import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { APP_SECRET } from "../config";

import { VandorPayload } from "../dto";
import { AuthPayload } from "../dto/Auth.dto";

export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
enteredPassword: string, savedPassword: string, salt: string) => {
  return await bcrypt.compare(enteredPassword, savedPassword);
};

export const GenerateSignature = async (payload: AuthPayload) => {
  return jwt.sign(payload, APP_SECRET, { expiresIn: "90d" });
};

export const ValidateSignature = async (req: Request): Promise<any> => {
  const signature = req.get("Authorization");

  if (signature) {
    try {
      const payload = (await jwt.verify(
        signature.split(" ")[1],
        APP_SECRET
      )) as AuthPayload;
      req.user = payload;
      return true;
    } catch (err) {
      return false;
    }
  }
  return false;
};

// export const ValidateSignature = async (
//   req: Request & { user?: AuthPayload }
// ) => {
//   const signature = req.get("Authorization");

//   if (!signature) {
//     return false;
//   }

//   const payload = (await jwt.verify(
//     signature.split(" ")[1],
//     APP_SECRET
//   )) as AuthPayload;
//   req.user = payload;
//   return true;
// };
