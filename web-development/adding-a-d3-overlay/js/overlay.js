



mapboxgl.accessToken = "pk.eyJ1Ijoicm9iaXNvbml2IiwiYSI6ImNqbjM5eXEwdjAyMnozcW9jMzdpbGk5emoifQ.Q_S2qL8UW-UyVLikG_KqQA";

var map = new mapboxgl.Map({
    container: 'map',
    center: [-74.0721, 4.7110],
    zoom: 10,
    pitch: 80,
    style: "mapbox://styles/mapbox/streets-v10",
    scrollZoom: true
});

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


var dots;
d3.json('https://gist.githubusercontent.com/john-guerra/c9c14729b8d15b2884d358fa9e368013/raw/d0a1bd65c926623869d62a64d9acd9cecd59d502/Puesto_Votacion_2018.geojson')
    .then((votingStations ) => {
        dots = svg.selectAll(".puesto")
            .data(votingStations.features)
            .join("path")
            .attr("class", "puesto")
            .style("fill", "salmon")
            // .on("mouseover", d => mutable hovered = d)
            .style("pointer-events", "all");
        
        update();
    })


function update () {
    dots.attr("d", path)
        .attr('r', (d) => {
            console.log(map.getZoom())
            return map.getZoom();
        });
}

// Every time the map changes, update the dots
map.on("viewreset", update);
map.on("move", update);
map.on("moveend", update);

