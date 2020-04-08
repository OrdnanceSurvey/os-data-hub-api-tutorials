
mapboxgl.accessToken = "pk.eyJ1Ijoicm9iaXNvbml2IiwiYSI6ImNqbjM5eXEwdjAyMnozcW9jMzdpbGk5emoifQ.Q_S2qL8UW-UyVLikG_KqQA";
const apiKey = "FtAS7OR45lE3AR78KxrdGpfYq8uAAV6K";

var serviceUrl = 'https://osdatahubapi.os.uk/OSMapsAPI/wmts/v1',
    wfsServiceUrl = "https://osdatahubapi.os.uk/OSFeaturesAPI/wfs/v1"

// Define parameters object.
var params = {
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

// Construct query string parameters from object.
var queryString = Object.keys(params).map(function (key) {
    return key + '=' + params[key];
}).join('&');

// Create a map style object using the WMTS service.
var style = {
    'version': 8,
    'sources': {
        'raster-tiles': {
            'type': 'raster',
            'tiles': [serviceUrl + '?' + queryString],
            'tileSize': 256,
            'maxzoom': 20
        }
    },
    'layers': [{
        'id': 'os-maps-wmts',
        'type': 'raster',
        'source': 'raster-tiles'
    }]
};

// Initialize the map object.
var map = new mapboxgl.Map({
    container: 'map',
    minZoom: 7,
    maxZoom: 20,
    style: style,
    center: { "lng": -2.2499467257034667, "lat": 53.47800737015962 },
    zoom: 15.53
});

map.dragRotate.disable(); // Disable map rotation using right click + drag.
map.touchZoomRotate.disableRotation(); // Disable map rotation using touch rotation gesture.

// Add navigation control (excluding compass button) to the map.
map.addControl(new mapboxgl.NavigationControl({
    showCompass: false
}));


// mapbox-gl-draw modes to disable draggable drawn polygons
const NewSimpleSelect = _.extend(MapboxDraw.modes.simple_select, {
    dragMove() { }
});

const NewDirectSelect = _.extend(MapboxDraw.modes.direct_select, {
    dragFeature() { }
});

var draw = new MapboxDraw({
    styles: [ // Customise draw polygon to use OS colours
        // ACTIVE (being drawn)
        // line stroke
        {
            "id": "gl-draw-line",
            "type": "line",
            "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "paint": {
                "line-color": colours.qualitative.lookup["1"],
                "line-dasharray": [0.2, 2],
                "line-width": 2
            }
        },
        // polygon fill
        {
            "id": "gl-draw-polygon-fill",
            "type": "fill",
            "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
            "paint": {
                "fill-color": "#D20C0C",
                "fill-outline-color": colours.qualitative.lookup["1"],
                "fill-opacity": 0.1
            }
        },
        // polygon outline stroke
        // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
        {
            "id": "gl-draw-polygon-stroke-active",
            "type": "line",
            "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "paint": {
                "line-color": colours.qualitative.lookup["1"],
                "line-dasharray": [0.2, 2],
                "line-width": 2
            }
        },
        // vertex point halos
        {
            "id": "gl-draw-polygon-and-line-vertex-halo-active",
            "type": "circle",
            "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
            "paint": {
                "circle-radius": 5,
                "circle-color": "#FFF"
            }
        },
        // vertex points
        {
            "id": "gl-draw-polygon-and-line-vertex-active",
            "type": "circle",
            "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
            "paint": {
                "circle-radius": 3,
                "circle-color": colours.qualitative.lookup["1"],
            }
        },

        // INACTIVE (static, already drawn)
        // line stroke
        {
            "id": "gl-draw-line-static",
            "type": "line",
            "filter": ["all", ["==", "$type", "LineString"], ["==", "mode", "static"]],
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "paint": {
                "line-color": "#000",
                "line-width": 3
            }
        },
        // polygon fill
        {
            "id": "gl-draw-polygon-fill-static",
            "type": "fill",
            "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
            "paint": {
                "fill-color": "#000",
                "fill-outline-color": "#000",
                "fill-opacity": 0.1
            }
        },
        // polygon outline
        {
            "id": "gl-draw-polygon-stroke-static",
            "type": "line",
            "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "paint": {
                "line-color": "#000",
                "line-width": 3
            }
        }
    ],
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true
    },
    modes: {
        ...MapboxDraw.modes,
        simple_select: NewSimpleSelect,
        direct_select: NewDirectSelect
    },

});

