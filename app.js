import express, { urlencoded } from "express";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import cors from "cors";
import { connectPassport } from "./utils/Provider.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

const app = express();
export default app;

/* ✅ Allow HTTPS cookies on Render */
app.enable("trust proxy");

/* ✅ CORS Must Come Before Session */
app.use(
  cors({
    origin: "https://los-pollos-hermanos-front.onrender.com", // Hard-coded frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

/* ✅ Session (Must be before passport.session()) */
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: true,          // Required for HTTPS
//       sameSite: "none",      // Required for cross-site cookies
//     },
//   })
// );


// server.js (Express)
 
import MongoStore from "connect-mongo"; // or connect-redis for Redis

 
app.use(session({
  name: "sid",
  secret: process.env.SESSION_SECRET || "replace_me",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl:   60, // seconds — session TTL 24 hours
  }),
  cookie: {
    maxAge:   60 * 1000, // 24 hours in ms
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true on HTTPS
    sameSite: "lax",
  },
}));

// Logout route (explicit logout)
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(err => {
    res.clearCookie("sid");
    if (err) return res.status(500).send("Logout error");
    res.send({ success: true });
  });
});





app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));

/* ✅ Initialize Passport */
connectPassport();
app.use(passport.initialize());
app.use(passport.session());

/* ✅ Routes */
import userRoute from "./routes/user.js";
import orderRoute from "./routes/order.js";

app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);

/* ✅ Error Middleware */
app.use(errorMiddleware);
