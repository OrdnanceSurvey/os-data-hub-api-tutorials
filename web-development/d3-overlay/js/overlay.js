




// https://bl.ocks.org/gwene/f3929040cca81742c29af297efeda7ab
var svg = d3.select('#map').append("svg");

var g = svg.append("g").attr("class", "leaflet-zoom-hide");

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
  }


var q = d3.queue()
  .defer(d3.json, "https://osdatahubapi.os.uk/OSFeaturesAPI/wfs/v1?typeNames=Topography_TopographicArea&key=FtAS7OR45lE3AR78KxrdGpfYq8uAAV6K&service=WFS&request=GetFeature&version=2.0.0&outputFormat=GEOJSON&srsName=urn:ogc:def:crs:EPSG::4326&count=100&startIndex=0")
  .defer(d3.json, "https://osdatahubapi.os.uk/OSFeaturesAPI/wfs/v1?typeNames=Topography_TopographicArea&key=FtAS7OR45lE3AR78KxrdGpfYq8uAAV6K&service=WFS&request=GetFeature&version=2.0.0&outputFormat=GEOJSON&srsName=urn:ogc:def:crs:EPSG::4326&count=100&startIndex=0")
  .awaitAll(function (error, results) {
      console.log(results)
  })
// fetch in data - ideally a points, lines and polygons layer. features API? 

// Draw on SVG

// Add some interactivity 