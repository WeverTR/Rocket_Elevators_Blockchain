// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract RocketTokenERC721 is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable, ERC721Burnable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    address[] addressList;
    uint public balanceReceived;
    uint deployDate;

    mapping(address => bool) public hasReceivedFreeNFT;

    constructor() ERC721("RocketToken", "ROCKET") {
        deployDate = block.timestamp;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://j7pdzt8putp9.usemoralis.com:2053/server";
    }


    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function receiveMoney() public payable {
        balanceReceived += msg.value;
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

    function withdrawMoney() public {
        address payable to = payable(msg.sender);
        to.transfer(getBalance());
    }

    function freeEligible() public onlyOwner {
        addressList =  [
            0xd1679bB3543e8aD195FF9f3Ac3436039bA389237,
            0xF4F555ca1586C40067cd215578f123d30813De02,
            0x5563D3361408D41BF172E3720C30b0e35F19A444,
            0x6ffdAf0795D208c11C583C88Cb5dbd2A8955A59e
        ];
    }

    function twentyFourHoursPassed() public view returns (bool) {
        return (block.timestamp >= (deployDate + 24 hours));
    }

    //Send token once per day to the receiver
    function dailyNFTGift(address receiver) public {
        //Grab list of eligible addresses, check if the receiver got tokens in the last 24hours
        freeEligible();
        for (uint i = 0; i < addressList.length; i++) {
            if (receiver == addressList[i] && twentyFourHoursPassed()) {
                //Update from last timestamp
                deployDate = block.timestamp;
                //Mint 100 new tokens to the receiver
                for (uint j = 0; j < 100; i++) {
                    safeMint(addressList[i], tokenURI(_tokenIdCounter.current()));
                    _tokenIdCounter.increment();
                }
            }
        }
    }
}