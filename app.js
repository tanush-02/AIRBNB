if(process.env.NODE_ENV !== "production") {
  // If not in production, load environment variables from .env file
require("dotenv").config();
}

const port = process.env.PORT || 8080;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/reviews.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter= require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter= require("./routes/user.js");


//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbURL=process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbURL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));


const store=MongoStore.create({
  mongoUrl:dbURL,
  crypto:{
    secret:process.env.SECRET
  },
  touchAfter:24*3600
})
store.on("error",(err)=>{
  console.log("Error in Mongo Sesssion Store ",err)
})

const sessionOptions = {
  store,
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    httpOnly: true,
    maxAge:  7 * 24 * 60 * 60 * 1000 ,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    
  }
}

app.get("/", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success") || [];
  res.locals.error = req.flash("error") || [];
  res.locals.currUser = req.user || null;
  next();
});


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


app.get("/demouser", async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: "demo" });

    if (existingUser) {
      
      return res.send("User already exists");

    }

    let fakeUser = new User({
      username: "demo",
      email: "demo@gmail.com"
    });

    let registeredUser = await User.register(fakeUser, "demo@123");
    res.send(registeredUser);

  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong");
  }
});


// 404 Error Handling
app.all("*",(req,res,next)=>{
  next(new ExpressError(400,"Page Not Found"));
});



app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    err.statusCode = 400;
    err.message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
  const message = err.message || "Something went wrong";

  res.status(statusCode).render("error.ejs", { err: { statusCode, message } });
});



app.listen(port, () => {
  console.log(`server is listening to port ${port}`);
});
