INSTRUCTIONS

Tested in:
- Python v3.9.  The Pandas module is required for the python script to operate: https://pandas.pydata.org/pandas-docs/stable/getting_started/install.html
- FME Workbench 2019

1. Open Products.csv and add the required id layer name that you wish to download.  A full list of layer id's are provided below or can be viewed here: https://osdatahubapi.os.uk/downloads/v1/products? 

2. Enter the date for the last time you downloaded each specific dataset - use the format YYYY-MM e.g. 2020-04.  

3. Select the required data format for each specific dataset.  The available data formats for each layer are provided below - make sure to use the exact same name as this is passed as a parameter into the download url.  

4. Specify which area you wish to download the data.  The majority of datasets offer full GB coverage as a single download, whilst a few offer individual areas.  If you require individual areas, enter the two letter code separated by a comma and leave no spaces e.g.  HO,HP,HT,HU.  A full list of National Grid areas can be found here: https://getoutside.ordnancesurvey.co.uk/site/uploads/images/assets/Web%20images/Diagram-A.jpg
  
Note: If you select GeoPackage as your data format, then your area has to be'GB'.  Only OS Open TOID has the option to download individual areas as a GeoPackage.           

5. Once you have completed the Products.csv, you will not need to edit it again unless you wish to add/remove a dataset or change data formats/areas to download.  The script/workbench will automatically update the user_version column allowing you to check when the latest version was downloaded.  

6. Place the python script/FME workbench and csv file in the same directory as the location you wish to save the data.

LAYERS
The current list of layers (id), available formats and areas (as of Feb 2021):

- 250kScaleColourRaster 	TIFF-LZW							GB
- BoundaryLine 			ESRI® Shapefile, GML, MapInfo® TAB, GeoPackage			GB
- CodePointOpen			CSV, GeoPackage							GB
- GBOverviewMaps		GeoTIFF								GB
- LIDS				CSV								GB
- MiniScale			Zip file (containing EPS, Illustrator and TIFF-LZW)		GB
- OpenNames			CSV, GML, GeoPackage						GB
- OpenRivers			ESRI® Shapefile, GML, GeoPackage				GB
- OpenRoads			ESRI® Shapefile, GML, GeoPackage				GB
- OpenUPRN			CSV, GeoPackage							GB
- OpenUSRN			GeoPackage							GB
- OpenZoomstack			GeoPackage, Vector Tiles					GB
- Strategi			DXF, ESRI® Shapefile, MapInfo® TAB				GB	
- Terrain50			ASCII Grid and GML (Grid), ESRI® Shapefile, GeoPackage, GML 	GB
- VectorMapDistrict		ESRI® Shapefile, GML, GeoTIFF, GeoPackage			GB or Area
- OpenGreenspace		ESRI® Shapefile, GML, GeoPackage				GB or Area
- OpenMapLocal			ESRI® Shapefile, GML, GeoTIFF, GeoPackage			GB or Area
- OpenTOID			CSV, GeoPackage							Area only