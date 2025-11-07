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
    default: "https://res.cloudinary.com/dlkf5aiek/image/upload/v1762414012/j0g5hrsnkykpiuhfsyus.jpg",
  },

  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },

orders:{
  type:Number,
  default:0
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
