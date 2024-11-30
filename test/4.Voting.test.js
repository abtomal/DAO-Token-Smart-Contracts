const { expect } = require("chai");
const { deployContracts, CONSTANTS } = require('./setup');
const { ethers } = require("hardhat");

describe("DAOMetra - Sistema di Voto", function () {
    let dao, token, owner, addr1, addr2;

    beforeEach(async function () {
        ({ dao, token, owner, addr1, addr2 } = await deployContracts());
        
        const tokenAmount = CONSTANTS.multiply(CONSTANTS.SHARE_PRICE, 10n);
        
        // token a entrambi i votanti
        for (const voter of [addr1, addr2]) {
            await token.connect(owner).transfer(voter.address, tokenAmount);
            await token.connect(voter).approve(await dao.getAddress(), tokenAmount);
            await dao.connect(voter).purchaseShares(10);
        }
        
        // proposta di test 
        await dao.connect(addr1).createProposal(
            "Test Proposal",
            "Description",
            addr2.address,
            ethers.parseEther("100")
        );
    });

    describe("Meccanica del Voto", function () {
        it("Dovrebbe pesare i voti in base alle shares", async function () {
            await dao.connect(addr1).vote(0, true, false);
            const proposal = await dao.proposals(0);
            expect(proposal.yesVotes).to.equal(10n);
        });
    });
});