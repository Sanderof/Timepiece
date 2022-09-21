
const http = require('http');
const express = require('express');
const request = require('request');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

// Middel ware
app.use(bodyParser.json());

app.use(express.static(__dirname)); // Serves static

// Processing get requests
app.get('/map-names', function(req, res) {
    // Array of file names of the maps
    const fileNames = { maps: fs.readdirSync('json/maps'), images: fs.readdirSync('Resources/mapImages')}; // Fetches the file names
    fileNames.maps.forEach((fileName, idx, array) => {
        array[idx] = fileName.replace(/\..+$/, ''); // Removes the extension by using regex
    });
    fileNames.images.forEach((fileName, idx, array) => {
        array[idx] = fileName.replace(/\..+$/, ''); // Removes the extension by using regex
    });

    res.send(fileNames);
    res.end();
});

// Processing post requests
app.post('/map-data', function(req, res) {
    console.log('Map data received');

    // Writes a .json file with the map data
    fs.writeFile(`json/maps/${req.body.name}.json`, JSON.stringify(req.body.data), function(err) {
        console.log('Map file saved to /json/maps');
    });

    // Writes a .json file with image data in the form of a base64 string
    fs.writeFile(`Resources/mapImages/${req.body.name}-img.json`, JSON.stringify(req.body.mapImg), function(err) {
        console.log('Image data saved to /Resources/mapImages');
    });

    res.end();
});

//------------ Make server listen on specified port --------------

const port = process.env.PORT || 5000;
app.listen(port, function(req, res) {
  console.log(`Server is running on port ${port}`);
});
