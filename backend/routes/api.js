const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// Get all locations
router.get('/locations', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new location
router.post('/locations', async (req, res) => {
  const location = new Location({
    name: req.body.name,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    type: req.body.type,
    description: req.body.description
  });

  try {
    const newLocation = await location.save();
    res.status(201).json(newLocation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Calculate route between two points
router.post('/route', async (req, res) => {
  const { startLat, startLng, endLat, endLng } = req.body;
  
  // Simple distance calculation (Haversine formula)
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  const distance = calculateDistance(startLat, startLng, endLat, endLng);
  
  res.json({
    distance: distance.toFixed(2),
    start: { lat: startLat, lng: startLng },
    end: { lat: endLat, lng: endLng }
  });
});

module.exports = router;