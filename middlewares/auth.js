import ErrorHandler from "../utils/ErrorHandler.js";

export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next(); // user is logged in
  }
  return next(new ErrorHandler("Not Logged In", 401));
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Only Admin Allowed", 405));
  }
  next();
};
