const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
  family: 4,
};

async function dbConnect() {
  if (!process.env.DB_URL) {
    console.error("Missing DB_URL. Add DB_URL to backend/.env or CodeSandbox environment variables.");
    return;
  }

  mongoose
    .connect(process.env.DB_URL, mongoOptions)
    .then(() => {
      console.log("Successfully connected to MongoDB Atlas!");
    })
    .catch((error) => {
      console.log("Unable to connect to MongoDB Atlas!");
      console.error(error.message);
    });
}

module.exports = dbConnect;
