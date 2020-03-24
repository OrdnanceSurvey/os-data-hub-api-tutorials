# Useful Tools for Web Developers

## Introduction

Maps are nice - and sometimes necessary - for many websites. But creating beautiful, usable, accurate maps can be tricky. There is a thicket of concepts, tools and data sources to navigate.

Here's our quick guide to some of the amazing tools are out there to help web developers work with spatial data. 

As a note - here we'll present resources roughly in line with the path spatial data takes from its origin to a user's browser from the perspective of a full stack web developer: collect - manipulate - analyze - store - access - visualize. Also, this list is not exhaustive! Loads of great tools exist - this is more of a windscreen tour.

## Collect

Data comes from somewhere, and spatial data is no different. Exactly _how_ spatial data is captured and created is beyond the scope of this post - all we need to know is that **raster images** and **vector features** can be downloaded or fetched from several reliable, authoritative sources. 

### Data Sources

#### Raster Images

Georeferenced raster images can form a basemap on the web or be used for analysis (like image recognition). 

[!image of raster]

Good, reliable sources of raster spatial data include:

**OS Data Hub**. Here at Ordnance Survey our team of surveyors, cartographers, data scientists and computer scientists collaborate to create raster map tiles of Great Britain at various zoom levels, in four styles. With the OS Maps API developers can load these tiles as a basemap.

**USGS Earth Explorer**. The US Geological Survey makes raster datasets of many different extents and resolutions available online. Lots of great satellite imagery here, including time series.


#### Vector Features

[ should I include licensing / attribution info? ]



**OS Data Hub**. Ordnance Survey also provides vector features with attribution via the OS Features API, and lightweight vector tiles through the OS Vector Tiles API. The spatial extent covers Great Britain, and includes data from the premium OS MasterMap Topo layer.

**Natural Earth**. Available at 1:10m, 1:50m and 1:110m scales, Natural Earth provides global vector datasets in SHP, SQLite and GeoPackage formats, and files ready for use with ArcMap (.mxd) and QGIS (.qgs).

**OpenStreetMap**. Citizen mappers around the world have created an amazing dataset of spatial features for OpenStreetMap, available for download or via API access. [ <- is this tru? [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) ]


[ ! image of vector features ]

## Data Prep

Data prep is often a major step in creating a web app. Working with spatial data can be especially tricky, especially for developers less familiar. These tools can help speed up the job. 

### Format Conversion

Often spatial (vector) data is downloaded from sources as shapefiles - but very often web applications and Javascript libraries are designed to work with GeoJSON, an open standard that describes geographic features and non-spatial attributes. These tools enable conversion between various spatial data formats. 

**mapshaper.org**. A handy in-browser tool for working with spatial data. Users upload .shp, geojson, and other data formats, then can manipulate the attributes and geometries. The Export function lets users select the output format. Very useful for quick manipulations, especially with smaller datasets.

**QGIS**. QGIS is an open source desktop GIS (geographic information system) program. With Q, users can load, visualize, manipulate and export vector and raster data - including into geojson and other formats.

**gdal**. The Geospatial Data Abstraction Library really deserves to stand on its own - it is an incredibly powerful tool to work with both raster and vector data. Many geospatial tools are built on top of gdal (including QGIS). With the library developers can manipulate spatial data in a very sophisticated way - but it is quite a technical tool to use. 

