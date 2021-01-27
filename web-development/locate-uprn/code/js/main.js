
var config = {
    apikey: "SrUGRuBNJ9UgRoI6cdJ0WIzbYJ8n1P91"
};

var placeServiceUrl = 'https://api.os.uk/search/places/v1',
    serviceUrl = 'https://api.os.uk/maps/vector/v1/vts';

// Initialize the map object.
var map = new mapboxgl.Map({
    container: 'map',
    minZoom: 6,
    // maxZoom: 18,
    style: serviceUrl + '/resources/styles?key=' + config.apikey,
    center: [-2.968, 54.425],
    zoom: 13,
    transformRequest: url => {
        return {
            url: url + '&srs=3857'
        }
    }
});

// Add navigation control (excluding compass button) to the map.
map.addControl(new mapboxgl.NavigationControl());



async function lookUpAddress(e) {
    e.preventDefault();

    let address = document.getElementById('address-text').value

    let res = await fetchAddressFromPlaces(address);
    console.log(res)
    let coords = [res.results[0].DPA.LNG, res.results[0].DPA.LAT];
    flyToCoords(coords);
    highlightTOID(res.results[0].DPA.TOPOGRAPHY_LAYER_TOID)

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
    // map.addSource('points-' + JSON.stringify(coords), {
    //     'type': 'geojson',
    //     'data': {

    //         'type': 'Feature',
    //         'geometry': {
    //             'type': 'Point',
    //             'coordinates': coords
    //         },
    //         'properties': {
    //             'title': 'Mapbox DC'
    //         }
    //     }

    // });

    // map.addLayer({
    //     "id": "points-" + JSON.stringify(coords),
    //     "type": "circle",
    //     "source": "points-" + JSON.stringify(coords),
    //     "layout": {
    //         "visibility": "visible"
    //     },
    //     "paint": {
    //         "circle-radius": 10,
    //         "circle-color": "#5b94c6",
    //         "circle-opacity": 0.5
    //     }
    // });

    map.once('moveend', function(){
        console.log('moveend logging');
        map.rotateTo(90.0, {duration: 5000});
    });
    
    map.flyTo({
        center: coords,
        zoom: 17.5,
        pitch: 75
    })

 
}

function highlightTOID(toidArray) {
    console.log(toidArray)

    var filter = ["in", "TOID"];
    for (var i in toidArray) {
        filter.push(toidArray[i]);
    }

    var ftArray = map.queryRenderedFeatures({ filter: filter });
    console.log(ftArray);

    map.addLayer({
        "id": "OS/TopographicArea_1/Building/1_3D-2",
        "type": "fill-extrusion",
        "source": "esri",
        "source-layer": "TopographicArea_1",
        "filter": [
            "==",
            "TOID",
            toidArray
        ],
        "minzoom": 16,
        "layout": {},
        "paint": {
            "fill-extrusion-color": "#FF1F5B",
            "fill-extrusion-opacity": 1,
            "fill-extrusion-height": [
                "interpolate",
                [ "linear" ],
                [ "zoom" ],
                16,
                0,
                16.05,
                [ "get", "RelHMax" ]
            ],
        }
    })
}



var qryLayers = [
    'OS/TopographicArea_1/Building/1',
    'OS/TopographicArea_1/Multi Surface'
];

var toidArray = [];

map.on("style.load", function () {
    map.getStyle().layers.forEach(function(val, i) {
        if(! val['source-layer'] )
            return;

        if( val['source-layer'] === 'CartographicText' ) {
            map.setLayoutProperty(val.id, 'text-rotation-alignment', 'map');
        }
        else if( val['source-layer'] === 'CartographicSymbol' || val['source-layer'] === 'TopographicPoint' ) {
            map.setLayoutProperty(val.id, 'icon-rotation-alignment', 'map');
        }
    });

    // Duplicate 'OS/TopographicArea_1/Building/1' layer to extrude the buildings
    // in 3D using the Building Height Attribute (RelHMax) value.
    map.addLayer({
        "id": "OS/TopographicArea_1/Building/1_3D",
        "type": "fill-extrusion",
        "source": "esri",
        "source-layer": "TopographicArea_1",
        "filter": [
            "==",
            "_symbol",
            33
        ],
        "minzoom": 16,
        "layout": {},
        "paint": {
            "fill-extrusion-color": "#DCD7C6",
            "fill-extrusion-opacity": 0.5,
            "fill-extrusion-height": [
                "interpolate",
                [ "linear" ],
                [ "zoom" ],
                16,
                0,
                16.05,
                [ "get", "RelHMax" ]
            ]
            // "fill-extrusion-opacity": 0.9
        }
    })
})

map.on('load', function () {


    map.on('click', function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: qryLayers });
        if (!features.length)
            return;


        toidArray = [];
        
        for (var i = 0; i < features.length; i++) {
            var toid = features[i].properties.TOID,
                j = toidArray.indexOf(toid);

            if (j === -1)
                toidArray.push(toid);
            else
                toidArray.splice(j, 1);

            break;
        }
        
        highlightTOID(toidArray)

        

        var filter = ["in", "TOID"];
        for (var i in toidArray) {
            filter.push(toidArray[i]);
        }

        var ftArray = map.queryRenderedFeatures({ filter: filter });

        if (!ftArray.length) {
            reset();
        }
        else {
            geojson = turf.getType(ftArray[0].geometry) === 'Polygon' ?
                turf.polygon(ftArray[0].geometry.coordinates) :
                turf.multiPolygon(ftArray[0].geometry.coordinates);

            geojson = turf.flatten(geojson);

            for (var i in ftArray) {
                var _geojson = turf.getType(ftArray[i].geometry) === 'Polygon' ?
                    turf.polygon(ftArray[i].geometry.coordinates) :
                    turf.multiPolygon(ftArray[i].geometry.coordinates);

                for (var j = 0; j < turf.flatten(_geojson).features.length; j++) {
                    geojson.features.push(turf.flatten(_geojson).features[j]);
                }
            }

            geojson = turf.buffer(turf.combine(geojson), 0);

            var _uuid = uuid();

            geojson.features[0].properties = {
                id: _uuid,
                refToTopo: toidArray,
                calcArea: turf.area(geojson)
            };

            // document.getElementsByTagName("pre")[0].innerText = JSON.stringify(geojson, null, 2);
            document.getElementById("download-link").innerHTML = `<a href="data:${"text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson))}" download="${_uuid}.geojson">Download GeoJSON</a>`;
        }

        // console.log(geojson);

        map.getSource("combine").setData(geojson);
    });
})