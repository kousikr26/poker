const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Poker", function () {
  it("Should return the new greeting once it's changed", async function () {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const Poker = await ethers.getContractFactory("Poker");
    const poker = await Poker.deploy();
    await poker.deployed();

    const joinTx = await poker.join();
    await joinTx.wait();

    const joinTx2 = await poker.connect(addr1).join();
    await joinTx2.wait();

    const joinTx3 = await poker.connect(addr2).join();
    await joinTx3.wait();
    
    const exmpString = "0xabc";
    const strlist = [];
    for (let i = 0; i < 52; i += 1) {
      strlist.push(ethers.utils.hexZeroPad(exmpString, 32));
    }
    const distribTx = await poker.connect(owner).initiate_distribution(strlist);
    await distribTx.wait();

    const printTx = await poker.connect(owner).print_cards();

    const joinTx4 = await poker.connect(addr3).join();
    await joinTx4.wait();

    const pickTx = await poker.connect(addr1).pick_cards(strlist.slice(40), strlist.slice(1,3))
    await pickTx.wait();

    const printTx2 = await poker.connect(addr1).print_cards();

    const printPlayerTx = await poker.connect(addr1).print_player_cards(2);


  });
});
