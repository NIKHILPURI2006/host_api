class MapNavigator {
    constructor() {
        this.map = null;
        this.markers = [];
        this.routeLayer = null;
        this.apiBaseUrl = 'https://map-navigator-backend.onrender.com/api';
        
        this.initMap();
        this.bindEvents();
        this.loadSavedLocations();
    }

    initMap() {
        // Initialize map centered on a default location
        this.map = L.map('map').setView([40.7128, -74.0060], 13); // New York City

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add click event to map
        this.map.on('click', (e) => {
            this.addMarker(e.latlng.lat, e.latlng.lng);
        });
    }

    bindEvents() {
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.searchLocation();
        });

        document.getElementById('planRoute').addEventListener('click', () => {
            this.planRoute();
        });

        // Enter key support for search
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchLocation();
            }
        });
    }

    async searchLocation() {
        const query = document.getElementById('searchInput').value;
        if (!query) return;

        try {
            // Using OpenStreetMap Nominatim API for geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);
                
                this.map.setView([lat, lon], 15);
                this.addMarker(lat, lon, result.display_name);
            } else {
                alert('Location not found!');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Error searching location');
        }
    }

    addMarker(lat, lng, name = 'New Location') {
        const marker = L.marker([lat, lng]).addTo(this.map);
        
        marker.bindPopup(`
            <b>${name}</b><br>
            <button onclick="mapApp.saveLocation(${lat}, ${lng}, '${name}')">Save Location</button>
        `);
        
        this.markers.push(marker);
    }

    async saveLocation(lat, lng, name) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/locations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    latitude: lat,
                    longitude: lng,
                    type: 'landmark'
                })
            });

            if (response.ok) {
                alert('Location saved successfully!');
                this.loadSavedLocations();
            } else {
                alert('Error saving location');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Error saving location');
        }
    }

    async loadSavedLocations() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/locations`);
            const locations = await response.json();
            
            const locationsList = document.getElementById('locationsList');
            locationsList.innerHTML = '';
            
            locations.forEach(location => {
                const li = document.createElement('li');
                li.textContent = location.name;
                li.onclick = () => {
                    this.map.setView([location.latitude, location.longitude], 15);
                    this.addMarker(location.latitude, location.longitude, location.name);
                };
                locationsList.appendChild(li);
            });
        } catch (error) {
            console.error('Load locations error:', error);
        }
    }

    async planRoute() {
        const startInput = document.getElementById('startPoint').value;
        const endInput = document.getElementById('endPoint').value;
        
        if (!startInput || !endInput) {
            alert('Please enter both start and end points');
            return;
        }

        try {
            // Geocode start and end points
            const [startResponse, endResponse] = await Promise.all([
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startInput)}`),
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endInput)}`)
            ]);

            const [startData, endData] = await Promise.all([
                startResponse.json(),
                endResponse.json()
            ]);

            if (startData.length === 0 || endData.length === 0) {
                alert('Could not find one or both locations');
                return;
            }

            const start = startData[0];
            const end = endData[0];
            const startLat = parseFloat(start.lat);
            const startLng = parseFloat(start.lon);
            const endLat = parseFloat(end.lat);
            const endLng = parseFloat(end.lon);

            // Calculate route using our API
            const routeResponse = await fetch(`${this.apiBaseUrl}/route`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startLat: startLat,
                    startLng: startLng,
                    endLat: endLat,
                    endLng: endLng
                })
            });

            const routeData = await routeResponse.json();

            // Display route on map
            this.displayRoute(startLat, startLng, endLat, endLng, routeData.distance);

            // Show route info
            document.getElementById('routeInfo').innerHTML = `
                <strong>Route Information:</strong><br>
                Distance: ${routeData.distance} km<br>
                From: ${start.display_name}<br>
                To: ${end.display_name}
            `;

        } catch (error) {
            console.error('Route planning error:', error);
            alert('Error planning route');
        }
    }

    displayRoute(startLat, startLng, endLat, endLng, distance) {
        // Clear previous route
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
        }

        // Add markers for start and end points
        const startMarker = L.marker([startLat, startLng]).addTo(this.map);
        const endMarker = L.marker([endLat, endLng]).addTo(this.map);

        // Create a simple line for the route (in real app, use routing service)
        const routeLine = L.polyline([
            [startLat, startLng],
            [endLat, endLng]
        ], { color: 'blue' }).addTo(this.map);

        this.routeLayer = L.layerGroup([startMarker, endMarker, routeLine]);
        
        // Fit map to show the entire route
        this.map.fitBounds(routeLine.getBounds());
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mapApp = new MapNavigator();
});