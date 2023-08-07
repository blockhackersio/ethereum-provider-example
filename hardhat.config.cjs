require("@typechain/hardhat");
// require("@nomicfoundation/hardhat-ethers");
// require("@nomicfoundation/hardhat-chai-matchers");
module.exports = {
  solidity: "0.8.19",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
};
