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
    type: String, 
    default: "",
  },

  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },

 googleId: {
  type: String,
 
  sparse: true,
  default: null,
},


  createdAt: {
    type: Date,
    default: Date.now,
  },
});

 

export const User = mongoose.model("User", schema);
