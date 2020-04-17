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

let camdenBorough = turf.union(...camdenFeatureCollection.features)
let camdenTrimmed = gp.parse(camdenBorough, 4);

fs.writeFile('camden.json', JSON.stringify(camdenTrimmed), function (err) {
    if (err) return console.log(err);
    console.log("A trimmed and merged Camden has been written to disk!")
})