**[toGeoJSON](https://github.com/mapbox/togeojson)**. A quick JS library to convert KML and GPX to GeoJSON on the command line, in with Node.js or in the browser. From Mapbox.

[**leaflet-omnivore**](https://github.com/mapbox/leaflet-omnivore). omnivore is a Javascript library that converts CSV, GPX, KML, WKT TopoJSON and encoded polylines to GeoJSON. This library works natively with Leaflet and can be adapted to work with other mapping libraries (like mapboxgl.js). From Mapbox. 

**[TopoJSON](https://github.com/topojson)**. Vector datasets can be quite large - making websites slower and the web developer's life more difficult. TopoJSON helps by reducing the size of GeoJSON files by efficiently describing line segments (arcs) so the same lines don't appear twice in the dataset. Note - to use TopoJSON you'll need to also use the [topojson client](https://github.com/topojson/topojson-client/blob/master/README.md#topo2geo), to convert back to GeoJSON.

## Data Management

Again, web developers tend to work with GeoJSON - so our focus will be managing these files.

[**geojsonlint**](http://geojsonlint.com/). For checking validity of GeoJSON objects.

[**Geojson validator**](https://www.npmjs.com/package/geojson-validation). A npm module to check validity of GeoJSON. Especially useful for validating user-uploaded files.

[geojson-vt](https://github.com/mapbox/geojson-vt). Create vector tiles from GeoJSON data efficiently on the fly. 

## Back End

Spatial datasets require specialized databases to efficiently store and access. Most notably, spatial queries enable developers to access records based on some spatial dimension - selecting points that are contained within a polygon, for example, or lines that intersect another line. 

**PostGIS**. PostgreSQL, with the PostGIS extension, is a commonly used relational database for spatial data. Well tested, large community, SQL.

**SpatiaLite**. Like PostGIS, SpatiaLite extends SQLite to support spatial queries.

**Mapbox**. With Mapbox, users can upload spatial data, which is stored in a way that it can be served to a browser. With Mapbox Studio users can create custom map styles for their location data. 

[**MongoDB**](https://docs.mongodb.com/manual/geospatial-queries/). This NoSQL database supports geospatial queries.

[**GeoDjango**](https://docs.djangoproject.com/en/3.0/ref/contrib/gis/). For developers running a Django back end, GeoDjango extends the framework to work with geographic data. Designed to connect to a geographic database like PostGIS or SpatiaLite. 

[NodeJS](https://nodejs.org/). Node seamlessly can work with spatial data, connecting to PostGIS and MongoDB instances. The runtime environment benefits from having access to the multitude of Javascript libraries developed for working with location data.

## Front End

[Leaflet](https://leafletjs.com/). Leaflet is "a JavaScript library for interactive maps". The library handles raster and vector tiles, and enables web developers to customize styling and interactivity - on desktop and mobile devices. A standard for web mappers.

[mapboxgl.js](https://docs.mapbox.com/mapbox-gl-js/api/). Mapbox GL JS lets web developers build customizable, interactive vector maps, rendered using WebGL. This gives developers the option the customize styling and offers a  smooth, impressive user experience, including 3D effects. GL JS fits into the Mapbox ecosystem. 

[d3.js](https://d3js.org/). Data-Driven Documents (D3) is an incredibly powerful library for working with data in the browser. The library excels as a way to create interactive geographic maps and visualizations - supported by a large community and range of example code snippets. 

[Turf.js](https://turfjs.org/). Geospatial analysis in JavaScript. Turf provides a suite of functions to analyze vector geopspatial features and work with coordinates and coordinate arrays. 

## Data Analysis

[`geotiff.js`](https://geotiffjs.github.io/). A JavaScript library for parsing and visualizing TIFF (raster) files, including raw raster data.

[geoblaze](http://geoblaze.io/). Extending geotiff.js, Geoblaze enables users to analyze and visualize raster data in the browser or in NodeJS. 

[Observable](https://observablehq.com). Observable is a web-based notebook for exploring and visualizing data. Powerful - well worth a look. 


## Design / Cartography

### Color Pickers

[Colorbrewer](https://colorbrewer2.org/). Created by a cartographer who has extensively researched how to use color on maps, Colorbrewer provides various color palettes for map designers. 

[Adobe Color](https://color.adobe.com/create). A tool to generate color palettes, including various schemes and hex code outputs. 

[OS Color Palette](https://github.com/OrdnanceSurvey/GeoDataViz-Toolkit/tree/master/Colours). Ordnance Survey cartographers have created a color scheme to be used on OS maps, made available in the OS GeoDataViz toolkit on Github.

### Iconography

[Mapbox Maki](https://labs.mapbox.com/maki-icons/). From Mapbox, Maki is a set of vector icons specifically for map designers - beautiful, with lots of icons you don't find elsewher.e.

[Font Awesome](https://fontawesome.com/). Another vector icon pack - with a free option. 
