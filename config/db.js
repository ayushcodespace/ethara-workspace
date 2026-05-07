const dns = require('dns');
const mongoose = require('mongoose');

const connectDB = async () => {
  dns.setServers(['8.8.8.8', '8.8.4.4']);

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully!');
  } catch (error) {
    console.log('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
