# Title

Brief description of the tutorial contents. This markdown file is optimized for Github.

**Image of what we're going for!**

## Tools and APIs

The languages, libraries, APIs and external data sources we'll use to complete this tutorial.
- Command line
- NodeJS and npm
- axios


## Tutorial

1. Download the Terrain50 dataset from the OS Downloads API.
2. Extract a few adjacent tiles
3. 

Copy of the tutorial can go here.


Resouces:

On Node fs: https://www.freecodecamp.org/news/node-js-streams-everything-you-need-to-know-c9141306be93/



## API Endpoints




## NodeJS

This section will look at how to automate the download of data from the OS Data Hub API with NodeJS.

First off - make sure you have [Node](https://nodejs.org/en/) installed. (Here's [a guide](https://www.taniarascia.com/how-to-install-and-use-node-js-and-npm-mac-and-windows/) if you don't already do.) 

We'll be focused on automating the download of the datasets and writing them to disk. To do this, though, we will look at the product details files that help us understand how to fetch data from the API. 

### init and installation

Before we access the Downloads API, we'll install `axios`, a Node package for making HTTP requests using promises. 

~~~bash
# On the command line
$ npm install axios
~~~

This will create a `./node_modules` directory and install the module. 

### The Product List

First, we'll look at the list of products available via the API, available at `https://osdatahubapi.os.uk/downloads/v1/products`. A request sent to this URL returns a JSON array of the 14 OS data products accessible through the API.

An advantage to this serving JSON is that we can parse and access the product-specific information using common libraries, including JavaScript's standard built in `JSON` object, with `.parse()` and `.stringify()` methods. By parsing the JSON returned by the API, we can loop through it, access each object's properties,and so on. 


Here we will look at the first few lines of `/code/node/list-products.js`, a module that will fetch a file describing the products available. Note that we assign the function to `module.exports`; this means 

~~~javascript
const axios = require('axios');

module.exports = async function listProducts() {
    const productList = await axios('https://osdatahubapi.os.uk/downloads/v1/products');

    console.log(productList.data); // <- print into console
    for (const product of productList.data) {
        console.log(product.id)
    }
}
~~~

Each dataset available via the API 