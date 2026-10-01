const mongoose = require("mongoose")

const commuteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        route: {
            origin: {
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },

                coordinates: {
                    latitude: {
                        type: Number,
                        required: true,
                    },

                    longitude: {
                        type: Number,
                        required: true
                    },
                },
            },

            destination: {
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },

                coordinates: {
                    latitude: {
                        type: Number,
                        required: true,
                    },

                    longitude: {
                        type: Number,
                        required: true,
                    },
                },
            },
        },

        schedule: {
            days: {
                type:[
                    {
                        type: String,
                        enum: [
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                            "sunday",
                        ],
                    },
                ],
                required: true,
                validate: {
                validator: (days) => days.length > 0,
                message: "At least one schedule date is required",
            },
        },

        departureTime: {
            type: String,
            required: true,
            trim: true,
            match: [
                /^([01]\d|2[0-3]):([0-5]\d)$/,
                "departure time must be in HH:mm format",
            ],
        },
        },

        pickupPoints: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },

                address: {
                    type: String,
                    required: true,
                    trim: true,
                },

                coordinates: {
                    latitude: {
                        type: Number,
                        required: true,
                    },
                    longitude: {
                        type: Number,
                        required: true,
                    },
                },
            },
        ],

        preferences: {
            seats: {
                type: Number,
                default: 1,
                min: 1,
            },

            specialRequest: {
                type: String,
                trim: true,
                maxlength: 500,
            },
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("commute", commuteSchema);