const RecurringCommute = require("../models/RecurringCommute");
const DriverProfile = require("../models/DriverProfile");

const DEFAULT_ROUTE_RADIUS_KM = 10;
const DEFAULT_PICKUP_RADIUS_KM = 2;
const DEFAULT_TIME_TOLERANCE_MINUTES = 30;

// Convert degrees to radians
const toRadians = (degrees) => (degrees * Math.PI) / 180;

// Calculate distance between two coordinates using the Haversine formula
const calculateDistanceKm = (pointA, pointB) => {
  const earthRadiusKm = 6371;

  const latitudeDifference = toRadians(pointB.latitude - pointA.latitude);
  const longitudeDifference = toRadians(pointB.longitude - pointA.longitude);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(pointA.latitude)) *
      Math.cos(toRadians(pointB.latitude)) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

// Calculate the shortest difference between two HH:mm times
const calculateTimeDifferenceMinutes = (timeA, timeB) => {
  const [hoursA, minutesA] = timeA.split(":").map(Number);
  const [hoursB, minutesB] = timeB.split(":").map(Number);

  const totalA = hoursA * 60 + minutesA;
  const totalB = hoursB * 60 + minutesB;

  const difference = Math.abs(totalA - totalB);

  // Handles times around midnight, e.g. 23:50 and 00:10
  return Math.min(difference, 1440 - difference);
};

// Find overlapping recurring days
const getCommonDays = (daysA, daysB) => {
  return daysA.filter((day) => daysB.includes(day));
};

// Find the closest pickup point between two commutes
const getClosestPickupDistance = (pickupPointsA, pickupPointsB) => {
  let closestDistance = Infinity;

  for (const pointA of pickupPointsA) {
    for (const pointB of pickupPointsB) {
      const distance = calculateDistanceKm(
        {
          latitude: pointA.latitude,
          longitude: pointA.longitude,
        },
        {
          latitude: pointB.latitude,
          longitude: pointB.longitude,
        }
      );

      closestDistance = Math.min(closestDistance, distance);
    }
  }

  return closestDistance;
};

// Convert a distance into a score between 0 and 1
const proximityScore = (distance, maximumDistance) => {
  if (distance >= maximumDistance) {
    return 0;
  }

  return 1 - distance / maximumDistance;
};

// Calculate the overall compatibility score
const calculateMatchScore = ({
  originDistance,
  destinationDistance,
  pickupDistance,
  timeDifference,
  commonDaysCount,
  totalRequestedDays,
  routeRadiusKm,
  pickupRadiusKm,
  timeToleranceMinutes,
}) => {
  const originScore = proximityScore(originDistance, routeRadiusKm);
  const destinationScore = proximityScore(
    destinationDistance,
    routeRadiusKm
  );

  const routeScore = (originScore + destinationScore) / 2;

  const timeScore = proximityScore(
    timeDifference,
    timeToleranceMinutes
  );

  const scheduleScore =
    totalRequestedDays > 0
      ? commonDaysCount / totalRequestedDays
      : 0;

  const pickupScore = proximityScore(
    pickupDistance,
    pickupRadiusKm
  );

  // Weighted ranking
  const score =
    routeScore * 40 +
    timeScore * 25 +
    scheduleScore * 15 +
    pickupScore * 20;

  return Number(score.toFixed(2));
};

const findMatchingCommutes = async (
  sourceCommute,
  requesterRole,
  options = {}
) => {
  const routeRadiusKm =
    Number(options.routeRadiusKm) || DEFAULT_ROUTE_RADIUS_KM;

  const pickupRadiusKm =
    Number(options.pickupRadiusKm) || DEFAULT_PICKUP_RADIUS_KM;

  const timeToleranceMinutes =
    Number(options.timeToleranceMinutes) ||
    DEFAULT_TIME_TOLERANCE_MINUTES;

  const candidateRole =
    requesterRole === "passenger" ? "driver" : "passenger";

  const candidates = await RecurringCommute.find({
    _id: { $ne: sourceCommute._id },
    commuter: { $ne: sourceCommute.commuter },
    status: "active",
  }).populate("commuter", "firstName lastName email role");

  const driverIds = candidates
    .filter((candidate) => candidate.commuter?.role === "driver")
    .map((candidate) => candidate.commuter._id);

  const driverProfiles = await DriverProfile.find({
    user: { $in: driverIds },
  }).select("user vehicle.seats");

  const driverSeatMap = new Map();

  for (const profile of driverProfiles) {
    driverSeatMap.set(
      profile.user.toString(),
      profile.vehicle?.seats || 0
    );
  }

  const matches = [];

  for (const candidate of candidates) {
    if (candidate.commuter?.role !== candidateRole) {
      continue;
    }

    const originDistance = calculateDistanceKm(
      sourceCommute.route.origin,
      candidate.route.origin
    );

    const destinationDistance = calculateDistanceKm(
      sourceCommute.route.destination,
      candidate.route.destination
    );

    // Route compatibility
    if (
      originDistance > routeRadiusKm ||
      destinationDistance > routeRadiusKm
    ) {
      continue;
    }

    // Schedule compatibility
    const commonDays = getCommonDays(
      sourceCommute.schedule.days,
      candidate.schedule.days
    );

    if (commonDays.length === 0) {
      continue;
    }

    // Departure-time compatibility
    const timeDifference = calculateTimeDifferenceMinutes(
      sourceCommute.schedule.departureTime,
      candidate.schedule.departureTime
    );

    if (timeDifference > timeToleranceMinutes) {
      continue;
    }

    // Pickup-point compatibility
    const pickupDistance = getClosestPickupDistance(
      sourceCommute.pickupPoints,
      candidate.pickupPoints
    );

    if (pickupDistance > pickupRadiusKm) {
      continue;
    }

    let availableSeats = null;

    // When matching passengers to drivers, verify vehicle capacity
    if (candidateRole === "driver") {
      availableSeats =
        driverSeatMap.get(candidate.commuter._id.toString()) || 0;

      const seatsNeeded = sourceCommute.preferences?.seatsNeeded || 1;

      if (availableSeats < seatsNeeded) {
        continue;
      }
    }

    const score = calculateMatchScore({
      originDistance,
      destinationDistance,
      pickupDistance,
      timeDifference,
      commonDaysCount: commonDays.length,
      totalRequestedDays: sourceCommute.schedule.days.length,
      routeRadiusKm,
      pickupRadiusKm,
      timeToleranceMinutes,
    });

    matches.push({
      commuteId: candidate._id,
      commuter: candidate.commuter,
      availableSeats,
      score,
      compatibility: {
        originDistanceKm: Number(originDistance.toFixed(2)),
        destinationDistanceKm: Number(
          destinationDistance.toFixed(2)
        ),
        pickupDistanceKm: Number(pickupDistance.toFixed(2)),
        departureTimeDifferenceMinutes: timeDifference,
        commonDays,
      },
      commute: candidate,
    });
  }

  // Highest compatibility score first
  matches.sort((a, b) => b.score - a.score);

  return matches;
};

module.exports = {
  findMatchingCommutes,
  calculateDistanceKm,
  calculateTimeDifferenceMinutes,
  getCommonDays,
};