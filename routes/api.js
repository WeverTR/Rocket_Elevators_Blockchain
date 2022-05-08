var express = require('express');
var app = express();
const { generateImage, uploadToIPFS, writeMetadata } = require('../ipfs');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();
var contractJson = require('../build/contracts/RocketToken.json');
var Web3 = require('web3')
var utils = require('web3-utils')
const provider = new HDWalletProvider(mnemonic, process.env.MUMBAITEST);
var Contract = require('web3-eth-contract');
Contract.setProvider(provider);
var PORT = 3000;

/* import moralis */
const Moralis = require("moralis/node");
require('dotenv').config();

/* Moralis init code */
const serverUrl = process.env.MORALIS_URL;
const appId = process.env.MORALIS_APP_ID;
const masterKey = process.env.MORALIS_MASTER;

Moralis.start({ serverUrl, appId, masterKey });

const web3 = new Web3(provider);
const contract = new Contract(contractJson.abi, "0x5891Aa468b1cdca981ABdCE8d3A7d7F4Be3F73AE")

// /* Return something */
// app.get('/test', function(req, res, next) {
//     res.render('index.html', { title: 'Express' });
// });


app.get(`/freeNFTValidation`, async function(req, res) {
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
app.post('/mintNFT', async function(req, res) {

   try {
       let accounts = await web3.eth.getAccounts();
       let wallet = accounts[0];
       const tokenId = await contract.methods.safeMint(wallet, "").on('receipt', function(receipt) {
            const tokenId = utils.hexToNumber(receipt.logs[0].topics[3])
            });

        // let image = await generateImage();
        // let imageURI = await uploadToIPFS(image, `RocketElevatorsNFTImage_${tokenId}.png`);
        // let metadata = writeMetadata(tokenID, imageURI);
        // let tokenURI = await uploadToIPFS(metadata, `RocketElevatorsNFTImage_${tokenId}.json`);

        console.log(tokenId);

        // .send({from: wallet, gas: 5500000}).on('receipt', function(receipt) {
        //     const tokenId = utils.hexToNumber(receipt.logs[0].topics[3])
        //     });

    //    let image = await generateImage();
    //    let imageURI = await uploadToIPFS(image, `RocketElevatorsNFTImage_${tokenID}.png`);
    //    let metadata = writeMetadata(tokenID, imageURI);
    //    let tokenURI = await uploadToIPFS(metadata, `RocketElevatorsNFTImage_${tokenID}.json`);

    //    res.json(tokenURI);
   } catch(err) {
        console.log(err);
        res.status(400).send({
            message: "Bad request"
        });
   }
});

module.exports = app;