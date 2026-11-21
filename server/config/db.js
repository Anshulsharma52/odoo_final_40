const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/solar_erp';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(` MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log(` Active Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(` Fatal: Failed to connect to MongoDB (${error.message})`);
    console.error(` Please ensure MongoDB is running at ${uri}`);
    process.exit(1);
  }
};

module.exports = connectDB;
