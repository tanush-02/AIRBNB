if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const port = process.env.PORT || 8080;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError");
const Listing = require("./models/listing");
const User = require("./models/user");

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");
const seedDB = require("./seed");

const dbURL = process.env.ATLASDB_URL;
const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", (err) => {
  console.log("❌ Session store error:", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  },
};

// --- Basic Express Setup ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(session(sessionOptions));
app.use(flash());

// --- Passport Setup ---
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// --- Global Variables Middleware ---
app.use((req, res, next) => {
  res.locals.currUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// --- Connect to DB + Start Server + Set Routes ---
async function main() {
  try {
    await mongoose.connect(dbURL);
    console.log("✅ Connected to MongoDB");

    await seedDB();
    console.log("✅ Database seeded");

    // Routes AFTER DB connection
    app.use("/listings", listingRouter);
    app.use("/listings/:id/reviews", reviewRouter);
    app.use("/", userRouter);

    app.get("/", async (req, res) => {
      const allListings = await Listing.find({});
      res.render("listings/index.ejs", { allListings });
    });

    app.get("/demouser", async (req, res) => {
      try {
        const existingUser = await User.findOne({ username: "demo" });
        if (existingUser) return res.send("User already exists");

        const newUser = new User({ username: "demo", email: "demo@gmail.com" });
        const registeredUser = await User.register(newUser, "demo@123");
        res.send(registeredUser);
      } catch (e) {
        console.error(e);
        res.status(500).send("Something went wrong");
      }
    });

    // 404 Handler
    app.all("*", (req, res, next) => {
      next(new ExpressError(404, "Page Not Found"));
    });

    // Error Handler
    app.use((err, req, res, next) => {
      if (err.name === "ValidationError") {
        err.statusCode = 400;
        err.message = Object.values(err.errors)
          .map((e) => e.message)
          .join(", ");
      }

      const statusCode = err.statusCode || 500;
      const message = err.message || "Something went wrong";

      res.status(statusCode).render("error.ejs", { err: { statusCode, message } });
    });

    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start app:", err);
    process.exit(1);
  }
}

main();
