// 📁 backend/seed.js
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const { faker } = require("@faker-js/faker");
require("dotenv").config();

const dbURL = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbURL);
  console.log("Connected to DB");

  // Clear existing listings
  await Listing.deleteMany({});

  for (let i = 0; i < 20; i++) {
    const listing = new Listing({
      title: faker.company.catchPhrase(),
      price: faker.number.int({ min: 500, max: 10000 }),
      location: `${faker.location.city()}, ${faker.location.state()}`,
      description: faker.lorem.paragraph(),
      image: `https://source.unsplash.com/600x400/?house,home,apartment&sig=${i}`
    });
    await listing.save();
  }

  console.log("Seeded 20 listings ✅");
  mongoose.connection.close();
}

main();
