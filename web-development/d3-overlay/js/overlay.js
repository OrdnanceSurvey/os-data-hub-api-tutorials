






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