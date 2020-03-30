





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
      
        let element =    `<li class="layer" data-np-id="1">
                        <div class="layer-element icon" data-type="list-item" data-id="${nationalPark.properties.OBJECTID}">
                            <div class="label">
                                <img class='np-arrow-green' src='./assets/img/np-arrow-green.png' />
                                <span class='np-name'>${
                                    nationalPark.properties.name ? 
                                        nationalPark.properties.name : 
                                        nationalPark.properties.OBJECTID
                                    }
                                    </span>
                                    <a href="${nationalPark.properties.url}" 
                                        
                                        target="_blank">
                                        <i class="material-icons" onClick="this.href='${nationalPark.properties.url}'" aria-label="">launch</i>
                                    </a>
                            </div>
                        </div>
                    </li>`
        
        element = $.parseHTML(element);

        // then create the leaflet geojson layer 
        let park = L.geoJSON(nationalPark, {
                        style: {
                            fillColor: osGreen[3],
                            color: osGreen[6],
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
                                    // map.flyToBounds(park.getBounds(), {
                                    //     padding: [75,75]
                                    // });

                                    flyToOffset(park, '.osel-sliding-side-panel')
                                }
                            });

                        }
                });
        // Do we want a popUp? 


        

        $(element).find('span').on('click', function (e) {

            e.preventDefault();
            flyToOffset(park, '.osel-sliding-side-panel')

        });

        // $(element).children('a').on('click', function () {
        //     console.log('link')
        // })

        $(element).on('mouseenter', function () {
            highlightGeojson(park)
            highlightListElement(element)
        });
        
        $(element).on('mouseleave', function () {
            unhighlightGeojson(park)
            unhighlightListElement(element)
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

function flyToOffset(Lgeojson, offsetElSelector, elPosition='left') {

    let offset = $(offsetElSelector).width();
    console.log("Fly To Offset", offset, elPosition)
    map.flyToBounds(Lgeojson.getBounds(), {
        paddingTopLeft: [offset, 50],
    })

}