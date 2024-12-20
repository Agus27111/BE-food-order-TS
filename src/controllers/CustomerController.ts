import express, { Request, Response, NextFunction } from "express";
import {
  CartItem,
  CreateCustomerInputs,
  EditCustomerProfileInput,
  OrderInputs,
  UserLoginInputs,
} from "../dto/Customer.dto";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} from "../utility";
import { Customer } from "../models/Customer";
import { GenerateOtp, onRequestOTP } from "../utility/notificationUtility";
import {
  DeliveryUser,
  Food,
  Offer,
  Order,
  Transaction,
  Vandor,
} from "../models";
import mongoose from "mongoose";

export const CustomerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const customerInputs = plainToClass(CreateCustomerInputs, req.body);

    const validationError = await validate(customerInputs, {
      validationError: { target: true },
    });

    if (validationError.length > 0) {
      return res.status(400).json(validationError);
    }

    const { email, phone, password } = customerInputs;

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const { otp, expiry } = GenerateOtp();

    const existingCustomer = await Customer.findOne({ email: email });

    if (existingCustomer) {
      return res.status(400).json({ message: "Email already exist!" });
    }

    const result = await Customer.create({
      email: email,
      password: userPassword,
      salt: salt,
      phone: phone,
      otp: otp,
      otp_expiry: expiry,
      firstName: "",
      lastName: "",
      address: "",
      verified: false,
      lat: 0,
      lng: 0,
      orders: [],
    });

    await onRequestOTP(otp, phone);

    //Generate the Signature
    const signature = await GenerateSignature({
      _id: result._id as string,
      email: result.email,
      verified: result.verified,
    });

    return res
      .status(201)
      .json({ signature, verified: result.verified, email: result.email });
  } catch (error) {
    return res.status(400).json({ msg: "Error while creating user" });
  }
};
export const CustomerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const customerInputs = plainToClass(UserLoginInputs, req.body);

  const validationError = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (validationError.length > 0) {
    return res.status(400).json(validationError);
  }

  const { email, password } = customerInputs;
  const customer = await Customer.findOne({ email: email });
  if (customer) {
    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );

    if (validation) {
      const signature = GenerateSignature({
        _id: customer._id as string,
        email: customer.email,
        verified: customer.verified,
      });

      return res.status(200).json({
        signature: signature,
        email: customer.email,
        verified: customer.verified,
      });
    }
  }

  return res.json({ msg: "Error With Signup" });
};
export const CustomerVerify = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { otp } = req.body;
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
        profile.verified = true;

        const updatedCustomerResponse = await profile.save();

        const signature = GenerateSignature({
          _id: updatedCustomerResponse._id as string,
          email: updatedCustomerResponse.email,
          verified: updatedCustomerResponse.verified,
        });

        return res.status(200).json({
          signature,
          email: updatedCustomerResponse.email,
          verified: updatedCustomerResponse.verified,
        });
      }
    }
  }

  return res.status(400).json({ msg: "Unable to verify Customer" });
};
export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const customer = req.user;

    if (!customer) {
      return res.status(400).json({ msg: "your not authenticate!" });
    }

    const profile = await Customer.findById(customer._id);

    if (!profile) {
      return res.status(400).json({ msg: "no one data match!" });
    }
    const { otp, expiry } = GenerateOtp();
    profile.otp = otp;
    profile.otp_expiry = expiry;

    await profile.save();
    const sendCode = await onRequestOTP(otp, profile.phone);

    if (!sendCode) {
      return res
        .status(400)
        .json({ message: "Failed to verify your phone number" });
    }

    return res
      .status(200)
      .json({ message: "OTP sent to your registered Mobile Number!" });
  } catch (error) {
    return res.status(400).json({ msg: "Error with Requesting OTP" });
  }
};
export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      return res.status(201).json(profile);
    }
  }
  return res.status(400).json({ msg: "Error while Fetching Profile" });
};
export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const customer = req.user;

  const customerInputs = plainToClass(EditCustomerProfileInput, req.body);

  const validationError = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (validationError.length > 0) {
    return res.status(400).json(validationError);
  }

  const { firstName, lastName, address } = customerInputs;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;
      const result = await profile.save();

      return res.status(201).json(result);
    }
  }
  return res.status(400).json({ msg: "Error while Updating Profile" });
};

// Create Payment
export const CreatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const customer = req.user;

  const { amount, paymentMode, offerId } = req.body;

  let payableAmount = Number(amount);

  if (offerId) {
    const appliedOffer = await Offer.findById(offerId);

    if (appliedOffer.isActive) {
      payableAmount = payableAmount - appliedOffer.offerAmount;
    }
  }
  // perform payment gateway charge api

  // create record on transaction
  const transaction = await Transaction.create({
    customer: customer._id,
    vandorId: "",
    orderId: "",
    orderValue: payableAmount,
    offerUsed: offerId || "NA",
    status: "OPEN",
    paymentMode: paymentMode,
    paymentResponse: "Payment is cash on Delivery",
  });

  //return transaction
  return res.status(200).json(transaction);
};

// Delivery Notificcation

