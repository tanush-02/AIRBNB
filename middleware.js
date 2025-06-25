const Listing= require("./models/listing");
const Review= require("./models/reviews");
const { listingSchema } = require('./schema'); // ✅ correct

const ExpressError = require("./utils/ExpressError");

// Middleware to validate listing data
// module.exports.validateListing = (req, res, next) => {
//   const { error } = listingSchema.validate(req.body.listing);
//   if (error) {
//     const msg = error.details.map((el) => el.message).join(",");
//     return next(new ExpressError(msg, 400));
//   }
//   next();
// };

module.exports.validateListing = (req, res, next) => {
  console.log("🛡️ Running validateListing...");
  console.log("Form data body:", req.body);

  const { error } = listingSchema.validate(req.body);
  if (error) {
    console.log("🚫 Listing validation failed:", error.details);
    const msg = error.details.map((el) => el.message).join(",");
    return next(new ExpressError(msg, 400));
  }
  next();
};


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; // Store the original URL
        req.flash("error", "You must be logged in to do that");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        // If there's a redirect URL stored, use it
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl; // Clear it after use
    }
    next();
}

module.exports.isOwner = async(req, res, next) => {
    let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You dont have permission to edit!");
    return res.redirect(`/listings/${id}`);
  }
    next();
}

module.exports.isReviewAuthor = async(req, res, next) => {
    let { id,reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect(`/listings/${id}`);
  }

  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You dont have permission to edit!");
    return res.redirect(`/listings/${id}`);
  }
    next();
}