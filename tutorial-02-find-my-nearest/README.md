# Find My Nearest ...

Steps to completion

- Develop code
    - Comment!!
- Write tutorial
- Get Kimberly and Tim to review
- Edit and go live.


# Tutorial

Maps that update based on user interaction can be incredibly useful. The Find My Nearest web app showcases a few APIs and web mapping capabilities of the OS Data Hub APIs. 

The webpage lets users select a location on a map, a feature type to visualize, then shows features of those type near their selected location. 

This tutorial will show how we used *[Leaflet](#)* and the *[OS Maps](#)* and *[OS Features](#)* APIs to create an interactive web map. We'll only focus on key functionality here, but all code can be reviewed on Github.

## Configuring the OS Maps API

The Find My Nearest interface shows a large interactive map, created using Leaflet.

Leaflet works by connecting to the OS Maps API, which is a [web map tile service](#). As the user pans and zooms on the map, the browser fetches and renders .png images in the appropriate position. The library provides a large suite of methods enabling interaction and visualization, detailed in the documentation. 

### Sample raster tile, or image with tiles outlined.

When the Leaflet library is imported, a global `L` object is declared. When we instantiate a new `L.map` object we provide the ID of a DOM `<div>` element, as well as a `mapOptions` object specifying where to set the initial view. We also add controls to the map. 

```javascript
var mapOptions = {
    minZoom: 7,
    maxZoom: 20,
    center: [ 51.502, -0.126 ],
    zoom: 15,
    attributionControl: false
};

var map = new L.map('map', mapOptions); 
                // 'map' is the id of the 
                // <div> in the HTML document

var ctrlScale = L.control.scale({ position: 'bottomright' }).addTo(map);

```

This alone does not give the browser any map data to visualize, though. For that we need create a new `L.tileLayer` object, connect it to the OS Maps API, and add it to the map. (Note: an API key is needed, which you can get at osdatahub.os.uk.)

```javascript
// Set API key
var apiKey = "API_KEY_HERE";

// Define URLs of API endpoints
var tileServiceUrl = 'https://osdatahubapi.os.uk/OSMapsAPI/zxy/v1',
wfsServiceUrl = 'https://osdatahubapi.os.uk/OSFeaturesAPI/wfs/v1';

// Load and display ZXY tile layer on the map.
var basemap = L.tileLayer(
        tileServiceUrl + '/Light_3857/{z}/{x}/{y}.png?key=' + apiKey, 
        { maxZoom: 20 }
    ).addTo(map);
```

With that we've created a Leaflet map and connected to the OS Maps API. The result: a pannable, zoomable map that shows the right level of detail for the zoom level. 🗺️

## Querying the OS Features API

The next sections will show how to query the OS Features API based on a location selected by the user. 

### Selecting a location to query

The webpage is designed to let users find their nearest features - but nearest to what? On the page, users have the option to select a location on the map or let the browser detect their location using their IP address. If they don't do either we automatically find features nearest the center of the map when the request is generated.

To do this, we write code for each option, and attach event handlers to the buttons displayed in the lefthand panel. 

First, when they click "Select on map.", users are able to click a location within the map div. The click event object is passed into the function - when a `L.map` object is clicked, _the coordinates of the point clicked are included in the event object_, as the `latlng` property. We parse these and convert them into an array, `[lng, lat]`, and call `updateCoordsToFind()`

```javascript
function selectLocationOnMap(event) {
    // On click return location, set to coordsToFind

    var coord = event.latlng.toString().split(',');
    var lat = coord[0].split('(');
    var lng = coord[1].split(')');

    let coords = [Number(lng[0]), Number(lat[1])];

    updateCoordsToFind(coords);

}
```

(Note: a special thanks for  [@ramiroaznar](http://bl.ocks.org/ramiroaznar/2c2793c5b3953ea68e8dd26273f5b93c) for providing the reference code for this function.)

The `updateCoordsToFind()` function clears sets a global variable to the parameter passed in, clears the map of existing pins and adds a new Leaflet marker to the map at that location. Then it flies to the location so the user can see where they're going to search. 

```javascript
function updateCoordsToFind(coords) {

    coordsToFind = coords;
        // ^^ declared globally 

    coordsToFindGroup.clearLayers();
    L.marker(coords.reverse())
        .addTo(coordsToFindGroup);
    
    map.flyTo(coordsToFind)

}
```

We also let users request results from the approximate location of their IP address, based on some cool code written by [Adeyinka Adegbenro](https://medium.com/better-programming/how-to-detect-the-location-of-your-websites-visitor-using-javascript-92f9e91c095f). We won't get into how it works, but you can read the code [here](#). 

### Querying the OS Features API

The OS Features API serves vector features from Ordnance Survey's huge dataset that match query parameters. To find features near the point queried, we take a few sequential steps:
1. Build a query based on user inputs. 
2. Fetch results based on the query parameters.
3. Find the features nearest the selected point within the array of result features.
4. Add nearest features to the map and sidebar.

Let's look at each of these in order. 

#### Building a query

The user has input the type of features to find and the location they want to search. With this information, we dynamically build a request for the OS Features API. 