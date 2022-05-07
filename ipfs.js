const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');
const axios = require('axios').default;
require('dotenv').config();

const generateImage = async() => {
    let layers = ["Background", "Base", "Eyes", "Glasses", "Hat", "Mouth"]
    let randomLayers = [];

    for (i = 0; i < layers.length; i++) {
        let max = 6;
        let min = 1;
        let rand = Math.floor(Math.random() * (max - min) + min);
        randomLayers.push(`./assets/${layers[i]}/${rand}.png`);
    }

    console.log(randomLayers);
 
let b64 = await mergeImages(
    [
        randomLayers[0],
        randomLayers[1],
        randomLayers[2],
        randomLayers[3],
        randomLayers[4]
    ],  {
            Canvas: Canvas,
            Image: Image
        });
        return b64
};

const writeMetadata = (tokenID, imageURI) => {
    let metadata = {
        "name": "Rocket Elevators #" + tokenID,
        "description": "Rocket Elevators NFT Collection",
        "image": imageURI
    }
    let jsonObjToStr = JSON.stringify(metadata);
    let jsonObjToB64 = Buffer.from(jsonObjToStr).toString("base64");
    return jsonObjToB64;
}

const uploadToIPFS = async (file, path) => {
    const response = await axios({
        method: "POST",
        timeout: 100000,
        url: "https://deep-index.moralis.io/api/v2/ipfs/uploadFolder",
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'evTVviQpSmyaTnQtB5tTmeVjve3IPCKgVjBSvtnGVygZAhEXZQGbQZFsXOh6q2Uy'
        },
        data: [{
            "path": path,
            "content": file
        }]
    });
    return response.data[0].path;
}

module.exports = {
    generateImage,
    writeMetadata,
    uploadToIPFS
}