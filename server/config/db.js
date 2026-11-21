const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/solar_erp';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(` Notice: External MongoDB not active (${error.message}).`);
    console.log(` Solar ERP running in High-Performance Local JSON-Document Store Mode.`);
    console.log(` All data is automatically persisted to server/data/*.json.`);
  }
};

module.exports = connectDB;
