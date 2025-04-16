const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

async function testConnection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'Dayli'
        });
        
        console.log('✅ MongoDB Atlas connection successful');
        const collections = await mongoose.connection.db.collections();
        console.log('📁 Available collections:', collections.map(c => c.collectionName));
        
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        if (error.message.includes('bad auth')) {
            console.log('\n🔍 Troubleshooting steps:');
            console.log('1. Username: romavolosh');
            console.log('2. Database: Dayli');
            console.log('3. Cluster: Cluster0');
        }
    } finally {
        await mongoose.connection.close();
    }
}

testConnection();