map.addControl(draw);

map.on('draw.create', activateFetch);
map.on('draw.delete', disactivateFetch);

function activateFetch() {

    $('#draw-prompt').css('display', 'none')
    $('#percent-built').css('display', 'block')
    $('#fetch-and-calculate').attr('disabled', false)

    // zoom to geometry with .osel-panel offset
}

function disactivateFetch() {
    $('#draw-prompt').css('display', 'block')
    $('#percent-built').css('display', 'none')
    $('#fetch-and-calculate').attr('disabled', true)
}


document.getElementById('fetch-and-calculate').addEventListener('click', async function () {

    let geom = draw.getAll();
    console.log(geom);

    let features = await getIntersectingFeatures(geom);
    console.log(features);

    let intersection = {
        type: "FeatureCollection",
        features: []
    }
    turf.featureEach(features, function (currentFeature) {
        intersection.features.push(turf.intersect(currentFeature, geom.features[0]))
    });


    let percent = turf.area(intersection) / turf.area(geom);

    $('#percent-built span').text((percent * 100).toFixed(2))




    map.addSource('buildings', {
        type: 'geojson',
        data: features
    });

    map.addSource('buildings-intersection', {
        type: 'geojson',
        data: intersection
    });



    map.addLayer({
        id: 'buildings',
        source: 'buildings',
        type: 'fill',
        layout: {},
        paint: {
            'fill-color': colours.qualitative.lookup['2'],
            'fill-opacity': 0.1,
            'fill-outline-color': 'black'

        }
    });


    map.addLayer({
        id: 'intersection-outline',
        source: 'buildings-intersection',
        type: 'line',
        layout: {},
        paint: {
            'line-color': colours.qualitative.lookup['1'],
            'line-width': 2
        }
    });

    console.log(features);
})





async function getIntersectingFeatures(polygon) {

    // Get the circle geometry coordinates and return a new space-delimited string.
    var coords = polygon.features[0].geometry.coordinates[0].join(' ');

    // Create an OGC XML filter parameter value which will select the Greenspace
    // features intersecting the circle polygon coordinates.
    // *** ADD Functionality to filter by Type attribute based on dropdown input!
    var xml = '<ogc:Filter>';
    xml += '<ogc:Intersects>';
    xml += '<ogc:PropertyName>SHAPE</ogc:PropertyName>';
    xml += '<gml:Polygon srsName="urn:ogc:def:crs:EPSG::4326">';
    xml += '<gml:outerBoundaryIs>';
    xml += '<gml:LinearRing>';
    xml += '<gml:coordinates>' + coords + '</gml:coordinates>';
    xml += '</gml:LinearRing>';
    xml += '</gml:outerBoundaryIs>';
    xml += '</gml:Polygon>';
    xml += '</ogc:Intersects>';
    xml += '</ogc:Filter>';


    // Define parameters object.
    let wfsParams = {
        key: apiKey,
        service: 'WFS',
        request: 'GetFeature',
        version: '2.0.0',
        typeNames: 'Zoomstack_LocalBuildings',
        outputFormat: 'GEOJSON',
        srsName: 'urn:ogc:def:crs:EPSG::4326',
        filter: xml,
        count: 100,
        startIndex: 0
    };

    // Create an empty GeoJSON FeatureCollection.
    let geojson = {
        "type": "FeatureCollection",
        "features": []
    };

    geojson.features.length = 0;

    var resultsRemain = true;

    while (resultsRemain) {

        await fetch(getUrl(wfsParams))
            .then(response => response.json())
            .then((data) => {
                // console.log(data)
                // console.log(geojson)
                wfsParams.startIndex += wfsParams.count;

                geojson.features.push.apply(geojson.features, data.features);

                resultsRemain = data.features.length < wfsParams.count ? false : true;

            })
            .catch((err) => { console.error(err); });
    }

    return geojson;

}






/**
 * Return URL with encoded parameters.
 * @param {object} params - The parameters object to be encoded.
 */
function getUrl(params) {
    var encodedParameters = Object.keys(params)
        .map(paramName => paramName + '=' + encodeURI(params[paramName]))
        .join('&');

    return wfsServiceUrl + '?' + encodedParameters;
}

