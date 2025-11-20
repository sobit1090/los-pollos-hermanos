import { asyncError } from "../middlewares/errorMiddleware.js";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinary.js";

/**
 * ✅ Get current logged-in user's profile
 */
export const myProfile = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};
export const deleteUser =async(req,res)=>{
    try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
/**
 * ✅ Register new user (session will start after login, not here)
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful, now login",
    });
} catch (error) {
  console.error("Registration Error:", error.message);
  return res.status(500).json({ message: error.message });
}

};
//add new User
export const addNewUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Validate photo upload (optional but recommended)
  

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      photo: "https://i.ibb.co/MBtjqXQ/no-avatar.gif",
 // multer saved filename
    });

    return res.status(201).json({
      success: true,
      message: "New user created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Add User Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * ✅ Login user WITH session + cookie
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
if (user.status === "Suspended") {
  return res.status(403).json({ message: "Your account is suspended. Contact support." });
}
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Create login session
    req.login(user, (err) => {
      if (err) return next(err);

      // ✅ Ensure the session cookie is saved before responding (CRITICAL)
      req.session.save(() => {
        return res.status(200).json({
          success: true,
          message: "Login successful",
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            photo:user.photo,
            role: user.role
          },
        });
      });
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};


/**
 * ✅ Logout user (destroy session & remove cookie)
 */
export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      return res.status(200).json({ success: true, message: "Logged out" });
    });
  });
};








 export const updatePhoto = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "los-pollos-assets/users", // ✅ keeps Cloudinary clean
    });

    req.user.photo = result.secure_url;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: "Photo uploaded successfully!",
      photo: result.secure_url,
 
    });
  } catch (error) {
    console.log("Photo upload error:", error);
    res.status(500).json({ message: "Upload failed" });
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
