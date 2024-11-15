import express, { Request, Response, NextFunction } from "express";
import {
  VandorLogin,
  GetVandorProfile,
  UpdateVandorProfile,
  UpdateVandorService,
  UpdateVendorCoverImage,
  GetFoods,
  AddFood,
} from "../controllers";
import { Authenticate } from "../middlewares";
import multer from "multer";
import fs from "fs";

const router = express.Router();

const path = "./src/images";

if (!fs.existsSync(path)) {
  fs.mkdirSync(path, { recursive: true });
}

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/images");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "_" + file.originalname
    );
  },
});

const images = multer({ storage: imageStorage }).array("images", 10);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Vandor route",
  });
});

router.post("/login", VandorLogin);
router.get("/profile", Authenticate, GetVandorProfile);
router.patch("/profile", Authenticate, UpdateVandorProfile);
router.patch("/service", Authenticate, UpdateVandorService);
router.patch("/coverimage", Authenticate, images, UpdateVendorCoverImage);

router.post("/food", Authenticate, images, AddFood);
router.get("/food", Authenticate, GetFoods);

export { router as VandorRoute };
