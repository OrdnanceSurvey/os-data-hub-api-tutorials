// First, set up the map
var apiKey = 'FtAS7OR45lE3AR78KxrdGpfYq8uAAV6K';

// Define map options including where the map loads and zoom constraints
var mapOptions = {
    minZoom: 7,
    maxZoom: 20,
    center: [ 54.92240688263684, -5.84949016571045 ],
    zoom: 7,
    attributionControl: false,
    zoomControl: false
};

// Instantiate a new L.map object
var map = new L.map('map', mapOptions);

// Add scale control to the map.
var ctrlScale = L.control.scale({ position: 'bottomright' }).addTo(map);

// Load and display WMTS tile layer on the map.

var wmtsServiceUrl = 'https://osdatahubapi.os.uk/OSMapsAPI/wmts/v1';

// Define parameters object.
var wmtsParams = {
    key: apiKey,
    service: 'WMTS',
    request: 'GetTile',
    version: '2.0.0',
    height: 256,
    width: 256,
    outputFormat: 'image/png',
    style: 'default',
    layer: 'Light_3857',
    tileMatrixSet: 'EPSG:3857',
    tileMatrix: '{z}',
    tileRow: '{y}',
    tileCol: '{x}'
};

var basemapQueryString = Object.keys(wmtsParams).map(
    function(key) {
            return key + '=' + wmtsParams[key];
        }).join('&');

var basemap = L.tileLayer(
        wmtsServiceUrl + "?" + basemapQueryString, 
        { maxZoom: 20 }
    ).addTo(map);
