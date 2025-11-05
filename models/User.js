import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
    select: false, // hide by default when fetching user
  },

  phone: {
    type: String,
  },

  photo: {
    type: String, // store image URL (e.g. Cloudinary link)
    default: "",
  },

  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true, // optional, avoids duplicate index errors
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
schema.pre("save", async function (next) {
  // if no password or not modified, skip hashing
  if (!this.password || !this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


export const User = mongoose.model("User", schema);
