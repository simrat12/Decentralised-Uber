const { expect } = require("chai");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { reverted } = require("@nomicfoundation/hardhat-chai-matchers");

describe("Uber", function () {
  async function deploy () {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const Uber = await ethers.getContractFactory("Uber");
    const uber = await Uber.deploy(["London", "Manchester", "Birmingham"]);
    await uber.deployed();

    return {owner, addr1, addr2, uber}
  };

  it("Check if Uber works", async function () {
    const {owner, addr1, addr2, uber} = await loadFixture(deploy);
    await uber.connect(owner).RegisterDriver(owner.address, "London", "Harry");
  })

  it("Check registration", async function () {
    const {owner, addr1, addr2, uber} = await loadFixture(deploy);
    await uber.connect(owner).RegisterDriver(owner.address, "London", "Harry");
    await expect(uber.connect(owner).RegisterUser(owner.address, "London", "Harry", false)).to.be.reverted;
  })

  it("Requesting Rides when a driver", async function () {
    const {owner, addr1, addr2, uber} = await loadFixture(deploy);
    await uber.connect(owner).RegisterDriver(owner.address, "London", "Harry");
    await expect(uber.connect(owner).requestRide("London", "Manchester")).to.be.reverted;
  })

  it("Requesting and accepting rides", async function () {
    const {owner, addr1, addr2, uber} = await loadFixture(deploy);
    await uber.connect(owner).RegisterDriver(owner.address, "London", "Harry");
    await uber.connect(addr1).RegisterUser(addr1.address, "Max", "London", false);
    await uber.connect(addr1).requestRide("London", "Manchester");
    await uber.connect(owner).acceptRide(1);
  })

  it("Accepting invalid ride", async function () {
    const {owner, addr1, addr2, uber} = await loadFixture(deploy);
    await uber.connect(owner).RegisterDriver(owner.address, "London", "Harry");
    await expect(uber.connect(owner).acceptRide(2)).to.be.reverted;
  })

  it("Accepting a taken ride", async function () {
    const {owner, addr1, addr2, uber} = await loadFixture(deploy);
    await uber.connect(owner).RegisterDriver(owner.address, "London", "Harry");
    await uber.connect(addr2).RegisterDriver(addr2.address, "London", "Steve");
    await uber.connect(addr1).RegisterUser(addr1.address, "Max", "London", false);
    await uber.connect(addr1).requestRide("London", "Manchester");
    await uber.connect(owner).acceptRide(1);
    await expect(uber.connect(addr2).acceptRide(1)).to.be.reverted;
  })

  it("Cancelling a ride", async function () {
    const {owner, addr1, addr2, uber} = await loadFixture(deploy);
    await uber.connect(addr1).RegisterUser(addr1.address, "Max", "London", false);
    await uber.connect(owner).RegisterDriver(owner.address, "London", "Harry");
    await uber.connect(addr1).requestRide("London", "Manchester");
    await uber.connect(owner).acceptRide(1);
    await time.increase(10001);
    await uber.connect(addr1).cancel_ride(1);
  })

  it("Cancelling a ride early", async function () {
    const {owner, addr1, addr2, uber} = await loadFixture(deploy);
    await uber.connect(addr1).RegisterUser(addr1.address, "Max", "London", false);
    await uber.connect(addr1).requestRide("London", "Manchester");
    await expect(uber.connect(addr1).cancel_ride(1)).to.be.reverted;
  })

  it("Cancelling a ride after acceptance", async function () {
    const {owner, addr1, addr2, uber} = await loadFixture(deploy);
    await uber.connect(owner).RegisterDriver(owner.address, "London", "Harry");
    await uber.connect(addr1).RegisterUser(addr1.address, "Max", "London", false);
    await uber.connect(addr1).requestRide("London", "Manchester");
    await uber.connect(owner).acceptRide(1);
    await expect(uber.connect(addr1).cancel_ride(1)).to.be.reverted;
  })
})
