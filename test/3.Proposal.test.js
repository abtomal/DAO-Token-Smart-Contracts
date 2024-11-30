const { expect } = require("chai");
const { deployContracts, CONSTANTS } = require('./setup');
const { ethers } = require("hardhat");

describe("DAOMetra - Gestione Proposte", function () {
    let dao, token, owner, addr1, addr2;

    beforeEach(async function () {
        ({ dao, token, owner, addr1, addr2 } = await deployContracts());
        
        const tokenAmount = CONSTANTS.multiply(CONSTANTS.SHARE_PRICE, 10n);
        
        // trasferimento token per creare proposta
        await token.connect(owner).transfer(addr1.address, tokenAmount);
        await token.connect(addr1).approve(await dao.getAddress(), tokenAmount);
        
        // acquisto shares per diventare membro della DAO
        await dao.connect(addr1).purchaseShares(10);
    });

    it("Solo i membri possono creare proposte", async function () {
        // addr2 non ha shares, non dovrebbe poter creare proposte
        await expect(
            dao.connect(addr2).createProposal(
                "Test Proposal",
                "Description",
                addr1.address,
                ethers.parseEther("100")
            )
        ).to.be.revertedWith("Only DAO members can perform this action");
    });
});