const { expect } = require("chai");
const { deployContracts, CONSTANTS } = require('./setup');
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DAOMetra - Limiti TEST", function () {
    let dao, token, owner, addr1, addr2;
    let maxUint256;

    beforeEach(async function () {
        ({ dao, token, owner, addr1, addr2 } = await deployContracts());
        maxUint256 = ethers.MaxUint256;
    });

    describe("Limiti Sistema Token", function () {
        it("Non dovrebbe permettere trasferimenti che superano il saldo", async function () {
            const balance = await token.balanceOf(owner.address);
            await expect(
                token.transfer(addr1.address, balance + 1n)
            ).to.be.revertedWith("Insufficient balance");
        });

        it("Non dovrebbe permettere approvazioni che superano il saldo", async function () {
            await token.approve(addr1.address, maxUint256);
            const balance = await token.balanceOf(owner.address);
            await expect(
                token.connect(addr1).transferFrom(owner.address, addr2.address, balance + 1n)
            ).to.be.revertedWith("Insufficient balance");
        });
    });

    describe("Limiti delle Shares", function () {
        beforeEach(async function () {
            const largeAmount = ethers.parseEther("1000000");
            await token.transfer(addr1.address, largeAmount);
            await token.connect(addr1).approve(await dao.getAddress(), largeAmount);
        });

        it("Dovrebbe gestire correttamente acquisti multipli di shares", async function () {
            for(let i = 0; i < 10; i++) {
                await dao.connect(addr1).purchaseShares(1);
            }
            expect(await dao.shares(addr1.address)).to.equal(10n);
        });

        it("Non dovrebbe permettere l'overflow del totalShares", async function () {
            const veryLargeAmount = 1000000n;
            await expect(
                dao.connect(addr1).purchaseShares(Number(veryLargeAmount))
            ).to.be.revertedWith("Insufficient balance");
        });
    });

    describe("Limiti delle Proposte", function () {
        beforeEach(async function () {
            const tokenAmount = CONSTANTS.multiply(CONSTANTS.SHARE_PRICE, 10n);
            await token.transfer(addr1.address, tokenAmount);
            await token.connect(addr1).approve(await dao.getAddress(), tokenAmount);
            await dao.connect(addr1).purchaseShares(10);
        });

        it("Dovrebbe gestire proposte con importi molto grandi", async function () {
            await expect(
                dao.connect(addr1).createProposal(
                    "Test Proposal",
                    "Description",
                    addr2.address,
                    maxUint256
                )
            ).to.not.be.reverted;
        });

        it("Dovrebbe gestire proposte con descrizioni lunghe", async function () {
            const longDescription = "a".repeat(1000); 
            await dao.connect(addr1).createProposal(
                "Test",
                longDescription,
                addr2.address,
                ethers.parseEther("100")
            );
            const proposal = await dao.proposals(0);
            expect(proposal.description).to.equal(longDescription);
        });
    });

    describe("Limiti del Sistema di Voto", function () {
        beforeEach(async function () {
            const tokenAmount = CONSTANTS.multiply(CONSTANTS.SHARE_PRICE, 1000n);
            await token.transfer(addr1.address, tokenAmount);
            await token.connect(addr1).approve(await dao.getAddress(), tokenAmount);
            await dao.connect(addr1).purchaseShares(1000);

            await dao.connect(addr1).createProposal(
                "Test Proposal",
                "Description",
                addr2.address,
                ethers.parseEther("100")
            );
        });

        it("Dovrebbe gestire correttamente voti con molte shares", async function () {
            await dao.connect(addr1).vote(0, true, false);
            const proposal = await dao.proposals(0);
            expect(proposal.yesVotes).to.equal(1000n);
        });

        it("Dovrebbe gestire correttamente il calcolo del quorum con molti voti", async function () {
            await dao.connect(addr1).vote(0, true, false);
            await time.increase(CONSTANTS.WEEK_IN_SECONDS);
            
            await expect(
                dao.connect(addr1).queueProposal(0)
            ).to.not.be.reverted;
        });
    });

    describe("Limiti del Timelock", function () {
        beforeEach(async function () {
           
            const tokenAmount = CONSTANTS.multiply(CONSTANTS.SHARE_PRICE, 10n);
            await token.transfer(addr1.address, tokenAmount);
            await token.connect(addr1).approve(await dao.getAddress(), tokenAmount);
            await dao.connect(addr1).purchaseShares(10);
            
            await dao.connect(addr1).createProposal(
                "Test Proposal",
                "Description",
                addr2.address,
                ethers.parseEther("100")
            );
            await dao.connect(addr1).vote(0, true, false);
        });

        it("Dovrebbe gestire correttamente periodi di tempo molto lunghi", async function () {
            await time.increase(CONSTANTS.WEEK_IN_SECONDS);
            await dao.connect(addr1).queueProposal(0);
            
            
            await time.increase(CONSTANTS.WEEK_IN_SECONDS * 52); // Un anno
            
            await expect(
                dao.connect(addr1).executeProposal(0)
            ).to.not.be.reverted;
        });

        it("Non dovrebbe permettere l'esecuzione immediata dopo la coda", async function () {
            await time.increase(CONSTANTS.WEEK_IN_SECONDS);
            await dao.connect(addr1).queueProposal(0);
            
            await expect(
                dao.connect(addr1).executeProposal(0)
            ).to.be.revertedWith("Timelock period not ended");
        });
    });
});