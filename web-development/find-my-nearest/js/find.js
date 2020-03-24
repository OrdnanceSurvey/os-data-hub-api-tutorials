var wfsServiceUrl = 'https://osdatahubapi.os.uk/OSFeaturesAPI/wfs/v1',
  tileServiceUrl = 'https://osdatahubapi.os.uk/OSMapsAPI/zxy/v1';


    // Load and display ZXY tile layer on the map.
var basemap = L.tileLayer(tileServiceUrl + '/Light_3857/{z}/{x}/{y}.png?key=' + config.apikey, {
  maxZoom: 20
}).addTo(map);

var styles = {
  'greenspace': {
      color: '#0c0',
      fillOpacity: 1
  }
};

// Create an empty GeoJSON FeatureCollection.
var geojson = {
  "type": "FeatureCollection",
  "features": []
};

// Add layer group to make it easier to add or remove layers from the map.
var lyrGroup = new L.layerGroup().addTo(map);




// Add an event listener to handle when the user clicks the 'Find Greenspace' button.
function getFeatures() {
  // Remove all the layers from the layer group.
  lyrGroup.clearLayers();

  // Get the centre point of the map window.
  var center = [ map.getCenter().lng, map.getCenter().lat ];

  // {Turf.js} Create a point form the centre position.
  var point = turf.point(center);

  // {Turf.js} Takes the centre point coordinates and calculates a circular polygon
  // of the given a radius in kilometers; and steps for precision.
  var circle = turf.circle(center, 1, { steps: 24, units: 'kilometers' });

  // Get the circle geometry coordinates and return a new space-delimited string.
  var coords = circle.geometry.coordinates[0].join(' ');

  // Create an OGC XML filter parameter value which will select the Greenspace
  // features intersecting the circle polygon coordinates.
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
  var wfsParams = {
      key: config.apikey,
      service: 'WFS',
      request: 'GetFeature',
      version: '2.0.0',
      typeNames: 'Zoomstack_Greenspace',
      outputFormat: 'GEOJSON',
      srsName: 'urn:ogc:def:crs:EPSG::4326',
      filter: xml,
      count: 100,
      startIndex: 0
  };

  var resultsRemain = true;

  geojson.features.length = 0;

  lyrGroup.addLayer(createGeoJSONLayer(geojson, 'greenspace'));
  // document.getElementById('distance').innerHTML = '';
  // document.getElementById('message').style.display = 'none';

  // Use fetch() method to request GeoJSON data from the OS Features API.
  //
  // If successful - remove everything from the layer group; then add a new GeoJSON
  // layer (with the appended features).
  //
  // Calls will be made until the number of features returned is less than the
  // requested count, at which point it can be assumed that all features for
  // the query have been returned, and there is no need to request further pages.
  function fetchWhile(resultsRemain) {
      if( resultsRemain ) {
          fetch(getUrl(wfsParams))
              .then(response => response.json())
              .then((data) => {
                  wfsParams.startIndex += wfsParams.count;

                  geojson.features.push.apply(geojson.features, data.features);

                  resultsRemain = data.features.length < wfsParams.count ? false : true;

                  fetchWhile(resultsRemain);
              });
      }
      else {
          if( geojson.features.length )
              findNearest(point, geojson);
          else
              pass;
          // document.getElementById('message').style.display = 'block';
      }
  }

  fetchWhile(resultsRemain);
}






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

/**
 * Determines the nearest feature in a GeoJSON object.
 * @param {object} point - GeoJSON point centroid.
 * @param {object} features - GeoJSON greenspace FeatureCollection.
 */
function findNearest(point, features) {
    var nearestFeature, nearestDistance = 1;

    // {Turf.js} Iterate over features in greenspace FeatureCollection.
    turf.featureEach(features, function(currentFeature, featureIndex) {
        if( featureIndex === 0 )
            nearestFeature = currentFeature;

        // {Turf.js} Test if point centroid is within the current greenspace feature.
        if( turf.booleanWithin(point, currentFeature) ) {
            nearestFeature = currentFeature;
            nearestDistance = 0;
            return;
        }

        // {Turf.js} Iterate over coordinates in current greenspace feature.
        turf.coordEach(currentFeature, function(currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
            // {Turf.js} Calculates the distance between two points in kilometres.
            var distance = turf.distance(point, turf.point(currentCoord));

            // If the distance is less than that whch has previously been calculated
            // replace the nearest values with those from the current index.
            if( distance <= nearestDistance ) {
                nearestFeature = currentFeature;
                nearestDistance = distance;
                return;
            }
        });
    });

    lyrGroup.addLayer(createGeoJSONLayer(nearestFeature, 'greenspace'));
    // document.getElementById('distance').innerHTML = (nearestDistance * 1000).toFixed(1) + 'm';
}



map.on('click', function (e) {
    // will need to assign this to the coordsToFind variable? 
    getCoordinatesFromClick(e)
});


function getLocationFromIP() {
    // From https://medium.com/better-programming/how-to-detect-the-location-of-your-websites-visitor-using-javascript-92f9e91c095f
    if ("geolocation" in navigator) {
        // check if geolocation is supported/enabled on current browser
        navigator.geolocation.getCurrentPosition(
         function success(position) {
           // for when getting location is a success
           console.log('latitude', position.coords.latitude, 
                       'longitude', position.coords.longitude);
         },
        function error(error_message) {
          // for when getting location results in an error
          console.error('An error has occured while retrieving location', error_message)
        });
      } else {
        // geolocation is not supported
        console.log('geolocation is not enabled on this browser');
        // Alert modal?
      }
}


function fetchNearestFeatures(coords, params) {

    // Create API request
    // Do we just want to use d3.json? 

    // fetch features

    // return promise ? 

}

