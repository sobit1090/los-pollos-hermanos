import ErrorHandler from "../utils/ErrorHandler.js";

export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // 🔥 FIX: return safe not-authenticated response
  return res.status(200).json({
    success: false,
    user: null,
  });
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Only Admin Allowed", 405));
  }
  next();
};
