import express, { Request, Response, NextFunction } from "express";
import {
  CreateOrder,
  CustomerLogin,
  CustomerSignUp,
  CustomerVerify,
  EditCustomerProfile,
  GetCustomerProfile,
  GetOrderById,
  GetOrders,
  RequestOtp,
  AddToCart,
  GetCart,
  DeleteCart,
} from "../controllers";
import { Authenticate } from "../middlewares";
// import { Offer } from '../models/Offer';

const router = express.Router();

/* ------------------- Suignup / Create Customer --------------------- */
router.post("/signup", CustomerSignUp);

/* ------------------- Login --------------------- */
router.post("/login", CustomerLogin);

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/* ------------------- Verify Customer Account --------------------- */
router.patch("/verify", CustomerVerify);

/* ------------------- OTP / request OTP --------------------- */
router.get("/otp", RequestOtp);

/* ------------------- Profile --------------------- */
router.get("/profile", GetCustomerProfile);
router.patch("/profile", EditCustomerProfile);

// //Cart
router.post("/cart", AddToCart);
router.get("/cart", GetCart);
router.delete("/cart", DeleteCart);

// //Apply Offers
// router.get('/offer/verify/:id', VerifyOffer);

// //Payment
// router.post('/create-payment', CreatePayment);

//Order
router.post("/create-order", CreateOrder);
router.get("/orders", GetOrders);
router.get("/order/:id", GetOrderById);

export { router as CustomerRoute };
