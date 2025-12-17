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
});