const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const {
  register,
  login,
  getMe,
  updateProfile,
  getAllUsers,
  updateUserRole,
  resetUserPassword,
  deleteUser,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

// Session middleware for OAuth flow
router.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "nutriplan-session-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 10 * 60 * 1000, // 10 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

// Google OAuth routes
router.get("/google", (req, res, next) => {
  const state = req.query.state;
  const mode = req.query.mode;

  // Store mode in session
  req.session.isRegistration = mode === "register";
  req.session.intendedRole = state || "user";

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: state,
  })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  passport.authenticate(
    "google",
    {
      failureRedirect: `${process.env.FRONTEND_URL}/login`,
      session: false,
    },
    (err, user, info) => {
      if (err) {
        console.error("Google OAuth error:", err);
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(
            "Authentication failed"
          )}`
        );
      }

      if (!user) {
        // Authentication failed - user returned false from strategy
        const errorMessage = info?.message || "Authentication failed";
        const role = req.query.state || "";
        const roleParam = role ? `&role=${role}` : "";

        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(
            errorMessage
          )}${roleParam}`
        );
      }

      // Success - generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });

      const role = req.query.state || "";
      const roleParam = role ? `&role=${role}` : "";

      res.redirect(
        `${process.env.FRONTEND_URL}/auth/google/success?token=${token}${roleParam}`
      );
    }
  )(req, res, next);
});

// Admin only routes
router.get("/users", protect, authorize("admin"), getAllUsers);
router.put("/users/:id/role", protect, authorize("admin"), updateUserRole);
router.put(
  "/users/:id/password",
  protect,
  authorize("admin"),
  resetUserPassword
);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
