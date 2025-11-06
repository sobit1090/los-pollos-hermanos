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
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,          // Required for HTTPS
      sameSite: "none",      // Required for cross-site cookies
    },
  })
);

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
