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
const contract = new Contract(contractJson.abi, process.env.ROCKETTOKENERC721CONTRACT_ADDRESS);

app.get(`/test`, async function(req, res) {
    const x = await web3.eth.defaultAccount;
    console.log(x);
});

app.get(`/freeNFTValidation/:_address`, async function(req, res) {
    console.log("GET Request Called for  endpoint")
    try {
            // Validate if a provided address is eligible to receive a free NFT
            let accounts = await web3.eth.getAccounts();
            let wallet = accounts[0];
            let _address = req.params._address;
            let eligible = await contract.methods.checkNFT(_address).call({from: wallet});
            res.json(eligible)
        
    }   catch(err) {
        console.log(err);
        res.status(400).send({
        message: "Invalid address"
        });
    }
});

app.get('/checkApproval/:_address'), function(req, res) {
    try {
        // Check if an address has approved the NFT contract to transfer at least 1 Rocket Token
        let _address = req.params._address;
        res.send(contract.methods.hasApproval);
    }   catch(err) {
        console.log(err);
        res.status(400).send({
        message: "Invalid address"
        });
    }
}

app.get(`/getNFTsbyaddress/:_address`, async function(req, res) {
    try {
        // Fetch the list of Rocket Elevators NFTs owned by a specific address
        const _address = req.params._address;
        const transactions = Moralis.Object.extend("PolygonTransactions");
        const query = new Moralis.Query(transactions);
        await query.equalTo("from_address", _address);
        let list = [];
        const results = await query.find({ useMasterKey: true });
        console.log("Successfully retrieved " + results.length + " NFTs.");
        for (let i = 0; i < results.length; i++) {
            list.push(results[i]);
        }
        res.json(list);
        
    }   catch(err) {
        console.log(err);
        res.status(400).send({
        message: "Invalid address"
        });
    }
});

app.get('/getNFTmetadatabyaddress/:_address', async function(req, res, _address) {
    try {
            const _address = req.params._address;
            const transfers = Moralis.Object.extend("PolygonNFTTransfers");
            const query = new Moralis.Query(transfers);
            await query.equalTo("from_address", _address);
            await query.exists("IPFS");
            const results = await query.find();
            // get metadata of NFT
            res.json(query);
        }
           catch(err) {
                console.log(err);
                res.status(400).send({
                message: "Invalid ID"
                });
            }
});


// Creating a randomly generated image containing NFT data
app.post('/mintNFT', async function(req, res) {

   try {
        const PolygonNFTTransfers = Moralis.Object.extend("PolygonNFTTransfers");
        const polygonNFTTransfers = new PolygonNFTTransfers();

        let accounts = await web3.eth.getAccounts();
        let wallet = accounts[0];
        let tokenId;
        let tokenAddress;
        await contract.methods.safeMint(wallet, "").send({from: wallet, gas: 5500000})
        .on('receipt', function(receipt) {
            tokenId = receipt.events.Transfer.returnValues.tokenId;
            });
        
        let image = await generateImage();
        let imageURI = await uploadToIPFS(image, `RocketElevatorsNFTImage_${tokenId}.png`);
        let metadata = writeMetadata(tokenId, imageURI);
        let tokenURI = await uploadToIPFS(metadata, `RocketElevatorsNFTImage_${tokenId}.json`);
        
        let B64ToJsonObj = JSON.parse(Buffer.from(metadata, 'base64'));
        
        console.log(B64ToJsonObj);
        // polygonNFTTransfers.set("IPFS", B64ToJsonObj);

        // polygonNFTTransfers.save(null, {useMasterKey: true}).then(
        // (polygonNFTTransfers) => {
        //     // Execute any logic that should take place after the object is saved.
        //     console.log("New object created with objectId: " + polygonNFTTransfers.id);
        // },
        // (error) => {
        //     // Execute any logic that should take place if the save fails.
        //     // error is a Moralis.Error with an error code and message.
        //     console.log("Failed to create new object, with error code: " + error.message);
        // });
        res.json(tokenURI);
    } catch(err) {
        console.log(err);
        res.status(400).send({
            message: "Bad request"
        });
   }
});

// Creating a randomly generated image containing NFT data and gifting it to an address
app.post('/giftNFT/:_address', async function(req, res) {

    try {
        let _address = req.params._address;
        let accounts = await web3.eth.getAccounts();
        let wallet = accounts[0];
        const tokenId = await contract.methods.NFTGift(_address).send({from: wallet, gas: 5500000})
        .on('receipt', function(receipt) {
            tokenId = receipt.events.Transfer.returnValues.tokenId;
            });
        
        let image = await generateImage();
        let imageURI = await uploadToIPFS(image, `RocketElevatorsNFTImage_${tokenId}.png`);
        let metadata = writeMetadata(tokenId, imageURI);
        let tokenURI = await uploadToIPFS(metadata, `RocketElevatorsNFTImage_${tokenId}.json`);

        console.log(tokenURI);
        res.json(tokenURI);
    }   catch(err) {
            console.log(err);
            res.status(400).send({
            message: "Bad request"
         });
    }
 });

module.exports = app;