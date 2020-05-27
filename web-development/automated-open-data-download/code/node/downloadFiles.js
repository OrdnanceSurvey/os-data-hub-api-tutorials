const fs = require('fs');
const axios = require('axios');

/* ============================================================
Function: Uses Axios to download file as stream using Promise
============================================================ */
const download_file = (url, filename) =>
    axios({
        url,
        responseType: 'stream'
    }).then(
        response =>
            new Promise((resolve, reject) => {
                response.data
                    .pipe(fs.createWriteStream(filename))
                    .on('finish', () => resolve())
                    .on('error', e => reject(e));
            }
    )
);

/* ============================================================
Download File
============================================================ */
async function downloadAllGB(url, targetdir) {
    try {
        
        // Giving user ongoing feedback in the terminal:
        console.log('Download starting ...')
        let interval = setInterval(() => console.log('...'), 5000)

        // Wait until the file is fully downloaded
        await download_file(url, `${targetdir}.zip`);

        // Complete!
        clearInterval(interval);
        console.log(`Downloaded file ${download.area}`)

        console.log('Completed downloading files')
    } catch (error) {
        console.error(error);
    }
}

module.exports = downloadAllGB;