// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract RocketToken is ERC20, ERC20Burnable, Pausable, Ownable, ERC20Permit {
    constructor() ERC20("RocketToken", "ROCKET") ERC20Permit("RocketToken") {
        _mint(msg.sender, 100000);
    }

    address[] addressList;
    mapping(address => bool) public hasReceivedFreeNFT;

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    function freeEligible() public onlyOwner {
        addressList =  [
            0xA55488F58133024975379F47dF9CDf46B7521C6A,
            0x700439557c41B81b964944675ea370cD82De0B5f,
            0x9963872CB0Cb9aE104E8AeB0A9468Cf11bd50328,
            0xF1057904e38A0315860794954Ce7f72f6C5ec60e,
            0x8d4C45081FA8C87475503112ecc0b3B79E324a1D,
            0xe5221820e2E570EDA5a11F524933fB75Db765Bc2,
            0xf142564BfBeEF7E37e231bF7227fc71aC3295c9e,
            0x95c1De73A8c0dC10559000Dd886978E3097d2F2a,
            0xe6722FE33c0c7A6DfcAE19C996Be01eF9B178400,
            0x23092057ccD46b1a27a9a115B4AbeBB932c18050 
        ];
    }
}
