var RocketToken = artifacts.require("RocketToken");

module.exports = function(deployer) {
  deployer.deploy(RocketToken);
};