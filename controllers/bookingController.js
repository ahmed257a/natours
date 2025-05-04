const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');
const Tour = require('../models/TourModel');
const Booking = require('../models/bookingModel');
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  const params = new URLSearchParams();
  if (req.params.tourId) params.append('tour', req.params.tourId);
  if (req.user.id) params.append('user', req.user.id);
  if (tour.price) params.append('price', tour.price);

  // 2) Create Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?${params.toString()}`,

    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          unit_amount: tour.price * 100, // convert from dollars to cents,
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });
  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // this is temporary, because it is not secure
  try {
    const { tour, user, price } = req.query;
    const bool = !tour;
    if (!tour || !user || !price) {
      return next();
    }

    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);
  } catch (err) {
    console.log(err);
  }
});

exports.getAllBookings = factory.getAll(Booking);
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
