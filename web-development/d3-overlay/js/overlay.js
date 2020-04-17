







async function loadOverlay() {
  // https://bl.ocks.org/gwene/f3929040cca81742c29af297efeda7ab

  // The Feature Types we want to fetch from the OS Features API: 
  var featureTypes = [
    "Zoomstack_RailwayStations",
    "Zoomstack_Rail",
    "Zoomstack_Greenspace",
  ]

  serviceEndpoints = {
    wfs: "https://osdatahubapi.os.uk/OSFeaturesAPI/wfs/v1",
    wmts: "https://osdatahubapi.os.uk/OSMapsAPI/wmts/v1"
  }
  // The parameters 
  var wfsParams = {
    key: apiKey,
    service: 'WFS',
    request: 'GetFeature',
    version: '2.0.0',
    outputFormat: 'GEOJSON',
    srsName: 'urn:ogc:def:crs:EPSG::4326',
    count: 100,
    startIndex: 0
  };


  // Load in boundaries we'll use to build the XML filter for the Features API call
  let camden = await d3.json('./data/camden-extra-simple.json');

  let coordsString = camden.coordinates[0].join(' ')
  let xmlFilter = `
      <ogc:Intersects>
        <ogc:PropertyName>SHAPE</ogc:PropertyName>
        <gml:Polygon srsName="urn:ogc:def:crs:EPSG::4326">
          <gml:outerBoundaryIs>
            <gml:LinearRing>
              <gml:coordinates>${coordsString}</gml:coordinates>
            </gml:LinearRing>
          </gml:outerBoundaryIs>
        </gml:Polygon>
      </ogc:Intersects>
      `;

  // Add XML filter to params object
  wfsParams.filter = xmlFilter.split('\n')
    .map(l => l.trim())
    .join('');

  console.log(wfsParams);
  
  let urls = featureTypes.map((featureType) => {

    // Specify the name of the feature type we want to request
    wfsParams.typeNames = featureType;
    return getUrl(serviceEndpoints.wfs, wfsParams)
  });



  // Fetch in data - ideally a points, lines and polygons layer. features API? 
  let geodata = await Promise.all(urls.map((url) => d3.json(url)));


  // Setting up D3:
  var bbox = document.body.getBoundingClientRect();
  var center = map.getCenter();
  var zoom = map.getZoom();

  // 512 is hardcoded tile size, might need to be 256 or changed to suit your map config
  var scale = (512) * 0.5 / Math.PI * Math.pow(2, zoom);

  var projection = d3.geoMercator()
    .center([center.lng, center.lat])
    .translate([bbox.width / 2, bbox.height / 2])
    .scale(scale);

  path.projection(projection)


  // Set up our SVG
  var svg = d3.select('#map').append("svg");

  var g = svg.append("g").attr("class", "leaflet-zoom-hide");

  var dots = g.append('g')
    .classed('rail-stations', true)
    .selectAll("circle.dot")
    .data(geodata[0].features)

  dots.enter().append("circle").classed("dot", true)
    .attr("r", 1)
    .style({
      fill: "#0082a3",
      "fill-opacity": 0.6,
      stroke: "#004d60",
      "stroke-width": 1
    })
    .attr("r", 6)

  // Draw on SVG

  // Add some interactivity
  dots
    .attr('cx', function (d) {
      var x = path(d.geometry.coordinates)[0];
      console.log(x)
      return x
    })
    .attr('cy', function (d) {
      var y = path(d.geometry.coordinates)[1];
      console.log(y)
      return y
    })

}

// render()

// function render() {

//     path.projection(d3Projection)

//     dots
//       .attr('cx', function (d) {
//         var x = path(d.geometry.coordinates)[0];
//         console.log(x)
//         return x
//       })
//       .attr('cy', function (d) {
//         var y = path(d.geometry.coordinates)[1];
//         console.log(y)
//         return y
//       })

//   }




// Use Leaflet to implement a D3 geometric transformation.
// the latLngToLayerPoint is a Leaflet conversion method:
//Returns the map layer point that corresponds to the given geographical
// coordinates (useful for placing overlays on the map).
function projectPoint(x, y) {
  var point = map.latLngToLayerPoint(new L.LatLng(y, x));
  this.stream.point(point.x, point.y);
} //end projectPoint





// Helper function
function getUrl(serviceUrl, params) {
  // encodedParameters is assigned to descriptionParams object above converted into an encoded URI
  // As an example, {version: "2.0.0", service: "WFS"} becomes version=2.0.0&service=WFS
  let encodedParameters = Object.keys(params)
    .map(paramName => paramName + '=' + encodeURI(params[paramName]))
    .join('&'); // each parameter is joined with "&"

  // And the full URL is constructed
  return serviceUrl + '?' + encodedParameters;
}