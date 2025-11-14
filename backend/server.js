const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// NUCLEAR CORS FIX - Manual headers for everything
app.use((req, res, next) => {
    // Set CORS headers for ALL responses
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Immediately respond to OPTIONS requests
    if (req.method === 'OPTIONS') {
        console.log('🔄 Handling OPTIONS preflight request');
        return res.status(200).json({});
    }
    
    next();
});

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB successfully');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
});

// Routes
app.use('/api', require('./routes/api'));

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        cors: 'Enabled'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('🚨 Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 CORS enabled for all origins`);
});