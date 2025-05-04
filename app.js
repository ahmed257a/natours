const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const tourRouter = require('./routes/TourRoutes');
const userRouter = require('./routes/UserRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/AppError');

//Initialize express app
const app = express();

// Setting Template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

/* ---- GLOBAL MIDDLEWARES ---- */
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Logging
app.use(morgan('dev'));

// Data sanitization against XSS
app.use(xss());

// // Set security HTTP headers
// app.use(helmet()); // will return a middleware function

// Set CORS policy
const corsOptions = {
  origin: ['http://127.0.0.1:3000', 'http://127.0.0.1:5500'], // can't be "*" if going to send credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // الميثودز المسموحة
  credentials: true, // allow incoming requests containing credentials <cookies> in the header
};

app.use(cors(corsOptions));

// Limit requests from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // limit size of data to 10 kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());
// Routes
app.use((req, res, next) => {
  // console.log('Cookies (from global middleware): ', req.cookies);
  next();
});
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// HANDLE UNHANDLED ROUTES
app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
});

// Register the global error handler middleware
app.use(globalErrorHandler);
module.exports = app;
