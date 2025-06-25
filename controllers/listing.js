const Listing= require("../models/listing");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm =(req, res) => {
  res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate(
    {
      path:"reviews",
      populate:{
        path:"author"
      },
    })
  .populate("owner");
  if (!listing) {
    req.flash("error", "Cannot find that listing!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
}

// module.exports.createListing = async (req, res, next) => {
//     let url=req.file.path;
//     let filename= url.file.filename;
//     let result = listingSchema.validate(req.body.listing);
//     const newListing = new Listing(req.body.listing);
//     newListing.image = {url,filename};
//     newListing.owner=req.user._id;
//     await newListing.save();
//     req.flash("success", "Successfully created a new listing!");
//     res.redirect("/listings");
// }

module.exports.createListing = async (req, res, next) => {
  console.log("📦 Form body:", req.body);
  console.log("🖼️ Uploaded file:", req.file); // This must not be undefined!

  try {
    const newListing = new Listing(req.body.listing);

    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    } else {
      console.warn("⚠️ No file uploaded — using fallback image");
    }

    newListing.owner = req.user._id;
    await newListing.save();

    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
  } catch (e) {
    console.error("❌ Error while creating listing:", e.message);
    next(e);
  }
};




module.exports.renderEditForm = async(req,res) =>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing does not exist");
        res.redirect("/listings");
    }
    res.redirect("/listings/edit.ejs",{listing});
}
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id); // ✅ fetch it first
    listing.set(req.body.listing); // now this works
    await listing.save();
    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  // if (!listing) {
  //   req.flash("error", "Cannot find that listing!");
  //   return res.redirect("/listings");
  // }
  req.flash("success", "Successfully deleted a listing!");
  res.redirect("/listings");
}