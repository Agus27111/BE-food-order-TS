import express, { Request, Response, NextFunction } from "express";
import { CreateVandor, GetVandorById, GetVandors } from "../controllers";

const router = express.Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Admin Route",
  });
});

router.post("/create", CreateVandor);
router.get("/vandor/:id", GetVandorById);
router.get("/vandors", GetVandors);

export { router as AdminRoute };
