import express, { Request, Response, NextFunction } from "express";
import {
  CreateVandor,
  GetTransactionById,
  GetTransactions,
  GetVandorById,
  GetVandors,
} from "../controllers";

const router = express.Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Admin Route",
  });
});

router.post("/create", CreateVandor);
router.get("/vandor/:id", GetVandorById);
router.get("/vandors", GetVandors);

router.get("/transactions", GetTransactions);
router.get("/transaction/:id", GetTransactionById);

export { router as AdminRoute };
