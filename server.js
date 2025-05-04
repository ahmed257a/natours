process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });

const mongoose = require('mongoose');
const app = require('./app');

const dbURI = process.env.DB_URI.replace(
  '<db_password>',
  process.env.DB_PASSWORD
);
mongoose.connect(dbURI).then((val) => {
  console.log(`connection successful✅`);
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app runing at http://localhost:${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
