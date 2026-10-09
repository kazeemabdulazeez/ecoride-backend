const mongoose = require("mongoose");

const incidentReportSchema = new mongoose.Schema(
  {
    pool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommutePool",
      required: true,
      index: true,
    },

    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "unsafe_driving",
        "harassment",
        "misconduct",
        "lateness",
        "no_show",
        "vehicle_issue",
        "other",
      ],
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["pending", "under_review", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },

    resolutionNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

incidentReportSchema.pre("validate", function () {
  if (
    this.reporter &&
    this.reportedUser &&
    this.reporter.toString() === this.reportedUser.toString()
  ) {
    this.invalidate(
      "reportedUser",
      "You cannot report yourself as the other party."
    );
  }
});

module.exports = mongoose.model("IncidentReport", incidentReportSchema);
