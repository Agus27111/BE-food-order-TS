import { Request, NextFunction, Response } from "express";
import { ValidateSignature } from "../utility";

export const Authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const signature = await ValidateSignature(req);
  if (signature) {
    return next();
  } else {
    return res.json({ message: "User Not authorised" });
  }
};
