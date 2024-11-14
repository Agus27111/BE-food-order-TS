// src/types/express.d.ts
import "express";
import { AuthPayload } from "../dto";

declare module "express" {
  interface Request {
    user?: AuthPayload;
  }
}
