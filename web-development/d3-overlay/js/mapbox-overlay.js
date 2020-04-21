const apiKey = "FtAS7OR45lE3AR78KxrdGpfYq8uAAV6K";

var serviceUrl = 'https://osdatahubapi.os.uk/OSVectorTileAPI/vts/v1';

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
    typeNames: "Zoomstack_RailwayStations",
    service: 'WFS',
    request: 'GetFeature',
    version: '2.0.0',
    outputFormat: 'GEOJSON',
    srsName: 'urn:ogc:def:crs:EPSG::4326',
    count: 100,
    startIndex: 0
};


// Initialize the map object.
map = new mapboxgl.Map({
    container: 'map',
    style: 'https://labs.os.uk/public/os-data-hub-examples/dist/os-vector-tile-api/styles/greyscale.json',
    // minZoom: 6,
    // maxBounds: [
    //     [ -10.76418, 49.528423 ],
    //     [ 1.9134116, 61.331151 ]
    // ],

    center: [-0.13806, 51.55223],
    zoom: 9,
    transformRequest: url => {
        url += '?key=' + apiKey + '&srs=3857';
        return {
            url: url
        }
    }
});



map.dragRotate.disable(); // Disable map rotation using right click + drag.
map.touchZoomRotate.disableRotation(); // Disable map rotation using touch rotation gesture.

// Add navigation control (excluding compass button) to the map.
map.addControl(new mapboxgl.NavigationControl({
    showCompass: false
}));


var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Setup our svg layer that we can manipulate with d3
const bb = document.getElementById('map').getBoundingClientRect();
var svg = d3.select('#map')
    .append("svg")
    .style("position", "absolute")
    .style("top", 0)
    .style("left", 0)
    .attr("width", bb.width)
    .attr("height", bb.height)
    .style("pointer-events", "none"); // the svg shouldn't capture mouse events, so we can have pan and zoom from mapbox

//Project any point to map's current state
function projectPoint(lon, lat) {
    var point = map.project(new mapboxgl.LngLat(lon, lat));
    this.stream.point(point.x, point.y);
}

//Projection function
var transform = d3.geoTransform({ point: projectPoint });
var path = d3.geoPath().projection(transform);

var stations = svg.selectAll(".station")
var railways = svg.selectAll('.railway')
var camdenPoly = svg.selectAll('.camden');

map.on('load', async function () {

    // Remove the layer we are going to be adding the SVG overlay for
    ["OS Open Zoomstack - Road/railway_stations/Railway Station And London Underground Station",
        "OS Open Zoomstack - Road/railway_stations/London Underground Station",
        "OS Open Zoomstack - Road/railway_stations/Railway Station",
        "OS Open Zoomstack - Road/railway_stations/Light Rapid Transit Station And Railway Station",
        "OS Open Zoomstack - Road/railway_stations/Light Rapid Transit Station And London Underground Station",
        "OS Open Zoomstack - Road/railway_stations/Light Rapid Transit Station"].map((layer) => {
            map.setLayoutProperty(layer, 'visibility', 'none')
        });



    let camden = await d3.json('./data/camden-simple.json');

    map.fitBounds(turf.bbox(camden.features[0]), { padding: 25 });
        
    camdenPoly = camdenPoly.data(camden.features)
        .join('path')
        .attr('class', 'camden')
        .style('fill', osColours.qualitative.lookup[1])
        .style('opacity', 0.2)


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


    let resultsRemain = true;
    fetchWhile(resultsRemain)

})


const update = () => {
    stations.attr("d", path.pointRadius(map.getZoom() / 2));
    camdenPoly.attr('d', path)
}

// Every time the map changes, update the stations
map.on("viewreset", update);
map.on("move", update);
map.on("moveend", update);

update();



function drawStations(stationJSON) {
    let stationFeatures = stationJSON.features;


    console.log(stationFeatures)
    stations = stations.data(stationFeatures)
        .join("path")
        .attr("class", "station")
        .style("fill", (d) => {
            switch (d.properties.Type) {
                case "Railway Station":
                    return osColours.qualitative.lookup[2];
                    break;
                case "Railway Station And London Underground Station":
                    return osColours.qualitative.lookup[3];
                    break;
                case "London Underground Station":
                    return osColours.qualitative.lookup[4];
                    break;
                default:
                    return "black";
            }
        })
        .on("mouseover", (d) => {
            div.style('display', 'block')
                .style('opacity', 1);

            div.html(
                `
              <h3>${d.properties.Name}</h3>
              `
            )
                .style("left", (d3.event.pageX + 15) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        })
        .on('mouseout', (d) => {
            div.transition()
                .duration(200)
                .style('display', 'none')
                .style('opacity', 0)
        })
        .on('click', (d) => {
        })
        .style("pointer-events", "all");

    // railways = railways.data(railwayFeatures)
    //     .join('path')
    //     .attr('class', 'railway')
    //     .style('stroke', 'black')
    //     .on('mouseover', (d) => {console.log(d)})
    //     .style('pointer-events', 'all')

    update()

}


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



async function fetchWhile(resultsRemain, geojson = { "type": "FeatureCollection", "features": [] }) {

    if (resultsRemain) {
        console.log(getUrl(serviceEndpoints.wfs, wfsParams))
        let response = await fetch(getUrl(serviceEndpoints.wfs, wfsParams));
        let data = await response.json();

        wfsParams.startIndex += wfsParams.count;

        geojson.features.push.apply(geojson.features, data.features);

        resultsRemain = data.features.length < wfsParams.count ? false : true;
        console.log(resultsRemain)
        fetchWhile(resultsRemain, geojson);
        // })
        // .catch((err) => {console.error(err); });
    }
    else {
        console.log(geojson)
        // if( geojson.features.length ) {
        drawStations(geojson)
        // return Promise.resolve(geojson);
        // } else {
        //     // Promise.reject('FAIL')
        //     return "Fail"
        // }
        // document.getElementById('message').style.display = 'block';
    }
}