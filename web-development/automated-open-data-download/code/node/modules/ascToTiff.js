const { spawn } = require('child_process');
const clippedDEMexists = require('./clippedDEMexists.js');
const renderDEMtoOutput = require('./renderDEMtoOutput.js');

module.exports = function demProcess(_params, _eventEmitter, _verbose=false) {

  var algo = _params.algo,
    area = _params.area;

  // First we clip to the target area:
  // NOTE: This is super inefficient, but much more scalable, especially
  // as we'd like to allow the user to upload polygons to clip, and
  // to include the option to pull all sorts and levels of polygons

  // Also, here is a place for MongoDB integration:
  // check if a clipped tiff exists
  // If so, use it
  // if not, clip it, store it, write it to db.

  // For now we just check in our directory system if it exists:
  if (!clippedDEMexists(_params)) {

    // Clip file then execute hillshade on it
    var demPath = './dem/gen/state/colorado/' + _params.area+ '/' + _params.area + '.tif';
    var clipArgs = ['-of', 'GTiff', '-cutline', './shp/' + area + '.shp', '-crop_to_cutline', '-dstalpha',
      './dem/gen/state/colorado/colorado/colorado.tif', demPath
    ]

    if (_verbose) {
      var clipCommand = 'gdalwarp';
      clipArgs.forEach((arg)=>{
        clipCommand += " " + arg;
      });
      console.log("CLIPCOMMAND: ", clipCommand);
    }


    // Environment variables, from trying to implement on
    // a production server
    var productionEnv = Object.create(process.env);
    productionEnv.NODE_ENV = 'production';

    const clipProcess = spawn('gdalwarp', clipArgs, {env: productionEnv, shell: true})
	     .on('error', function (error) {throw error;});

    clipProcess.stdout.on('data', (data) => {
      if (_verbose) {
        console.log('Clipping: ', data.toString('utf8'));
      }
    });

    clipProcess.on('close', (code) => {
      // Successful clip -
      if (code == 0) {
        console.log('Successful clip');
        renderDEMtoOutput(_params, _eventEmitter, _verbose);
      }
    })
  } else {
    // Execute hillshade on clipped file
    renderDEMtoOutput(_params, _eventEmitter, _verbose);
  }
}