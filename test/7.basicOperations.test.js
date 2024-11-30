const { expect } = require("chai");
const { deployContracts, CONSTANTS } = require('./setup');
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DAOMetra - Operazioni Base", function () {
    let dao, token, owner, addr1, addr2;

    beforeEach(async function () {
        ({ dao, token, owner, addr1, addr2 } = await deployContracts());
    });

    describe("1. Acquisto base di shares", function () {
        it("Un membro dovrebbe poter acquistare shares", async function () {
      
            const tokenAmount = CONSTANTS.multiply(CONSTANTS.SHARE_PRICE, 10n);
            
            
            await token.transfer(addr1.address, tokenAmount);
            
           
            await token.connect(addr1).approve(await dao.getAddress(), tokenAmount);
            
            await dao.connect(addr1).purchaseShares(5);
            
          
            expect(await dao.shares(addr1.address)).to.equal(5n);
        });
    });

    describe("2. Creazione di una proposta base", function () {
        beforeEach(async function () {
            const tokenAmount = CONSTANTS.multiply(CONSTANTS.SHARE_PRICE, 10n);
            await token.transfer(addr1.address, tokenAmount);
            await token.connect(addr1).approve(await dao.getAddress(), tokenAmount);
            await dao.connect(addr1).purchaseShares(5);
        });

        it("Un membro dovrebbe poter creare una proposta", async function () {
            await dao.connect(addr1).createProposal(
                "Prima Proposta",
                "Questa è una proposta di test",
                addr2.address,
                ethers.parseEther("100")
            );
            
            const proposal = await dao.proposals(0);
            expect(proposal.title).to.equal("Prima Proposta");
            expect(proposal.description).to.equal("Questa è una proposta di test");
        });
    });

    describe("3. Votazione semplice tra due membri", function () {
        beforeEach(async function () {

  
            const tokenAmount = CONSTANTS.multiply(CONSTANTS.SHARE_PRICE, 10n);
            
            // adddr1
            await token.transfer(addr1.address, tokenAmount);
            await token.connect(addr1).approve(await dao.getAddress(), tokenAmount);
            await dao.connect(addr1).purchaseShares(5);
            
            // addr2
            await token.transfer(addr2.address, tokenAmount);
            await token.connect(addr2).approve(await dao.getAddress(), tokenAmount);
            await dao.connect(addr2).purchaseShares(5);
            
            await dao.connect(addr1).createProposal(
                "Proposta da Votare",
                "Proposta per test di voto",
                addr2.address,
                ethers.parseEther("100")
            );
        });

        it("Due membri dovrebbero poter votare su una proposta", async function () {
            // addr1 voto 
            await dao.connect(addr1).vote(0, true, false);
            
            // addr2 voto
            await dao.connect(addr2).vote(0, false, false);
            
           
            const proposal = await dao.proposals(0);
            expect(proposal.yesVotes).to.equal(5n);    
            expect(proposal.noVotes).to.equal(5n);     
        });
    });
});