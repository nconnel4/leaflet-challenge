// instatiate map
const map = L.map('mapid', {
    center: [28.4449, -43.6699],
    zoom: 2.5
});

// instantiate layer control
layerControl = L.control.layers().addTo(map);


const addTileLayer = (overlayName, mapboxId) => {
    return L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: `mapbox/${mapboxId}`,
        accessToken: API_KEY
    });
};

const getMarkerColor = value => {
    if (value >= 90)
        return '#f90015';
    else if (value >= 70)
        return '#f55700';
    else if (value >= 50)
        return '#f1c100';
    else if (value >= 30)
        return '#eaef00';
    else if (value >= 10)
        return '#b3ed00';
    else
        return '#00e51e';
}

const addEarthquakeData = () => {

    //instantiate empty layer group
    let earthquakeLayer = L.layerGroup().addTo(map);

    d3.json('static/data/all_week.geojson.json').then(data => {

        data.features.forEach(dataPoint => {
            const lat = dataPoint.geometry.coordinates[1];
            const long = dataPoint.geometry.coordinates[0];
            const magnitude = dataPoint.properties.mag * 2;
            const depth = dataPoint.geometry.coordinates[2];
            const time = new Date(dataPoint.properties.time * 1000);

            var circle = L.circleMarker([lat, long], {
                radius: magnitude,
                color: getMarkerColor(depth),
                fillColor: getMarkerColor(depth),
                fillOpacity: 0.5
            }).bindPopup('<b>Date/Time:</b>' + time + '<br>' +
                '<b>Coordinates: </b>[' + lat + ', ' + long + ']<br>' +
                '<b>Magnitude:</b>' + magnitude + '<br>' +
                '<b>Depth:</b>' + depth + 'km<br>')

            // add marker to layer group
            earthquakeLayer.addLayer(circle);

        })

        // add layer group to control
        layerControl.addOverlay(earthquakeLayer, 'Earthquake');
    })
};

const addTectonicBoundaries = () => {

    // instantiate empty layer group
    let tectonicLayer = L.layerGroup().addTo(map);

    function addDataToLayer(feature, layer) {
        // function to add geoJson data to layer group
        tectonicLayer.addLayer(layer);
    }

    d3.json('static/data/PB2002_plates.json').then(data => {
        console.log(data);

        tectonicPlates = L.geoJSON(data, {
            onEachFeature: addDataToLayer,
            style: function () {
                return {
                    color: 'orange',
                    fillOpacity: 0,
                    weight: 1
                }
            }
        });

        // add tectonic plates to layer group
        layerControl.addOverlay(tectonicLayer, 'Tectonic Boundaries');
    })
};

const addLegend = () => {
    const legend = L.control({position: 'bottomright'});

    legend.onAdd = () => {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 50, 70, 90];

        div.innerHTML += '<b>Depth (km)</b><br>'

        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getMarkerColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    return legend;
}

const init = () => {

    // create layers
    let streets = addTileLayer('Streets', 'streets-v11');
    let satellite = addTileLayer('Satellite', 'satellite-streets-v11');
    let light = addTileLayer('Light', 'light-v10');

    // set default layer to satellite
    satellite.addTo(map)

    // add layers to control
    layerControl.addBaseLayer(streets, 'Streets');
    layerControl.addBaseLayer(satellite, 'Satellite');
    layerControl.addBaseLayer(light, 'Light')

    // load tectonic plate and earthquake markers into map
    addTectonicBoundaries();
    addEarthquakeData()

    // add legend to map
    let legend = addLegend();
    legend.addTo(map);

};

// run initialization
init();