const assignOrderForDelivery = async (orderId: string, vendorId: string) => {
  // find the vendor
  const vendor = await Vandor.findById(vendorId);
  if (vendor) {
    const areaCode = vendor.pincode;
    const vendorLat = vendor.lat;
    const vendorLng = vendor.lng;

    //find the available Delivery person
    const deliveryPerson = await DeliveryUser.find({
      pincode: areaCode,
      verified: true,
      isAvailable: true,
    });
    if (deliveryPerson) {
      // Check the nearest delivery person and assign the order

      const currentOrder = await Order.findById(orderId);
      if (currentOrder) {
        //update Delivery ID
        currentOrder.deliveryId = deliveryPerson[0]._id as string;
        await currentOrder.save();

        //Notify to vendor for received new order firebase push notification
      }
    }
  }

  // Update Delivery ID
};

const validateTransaction = async (txnId: string) => {
  const currentTransaction = await Transaction.findById(txnId);

  if (currentTransaction) {
    if (currentTransaction.status.toLowerCase() !== "failed") {
      return { status: true, currentTransaction };
    }
  }
  return { status: false, currentTransaction };
};

// Order Section

export const CreateOrder = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const customer = req.user;

    const { txnId, amount, items } = <OrderInputs>req.body;

    if (!customer) {
      return res.status(400).json({ msg: "Customer not authenticated" });
    }

    const { status, currentTransaction } = await validateTransaction(txnId);
    if (!status) {
      return res.status(201).json({ msg: "Error with create Order!" });
    }

    const profile = await Customer.findById(customer._id);
    if (!profile) {
      return res.status(404).json({ msg: "Customer not found" });
    }

    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

    let cartItems = [];
    let netAmount = 0.0;

    let vendorId;

    const foods = await Food.find()
      .where("_id")
      .in(items.map((item) => item._id))
      .exec();

    foods.forEach((food) => {
      items.forEach(({ _id, unit }) => {
        if (food._id.toString() === _id) {
          vendorId = food.vendorId;
          netAmount += food.price * unit;
          cartItems.push({ food, unit });
        }
      });
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ msg: "No valid items in cart" });
    }

    const currentOrder = await Order.create({
      orderID: orderId,
      vendorId: vendorId,
      items: cartItems,
      totalAmount: netAmount,
      paidAmount: amount,
      orderDate: new Date(),
      orderStatus: "Waiting",
      remarks: "",
      deliveryId: "",
      readyTime: 45,
    });

    profile.cart = [] as any;
    profile.orders.push(currentOrder);

    currentTransaction.vandorId = vendorId;
    currentTransaction.orderId = orderId;
    currentTransaction.status = "CONFIRMED";

    await currentTransaction.save();

    assignOrderForDelivery(currentOrder._id as string, vendorId);

    await profile.save();

    return res.status(200).json(currentOrder);
  } catch (error) {
    console.error("Error in CreateOrder:", error);
    return res.status(500).json({ msg: "Error while creating order" });
  }
};

export const GetOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("orders");
    if (profile) {
      return res.status(200).json(profile.orders);
    }
  }

  return res.status(400).json({ msg: "Orders not found" });
};

export const GetOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const orderId = req.params.id;

  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");

    if (order) {
      return res.status(200).json(order);
    }
  }

  return res.status(400).json({ msg: "Order not found" });
};

export const AddToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const customer = req.user;

  const customerId = customer._id;

  const profile = await Customer.findById(customerId).populate("cart.food");

  if (!profile) {
    return res.status(404).json({ msg: "Customer not found" });
  }

  let cartItems = Array();
  const { _id, unit } = <CartItem>req.body;

  const food = await Food.findById(_id);
  if (!food) {
    return res.status(404).json({ msg: "food id is wrong!" });
  }
  cartItems = profile.cart;

  if (cartItems.length > 0) {
    //check and update
    let existFoodItems = cartItems.filter(
      (item) => item.food._id.toString() === _id
    );
    if (existFoodItems.length > 0) {
      const index = cartItems.indexOf(existFoodItems[0]);
      if (unit > 0) {
        cartItems[index] = { food, unit };
        console.log("Updated cart item:", cartItems[index]);
      } else {
        cartItems.splice(index, 1);
        console.log("Removed cart item:", existFoodItems[0]);
      }
    } else {
      //add new Item
      cartItems.push({ food, unit });
    }
  } else {
    // Add item if cart is empty
    cartItems.push({ food, unit });
  }
  profile.cart = cartItems as any;
  const cartResult = await profile.save();
  return res.status(200).json(cartResult.cart);
};

export const GetCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const customer = req.user;

  const customerId = customer._id;

  const profile = await Customer.findById(customerId).populate("cart.food");

  if (!profile) {
    return res.status(404).json({ msg: "Customer not found" });
  }
  return res.status(200).json(profile.cart);
};

export const DeleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const customer = req.user;

    const customerId = customer._id;

    const profile = await Customer.findById(customerId).populate("cart.food");

    if (!profile) {
      return res.status(404).json({ msg: "Customer not found" });
    }
    profile.cart = [] as any;
    const cartResult = await profile.save();
    return res.status(200).json(cartResult);
  } catch (error) {
    return res.status(404).json({ msg: "Cart is already empty!" });
  }
};

export const VerifyOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const offerId = req.params.id;
    const customer = req.user;

    if (!customer) {
      return res.status(400).json({ msg: "youre not authenticate!" });
    }

    const appliedOffer = await Offer.findById(offerId);

    if (!appliedOffer) {
      return res.status(400).json({ msg: "The offer not found!" });
    }

    if (appliedOffer.promoType == "USER") {
      //only applied once per user
    }

    if (!appliedOffer.isActive) {
      return res.status(400).json({ msg: "the Offers is not active" });
    }

    return res.status(200).json({ msg: "Offer is Valid", offer: appliedOffer });
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
};
