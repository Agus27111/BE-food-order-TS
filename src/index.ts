import express from "express";
import App from "./services/ExpressApp";
import dbConnection from "./services/Database";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
const StartServer = async () => {
  const app = express();
  await App(app);
  await dbConnection();
  app.listen(PORT, () => {
    console.clear();
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

StartServer();
