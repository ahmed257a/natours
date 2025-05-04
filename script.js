require('dotenv').config({ path: './config.env' });
const dbURI = process.env.DB_URI.replace(
  '<db_password>',
  process.env.DB_PASSWORD
);

const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./models/TourModel');
const User = require('./models/UserModel');
const Review = require('./models/reviewModel');

mongoose.connect(dbURI).then(() => {
  console.log('connection successful✅');
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours.json`, 'utf8')
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/reviews.json`, 'utf8')
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`, 'utf8')
);

// IMPORTING

// IMPORTING
const importDataAll = async () => {
  try {
    await Tour.create(tours);
    await Review.create(reviews);
    await User.create(users, { validateBeforeSave: false });
    console.log('All imported Successfully✅');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const importDataTours = async () => {
  try {
    await Tour.create(tours);
    await Tour.create(tours);
    console.log('tours imported Successfully✅');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const importDataUsers = async () => {
  try {
    await User.create(users);
    console.log('Users imported Successfully✅');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const importDataReviews = async () => {
  try {
    await Review.create(reviews);
    console.log('Reviews imported Successfully✅');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETING
const deleteDataAll = async () => {
  try {
    await Promise.all([
      Tour.deleteMany(),
      User.deleteMany(),
      Review.deleteMany(),
    ]);
    console.log('All Deleted 😱');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteDataTours = async () => {
  try {
    await Tour.deleteMany();
    console.log('Deleted😱');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteDataUsers = async () => {
  try {
    await User.deleteMany();
    console.log('Deleted😱');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteDataReviews = async () => {
  try {
    await Review.deleteMany();
    console.log('Deleted😱');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Calling
switch (process.argv[2]) {
  case '--import-tours':
    importDataTours();
    break;
  case '--import-all':
    importDataAll();
    break;
  case '--delete-tours':
    deleteDataTours();
    break;
  case '--delete-all': {
    deleteDataAll();
    break;
  }
  case '--delete-users':
    deleteDataUsers();
    break;
  case '--delete-reviews':
    deleteDataReviews();
    break;

  case '--import-reviews':
    importDataReviews();
    break;
}

const deleteTour = async (req, res, next) => {
  const tour = await Tour.findOneAndDelete({ name: /test/i });
  console.log(tour.name);
};

deleteTour();
