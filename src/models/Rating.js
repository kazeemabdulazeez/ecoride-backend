const { Schema, model } = require('mongoose');

const ratingSchema = new Schema({
  tripSession: {
    type: Schema.Types.ObjectId,
    ref: 'TripSession',
    required: true,
    index: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  ratedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  score: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    maxlength: 1000,
  },
  tags: [{ type: String, trim: true }],
}, { timestamps: true });

// One rating per author per trip per rated user
ratingSchema.index(
  { tripSession: 1, author: 1, ratedUser: 1 },
  { unique: true }
);

// Fast lookups for a user's ratings
ratingSchema.index({ ratedUser: 1, createdAt: -1 });

ratingSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    tripSession: this.tripSession,
    author: this.author,
    ratedUser: this.ratedUser,
    score: this.score,
    comment: this.comment,
    tags: this.tags,
    createdAt: this.createdAt,
  };
};

module.exports = model('Rating', ratingSchema);