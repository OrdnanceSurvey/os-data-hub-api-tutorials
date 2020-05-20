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
    layer: 'Outdoor_3857',
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

    
// Set up the leaflet geojson layer. 
// We'll pass this into the omnivore.geojson() method
var parksLayer = L.geoJSON(null, {
        style: {
            fillColor: osGreen[3],
            color: osGreen[6],
            fillOpacity: 0.3,
            weight: 1
        },
        onEachFeature: function (feature, layer) {
            layer.on({
                'mouseover': function (e) {
                    highlightGeojson(feature.properties.id);
                    highlightListElement(feature.properties.id);                                    
                    
                },
                'mouseout': function (e) {
                    unhighlightGeojson(feature.properties.id);
                    unhighlightListElement(feature.properties.id);
                }, 
                'click': function (e) {
                    flyToBoundsOffset(feature.properties.id, '.osel-sliding-side-panel')
                }
            });

        }
});

// Then fetch the geojson using Leaflet Omnivore, which returns a L.geoJSON object
var nationalParks = omnivore.geojson('./data/national-parks.json', null, parksLayer)
    .on('ready', function () { // <- this callback is executed once data is loaded
        
        nationalParks.getLayers().forEach(function (nationalParkFeature, i) {

            let nationalPark = nationalParkFeature.feature; // <- the GeoJSON Feature object

            // First create the HTML element that will represent the park
            let element =   `<li class="layer" data-np-id="${nationalPark.properties.id}">
                                <div class="layer-element icon" data-type="list-item" data-id="${nationalPark.properties.id}">
                                    <div class="label">
                                        <img class='np-arrow-green' src='./assets/img/np-arrow-green.png' />
                                        <span class='np-name'>${ nationalPark.properties.name }
                                            </span>
                                            <a href="${ nationalPark.properties.url }" target="_blank">
                                                <i class="material-icons" onClick="this.href='${ nationalPark.properties.url }'" aria-label="">launch</i>
                                            </a>
                                    </div>
                                </div>
                            </li>`
            
            element = $.parseHTML(element);

            $(element).find('span').on('click', function (e) {
                e.preventDefault();
                flyToBoundsOffset(nationalPark.properties.id, '.osel-sliding-side-panel')
            });
    
            $(element).on('mouseenter', function () {
                highlightGeojson(nationalPark.properties.id)
                highlightListElement(nationalPark.properties.id)
            });
            
            $(element).on('mouseleave', function () {
                unhighlightGeojson(nationalPark.properties.id)
                unhighlightListElement(nationalPark.properties.id)
            });
    
            $('.layers').append(element);
        });
    })
    .on('error', function (err) {
        console.error(err);
    })
    .addTo(map)



function getFeatureById(dataId) {
    
    let filtered = Object.values(map._layers).filter((l) => {
        if ('feature' in l) {
            return l.feature.properties.id == dataId;
        }
    });

    return filtered[0];
}

function highlightGeojson( dataId) {

    let geojson = getFeatureById(dataId);

    geojson.setStyle({
        fillOpacity: 0.6,
        weight: 3
    })
}

function unhighlightGeojson (dataId) {

    let geojson = getFeatureById(dataId);
    geojson.setStyle({
        fillOpacity: 0.3,
        weight: 1
    })
};

function highlightListElement(dataId) {

    $('[data-np-id="' + String(dataId) + '"]')
        .addClass('highlight');
}

function unhighlightListElement(dataId) {

    $('[data-np-id="' + String(dataId) + '"]')
        .removeClass('highlight')
}

function flyToBoundsOffset(dataId, offsetElSelector, elPosition='left') {

    let offset = $(offsetElSelector).width();

    let geojsonLayer = getFeatureById(dataId);

    let paddingOptions;

    if (elPosition == "left") {
        paddingOptions = {
            paddingTopLeft: [offset, 50],
            paddingBottomRight: [50,50]
        }
    } else if (elPosition == "right") {
        paddingOptions = {
            paddingTopLeft: [50, 50],
            paddingBottomRight: [offset,50]
        }
    }

    map.flyToBounds(geojsonLayer.getBounds(), paddingOptions)

}