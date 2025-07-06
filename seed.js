// ✅ SEED FIXED WITH VALID IMAGES AND STRUCTURE
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const Review = require("./models/reviews");
const User = require("./models/user");

const dbURL = process.env.ATLASDB_URL;

const sampleImages = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "https://images.unsplash.com/photo-1599423300746-b62533397364",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"
];

const seedDB = async () => {
  try {
    console.log("\u2728 Connected to MongoDB");

    await Listing.deleteMany({});
    await Review.deleteMany({});
    await User.deleteMany({});

    const demoUser = new User({ username: "demo", email: "demo@gmail.com" });
    const registeredUser = await User.register(demoUser, "demo@123");

    for (let i = 0; i < 8; i++) {
      const sampleListing = new Listing({
        title: `Sample Stay ${i + 1}`,
        description: "Comfortable and scenic stay for travelers.",
        image: {
          filename: `seed-${i + 1}.jpg`,
          url: sampleImages[i % sampleImages.length]
        },
        price: Math.floor(Math.random() * 5000) + 1000,
        location: "Bangalore",
        country: "India",
        owner: registeredUser._id
      });

      const review = new Review({
        comment: "Loved the stay, would visit again!",
        rating: 4,
        author: registeredUser._id
      });

      await review.save();
      sampleListing.reviews.push(review);
      await sampleListing.save();
    }

    console.log("\u2705 Seeded Listings, Reviews, and Demo User");
    
  } catch (err) {
    console.error("\u274C Seed error:", err);
    process.exit(1);
  }
};

module.exports = seedDB;
