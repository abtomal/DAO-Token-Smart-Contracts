const { ethers } = require("hardhat");

async function main() {

  const TokenContract = await ethers.getContractFactory("DAOMetraToken");
  const DaoContract = await ethers.getContractFactory("DAOMetra");

  console.log("Deploying contracts...");

  // Deploy token
  const tokenContract = await TokenContract.deploy(ethers.parseEther("1000000")); // 1 milione 
  await tokenContract.waitForDeployment();
  console.log("Token deployed to:", await tokenContract.getAddress());

  // Deploy DAO
  const daoContract = await DaoContract.deploy(
    await tokenContract.getAddress(), 
    ethers.parseEther("110")  // 110 token x share
  );
  await daoContract.waitForDeployment();
  console.log("DAO deployed to:", await daoContract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });