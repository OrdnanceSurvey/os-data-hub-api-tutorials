# National Park Locator

A web interface to find national parks in the UK. 

## TODO:

- Add links to National Parks 
    - Get URLs and add to GeoJSON properties objects
    - Build HTML and drop in URL into href attribute
- Implement offset flyToBounds functionality based on left panel width
- Use OS green colour

## 1. Get National Park boundaries

We'll use the OS Features API to fetch national park boundaries. 

```javascript 


var apiKey = "API_KEY_HERE";
var wfsUrl =  "https://osdatahubapi.os.uk/OSFeaturesAPI/wfs/v1";
var wfsParams = {
    key: apiKey,
    service: 'WFS',
    request: 'GetFeature',
    version: '2.0.0',
    typeNames: 'Zoomstack_NationalParks',
    outputFormat: 'GEOJSON',
    srsName: 'urn:ogc:def:crs:EPSG::4326',
    count: 100,
    startIndex: 0
};

var encodedParameters = Object.keys(params)
        .map(paramName => paramName + '=' + encodeURI(params[paramName]))
        .join('&');

var url = wfsServiceUrl + '?' + encodedParameters;
console.log(url)

var nationalParks = await fetch(url);

```

Then, in terminal we can `curl` the data from the API. (Start out in the root project folder.)

```bash
mkdir data && cd data
curl https://osdatahubapi.os.uk/OSFeaturesAPI/wfs/v1?key=API_KEY_HERE&service=WFS&request=GetFeature&version=2.0.0&typeNames=Zoomstack_NationalParks&outputFormat=GEOJSON&srsName=urn:ogc:def:crs:EPSG::4326&count=100&startIndex=0 -o national-parks.json

```

This geojson file is ~1kb - not too big, but we can slim it down without losing too much detail using [mapshaper.org](https://mapshaper.org/). Upload the file, use the Simplify option, then export as GeoJSON.

[! gif of mapshaper](gif of mapshaper)

