
var config = {
    apikey: prompt("Input API key")
};

var placeServiceUrl = 'https://api.os.uk/search/places/v1',
    serviceUrl = 'https://api.os.uk/maps/vector/v1/vts';

// Initialize the map object.
var map = new mapboxgl.Map({
    container: 'map',
    minZoom: 6,
    maxZoom: 18,
    style: serviceUrl + '/resources/styles?key=' + config.apikey,
    center: [-2.968, 54.425],
    zoom: 13,
    transformRequest: url => {
        return {
            url: url + '&srs=3857'
        }
    }
});

map.dragRotate.disable(); // Disable map rotation using right click + drag.
map.touchZoomRotate.disableRotation(); // Disable map rotation using touch rotation gesture.

// Add navigation control (excluding compass button) to the map.
map.addControl(new mapboxgl.NavigationControl({
    showCompass: false
}));



async function lookUpAddress(e) {
    e.preventDefault();

    let address = document.getElementById('address-text').value

    let res = await fetchAddressFromPlaces(address);
    let coords = [res.results[0].DPA.LNG, res.results[0].DPA.LAT];
    flyToCoords(coords);

}

var form = document.getElementById("the-form");
form.addEventListener('submit', lookUpAddress);

async function fetchAddressFromPlaces(address) {

    let url = placeServiceUrl + `/find?query=${encodeURIComponent(address)}&output_srs=EPSG:4326&key=${config.apikey}`;

    let res = await fetch(url);
    let json = await res.json()
    return json;

}

async function flyToCoords(coords) {
    map.addSource('points-' + JSON.stringify(coords), {
        'type': 'geojson',
        'data': {
            // feature for Mapbox DC
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': coords
            },
            'properties': {
                'title': 'Mapbox DC'
            }
        }

    });

    map.addLayer({
        "id": "points-"  + JSON.stringify(coords),
        "type": "circle",
        "source": "points-"  + JSON.stringify(coords),
        "layout": {
            "visibility": "visible"
        },
        "paint": {
            "circle-radius": 10,
            "circle-color": "#5b94c6",
            "circle-opacity": 0.6
        }
    })
    map.flyTo({
        center: coords
    })
}

function highlightTOID() {

}
