$.fn.reverse = [].reverse;

var initLoad = true;

var apiKey = 'FtAS7OR45lE3AR78KxrdGpfYq8uAAV6K';

var coordsToFind = null;

var wfsServiceUrl = 'https://osdatahubapi.os.uk/OSFeaturesAPI/wfs/v1',
tileServiceUrl = 'https://osdatahubapi.os.uk/OSMapsAPI/zxy/v1';

// Initialize the map.
    // @TIM I'd like to not make it load zoomed in on London as it is a GB-wide service. 
    // But the map tiles don't extend much beyond the bounds of the UK. 
    // Have you dealt with this in the past? Ideas? 
var mapOptions = {
    minZoom: 7,
    maxZoom: 20,
    center: [ 51.502, -0.126 ],
    zoom: 15,
    attributionControl: false
};

var map = L.map('map', mapOptions);

// Add scale control to the map.
var ctrlScale = L.control.scale({ position: 'bottomleft' }).addTo(map);

// Load and display ZXY tile layer on the map.
var basemap = L.tileLayer(tileServiceUrl + '/Light_3857/{z}/{x}/{y}.png?key=' + apiKey, {
maxZoom: 20
}).addTo(map);


// Define the layer styles.
var styles = {
    'Zoomstack_Greenspace': {
        color: '#0c0',
        fillOpacity: 0.5
    },
    "Zoomstack_NationalParks": {
        color: 'brown',
        fillOpacity: 0.5
    },
    "Zoomstack_Woodland": {
        color: 'green',
        fillOpacity: 0.5
    }, 
    "Zoomstack_LocalBuildings": {
        color: 'grey',
        fillOpacity: 0.5
    }

};

// Create an empty GeoJSON FeatureCollection.
var geojson = {
    "type": "FeatureCollection",
    "features": []
};

// Add layer group to make it easier to add or remove layers from the map.
var foundFeaturesGroup = new L.FeatureGroup().addTo(map);
var coordsToFindGroup = new L.FeatureGroup().addTo(map);


// Add an event listener to handle when the user clicks the 'Find Greenspace' button.
document.getElementById('request').addEventListener('click', function(e) {
    
    // Remove all the layers from the layer group.
    foundFeaturesGroup.clearLayers();

    // Get the centre point of the map window.
    if (!coordsToFind) {
        var coordsToFind = [ map.getCenter().lng, map.getCenter().lat ];
    }

    

    // {Turf.js} Create a point form the centre position.
    var pointToFind = turf.point(coordsToFind);

    // {Turf.js} Takes the centre point coordinates and calculates a circular polygon
    // of the given a radius in kilometers; and steps for precision.
    var circle = turf.circle(coordsToFind, 1, { steps: 24, units: 'kilometers' });

    // Get the circle geometry coordinates and return a new space-delimited string.
    var coords = circle.geometry.coordinates[0].join(' ');

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

    var featureTypeToFind = $('#feature-type-select span').text();
    let typeName = getFeatureTypeToFind(featureTypeToFind);
    // @TIM Do we want to demonstrate a local filter as well? Within Green space - Cemeteries vs Public parks etc? 

    // Define parameters object.
    var wfsParams = {
        key: apiKey,
        service: 'WFS',
        request: 'GetFeature',
        version: '2.0.0',
        typeNames: typeName,
        outputFormat: 'GEOJSON',
        srsName: 'urn:ogc:def:crs:EPSG::4326',
        filter: xml,
        count: 100,
        startIndex: 0
    };

    var resultsRemain = true;

    geojson.features.length = 0;


    // Use fetch() method to request GeoJSON data from the OS Features API.
    //
    // If successful - remove everything from the layer group; then add a new GeoJSON
    // layer (with the appended features).
    //
    // Calls will be made until the number of features returned is less than the
    // requested count, at which point it can be assumed that all features for
    // the query have been returned, and there is no need to request further pages.
    function fetchWhile(resultsRemain) {
        if ( resultsRemain ) {
            fetch(getUrl(wfsParams))
                .then(response => response.json())
                .then((data) => {
                    // console.log(data);
                    wfsParams.startIndex += wfsParams.count;

                    geojson.features.push.apply(geojson.features, data.features);

                    resultsRemain = data.features.length < wfsParams.count ? false : true;

                    fetchWhile(resultsRemain);
                });
        }
        else {
            clearSpinner();
            if( geojson.features.length ) {
                return findNearestN(pointToFind, geojson, 20, typeName);
            } else {
                console.log("No features found");
            }
                // document.getElementById('message').style.display = 'block';
        }
    }

    fetchWhile(resultsRemain);

    
});

/**
 * Creates a GeoJSON layer.
 * @param {object} obj - GeoJSON features object.
 * @param {object} style - Style options.
 */
