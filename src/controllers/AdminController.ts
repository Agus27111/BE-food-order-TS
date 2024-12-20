import { Request, Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto";
import { Vandor } from "../models/Vandor";
import { GenerateSalt, GeneratePassword } from "../utility";
import mongoose from "mongoose";
import { Transaction, DeliveryUser } from "../models";

export const FindVandor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vandor.findOne({ email: email });
  } else {
    return await Vandor.findOne({ _id: id });
  }
};

export const CreateVandor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      name,
      ownerName,
      foodType,
      pincode,
      address,
      password,
      phone,
      email,
    } = <CreateVandorInput>req.body;

    const existingVandor = await FindVandor("", email);

    // Jika ada vandor dengan email yang sama, kembalikan response error dan berhenti eksekusi
    if (existingVandor) {
      return res.status(400).json({
        success: "false",
        message: "A vandor exists with this email ID",
      });
    }

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const createdVandor = await Vandor.create({
      name: name,
      address: address,
      pincode: pincode,
      foodType: foodType,
      email: email,
      password: userPassword,
      salt: salt,
      ownerName: ownerName,
      phone: phone,
      rating: 0,
      serviceAvailable: false,
      coverImages: [],
      foods: [],
      lat: 0,
      lng: 0,
    });

    res.status(201).json({
      success: "true",
      message: "Vandor created successfully",
      data: createdVandor,
    });
  } catch (error) {
    res.status(500).json({
      success: "false",
      message: "Vandor not created",
      error: error,
    });
  }
};

export const GetVandors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const vandor = await Vandor.find();
    if (vandor !== null) {
      return res.status(200).json(vandor);
    } else {
      return res.json({ message: "cannot find a Vandor" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error });
  }
};

export const GetVandorById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: `Invalid Vandor ID format`,
      });
    }

    const vandor = await FindVandor(id);

    return res.status(200).json(vandor);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error });
  }
};

export const GetTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const transactions = await Transaction.find();

  if (transactions) {
    return res.status(200).json(transactions);
  }

  return res.json({ message: "Transactions data not available" });
};

export const GetTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const id = req.params.id;

  const transaction = await Transaction.findById(id);

  if (transaction) {
    return res.status(200).json(transaction);
  }

  return res.json({ message: "Transaction data not available" });
};

export const VerifyDeliveryUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

  const { _id, status } = req.body;

  if(_id){

      const profile = await DeliveryUser.findById(_id);

      if(profile){
          profile.verified = status;
          const result = await profile.save();

          return res.status(200).json(result);
      }
  }

  return res.json({ message: 'Unable to verify Delivery User'});
}


export const GetDeliveryUsers = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

  const deliveryUsers = await DeliveryUser.find();

  if(deliveryUsers){
      return res.status(200).json(deliveryUsers);
  }
  
  return res.json({ message: 'Unable to get Delivery Users'});
}