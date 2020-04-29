# Title

Brief description of the tutorial contents. This markdown file is optimized for Github.

**Image of what we're going for!**

## Tools and APIs

The languages, libraries, APIs and external data sources we'll use to complete this tutorial.

## D3 Overlay

"Choose the right tool for the job" - a common sense saying that applies just as well to web development as it does to home improvement. 

In this tutorial, we'll learn how to use D3.js to add an overlay of geographic features to an interactive Mapbox GL map. Our goal is to create a smooth-panning and zooming user experience, and to gain access to the amazing capabilities of D3. 

## A vector tile basemap

With Mapbox GL JS, first we'll create a basemap connected to the OS Vector Tile API. Since our focus is on the D3 overlay, we won't go into this code in depth - you can find it on our [Examples page](https://labs.os.uk/public/os-data-hub-examples/os-vector-tile-api/vts-3857-basic-map).

We want our basemap in greyscale, so we can distinguish the overlaid features more easily. The ability to customise the style of vector tiles is one of their major advantages. When we instantiate a new `mapboxgl.Map` object, we include a [custom style](https://labs.os.uk/public/os-data-hub-examples/dist/os-vector-tile-api/styles/greyscale.json):

~~~javascript
// Instantiate a new mapboxgl.Map object.
map = new mapboxgl.Map({
    container: 'map',
    style: 'https://labs.os.uk/public/os-data-hub-examples/dist/os-vector-tile-api/styles/greyscale.json',
    center: [-0.13806, 51.55223],
    zoom: 9,
    transformRequest: url => {
        url += '?key=' + apiKey + '&srs=3857';
        return {
            url: url
        }
    }
});
~~~