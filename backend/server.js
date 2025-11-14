const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - UPDATED FOR PRODUCTION
app.use(cors({
    origin: [
        'https://moonlit-maamoul-37863d.netlify.app',  // Your exact Netlify URL
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests for all routes
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', 'https://moonlit-maamoul-37863d.netlify.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.status(200).send();
});

// Handle preflight requests
app.options('*', cors());
app.use(express.json());

// MongoDB Connection with better error handling
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    console.log('💡 Tips: Check your .env file and MongoDB Atlas network settings');
});

// Routes
app.use('/api', require('./routes/api'));

// Health check route
app.get('/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
        res.json({ 
            status: 'OK', 
            database: dbStatus,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ status: 'Error', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
});