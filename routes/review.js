const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema } = require("../schema.js");
const Review = require("../models/reviews.js");
const Listing=require("../models/listing.js") 
const {isLoggedIn,isReviewAuthor} =require("../middleware.js")
const reviewContoller=require("../controllers/review.js");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    return next(new ExpressError(msg , 400));
  }
  next();
}

// Reviews : post route
router.post("/",isLoggedIn,
  validateReview,
  wrapAsync(reviewContoller.createReview)
);

//Reviews : delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, 
  wrapAsync(reviewContoller.destroyReview)
);

module.exports=router;

