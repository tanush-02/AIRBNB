const expresss = require('express');
const router = expresss.Router();
const User = require('../models/user.js');
const passport = require('passport');
const { isLggedIn } = require('../middleware.js');
const { saveRedirectUrl } = require('../middleware.js');

const userController = require('../controllers/user.js');
const user = require('../models/user.js');

// In your router file
router.route("/signup")
.get(userController.renderSignupForm)
.post(userController.signup);

router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl,
    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
    userController.login
);

router.get('/logout',userController.logout);

module.exports = router;