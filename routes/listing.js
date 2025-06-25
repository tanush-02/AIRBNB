const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
// const ExpressError = require("../utils/ExpressError.js");
// const { listingSchema, reviewSchema } = require("../schema.js");
// const Listing = require("../models/listing.js");
// const Review = require("../models/reviews.js");
const { isLoggedIn,isOwner,validateListing } = require("../middleware.js");
const listingController=require("../controllers/listing.js");
const multer = require("multer");
const { cloudinary, storage } = require("../cloudConfig.js");
const { escapeXML } = require("ejs");
const upload = multer({storage});

// Index Route
router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single("image"),
  validateListing, 
  wrapAsync(listingController.createListing)
);


//New Route
router.get("/new",isLoggedIn,
   wrapAsync(listingController.renderNewForm)
);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner,upload.single("image"),validateListing,
  wrapAsync(listingController.updateListing)
)
.delete(isLoggedIn,isOwner,
  wrapAsync(listingController.destroyListing)
);


//Edit Route
router.get("/:id/edit",isLoggedIn, isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;