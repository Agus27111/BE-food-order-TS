import { Request, Response, NextFunction } from "express";
import { FoodDoc, Offer, Vandor } from "../models";

export const GetFoodAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const pincode = req.params.pincode;

    const result = await Vandor.find({
      pincode: pincode,
      serviceAvailable: true,
    })
      .sort([["rating", "descending"]])
      .populate("foods");
    if (result.length === 0) {
      return res.status(404).json({ msg: "data Not found!" });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ msg: "cannot load data" });
  }
};
export const GetTopRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const pincode = req.params.pincode;

    const result = await Vandor.find({
      pincode: pincode,
      serviceAvailable: true,
    })
      .sort([["rating", "descending"]])
      .limit(10);
    if (result.length === 0) {
      return res.status(404).json({ msg: "data Not found!" });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ msg: "cannot load data" });
  }
};
export const GetFoodsIn30Min = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const pincode = req.params.pincode;

    const result = await Vandor.find({
      pincode: pincode,
      serviceAvailable: false,
    }).populate("foods");

    if (result.length === 0) {
      return res.status(404).json({ msg: "data Not found!" });
    }

    let foodResult: any = [];
    result.map((vandor) => {
      const foods = vandor.foods as [FoodDoc];
      foodResult.push(...foods.filter((food: FoodDoc) => food.readyTime <= 30));
    });

    return res.status(200).json(foodResult);
  } catch (error) {
    return res.status(500).json({ msg: "cannot load data" });
  }
};
export const SearchFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const pincode = req.params.pincode;

    const result = await Vandor.find({
      pincode: pincode,
      serviceAvailable: true,
    }).populate("foods");

    if (result.length === 0) {
      return res.status(404).json({ msg: "data Not found!" });
    }

    let foodResult: any = [];

    result.map((item) => {
      foodResult.push(...item.foods);
    });

    return res.status(200).json(foodResult);
  } catch (error) {
    return res.status(500).json({ msg: "cannot load data" });
  }
};

export const GetAvailableOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const pincode = req.params.pincode;

    const offers = await Offer.find({ pincode: pincode, isActive: true });
    if (!offers) {
      return res.status(400).json({ msg: "Offers not found!" });
    }

    return res.status(200).json(offers);
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
};

export const RestaurantById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const id = req.params.id;

    const result = await Vandor.findById(id).populate("foods");
    if (!result) {
      return res.status(404).json({ msg: "data Not found!" });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ msg: "cannot load data" });
  }
};
