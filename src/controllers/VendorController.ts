import { Request, Response, NextFunction } from "express";
import { VandorLoginInput, EditVendorInput } from "../dto";
import { Food } from "../models";
// import { Offer } from '../models/Offer';
// import { Order } from '../models/Order';
import { GenerateSignature, ValidatePassword } from "../utility";
import { FindVandor } from "./AdminController";
import bcrypt from "bcrypt";
import { CreateFoodInput } from "../dto/Food.dto";

export const VandorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { email, password } = <VandorLoginInput>req.body;

    if (!email || !password) {
      return res.json({ message: "Email and password must be filled" });
    }

    const existingUser = await FindVandor("", email);

    if (!existingUser) {
      return res.status(404).json({ message: "Vandor not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const signature = await GenerateSignature({
      _id: existingUser._id as string,
      email: existingUser.email,
      name: existingUser.name,
    });

    return res.status(200).json({ status: "success", signature: signature });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

export const GetVandorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const user = req.user;

  if (user) {
    const existingVendor = await FindVandor(user._id);
    return res.json(existingVendor);
  }

  return res.json({ message: "vendor Information Not Found" });
};

export const UpdateVandorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const user = req.user;

  const { foodType, name, address, phone } = <EditVendorInput>req.body;

  if (user) {
    const existingVendor = await FindVandor(user._id);

    if (existingVendor !== null) {
      existingVendor.name = name;
      existingVendor.address = address;
      existingVendor.phone = phone;
      existingVendor.foodType = foodType;
      const saveResult = await existingVendor.save();

      return res.json(saveResult);
    }
  }
  return res.json({ message: "Unable to Update vendor profile " });
};

export const UpdateVendorCoverImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const user = req.user;

    if (user) {
      const vendor = await FindVandor(user._id);

      if (vendor !== null) {
        const files = req.files as [Express.Multer.File];

        if (files && files.length > 0) {
          const images = files.map(
            (file: Express.Multer.File) => file.filename
          );

          vendor.coverImage.push(...images);

          const saveResult = await vendor.save();
          return res.json(saveResult);
        } else {
          return res.status(400).json({ message: "No files uploaded" });
        }
      } else {
        return res.status(404).json({ message: "Vendor not found" });
      }
    } else {
      return res.status(401).json({ message: "User not authenticated" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update vendor profile image",
      error: error.message,
    });
  }
};

export const UpdateVandorService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const user = req.user;

    const existingVendor = await FindVandor(user._id);

    if (!existingVendor) {
      return res.status(400).json({
        message: "user not authenticate",
      });
    }
    existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
    const saveResult = await existingVendor.save();

    return res.status(200).json({
      success: "success",
      message: "service now avaluable",
      data: saveResult,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const AddFood = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const user = req.user;
  const { name, description, category, foodType, readyTime, price } = <
    CreateFoodInput
  >req.body;

  if (user) {
    const vendor = await FindVandor(user._id);

    if (vendor !== null) {
      const files = req.files as [Express.Multer.File];

      const images = files.map((file: Express.Multer.File) => file.filename);

      const food = await Food.create({
        vendorId: vendor._id,
        name: name,
        description: description,
        category: category,
        price: price,
        rating: 0,
        readyTime: readyTime,
        foodType: foodType,
        images: images,
      });
      vendor.foods.push(food);
      const result = await vendor.save();
      return res.json(food);
    }
  }
  return res.json({ message: "Unable to Update vendor profile " });
};

export const GetFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const user = req.user;

  if (user) {
    const foods = await Food.find({ vendorId: user._id });

    if (foods !== null) {
      return res.json(foods);
    }
  }
  return res.json({ message: "Foods not found!" });
};
