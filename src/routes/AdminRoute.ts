import express, { Request, Response, NextFunction } from "express";
import {
  CreateVandor,
  GetDeliveryUsers,
  GetTransactionById,
  GetTransactions,
  GetVandorById,
  GetVandors,
  VerifyDeliveryUser,
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

router.put("/delivery/verify", VerifyDeliveryUser);
router.get("/delivery/users", GetDeliveryUsers);

export { router as AdminRoute };
