// review / rating /createdAt / ref to tour / ref to user

const mongoose = require('mongoose');
const Tour = require('./TourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure unique combination of tour and user
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// MIDDLEWARES

// Populate user field
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// updating tour ratingsAverage & ratingsQuantity after updating or deleting reviews
reviewSchema.post(/findOneAnd/, async function (doc) {
  // <doc> will be null, if wrong Id used
  if (doc) await doc.constructor.calcAverageRatings(doc.tour);
});

// Remember <post> middlewares don't have access to <next>
reviewSchema.post('save', async function () {
  /**
   * We need to call static method on the Model itself
   * like this => // Review.calcAverageRatings(this.tour);
   * But Since Review model is not yet defined, We will use this.constructor
   * NOTE ===> {this: current document, this.constructor: Model itself}
   */
  await this.constructor.calcAverageRatings(this.tour);
});

// STATIC METHODS [Called on parent]
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // In static methods <this> refer to the Model

  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
