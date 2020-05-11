const getFilePaths = require('./getFilePaths.js')
const downloadAllGB = require('./downloadFiles.js')
const recursiveUnzip = require('./recursiveUnzip.js');


(async () => {

    const targetDir = './Terrain50'
    await downloadAllGB('https://osdatahubapi.os.uk/downloads/v1/products/Terrain50/downloads?area=GB&format=ASCII+Grid+and+GML+%28Grid%29&redirect', targetDir)
    await recursiveUnzip(targetDir);

    // Now we have a directory with several subdirectories containing, among other files, .asc grids representing elevations of 50
    // Since we are focused on creating a hillshade of the Shetlands, we will extract an array of paths to .asc files:
    let allPaths = getFilePaths(targetDir)
    ascPaths = allPaths.filter((filepath) => path.parse(filepath).extname === '.asc')


})()