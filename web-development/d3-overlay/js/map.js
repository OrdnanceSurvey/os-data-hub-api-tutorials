// First, set up the map
var apiKey = 'FtAS7OR45lE3AR78KxrdGpfYq8uAAV6K';

// Define map options including where the map loads and zoom constraints
var mapOptions = {
    minZoom: 7,
    maxZoom: 20,
    center: [51.540728, -0.14208],
    zoom: 11,
    attributionControl: false,
    zoomControl: false
};


var stations;

var projection, path;


// Instantiate a new L.map object
var map = new L.map('map', mapOptions)
    .on('load', async function () {
        await loadOverlay()
    });




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
    function (key) {
        return key + '=' + wmtsParams[key];
    }).join('&');

var basemap = L.tileLayer(
    wmtsServiceUrl + "?" + basemapQueryString,
    { maxZoom: 20 }
).addTo(map);







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
    console.log(camden)
    let coordsString = camden.features[0].coordinates[0].join(' ')

    let xmlFilter = `
        <ogc:Filter>
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
        </ogc:Filter>
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

    projection = d3.geoMercator()
        .center([center.lng, center.lat])
        .translate([bbox.width / 2, bbox.height / 2])
        .scale(scale);

    path = d3.geoPath(projection)


    // Set up our SVG
    var svg = d3.select(map.getPanes().overlayPane).append("svg")
                .attr("width", document.getElementById('map').clientWidth) 
                .attr("height",document.getElementById('map').clientHeight);

    var g = svg.append('g')
        .classed('rail-stations', true);

    stations = g.selectAll("circle.dot")
        .data(geodata[0].features)
        .enter().append("circle").classed("dot", true)
        .attr("r", 1)
        .style('fill', "#0082a3")
        .style("fill-opacity", 0.6)
        .style('stroke', "#004d60")
        .style("stroke-width",  1)
        .attr("r", 6)
        .attr('cx', function (d) {
            console.log(d);
            console.log( projection(d.geometry.coordinates))
            var x = projection(d.geometry.coordinates)[0];
            console.log(x)
            return x
        })
        .attr('cy', function (d) {
            var y = projection(d.geometry.coordinates)[1];
            console.log(y)
            return y
        })

}




// Use Leaflet to implement a D3 geometric transformation.
// the latLngToLayerPoint is a Leaflet conversion method:
//Returns the map layer point that corresponds to the given geographical
// coordinates (useful for placing overlays on the map).
function projectPoint(coords) {
    let x = coords[0], y = coords[1];
    console.log(coords);
    // From https://bost.ocks.org/mike/leaflet/
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