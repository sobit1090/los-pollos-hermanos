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

// Trust proxy for HTTPS cookies on Render
app.enable("trust proxy");
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
// Session (must be before passport.session())
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV !== "development",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    },
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));

// ✅ CORS Configuration


// ✅ Initialize Passport (Must be above Routes)
connectPassport();
app.use(passport.initialize());
app.use(passport.session());

// ✅ Importing Routes
import userRoute from "./routes/user.js";
import orderRoute from "./routes/order.js";

app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);

// ✅ Error Handler
app.use(errorMiddleware);
