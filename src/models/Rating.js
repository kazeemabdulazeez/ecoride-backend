const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },

    pool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommutePool",
      required: true,
      index: true,
    },

    rater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    ratee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number from 1 to 5.",
      },
    },

    review: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// One rating per rater, recipient, and booking.
ratingSchema.index(
  { booking: 1, rater: 1, ratee: 1 },
  { unique: true }
);

// Prevent users from rating themselves.
ratingSchema.pre("validate", function () {
  if (
    this.rater &&
    this.ratee &&
    this.rater.toString() === this.ratee.toString()
  ) {
    this.invalidate("ratee", "You cannot rate yourself.");
  }
});

module.exports = mongoose.model("Rating", ratingSchema);
