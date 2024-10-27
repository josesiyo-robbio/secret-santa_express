const mongoose = require('mongoose');

const uri = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?authSource=admin`;

const connectDB = async () => {
  try 
  {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } 
  catch (error) 
  {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
