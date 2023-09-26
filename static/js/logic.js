// Create background tile layer
let backgroundMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the map object
let map = L.map("map", {
    center: [39.83, -108.58], // Center the map
    zoom: 6, // Initial zoom
    layers: [backgroundMap] // Set background map as default layer
});

// Create a pop-up with explanation text.
let explanationPopup = L.popup()
    .setLatLng([39.83, -108.58]) // Adjust the coordinates as needed
    .setContent('<h1>Earthquake Map</h1>' +
        '<p>This map shows earthquake data for the past 7 days with depth-based coloring and magnitude-based marker size. Click on a marker for more information about each earthquake.</p>')
    .openOn(map);

// Create a legend
let legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let depths = [0, 10, 30, 50, 70, 90]; // Define depth ranges
    let colors = ['#00FF00', '#CCFF00', '#FFFF00', '#FFCC00', '#FF9900', '#FF0000']; // Define colors for each depth range
    let labels = [];

    // Loop through depth ranges and create labels
    for (let i = 0; i < depths.length; i++) {
        let from = depths[i];
        let to = depths[i + 1];

        // Create a <div> each legend item with a white background
        let legendItemContainer = document.createElement('div');
        legendItemContainer.style.background = '#FFFFFF';
        legendItemContainer.style.margin = '2px';

        // Create a <div> for the colored box and label
        let legendItem = document.createElement('div');
        legendItem.innerHTML =
            '<span class="legend-color" style="background:' + colors[i] + '"></span>' +
            from + (to ? '&ndash;' + to : '+');
        legendItem.style.display = 'flex';
        legendItem.style.alignItems = 'center';
        legendItem.style.padding = '2px 5px';

        // Append the inner <div> to the container <div>
        legendItemContainer.appendChild(legendItem);

        // Append the container <div> to the legend
        div.appendChild(legendItemContainer);
    }

    return div;
};

legend.addTo(map);

// Load earthquake data from USGS API
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
    // Set marker color based on depth
    function getColor(depth) {
        if (depth <= 10) return '#00FF00';
        else if (depth <= 30) return '#CCFF00';
        else if (depth <= 50) return '#FFFF00';
        else if (depth <= 70) return '#FFCC00';
        else if (depth <= 90) return '#FF9900';
        else return '#FF0000';
    }

    // Set marker size based on magnitude
    function getRadius(magnitude) {
        return Math.sqrt(magnitude) * 5;
    }

    // Create GeoJSON layer and add it to the map
    L.geoJSON(data.features, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getRadius(feature.properties.mag),
                fillColor: getColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).bindPopup(
                "Magnitude: " + feature.properties.mag +
                "<br>Depth: " + feature.geometry.coordinates[2] +
                "<br>Location: " + feature.properties.place
            );
        }
    }).addTo(map);
});