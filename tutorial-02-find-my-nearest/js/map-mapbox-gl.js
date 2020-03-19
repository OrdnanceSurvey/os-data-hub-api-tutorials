$.fn.reverse = [].reverse;

mapboxgl.accessToken = 'NOT-REQUIRED-WITH-YOUR-VECTOR-TILES-DATA';

var initLoad = true;

var _qryLayers = [ 'mapLayer01', 'mapLayer02', 'mapLayer03' ];

var sw = [ -8.74, 49.84 ],
    ne = [ 1.96, 60.9 ];

var bounds = [ sw, ne ],
    center = [ -1.485, 52.567 ]; //new mapboxgl.LngLatBounds(sw, ne).getCenter();

var map = new mapboxgl.Map({
    container: 'map',
    minZoom: 7,
    maxZoom: 16,
    maxBounds: bounds,
    style: 'https://s3-eu-west-1.amazonaws.com/tiles.os.uk/v2/styles/open-zoomstack-' + defaults.basemapStyle.toLowerCase() + '/style.json',
    center: center,
    zoom: 9,
    attributionControl: false
});

$("#map div.zoom-control [class^='zoom-']").not('disabled').click(function() {
    $(this).hasClass('zoom-in') ? map.zoomIn() : map.zoomOut();
});

map.on('zoom', function() {
    $("#map div.zoom-control [class^='zoom-']").removeClass('disabled');
    if( map.getZoom() == map.getMaxZoom() )
        $("#map div.zoom-control .zoom-in").addClass('disabled');
    if( map.getZoom() == map.getMinZoom() )
        $("#map div.zoom-control .zoom-out").addClass('disabled');
});

map.on('move', function() {
    coordinates.update();
});

map.on('style.load', function() {
    coordinates.update();
    addLayers();
});

map.on('load', function() {
    // Select features around a clicked point using queryRenderedFeatures().
    map.on('click', function(e) {
        resetProperties();

        var bbox = [[ e.point.x - 2.5, e.point.y - 2.5 ], [ e.point.x + 2.5, e.point.y + 2.5 ]],
            features = map.queryRenderedFeatures(bbox, { layers: _qryLayers });

        if(! features.length )
            return;

        var ft = features[0];

        var coord = e.lngLat,
            offset = [ 0, -10 ];

        if( turf.getType(ft.geometry) === 'Point' ) {
            coord = turf.getCoord(turf.centroid(ft.geometry));
            offset = [ 0, -35 ];
        }

        var propertiesContent = popupContent = '';

        $.each(ft.properties, function(k, v) {
            var value = (v !== '') ? v : '&lt;null&gt;';
            propertiesContent += '<div class="property"><div>' + k + '</div><div>' + value + '</div></div>';
        });

        var popupContent = '\
            <div class="osel-popup-content">\
                <div class="osel-popup-heading">\
                    <div class="osel-popup-title">' + ft.properties[config.defaultField[ft.layer.id]] + '</div>\
                </div>\
                <div class="osel-popup-link">More details</div>\
            </div>\
        ';

        displayPopup(popupContent, coord, offset, mapOffsetX);

        $(".osel-feature-properties").html(propertiesContent);
        $(".osel-sliding-side-panel.panel-right [class^='scroller']").scrollTop(0).scrollLeft(0);

        if( popupContent == '' )
            sliderRight.slideReveal("show");
    });

    // Use queryRenderedFeatures() to indicate that the features are clickable
    // by changing the cursor style to 'pointer'.
    map.on('mousemove', function(e) {
        var features = map.queryRenderedFeatures(e.point, { layers: _qryLayers });
        map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
    });
});

function sortLayers() {
    $("ul.layers .layer").reverse().each(function(index) {
        var id = $(this).data('id');
        map.moveLayer(id);
        if( typeof map.getLayer(id + '-outline') !== 'undefined' )
            map.moveLayer(id + '-outline');
    });
}

