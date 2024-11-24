import express, { Request, Response, NextFunction } from "express";
import {
  VandorLogin,
  GetVandorProfile,
  UpdateVandorProfile,
  UpdateVandorService,
  UpdateVendorCoverImage,
  GetFoods,
  AddFood,
  GetOrderDetails,
  GetOrders,
  ProcessOrder,
  GetCurrentOrders,
  AddOffer,
  EditOffer,
  GetOffers,
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

//ORDERS
router.get("/orders", Authenticate, GetCurrentOrders);
router.put("/order/:id/process", Authenticate, ProcessOrder);
router.get("/order/:id", Authenticate, GetOrderDetails);

//OFFERS
router.get('/offers',Authenticate, GetOffers);
router.post('/offer',Authenticate, AddOffer);
router.put('/offer/:id',Authenticate, EditOffer)


export { router as VandorRoute };
