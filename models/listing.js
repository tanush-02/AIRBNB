const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews.js"); 

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: String,
    url:String
  },
 
  price:{
    type: Number,
    required: true,
    min: 0
  } ,
  location: String,
  country: String,
  reviews:[
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner:{
      type: Schema.Types.ObjectId,
      ref: "User"
    }

});

listingSchema.post("findOneAndDelete", async(listing)=> {
  if(listing.reviews) {
    await Review.deleteMany({_id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

