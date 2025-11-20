import express from "express";
import passport from "passport";
 
import { addNewUser, updatePhoto } from "../controllers/user.js";
import { singleUpload } from "../middlewares/multer.js";

import {
  getAdminStats,
  getAdminUsers,
  logout,
  myProfile,
  deleteUser,
  loginUser,
  registerUser,
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

router.put("/update/profile-photo", isAuthenticated, singleUpload, updatePhoto);

// 2) OAuth callback (Google redirects here). We keep your original /login GET.
router.get(
  "/login",
  (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
      // ❶ Duplicate Email (password user trying Google)
      if (info?.message === "EMAIL_ALREADY_EXISTS_PASSWORD_LOGIN") {
        return res.redirect(
          (process.env.FRONTEND_URL || "http://localhost:5173") +
            "/login?error=EMAIL_ALREADY_EXISTS_PASSWORD_LOGIN"
        );
      }

      // ❷ General error
      if (err || !user) {
        return res.redirect(
          (process.env.FRONTEND_URL || "http://localhost:5173") +
            "/login?error=SOMETHING_WENT_WRONG"
        );
      }

      // ❸ Successful login → create session
      req.logIn(user, (err) => {
        if (err) {
          return res.redirect(
            (process.env.FRONTEND_URL || "http://localhost:5173") +
              "/login?error=SOMETHING_WENT_WRONG"
          );
        }

        return res.redirect(
          process.env.FRONTEND_URL || "http://localhost:5173"
        );
      });
    })(req, res, next);
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
router.delete("/admin/users/:id",isAuthenticated, authorizeAdmin, deleteUser);
router.post("admin/register/addnewuser",isAuthenticated,authorizeAdmin,addNewUser);
router.put("/admin/users/:id/toggle", async (req, res) => {
  const user = await User.findById(req.params.id);

  user.status = user.status === "Active" ? "Suspended" : "Active";
  await user.save();

  res.json({ success: true, status: user.status });
});

export default router;
