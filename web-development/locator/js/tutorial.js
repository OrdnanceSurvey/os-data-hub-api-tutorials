





// Set up map
var apiKey = 'FtAS7OR45lE3AR78KxrdGpfYq8uAAV6K';
var wmtsServiceUrl = 'https://osdatahubapi.os.uk/OSMapsAPI/wmts/v1';

var mapOptions = {
    minZoom: 7,
    maxZoom: 20,
    center: [ 54.92240688263684, -5.84949016571045 ],
    zoom: 7,
    attributionControl: false,
    zoomControl: false
};

var map = new L.map('map', mapOptions);

// Add scale control to the map.
var ctrlScale = L.control.scale({ position: 'bottomright' }).addTo(map);

// Load and display WMTS tile layer on the map.
var basemapQueryString = generateWMTSQueryString();

var basemap = L.tileLayer(
        wmtsServiceUrl + "?" + basemapQueryString, 
        { maxZoom: 20 }
    ).addTo(map);


// Fetch geojson data to display
var nationalParks = {};

// This is an immediately-invoked function expression. 
// Necessary because we can't use await outside of an async function. 
(async function () {
    nationalParks = await fetch('./data/np-simplified.json');
    nationalParks = await nationalParks.json();

    nationalParks.forEach(function (nationalPark, i) {
        console.log(i);
        // First create the HTML element that will represent the park
        let element =  `<li class="layer" data-np-id=${nationalPark.properties.OBJECTID}>
                        <div class="layer-element icon" data-type="list-item" data-id="">
                            <div class="label"><i class="material-icons">near_me</i>${nationalPark.properties.name ? nationalPark.properties.name : nationalPark.properties.OBJECTID}</div>
                        </div>
                    </li>`;
        
        element = $.parseHTML(element);

        // then create the leaflet geojson layer 
        let park = L.geoJSON(nationalPark, {
                        style: {
                            fillColor: "green",
                            color: "green",
                            fillOpacity: 0.3,
                            weight: 1
                        },
                        onEachFeature: function (feature, layer) {
                            layer.on({
                                'mouseover': function () {
                                    highlightGeojson(park);
                                    highlightListElement(element);                                    $(element).addClass('highlight')
                                },
                                'mouseout': function () {
                                    unhighlightGeojson(park);
                                    unhighlightListElement(element);
                                }, 
                                'click': function () {
                                    map.fitBounds(park.getBounds());
                                }
                            });

                        }
                });
        // Do we want a popUp? 


        

        $(element).on('click', function (e) {

            e.preventDefault();
            map.fitBounds(park.getBounds());

        });

        $(element).on('mouseenter', function () {
            highlightGeojson(park)
        });
        
        $(element).on('mouseleave', function () {
            unhighlightGeojson(park)
        });


        $('.layers').append(element);
        park.addTo(map);

    });
    
})()

function highlightGeojson( geojson) {
    geojson.setStyle({
        fillOpacity: 0.6,
        weight: 3
    })
}

function unhighlightGeojson (geojson) {
    geojson.setStyle({
        fillOpacity: 0.3,
        weight: 1
    })
};

function highlightListElement(html) {
    
    $(html).addClass('highlight')

}

function unhighlightListElement(html) {
    $(html).removeClass('highlight')
}
// Loop through geojson features