import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import { AuthPayload } from "../dto";
dotenv.config();

import { AdminRoute, VandorRoute, ShoppingRoute } from "../routes";

declare module "express" {
  interface Request {
    user?: AuthPayload;
  }
}

export default async (app: Application) => {
  // Middleware
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (req, res) => {
    res.send("Hello, world!");
  });

  app.use("/admin", AdminRoute);
  app.use("/vandor", VandorRoute);
  app.use("/", ShoppingRoute);

  return app;
};
