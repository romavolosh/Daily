const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'Dayli',
            serverSelectionTimeoutMS: 5000,
            retryWrites: true
        });
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        setTimeout(connectDB, 5000);
    }
}

module.exports = connectDB;