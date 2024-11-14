import dotenv from "dotenv";
dotenv.config();

export const MONGO_URL = process.env.MONGO_URL as string;
export const APP_SECRET = process.env.APP_SECRET as string;
