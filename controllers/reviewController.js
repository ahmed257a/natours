const catchAsync = require('../utils/catchAsync');
const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/AppError');
// MIDDLEWARES
exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes for reviews
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// A middleware to allow only users who booked the tour to review it
exports.restrictToBookedUsers = catchAsync(async (req, res, next) => {
  const userId = req.user._id; // coming from <protect> middleware
  const tourId = req.body.tour;
  req.body.user;
  const booking = await Booking.findOne({
    user: userId,
    tour: tourId,
  });
  if (!booking)
    return next(
      new AppError('Only users who Booked the tour can review it.', 403)
    );
  next();
});

// HANDLERS
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
