const mongoose = require("mongoose");

const DB_URL =
  "mongodb://admin:amadeuswaifu221005@ac-voegqcs-shard-00-00.zwm49zf.mongodb.net:27017,ac-voegqcs-shard-00-01.zwm49zf.mongodb.net:27017,ac-voegqcs-shard-00-02.zwm49zf.mongodb.net:27017/final-project?ssl=true&replicaSet=atlas-10k3vj-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
  family: 4,
};

async function dbConnect() {
  mongoose
    .connect(DB_URL, mongoOptions)
    .then(() => {
      console.log("Successfully connected to MongoDB Atlas!");
    })
    .catch((error) => {
      console.log("Unable to connect to MongoDB Atlas!");
      console.error(error.message);
    });
}

module.exports = dbConnect;
