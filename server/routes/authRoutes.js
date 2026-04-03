const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

// redirect Google
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// callback
router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET
    );

    res.redirect(`http://localhost:3000?token=${token}`);
  }
);

module.exports = router;