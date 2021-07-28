const map = L.map('mapid', {
    center: [45.52, -122.67],
    zoom: 2
  });

const addTileLayer = () => {
    L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    }).addTo(map);
};

const addDataPoints = () => {
    d3.json('static/data/all_week.geojson.json').then(data => {

        const getMarkerColor = value => {
            if (value >= 90) 
                return '#f90015';
            else if (value >= 70)
                return '#f55700';
            else if (value >= 50)
                return '#f1c100';
            else if (value >= 30)
                return '#eaef00'
            else if (value >= 10)
                return '#b3ed00'
            else 
                return '#00e51e'
        }

        data.features.forEach(dataPoint => {
            const lat = dataPoint.geometry.coordinates[1];
            const long = dataPoint.geometry.coordinates[0];
            const magnitude = dataPoint.properties.mag * 2 ;
            const depth = dataPoint.geometry.coordinates[2];

            L.circleMarker([lat, long],  {
                radius:magnitude,
                color: getMarkerColor(depth),
                fillColor: getMarkerColor(depth),
                fillOpacity: 0.5}).addTo(map);
        })
    })
};

const init = () => {
    addTileLayer();
    addDataPoints();
};

init();