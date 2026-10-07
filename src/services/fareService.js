const BASE_FARE = 500;
const RATE_PER_KM = 100;

/**
 * Calculate distance between two coordinates
 * using the Haversine formula.
 */
const calculateDistanceKm = (
  originLatitude,
  originLongitude,
  destinationLatitude,
  destinationLongitude
) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const earthRadiusKm = 6371;

  const latitudeDifference = toRadians(
    destinationLatitude - originLatitude
  );

  const longitudeDifference = toRadians(
    destinationLongitude - originLongitude
  );

  const originLat = toRadians(originLatitude);
  const destinationLat = toRadians(destinationLatitude);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(originLat) *
      Math.cos(destinationLat) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

/**
 * Calculate the fare for a booking.
 */
const calculateFare = ({
  originLatitude,
  originLongitude,
  destinationLatitude,
  destinationLongitude,
  seats = 1,
}) => {
  if (
    !Number.isFinite(originLatitude) ||
    !Number.isFinite(originLongitude) ||
    !Number.isFinite(destinationLatitude) ||
    !Number.isFinite(destinationLongitude)
  ) {
    throw new Error("Valid origin and destination coordinates are required.");
  }

  if (!Number.isInteger(seats) || seats < 1) {
    throw new Error("Seats must be a positive whole number.");
  }

  const distanceKm = calculateDistanceKm(
    originLatitude,
    originLongitude,
    destinationLatitude,
    destinationLongitude
  );

  const farePerSeat = BASE_FARE + distanceKm * RATE_PER_KM;

  const totalFare = farePerSeat * seats;

  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    baseFare: BASE_FARE,
    ratePerKm: RATE_PER_KM,
    farePerSeat: Number(farePerSeat.toFixed(2)),
    seats,
    totalFare: Number(totalFare.toFixed(2)),
    currency: "NGN",
  };
};

module.exports = {
  calculateDistanceKm,
  calculateFare,
};