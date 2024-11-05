/* eslint-env mocha */

import { expect } from "chai";
import { parseEther } from "ethers";
import pkg from 'hardhat';

const { ethers } = pkg;


describe("Votex System", function () {
  let owner, addr1, addr2, VOTING;

  beforeEach("Before Each", async function () {
    VOTING = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2] = await ethers.getSigners();

    this.voting = await VOTING.deploy()

  })

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      await expect(await this.voting.owner()).to.be.equal(owner.address);
    })

    it("Should set the right Token Name", async function () {
      await expect(await this.voting.name()).to.be.equal("Votex");
    })

    it("Should set the right Token Symbol", async function () {
      await expect(await this.voting.symbol()).to.be.equal("VTKN");
    })
  })

  describe("Register Voter", function () {
    it("Should revert if registration period has not started", async function () {
      await expect(this.voting.connect(addr1).registerVoter("Peter", 23, "37948012")).to.be.revertedWith("Registration period has not started.");
    })

    it("Should register voter successfully", async function () {
      await this.voting.connect(owner).startRegistration();

      await expect(this.voting.connect(addr1).registerVoter("Peter", 23, "37948012")).to.emit(this.voting, "VoterRegistrationSuccess").withArgs("Peter", 23, "37948012");

      await expect(this.voting.connect(addr2).registerVoter("Paul", 54, "37948012")).to.be.revertedWith("Voter already exists!");
    })

    it("Should ensure that the registration tokens are sent to the voter account", async function () {
      await this.voting.connect(owner).startRegistration();

      await expect(this.voting.connect(addr1).registerVoter("Peter", 23, "37948012")).to.emit(this.voting, "VoterRegistrationSuccess").withArgs("Peter", 23, "37948012");

      await expect(await this.voting.balanceOf(addr1.address)).to.equal(ethers.parseEther("5"));
    })
  })

  describe("Register Candidate", function () {
    it("Should succeed if candidate is already a registered voter", async function () {
      await this.voting.connect(owner).startRegistration();

      await expect(this.voting.connect(addr1).registerVoter("Peter", 23, "37948012")).to.emit(this.voting, "VoterRegistrationSuccess").withArgs("Peter", 23, "37948012");

      await expect(await this.voting.connect(addr2).registerCandidate("Peter", 23, "37948012", "DAP")).to.emit(this.voting, "CandidateRegistrationSuccess").withArgs("Peter", 23, "37948012", "DAP");
    })

    it("Should revert if candidate is not a registered voter", async function () {
      await this.voting.connect(owner).startRegistration();

      await expect(this.voting.connect(addr1).registerVoter("Peter", 23, "37948012")).to.emit(this.voting, "VoterRegistrationSuccess").withArgs("Peter", 23, "37948012");

      await expect(this.voting.connect(addr2).registerCandidate("Peter", 23, "37575933", "DAP")).to.be.rejectedWith("You must be a registered voter!");
    })

    it("Should revert if candidate is already registered", async function () {
      await this.voting.connect(owner).startRegistration();

      await expect(this.voting.connect(addr1).registerVoter("Peter", 23, "37948012")).to.emit(this.voting, "VoterRegistrationSuccess").withArgs("Peter", 23, "37948012");

      await expect(await this.voting.connect(addr2).registerCandidate("Peter", 23, "37948012", "DAP")).to.emit(this.voting, "CandidateRegistrationSuccess").withArgs("Peter", 23, "37948012", "DAP");

      await expect(this.voting.connect(addr2).registerCandidate("John", 40, "37948012", "PNU")).to.be.revertedWith("Candidate already exists!");
    })
  })

  describe("Verify Candidate", async function () {
    it("Should succeed if candidate is already registered", async function () {
      await this.voting.connect(owner).startRegistration();

      await expect(this.voting.connect(addr1).registerVoter("Peter", 23, "37948012")).to.emit(this.voting, "VoterRegistrationSuccess").withArgs("Peter", 23, "37948012");

      await expect(await this.voting.connect(addr2).registerCandidate("Peter", 23, "37948012", "DAP")).to.emit(this.voting, "CandidateRegistrationSuccess").withArgs("Peter", 23, "37948012", "DAP");

      await expect(await this.voting.connect(owner).verifyCandidate("37948012")).to.emit(this.voting, "VerifyCandidateSuccess").withArgs("Peter", "37948012");
    })

    it("Should revert if candidate is already verified", async function () {
      await this.voting.connect(owner).startRegistration();

      await expect(this.voting.connect(addr1).registerVoter("Peter", 23, "37948012")).to.emit(this.voting, "VoterRegistrationSuccess").withArgs("Peter", 23, "37948012");

      await expect(await this.voting.connect(addr2).registerCandidate("Peter", 23, "37948012", "DAP")).to.emit(this.voting, "CandidateRegistrationSuccess").withArgs("Peter", 23, "37948012", "DAP");

      await expect(await this.voting.connect(owner).verifyCandidate("37948012")).to.emit(this.voting, "VerifyCandidateSuccess").withArgs("Peter", "37948012");

      await expect(this.voting.connect(owner).verifyCandidate("37948012")).to.be.revertedWith("Candidate already verified!");
    })

    it("Should fund the owners account with 10 tokens", async function () {
      await this.voting.connect(owner).startRegistration();

      await expect(this.voting.connect(addr1).registerVoter("Peter", 23, "37948012")).to.emit(this.voting, "VoterRegistrationSuccess").withArgs("Peter", 23, "37948012");

      await expect(await this.voting.connect(addr2).registerCandidate("Peter", 23, "37948012", "DAP")).to.emit(this.voting, "CandidateRegistrationSuccess").withArgs("Peter", 23, "37948012", "DAP");

      await expect(await this.voting.connect(owner).verifyCandidate("37948012")).to.emit(this.voting, "VerifyCandidateSuccess").withArgs("Peter", "37948012");

      await expect(await this.voting.balanceOf(owner.address)).to.equal(ethers.parseEther("10"));
    })
  })

  describe("Voting", function () {
    it("Should revert if positions is empty", async function () {
      await this.voting.connect(owner).startRegistration();

      await expect(this.voting.connect(addr2).registerVoter("Peter", 23, "37948012")).to.emit(this.voting, "VoterRegistrationSuccess").withArgs("Peter", 23, "37948012");

      await expect(await this.voting.connect(addr2).registerCandidate("Peter", 23, "37948012", "DAP")).to.emit(this.voting, "CandidateRegistrationSuccess").withArgs("Peter", 23, "37948012", "DAP");

      await expect(await this.voting.connect(owner).addPositions(["Mayor"])).to.emit(this.voting, "PositionAdded").withArgs('Mayor');

      await this.voting.connect(owner).verifyCandidate("37948012");

      await this.voting.connect(owner).endRegistrationAndStartVoting();

      await expect(this.voting.connect(addr2).vote("Mayor", 1)).to.be.revertedWith("Invalid position.");
    })
  })

  describe("Start Registration Period", function () {
    it("Should revert if registration has already started", async function () {
      await this.voting.connect(owner).startRegistration();
      await expect(this.voting.connect(owner).startRegistration()).to.be.revertedWith("Registration has already started.");
    })

    it("Should revert if voting has already started", async function () {
      await this.voting.connect(owner).startRegistration();
      await this.voting.connect(owner).endRegistrationAndStartVoting();
      await expect(this.voting.connect(owner).startRegistration()).to.be.revertedWith("Cannot start registration after voting has begun.");
    })
  })

  describe("Start Voting Period", async function () {
    it("Should revert if registration period has not started", async function () {
      await expect(this.voting.connect(owner).endRegistrationAndStartVoting()).to.be.revertedWith("Registration period has not started.")
    })

    it("Should revert if voting period has not started", async function () {
      await this.voting.connect(owner).startRegistration();
      await this.voting.connect(owner).endRegistrationAndStartVoting();

      await expect(this.voting.connect(owner).endRegistrationAndStartVoting()).to.be.rejectedWith("Registration period has not started.");
    })
  })

  describe("Add Positions", function () {
    it("Should add a new position", async function () {
      const add = await expect(await this.voting.connect(owner).addPositions(["Mayor"])).to.emit(this.voting, "PositionAdded").withArgs('Mayor')
      console.log(await this.voting.connect(addr1).getPositionCount());
      expect(await this.voting.connect(addr1).getPositionCount()).to.equal(1);

      const positions = await this.voting.connect(addr1).getAllPositions();
      const positionNames = positions.map(position => position.pName);
      expect(positionNames).to.deep.equal(["Mayor"]);
    })

    it("Should revert if not owner who is adding the position(s)", async function () {
      await expect(this.voting.connect(addr1).addPositions(["Mayor", "President"])).to.be.revertedWith("You are not the owner!");
    })

  })
})