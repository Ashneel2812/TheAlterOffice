const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get the MongoDB URI from the environment variables
    const dbURI = process.env.MONGO_URI;

    if (!dbURI) {
      console.error('MongoDB URI is undefined. Please check your .env file or environment configuration.');
      return;
    }

    // Connect to MongoDB
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
  }
};

module.exports = connectDB;
