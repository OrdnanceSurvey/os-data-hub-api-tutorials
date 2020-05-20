const fs = require('fs')
const path = require('path')
const extract = require('extract-zip')
const getFilePaths = require('./getFilePaths.js')

async function unzipAll(dir) {

    dir = path.resolve(dir)
    
    // An array of all .zip file paths in the directory:
    let filepaths = getFilePaths(dir)
    filepaths = filepaths.filter(filepath => path.extname(filepath) === '.zip')
    
    // Loop through filepaths, extracting and deleting each:
    while (filepaths.length > 0) {
        for (let file of filepaths) {

            let parsedpath = path.parse(file);
            let targetdir = path.resolve(parsedpath.dir);

            try {
                await extract(file, { dir: targetdir})
                await fs.unlinkSync(file);
                console.log('Unzipped', parsedpath.base + ", deleted .zip file.")
            } catch (err) {
                console.log(err)
              }
        }

        // Edge case: if the directory passed in was zipped  
        let parsed = path.parse(dir);
        if (parsed.ext === '.zip') {
            dir = path.resolve(parsed.dir, parsed.name); // the now-extracted zipped directory
        }

        // If the extracted folders contained zipfiles, they'd be included here:
        filepaths = getFilePaths(dir)
        filepaths = filepaths.filter(filepath => path.extname(filepath) === '.zip')
    }
}


module.exports = unzipAll;