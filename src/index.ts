import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { AuthPayload } from "./dto";
dotenv.config();

import { AdminRoute, VandorRoute } from "./routes";
import { MONGO_URL } from "./config";

declare module "express" {
  interface Request {
    user?: AuthPayload;
  }
}

const PORT = process.env.PORT || 3001;
const app = express();
const router = express.Router();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

// Routes
router.get("/", (req, res) => {
  res.send("Hello, world!");
});

router.use("/admin", AdminRoute);
router.use("/vandor", VandorRoute);

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log(err);
  });

// Start server
app.listen(PORT, () => {
  console.clear();
  console.log(`Server is running on http://localhost:${PORT}`);
});
