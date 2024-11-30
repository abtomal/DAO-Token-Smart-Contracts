const { expect } = require("chai");
const { deployContracts, CONSTANTS } = require('./setup');
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DAOMetra - Timelock", function () {
    let dao, token, owner, addr1, addr2;

    beforeEach(async function () {
        ({ dao, token, owner, addr1, addr2 } = await deployContracts());
        
        const tokenAmount = CONSTANTS.multiply(CONSTANTS.SHARE_PRICE, 10n);
        
        await token.connect(owner).transfer(addr1.address, tokenAmount);
        await token.connect(addr1).approve(await dao.getAddress(), tokenAmount);
        await dao.connect(addr1).purchaseShares(10);
        
        // proposta + voto per testare timelock
        await dao.connect(addr1).createProposal(
            "Test Proposal",
            "Description",
            addr2.address,
            ethers.parseEther("100")
        );
        await dao.connect(addr1).vote(0, true, false);
    });

    it("Non dovrebbe permettere l'esecuzione immediata dopo la votazione", async function () {
        // andiamo oltre il periodo di votazione
        await time.increase(CONSTANTS.WEEK_IN_SECONDS);
        
        await dao.connect(addr1).queueProposal(0);
        
        // (dovrebbe fallire)
        await expect(
            dao.connect(addr1).executeProposal(0)
        ).to.be.revertedWith("Timelock period not ended");
    });
});