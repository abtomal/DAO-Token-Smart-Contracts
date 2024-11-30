
const { expect } = require("chai");
const { deployContracts, CONSTANTS } = require('./setup');
const { ethers } = require("hardhat");

describe("DAOMetra - Inizializzazione", function () {
    let dao, token, owner, addr1;

    beforeEach(async function () {
        ({ dao, token, owner, addr1 } = await deployContracts());
    });

    describe("Setup Iniziale", function () {
        it("Dovrebbe impostare correttamente l'owner come admin iniziale del token", async function () {
            const currentAdmin = await token.admin();
            const ownerAddress = await owner.getAddress();
            expect(currentAdmin).to.equal(ownerAddress);
        });

        it("Dovrebbe impostare il prezzo delle shares corretto", async function () {
            expect(await dao.sharePrice()).to.equal(CONSTANTS.SHARE_PRICE);
        });

        it("Dovrebbe attivare la vendita delle shares", async function () {
            expect(await dao.saleActive()).to.be.true;
        });

        it("Dovrebbe assegnare il supply iniziale all'owner", async function () {
            const ownerBalance = await token.balanceOf(owner.address);
            expect(ownerBalance).to.equal(CONSTANTS.INITIAL_SUPPLY);
        });

        it("Dovrebbe permettere all'owner di impostare la DAO come admin", async function () {
            const daoAddress = await dao.getAddress();
            await expect(token.connect(owner).setDAOAsAdmin(daoAddress))
                .to.emit(token, 'AdminChanged')
                .withArgs(owner.address, daoAddress);

            expect(await token.admin()).to.equal(daoAddress);
        });

        it("Non dovrebbe permettere a non-admin di cambiare l'admin", async function () {
            await expect(
                token.connect(addr1).setDAOAsAdmin(addr1.address)
            ).to.be.revertedWith("Only admin can perform this action");
        });

        it("Non dovrebbe permettere di impostare l'indirizzo zero come admin", async function () {
            await expect(
                token.connect(owner).setDAOAsAdmin(ethers.ZeroAddress)
            ).to.be.revertedWith("Cannot set zero address as admin");
        });
    });
});