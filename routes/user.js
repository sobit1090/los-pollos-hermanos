import express from "express";
import passport from "passport";
import {
  getAdminStats,
  getAdminUsers,
  logout,
  myProfile,
  loginUser,
  registerUser,
  updateProfile,
} from "../controllers/user.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

/** -------------------- GOOGLE OAUTH -------------------- **/

// 1) Kick off Google OAuth
router.get(
  "/googlelogin",
  passport.authenticate("google", {
    scope: ["profile", "email"], // keep email so you can store it
    prompt: "select_account",
  })
);

// 2) OAuth callback (Google redirects here). We keep your original /login GET.
router.get(
  "/login",
  passport.authenticate("google", {
    failureRedirect:
      (process.env.FRONTEND_URL || "http://localhost:5173") + "/login",
    session: true,
  }),
  (req, res) => {
    // success -> redirect to your frontend home (or /profile if you prefer)
    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
  }
);

/** -------------------- LOCAL AUTH -------------------- **/

// Email+Password login
router.post("/login", loginUser);

// Email+Password register
router.post("/register", registerUser);

/** -------------------- USER/APPS ROUTES -------------------- **/

router.get("/me", isAuthenticated, myProfile);
router.get("/logout", logout);
router.put("/updateProfile", isAuthenticated, updateProfile);

/** -------------------- ADMIN -------------------- **/

router.get("/admin/users", isAuthenticated, authorizeAdmin, getAdminUsers);
router.get("/admin/stats", isAuthenticated, authorizeAdmin, getAdminStats);

export default router;
