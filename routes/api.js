var express = require('express');
var app = express();
const { generateImage, uploadToIPFS, writeMetadata } = require('../ipfs');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();
var contractJson = require('../build/contracts/RocketTokenERC721.json');
var Web3 = require('web3')
var Contract = require('web3-eth-contract');
Contract.setProvider(new HDWalletProvider(mnemonic, `http://localhost:8545`));
var PORT = 3000;

/* import moralis */
const Moralis = require("moralis/node");
require('dotenv').config();

/* Moralis init code */
const serverUrl = process.env.MORALIS_URL;
const appId = process.env.MORALIS_APP_ID;
const masterKey = process.env.MORALIS_MASTER;

Moralis.start({ serverUrl, appId, masterKey });

var contract = new Contract(contractJson.abi, "0x6097d97967a5906e0713b1f1a5f8e272fF9Fbe7a");
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))

// /* Return something */
// app.get('/test', function(req, res, next) {
//     res.render('index.html', { title: 'Express' });
// });


app.get(`/api/freeNFTValidation`, async function(req, res) {
    console.log("GET Request Called for  endpoint")
    try {
            // Validate if a provided address is eligible to receive a free NFT
            let _address = "0xd1679bB3543e8aD195FF9f3Ac3436039bA389237";
            let eligible = await contract.methods.checkNFT(_address).call();
            res.json(eligible)
        
    }   catch(err) {
        console.log(err);
        res.status(400).send({
        message: "Invalid address"
        });
    }
});

// app.get('/checkApproval'), function(req, res) {
//     console.log("GET Request Called for  endpoint")
//     res.send("GET Request Called")
//     try {
//         // Check if an address has approved the NFT contract to transfer at least 1 Rocket Token
//         console.log(eligible);
        
//     }   catch(err) {
//         console.log(err);
//         res.status(400).send({
//         message: "Invalid address"
//         });
//     }
// }

app.get(`/getNFTsbyaddresses/:_address`, function(req, res) {
    console.log("GET Request Called for  endpoint")
    res.send("GET Request Called")

    try {
        // Fetch the list of Rocket Elevators NFTs owned by a specific address
        const _address = req.params._address;
        const options = {
            address: _address,
        };
        let x = Moralis.Web3API.account.getNFTs(options);
        console.log(x);
        
    }   catch(err) {
        console.log(err);
        res.status(400).send({
        message: "Invalid address"
        });
    }
});

app.get('/getNFTmetadatabyaddress/:address', function(req, res) {
    console.log("GET Request Called for  endpoint")
    res.send("GET Request Called")

    try {
        // get metadata of NFT
        let accounts =  web3.eth.getAccounts();
        let wallet = accounts[0];
        const options = {
            address: wallet,
          };
          const metaData =  Moralis.Web3API.token.getNFTMetadata(options);
        
    }   catch(err) {
        console.log(err);
        res.status(400).send({
        message: "Invalid address"
        });
    }
});


// Creating a randomly generated image containing NFT data
app.get('/mintNFT', async function(req, res) {
   console.log("POST Request Called for  endpoint")
   res.send("POST Request Called")

   try {
       let accounts = await getAccounts();
       let wallet = accounts[0];
       const walletAddress = req.params.walletAddress;
       let tokenID = _tokenIdCounter.current();
       await contract.safeMint(walletAddress, "").send({from: wallet, gas: 5500000});

       let image = await generateImage();
       let imageURI = await uploadToIPFS(image, `RocketElevatorsNFTImage_${tokenID}.png`);
       let metadata = writeMetadata(tokenID, imageURI);
       let tokenURI = await uploadToIPFS(metadata, `RocketElevatorsNFTImage_${tokenID}.json`);

       res.json(tokenURI);
   } catch(err) {
        console.log(err);
        res.status(400).send({
            message: "Bad request"
        });
   }
});

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});

module.exports = app;