const { expect } = require("chai");
const { deployContracts, CONSTANTS } = require('./setup');
const { ethers } = require("hardhat");

describe("DAOMetra - Gestione Shares", function () {
    let dao, token, owner, addr1, addr2;
    
    beforeEach(async function () {
        ({ dao, token, owner, addr1, addr2 } = await deployContracts());
    });

    describe("Acquisto Shares", function () {
        beforeEach(async function () {
            const tokenAmount = CONSTANTS.multiply(CONSTANTS.SHARE_PRICE, 10n);
            await token.connect(owner).transfer(addr1.address, tokenAmount);
            await token.connect(addr1).approve(await dao.getAddress(), tokenAmount);
        });

        it("Dovrebbe permettere l'acquisto di shares", async function () {
            await dao.connect(addr1).purchaseShares(5);
            expect(await dao.shares(addr1.address)).to.equal(5n);
        });

        it("Dovrebbe aggiornare correttamente il totalShares", async function () {
            const initialTotal = await dao.totalShares();
            await dao.connect(addr1).purchaseShares(5);
            expect(await dao.totalShares()).to.equal(initialTotal + 5n);
        });

        it("Dovrebbe trasferire correttamente i token", async function () {
            const shareAmount = 5n;
            const cost = CONSTANTS.multiply(CONSTANTS.SHARE_PRICE, shareAmount);
            const initialBalance = await token.balanceOf(addr1.address);
            
            await dao.connect(addr1).purchaseShares(Number(shareAmount));
            
            expect(await token.balanceOf(addr1.address)).to.equal(initialBalance - cost);
            expect(await token.balanceOf(await dao.getAddress())).to.equal(cost);
        });

        it("Non dovrebbe permettere l'acquisto di 0 shares", async function () {
            await expect(
                dao.connect(addr1).purchaseShares(0)
            ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("Non dovrebbe permettere l'acquisto con token insufficienti", async function () {
            const tokenAmount = CONSTANTS.multiply(CONSTANTS.SHARE_PRICE, 5n);
            await dao.connect(addr1).purchaseShares(5);
            
            await expect(
                dao.connect(addr1).purchaseShares(6)
            ).to.be.revertedWith("Insufficient balance");  
        });
    });

    describe("Disabilitazione Vendita", function () {
        it("Solo l'admin dovrebbe poter disabilitare la vendita", async function () {
            await expect(
                dao.connect(addr1).disableSale()
            ).to.be.revertedWith("Only admin can perform this action");
        });

        it("Dovrebbe impedire l'acquisto dopo la disabilitazione", async function () {
            const tokenAmount = CONSTANTS.multiply(CONSTANTS.SHARE_PRICE, 10n);
            await token.connect(owner).transfer(addr1.address, tokenAmount);
            await token.connect(addr1).approve(await dao.getAddress(), tokenAmount);
            
            await dao.disableSale();
            
            await expect(
                dao.connect(addr1).purchaseShares(5)
            ).to.be.revertedWith("Token sale is not active");
        });

        it("La disabilitazione dovrebbe essere irreversibile", async function () {
            await dao.disableSale();
            // No funzione per riattivare la vendita
            expect(await dao.saleActive()).to.be.false;
        });
    });

    describe("Edge Cases", function () {
        it("Dovrebbe gestire correttamente il massimo numero di shares acquistabili", async function () {
            const largeAmount = ethers.parseEther("1000000");
            await token.connect(owner).transfer(addr1.address, largeAmount);
            await token.connect(addr1).approve(await dao.getAddress(), largeAmount);
            
            // Big buy di shares
            const maxShares = 1000n;
            await dao.connect(addr1).purchaseShares(Number(maxShares));
            expect(await dao.shares(addr1.address)).to.equal(maxShares);
        });

        it("Dovrebbe mantenere la consistenza dei saldi dopo multiple transazioni", async function () {
            const tokenAmount = CONSTANTS.multiply(CONSTANTS.SHARE_PRICE, 20n);
            await token.connect(owner).transfer(addr1.address, tokenAmount);
            await token.connect(addr1).approve(await dao.getAddress(), tokenAmount);
            
            // multiple transazioni
            await dao.connect(addr1).purchaseShares(5);
            await dao.connect(addr1).purchaseShares(3);
            await dao.connect(addr1).purchaseShares(2);
            
            expect(await dao.shares(addr1.address)).to.equal(10n);
            expect(await dao.totalShares()).to.equal(10n);
        });
    });
});