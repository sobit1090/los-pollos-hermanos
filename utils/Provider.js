// utils/Provider.js

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.js";

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Google OAuth Strategy
export const connectPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;

    // Find user by googleId OR email
    let user = await User.findOne({
      $or: [{ googleId: profile.id }, { email }],
    });

    // ❌ Case: Email exists but user did NOT sign up with Google
    if (user && !user.googleId) {
      return done(null, false, { message: "EMAIL_ALREADY_EXISTS_PASSWORD_LOGIN" });
    }

    // ✔ Case: Google user exists → login
    if (user) {
      return done(null, user);
    }

    // ✔ Case: Create new Google user
    user = await User.create({
      name: profile.displayName,
      email: email,
      googleId: profile.id,
      photo: profile.photos?.[0]?.value || "",
      password: "google_authenticated_user",
      authType: "google",
    });

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}

    )
  );
};
