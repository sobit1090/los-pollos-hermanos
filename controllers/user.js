import { asyncError } from "../middlewares/errorMiddleware.js";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import bcrypt from "bcryptjs";

/**
 * ✅ Get current logged-in user's profile
 */
export const myProfile = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * ✅ Register new user
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

/**
 * ✅ Login user
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    // Get user with password
    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(400).json({ message: "User not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Successful login
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

/**
 * ✅ Logout user
 */
export const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);

    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    });

    return res.redirect(
      process.env.NODE_ENV === "development"
        ? "http://localhost:5173/login"
        : process.env.CLIENT_URL + "/login"
    );
  });
};

/**
 * ✅ Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { phone, photo } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (phone) user.phone = phone;
    if (photo) user.photo = photo;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};

/**
 * ✅ Admin: Get all users
 */
export const getAdminUsers = asyncError(async (req, res) => {
  const users = await User.find({});
  res.status(200).json({
    success: true,
    users,
  });
});

/**
 * ✅ Admin: Get platform statistics
 */
export const getAdminStats = asyncError(async (req, res) => {
  const usersCount = await User.countDocuments();
  const orders = await Order.find({});

  const preparingOrders = orders.filter((o) => o.orderStatus === "Preparing");
  const shippedOrders = orders.filter((o) => o.orderStatus === "Shipped");
  const deliveredOrders = orders.filter((o) => o.orderStatus === "Delivered");

  const totalIncome = orders.reduce((acc, order) => acc + order.totalAmount, 0);

  res.status(200).json({
    success: true,
    usersCount,
    ordersCount: {
      total: orders.length,
      preparing: preparingOrders.length,
      shipped: shippedOrders.length,
      delivered: deliveredOrders.length,
    },
    totalIncome,
  });
});
