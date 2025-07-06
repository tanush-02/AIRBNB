const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Listing = require("./models/listing");
const Review = require("./models/reviews");
const User = require("./models/user");
require("dotenv").config();

const dbURL = process.env.ATLASDB_URL;

async function seedDB() {
  await mongoose.connect(dbURL);
  console.log("✅ Connected to DB");

  await Listing.deleteMany({});
  await Review.deleteMany({});
  await User.deleteMany({});

  // 1. Create demo user
  const demoUser = new User({ username: "demo", email: "demo@gmail.com" });
  const registeredUser = await User.register(demoUser, "demo@123");

  // 2. Generate listings
  for (let i = 0; i < 15; i++) {
    const fakeTitle = faker.lorem.words(3);
    const fakeDesc = faker.lorem.paragraph();
    const fakeLocation = faker.location.city();
    const fakeCountry = faker.location.country();
    const fakePrice = faker.number.int({ min: 1000, max: 10000 });

    const newListing = new Listing({
      title: fakeTitle,
      description: fakeDesc,
      price: fakePrice,
      location: fakeLocation,
      country: fakeCountry,
      image: {
        url: `https://source.unsplash.com/600x400/?house,home,hotel&sig=${i}`,
        filename: `house-${i}`
      },
      owner: registeredUser._id,
    });

    // 3. Create 1–3 reviews per listing
    const reviewCount = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < reviewCount; j++) {
      const review = new Review({
        comment: faker.lorem.sentence(),
        rating: faker.number.int({ min: 1, max: 5 }),
        author: registeredUser._id
      });
      await review.save();
      newListing.reviews.push(review);
    }

    await newListing.save();
  }

  console.log("✅ Seeded Listings, Reviews, and Demo User");
  mongoose.connection.close();
}

module.exports = seedDB;
