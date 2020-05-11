const axios = require('axios');

/* This function will return the specific information on OS Open GreenSpace */
module.exports = async function getProductDetails() {

    try {
        const productDetails = await axios('https://osdatahubapi.os.uk/downloads/v1/products/OpenGreenspace');
        console.log(productDetails.data)
    } catch(err) {
        console.error(err)
    }
    
    /* At this point we could insert another function to process the results or act on them/download them */
}
