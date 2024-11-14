import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

import { MONGO_URL } from "../config";



export default async () => {
  try {
    await mongoose
      .connect(MONGO_URL)
      .then(() => {
        console.log("MongoDB connected");
      })
  } catch (ex) {
    console.log("🚀 ~ async ~ ex:", ex);
  }
};


