import { expect } from "chai";
import { ethers } from "hardhat";

describe("HashedVoice - Basic Election Creation", function () {

    // An ADMIN_ROLE & ELECTION_ADMIN_ROLE can create an election.

    it("should allow an admin to create an election", async function () {
        const [admin] = await ethers.getSigners();

        const HashedVoice = await ethers.getContractFactory("HashedVoice")

        const contract = await HashedVoice.deploy();
        await contract.waitForDeployment();

        const tx = await contract.createElection(
            "CR Election",
            "Class Representative",
            "25JE0853",
            "25JE0992"
        );
        await tx.wait();

        const election = await contract.getElectionMetadata(1);

        expect(election.name).to.equal("CR Election");
        expect(election.votingOpen).to.equal(false);
        expect(election.candidateCount).to.equal(0n);
    });

    //Any non-admin cannot create any election.

    it("should not allow a non-admin to create an election", async function () {
        const [admin, nonAdmin] = await ethers.getSigners();

        const HashedVoice = await ethers.getContractFactory("HashedVoice");

        const contract = await HashedVoice.deploy();
        await contract.waitForDeployment();

        await expect(
            contract.connect(nonAdmin).createElection(
                "Fake Election",
                "You should not be seeing this.",
                "25JE0853",
                "25JE0992"
            )
        ).to.be.revertedWith("Requires ELECTION_ADMIN_ROLE");
    });

    //Candidate Manager can add Candidate

    it("should allow candidate manager to add candidates", async function () {
        const [admin, candidateManager] = await ethers.getSigners();

        const HashedVoice = await ethers.getContractFactory("HashedVoice");

        const contract = await HashedVoice.deploy();
        await contract.waitForDeployment();

        await contract.createElection(
            "CR Election",
            "Class Representative",
            "25JE0853",
            "25JE0992"
        );

        const CANDIDATE_MANAGER_ROLE = await contract.CANDIDATE_MANAGER_ROLE();
        await contract.grantRole(CANDIDATE_MANAGER_ROLE,candidateManager.address);

        await contract.connect(candidateManager).addCandidate(1,"Prav Prateek");
        
        const candidate = await contract.getCandidate(1,1);      //ElectionId & CandidateId
        //candidate = [id,name,votes]
        expect(candidate[1]).to.equal("Prav Prateek");
        expect(candidate[2]).to.equal(0n);
    });

    //Non-candidate manager cannot add candidates

    it("should NOT allow non-candidate-manager to add candidates",async function () {
        const [admin, nonManager] = await ethers.getSigners();

        const HashedVoice = await ethers.getContractFactory("HashedVoice");

        const contract = await HashedVoice.deploy();
        await contract.waitForDeployment();

        await contract.createElection(
            "CR Election",
            "Class Representative",
            "25JE0853",
            "25JE0992"
        );

        await expect(contract.connect(nonManager).addCandidate(1,"Unauthorised Candidate")).to.be.revertedWith("Requires CANDIDATE_MANAGER_ROLE");
    });

    //Cannot add candidates once election is opened.

    it("should not allow addition of cadidates after election is opened.",async function () {
        const [admin, candidateManager] = await ethers.getSigners();

        const HashedVoice = await ethers.getContractFactory("HashedVoice");

        const contract = await HashedVoice.deploy();
        await contract.waitForDeployment();

        await contract.createElection(
            "CR Election",
            "Class Representative",
            "25JE0853",
            "25JE0992"
        );

        const CANDIDATE_MANAGER_ROLE = await contract.CANDIDATE_MANAGER_ROLE();
        await contract.grantRole(CANDIDATE_MANAGER_ROLE,candidateManager.address);

        await contract.connect(candidateManager).addCandidate(1,"Initial Candidate");

        await contract.openElection(1);
        await expect(contract.connect(candidateManager).addCandidate(1,"Late Candidate")).to.be.revertedWith("Cannot add candidates while voting is open");
    });

    //Cannot vote when election is closed.

    it("should not allow to vote once election is closed",async function () {
        const [admin, candidateManager,voter] = await ethers.getSigners();

        const HashedVoice = await ethers.getContractFactory("HashedVoice");

        const contract = await HashedVoice.deploy();
        await contract.waitForDeployment();

        await contract.createElection(
            "CR Election",
            "Class Representative",
            "25JE0853",
            "25JE0992"
        );

        const CANDIDATE_MANAGER_ROLE = await contract.CANDIDATE_MANAGER_ROLE();
        await contract.grantRole(CANDIDATE_MANAGER_ROLE,candidateManager.address);

        await contract.connect(candidateManager).addCandidate(1,"Initial Candidate");
        await expect(contract.connect(voter).vote(1,1,"25JE0900")).to.be.revertedWith("Voting is closed");
    });

    //Voter can vote if eligible and election is open.

    it("should allow a voter to vote when election is open and eligible",async function () {
        const [admin, candidateManager,voter] = await ethers.getSigners();

        const HashedVoice = await ethers.getContractFactory("HashedVoice");

        const contract = await HashedVoice.deploy();
        await contract.waitForDeployment();

        await contract.createElection(
            "CR Election",
            "Class Representative",
            "25JE0853",
            "25JE0992"
        );

        const CANDIDATE_MANAGER_ROLE = await contract.CANDIDATE_MANAGER_ROLE();
        await contract.grantRole(CANDIDATE_MANAGER_ROLE,candidateManager.address);

        await contract.connect(candidateManager).addCandidate(1,"Initial Candidate");
        await contract.openElection(1);
        await contract.connect(voter).vote(1,1,"25JE0900");

        const candidate = await contract.getCandidate(1,1);
        expect(candidate[2]).to.be.equal(1n);
    });

    //Voter cannot vote twice.

    it("should not allow a voter to vote more than once",async function () {
        const [admin, candidateManager,voter] = await ethers.getSigners();

        const HashedVoice = await ethers.getContractFactory("HashedVoice");

        const contract = await HashedVoice.deploy();
        await contract.waitForDeployment();

        await contract.createElection(
            "CR Election",
            "Class Representative",
            "25JE0853",
            "25JE0992"
        );

        const CANDIDATE_MANAGER_ROLE = await contract.CANDIDATE_MANAGER_ROLE();
        await contract.grantRole(CANDIDATE_MANAGER_ROLE,candidateManager.address);

        await contract.connect(candidateManager).addCandidate(1,"Initial Candidate");
        await contract.openElection(1);
        await contract.connect(voter).vote(1,1,"25JE0900");

        await expect(contract.connect(voter).vote(1,1,"25JE0900")).to.be.revertedWith("Already voted");
    });

    //Cannot vote if admission is out of range.

    it("should not allow voting if admission number is out of range",async function () {
        const [admin, candidateManager,voter] = await ethers.getSigners();

        const HashedVoice = await ethers.getContractFactory("HashedVoice");

        const contract = await HashedVoice.deploy();
        await contract.waitForDeployment();

        await contract.createElection(
            "CR Election",
            "Class Representative",
            "25JE0853",
            "25JE0992"
        );

        const CANDIDATE_MANAGER_ROLE = await contract.CANDIDATE_MANAGER_ROLE();
        await contract.grantRole(CANDIDATE_MANAGER_ROLE,candidateManager.address);

        await contract.connect(candidateManager).addCandidate(1,"Initial Candidate");
        await contract.openElection(1);

        await expect(contract.connect(voter).vote(1,1,"24JE0123")).to.be.revertedWith("Not allowed");
    });

    //When an election is open, only admin can see votecount and after the closing of election everyone can.

    it("should hide votes from voters during open election but show to admin, and show to all after closing", async function () {
        const [admin, candidateManager,voter] = await ethers.getSigners();

        const HashedVoice = await ethers.getContractFactory("HashedVoice");

        const contract = await HashedVoice.deploy();
        await contract.waitForDeployment();

        await contract.createElection(
            "CR Election",
            "Class Representative",
            "25JE0853",
            "25JE0992"
        );

        const CANDIDATE_MANAGER_ROLE = await contract.CANDIDATE_MANAGER_ROLE();
        await contract.grantRole(CANDIDATE_MANAGER_ROLE,candidateManager.address);

        await contract.connect(candidateManager).addCandidate(1,"Initial Candidate");
        await contract.openElection(1);

        await contract.connect(voter).vote(1,1,"25JE0900");

        const voterViewOpen = await contract.connect(voter).getCandidate(1,1);
        expect(voterViewOpen[2]).to.be.equal(0n);

        const adminViewOpen = await contract.connect(admin).getCandidate(1,1);
        expect(adminViewOpen[2]).to.be.equal(1n);

        await contract.closeElection(1);

        const voterViewClosed = await contract.connect(voter).getCandidate(1,1);
        expect(voterViewClosed[2]).to.be.equal(1n);
    });
});