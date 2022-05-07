const { generateImage, uploadToIPFS, writeMetadata } = require('./ipfs');

const test = async() => {
    let image = await generateImage();
    let imageURI = await uploadToIPFS(image, "test.png");
    console.log(imageURI);
}

test()