function toggleLayer(elem, type) {
    resetProperties();

    var layer = elem.parent().data('id'),
        visibility = elem.attr('data-state') == 'checked' ? 'visible' : 'none';

    var layerArray = layer.split('|');
    for( var i in layerArray ) {
        map.setLayoutProperty(layerArray[i], 'visibility', visibility);
        if( typeof map.getLayer(layerArray[i] + '-outline') !== 'undefined' )
            map.setLayoutProperty(layerArray[i] + '-outline', 'visibility', visibility);
    }

    if( elem.parent().find('.layer-options').length > 0 )
        filterLayer(elem.parent().find('.layer-element').eq(0));
}

// function filterLayer(elem) {
// }

function resetProperties() {
    $(".osel-fixed-popup").remove();
    $(".mapboxgl-popup").remove();
    sliderRight.slideReveal("hide");
}

function removeHighlight() {
}

function switchBasemap(style) {
    map.setStyle('https://s3-eu-west-1.amazonaws.com/tiles.os.uk/v2/styles/open-zoomstack-' + style.toLowerCase() + '/style.json', { diff: false });
}

function zoomToLayerExtent(lyr) {
    var bounds = map.getLayer(lyr).metadata.bounds;
    map.fitBounds(bounds, {
        padding: 40,
        animate: false
    });
}

function setLayerOpacity(lyr, value) {
    map.setPaintProperty(lyr, 'icon-opacity', value);
}

function addLayers() {
    map.addSource("src-boundary", {
        "type": "geojson",
        "data": "data/sample/boundary.geojson"
    });
    map.addLayer({
        "id": "mapLayer03",
        "type": "fill",
        "source": "src-boundary",
        "layout": {
            "visibility": getVisibility("mapLayer03")
        },
        "paint": {
            "fill-color": "#666",
            "fill-opacity": 0.3
        }
    });
    map.addLayer({
        "id": "mapLayer03-outline",
        "type": "line",
        "source": "src-boundary",
        "layout": {
            "visibility": getVisibility("mapLayer03")
        },
        "paint": {
            "line-color": "#666",
            "line-width": 2
        }
    });

    map.addSource("src-roads", {
        "type": "geojson",
        "data": "data/sample/roads.geojson"
    });
    map.addLayer({
        "id": "mapLayer02",
        "type": "line",
        "source": "src-roads",
        "layout": {
            "visibility": getVisibility("mapLayer02")
        },
        "paint": {
            "line-color": "#ff1f5b",
            "line-width": 3
        }
    });

    $.ajax({
        type: "GET",
        url: 'data/sample/postcodes.csv',
        dataType: "text",
        success: function(csvData) { makeGeoJSON(csvData); }
    });
}

function getVisibility(id) {
    var state = $(".osel-sliding-side-panel.panel-left .layer[data-id='" + id + "'] .layer-element").attr('data-state');
    return state == 'checked' ? 'visible' : 'none';
}


function makeGeoJSON(csvData) {
    csv2geojson.csv2geojson(csvData, {
        latfield: 'Y',
        lonfield: 'X',
        delimiter: ','
    }, function(err, data) {
        if (err) throw err;
        map.loadImage('https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', function(error, image) {
            if (error) throw error;
            map.addImage("marker-icon", image);
            map.addLayer({
                "id": "mapLayer01",
                "type": "symbol",
                "source": {
                    "type": "geojson",
                    "data": data
                },
                "layout": {
                    "icon-image": "marker-icon",
                    "icon-size": 0.5,
                    "icon-allow-overlap": true,
                    "icon-ignore-placement": true,
                    "icon-anchor": "bottom",
                    "visibility": getVisibility("mapLayer01")
                },
                "metadata": {
                    "bounds": geojsonExtent(data)
                }
            });
            if( initLoad ) {
                if( getVisibility('mapLayer01') == 'visible' )
                    zoomToLayerExtent('mapLayer01');
                initLoad = false;
            }
            sortLayers();
        });
    });
}
