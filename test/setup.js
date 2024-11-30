// setup.js
const { ethers } = require("hardhat");

async function deployContracts() {
    const [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    // Deploy del token
    const TokenFactory = await ethers.getContractFactory("DAOMetraToken", owner);
    const token = await TokenFactory.deploy(CONSTANTS.INITIAL_SUPPLY);
    await token.waitForDeployment();

    // Deploy della DAO
    const DAOFactory = await ethers.getContractFactory("DAOMetra", owner);
    const dao = await DAOFactory.deploy(await token.getAddress(), CONSTANTS.SHARE_PRICE);
    await dao.waitForDeployment();

    return {
        token,
        dao,
        owner,
        addr1,
        addr2,
        addrs
    };
}

const CONSTANTS = {
    WEEK_IN_SECONDS: 7 * 24 * 60 * 60,
    DAY_IN_SECONDS: 24 * 60 * 60,
    SHARE_PRICE: ethers.parseEther("100"),
    INITIAL_SUPPLY: ethers.parseEther("1000000"),
    multiply: (value, multiplier) => BigInt(value) * BigInt(multiplier)
};

module.exports = {
    deployContracts,
    CONSTANTS
};