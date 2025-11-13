const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('🔗 Testing MongoDB connection...');
        
        // Check if .env is loaded
        if (!process.env.MONGODB_URI) {
            console.log('❌ MONGODB_URI not found in .env file');
            return;
        }
        
        console.log('📁 Connecting to MongoDB...');
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
        
        // Test if we can create and save a location
        const Location = require('./models/Location');
        const testLocation = new Location({
            name: 'Test Location - Times Square',
            latitude: 40.7589,
            longitude: -73.9851,
            type: 'landmark',
            description: 'Test location for database connection'
        });
        
        await testLocation.save();
        console.log('✅ SUCCESS: Test location saved to database!');
        console.log('📍 Saved location:', testLocation);
        
        // Find and display all locations
        const allLocations = await Location.find();
        console.log('📊 All locations in database:', allLocations);
        
        // Don't clean up so we can see it in the app
        console.log('💡 Test location kept in database for verification');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.log('💡 Check your MONGODB_URI in .env file and MongoDB Atlas settings');
        process.exit(1);
    }
}

testConnection();