function createGeoJSONLayer(obj, style) {
    return new L.geoJson(obj, {
        style: styles[style]
    });
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

// /**
//  * Determines the nearest feature in a GeoJSON object.
//  * @param {object} point - GeoJSON point centroid.
//  * @param {object} features - GeoJSON greenspace FeatureCollection.
//  */
// function findNearest(point, features) {
//     var nearestFeature, nearestDistance = 1;

//     // {Turf.js} Iterate over features in greenspace FeatureCollection.
//     turf.featureEach(features, function(currentFeature, featureIndex) {
//         if( featureIndex === 0 )
//             nearestFeature = currentFeature;

//         // {Turf.js} Test if point centroid is within the current greenspace feature.
//         if( turf.booleanWithin(point, currentFeature) ) {
//             nearestFeature = currentFeature;
//             nearestDistance = 0;
//             return;
//         }

//         // {Turf.js} Iterate over coordinates in current greenspace feature.
//         turf.coordEach(currentFeature, function(currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
//             // {Turf.js} Calculates the distance between two points in kilometres.
//             var distance = turf.distance(point, turf.point(currentCoord));

//             // If the distance is less than that whch has previously been calculated
//             // replace the nearest values with those from the current index.
//             if( distance <= nearestDistance ) {
//                 nearestFeature = currentFeature;
//                 nearestDistance = distance;
//                 return;
//             }
//         });
//     });

//     foundFeaturesGroup.addLayer(createGeoJSONLayer(nearestFeature, 'greenspace'));
//     // document.getElementById('distance').innerHTML = (nearestDistance * 1000).toFixed(1) + 'm';
// }

function findNearestN(point, featurecollection, n, typeName) {

    // Calculate distances, add to properties of feature collection
    var polygons = featurecollection.features
    for (var i = 0; i < featurecollection.features.length; i++) {
        polygons[i] = addDistanceFromPointToPolygon(point, polygons[i]);
    }

    // Sort by distance property
        // They appear to be sorted ...
        // ... but if not, would this work? Not exactly I think ...
    polygons = polygons.sort((a,b) => a.properties.distanceToPoint - b.properties.distanceToPoint);
    
    // create FeatureCollection of 0-n features.
    var nearestFeatures = {
        type: "FeatureCollection",
        features: polygons.slice(0, n)
    }

    console.log(nearestFeatures);
    foundFeaturesGroup.addLayer(createGeoJSONLayer(nearestFeatures, typeName));
    
    map.fitBounds(foundFeaturesGroup.getBounds());

}

function addDistanceFromPointToPolygon(point, polygon) {

    var nearestDistance = 100;

    if( turf.booleanWithin(point, polygon) ) {
        return 0;
    }

     // {Turf.js} Iterate over coordinates in current greenspace feature.
    turf.coordEach(polygon, function(currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
        // {Turf.js} Calculates the distance between two points in kilometres.
        var distance = turf.distance(point, turf.point(currentCoord));
        // console.log('distance', distance)
        // If the distance is less than that whch has previously been calculated
        // replace the nearest values with those from the current index.
        if( distance <= nearestDistance ) {
            nearestDistance = distance;
        }
    });

    polygon.properties.distanceToPoint = nearestDistance;
    return polygon;

}

$("#map div.zoom-control [class^='zoom-']").not('disabled').click(function() {
    $(this).hasClass('zoom-in') ? map.zoomIn() : map.zoomOut();
});

map.on({
    zoom: function() {
        $("#map div.zoom-control [class^='zoom-']").removeClass('disabled');
        if( map.getZoom() == map.getMaxZoom() )
            $("#map div.zoom-control .zoom-in").addClass('disabled');
        if( map.getZoom() == map.getMinZoom() )
            $("#map div.zoom-control .zoom-out").addClass('disabled');
    },
    move: function() {
        coordinates.update();
    },
    click: function() {
        resetProperties();
    }
});

map.getPane('shadowPane').style.display = 'none'; // hide shadow pane

// async? or promise ...
function addLayer() {
    map.createPane('foundFeatures');

    var foundFeatures = L.geoJson(null, {
        onEachFeature: onEachFeature,
        pane: 'foundFeatures',
        style: { color: '#666', weight: 2, fillOpacity: 0.3 }
    }),
    mapFeatures = omnivore.geojson('data/sample/boundary.geojson', null, foundFeatures).on('ready', function() {
            // this.eachLayer(bindPopup);
    }).addTo(map); 


}

$(".osel-sliding-side-panel.panel-left .layers .layer .layer-element[data-state='unchecked']").each(function() {
    var id = $(this).parent().data('id');
    $(map.getPane(id)).addClass('hidden');
});

// sortLayers();

function onEachFeature(feature, layer) {
    layer.on('click', function(e) {
        L.DomEvent.stopPropagation(e);

        sliderRight.slideReveal("hide");

        var coord = e.latlng
            offset = feature.geometry.type === 'Point' ? [ 0, -22 ] : [ 0, 8 ];

        var str = '';
        $.each(feature.properties, function(k, v) {
            var value = (v !== '') ? v : '&lt;null&gt;';
            str += '<div class="property"><div>' + k + '</div><div>' + value + '</div></div>';
        });

        $(".osel-feature-properties").html(str);
        $(".osel-sliding-side-panel.panel-right [class^='scroller']").scrollTop(0).scrollLeft(0);

        var popupContent = '\
            <div class="osel-popup-content">\
                <div class="osel-popup-heading">\
                    <div class="osel-popup-title">' + feature.properties[config.defaultField[layer.options.pane]] + '</div>\
                </div>\
                <div class="osel-popup-link">More details</div>\
            </div>\
        ';

        displayPopup(popupContent, coord, offset, mapOffsetX);
    });
}

// function bindPopup(layer) {
//     var obj = layer.feature.properties,
//         values = Object.keys(obj).map(function(e) { return obj[e] });
//
//     var popupContent = '\
//         <div class="osel-popup-content">\
//             <div class="osel-popup-heading">\
//                 <div class="osel-popup-title">' + values[0] + '</div>\
//             </div>\
//             <div class="osel-popup-link">More details</div>\
//         </div>\
//     ';
//
//     layer.bindPopup(popupContent);
// }

function sortLayers() {
    $("ul.layers .layer").reverse().each(function(index) {
        var id = $(this).data('id');
        map.getPane(window[id].options.pane).style.zIndex = 650 + index;
    });
}

function toggleLayer(elem, type) {
    resetProperties();

    var id  = elem.parent().data('id');
    $(map.getPane(window[id].options.pane)).toggleClass('hidden');
}

function resetProperties() {
    $(".osel-fixed-popup").remove();
    map.closePopup();
    sliderRight.slideReveal("hide");
}

function switchBasemap(style) {
    basemap.setUrl(getTileServer(style));
}

function zoomToLayerExtent(lyr) {
    map.fitBounds(window[lyr].getBounds());
}

function setLayerOpacity(lyr, value) {
    map.getPane(window[lyr].options.pane).style.opacity = value;
}

function getTileServer(style = defaults.basemapStyle) {   
    return 'https://osdatahubapi.os.uk/OSMapsAPI/zxy/v1/Light_3857/{z}/{x}/{y}.png?key=' + config.apikey;
}

function addSpinner() {
    $('#request');
}

function addSpinner() {
    
}

function getFeatureTypeToFind(featureTypeToFind) {
    
    switch(featureTypeToFind) {
        case "Green space (OS MasterMap Topo)":
            return "Greenspace_GreenspaceArea";
            break;
        case "Green space (Open Zoomstack)":
            return "Zoomstack_Greenspace";
            break;
        case "National park":
            return "Zoomstack_NationalParks";
            break;
        case "Woodland":
            return "Zoomstack_Woodland";
            break;
        case "Building":
            return "Zoomstack_LocalBuildings";
            break;
    }

}


function toggleClickCoordsListener() {

    if ($("#select-location").hasClass('active')) {
        $('#map').addClass('selecting');

        map.on('click', function (event) {
            let coords = selectLocationOnMap(event);
            $('#select-location').removeClass('active')
            updateCoordsToFindLayer(coords);

        });
    } else {

        $('#map').removeClass('selecting');
        map.off('click');
    }
    
}

function selectLocationOnMap(event) {
    // On click return location, set to coordsToFind

    // Thanks @ramiroaznar! http://bl.ocks.org/ramiroaznar/2c2793c5b3953ea68e8dd26273f5b93c
    var coord = event.latlng.toString().split(',');
    var lat = coord[0].split('(');
    var lng = coord[1].split(')');

    return [Number(lng[0]), Number(lat[1])];
}

function updateCoordsToFindLayer(coords) {

    coordsToFindGroup.clearLayers();
    coordsToFind = coords;
    L.marker(coords.reverse())
        .addTo(coordsToFindGroup);
    
    map.flyTo(coordsToFind)

    // center map on pin? 
}

function setUseMyLocation() {

    // TEST IF THIS WORKS when deployed on web server
    // From https://medium.com/better-programming/how-to-detect-the-location-of-your-websites-visitor-using-javascript-92f9e91c095f
    if ("geolocation" in navigator) {
        // check if geolocation is supported/enabled on current browser
        navigator.geolocation.getCurrentPosition(
            function success(position) {
                // for when getting location is a success
                let coords = [
                    position.coords.longitude,
                    position.coords.latitude
                ]
                updateCoordsToFindLayer(coords) 
                console.log('latitude:', position.coords.latitude, 
                            'longitude:', position.coords.longitude);
            },
            function error(error_message) {
                // for when getting location results in an error
                console.error('An error has occured while retrieving location', error_message)
            }
        );
    } else {
        // geolocation is not supported
        alert('Geolocation is not enabled on this browser. Please select on map.');
        // Alert modal?
    }
}
