
const fs = require('fs');
const path = require('path');

/** Retrieve file paths from a given folder and its subfolders. */
/* From @darioblanco on https://gist.github.com/kethinov/6658166 */
const getFilePaths = (folderPath, ext = null) => {
  const entryPaths = fs.readdirSync(folderPath).map(entry => path.join(folderPath, entry));
  const filePaths = entryPaths.filter(entryPath => fs.statSync(entryPath).isFile());
  const dirPaths = entryPaths.filter(entryPath => !filePaths.includes(entryPath));
  const dirFiles = dirPaths.reduce((prev, curr) => prev.concat(getFilePaths(curr)), []);
  let filepaths = [...filePaths, ...dirFiles];
  
  if (ext) {
    filepaths = filepaths.filter(filepath => path.extname(filepath) === '.' + ext)
  }

  return filepaths;

};

module.exports = getFilePaths;