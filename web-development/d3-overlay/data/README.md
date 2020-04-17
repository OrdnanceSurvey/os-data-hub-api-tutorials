
# Prepping data

[Camden boundaries](https://opendata.camden.gov.uk/Maps/Camden-Ward-Boundary/yqyi-6agf)
On the command line:

1. Download geojson from Camden.gov.uk

~~~bash
mkdir camden && cd camden
curl https://opendata.camden.gov.uk/resource/hi9w-vm75.json -o camden-wards.json
~~~ 

2. Convert to polygons:

On the command line, with node:
~~~bash
npm install @turf/turf  geojson-precision mapshaper
node
~~~
~~~javascript
const fs = require('fs')
const turf = require('@turf/turf')
const gp = require('geojson-precision')

const camdenFull = require('./camden-wards.json')

camdenFeatureCollection = {
    type: "FeatureCollection", 
    features: camdenFull.map((ward) => {
        let geom = ward['the_geom'];
        geom.type = 'Polygon'

        let feature = {
            type: "Feature",
            geometry: geom
        }

        return feature;
    })
}

// Union wards into geometry
let camdenBorough = turf.union(...camdenFeatureCollection.features)
// Trim unnecessary precision from coordinates
let camdenTrimmed = gp.parse(camdenBorough, 4);

// Write to disk!
fs.writeFile('camden.json', JSON.stringify(camdenTrimmed), function (err) {
    if (err) return console.log(err);
    console.log("A trimmed and merged Camden has been written to disk!")
})
~~~

Result: A 58kb JSON file with a Feature representing the boundaries of the borough of Camden, in London. Ready to create a spatial XML filter!