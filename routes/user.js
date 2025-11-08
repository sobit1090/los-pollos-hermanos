import express from "express";
import passport from "passport";
 
import { updatePhoto } from "../controllers/user.js";
import { singleUpload } from "../middlewares/multer.js";

import {
  getAdminStats,
  getAdminUsers,
  logout,
  myProfile,
  loginUser,
  registerUser,
 
} from "../controllers/user.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

/** -------------------- GOOGLE OAUTH -------------------- **/

// 1) Kick off Google OAuth
router.get(
  "/googlelogin",
  passport.authenticate("google", { scope: ["profile", "email"],// keep email so you can store it
    prompt: "select_account",
  })
);




 
 

router.put("/update/profile-photo", isAuthenticated, singleUpload, updatePhoto);




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
 

/** -------------------- ADMIN -------------------- **/

router.get("/admin/users", isAuthenticated, authorizeAdmin, getAdminUsers);
router.get("/admin/stats", isAuthenticated, authorizeAdmin, getAdminStats);
router.delete("/admin/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});

router.put("/admin/users/:id/toggle", async (req, res) => {
  const user = await User.findById(req.params.id);

  user.status = user.status === "Active" ? "Suspended" : "Active";
  await user.save();

  res.json({ success: true, status: user.status });
});

export default router;
