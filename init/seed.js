const mongoose = require('mongoose');
const Listing = require('../models/listing');
const { data } = require('../data');

mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
  .then(() => {
    console.log('DB connected');
  })
  .catch((err) => {
    console.error('DB connection error:', err);
  });

const seedDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(data);
  console.log('Database seeded!');
};

seedDB().then(() => mongoose.connection.close());
