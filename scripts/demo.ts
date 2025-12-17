import { ethers } from "hardhat";

async function main() {
    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const contract = await ethers.getContractAt("HashedVoice", CONTRACT_ADDRESS);

    const [admin,manager,candidatemgr,voter1]=await ethers.getSigners();

    console.log("Admin address:",admin.address);
    
    let tx = await contract.connect(admin).grantRole(ethers.id("ELECTION_ADMIN_ROLE"),manager.address);
    await tx.wait();
    console.log(`Granted ELECTION_ADMIN_ROLE to manager: ${manager.address}`);

    tx = await contract.connect(admin).grantRole(ethers.id("CANDIDATE_MANAGER_ROLE"),candidatemgr.address);
    await tx.wait();
    console.log(`Granted CANDIDATE_MANAGER_ROLE to candidate manager: ${candidatemgr.address}`);

    tx = await contract.connect(manager).createElection("CR Elections Freshers 2025", "Election for Class Representative of CSE Freshers 2025", "25JE0853", "25JE0992");
    let receipt = await tx.wait();
    const electionId =1; //Just to keep demo simple.
    console.log(`Election created with ID: ${electionId}`);

    //Adding candidates
    tx = await contract.connect(candidatemgr).addCandidate(electionId, "Kendrick");
    await tx.wait();
    console.log(`Added candidate Prav Prateek to election ID: ${electionId}`);

    tx = await contract.connect(candidatemgr).addCandidate(electionId, "Drake");
    await tx.wait();
    console.log(`Added candidate Anurag Varshney to election ID: ${electionId}`);

    //Opening election
    tx = await contract.connect(manager).openElection(electionId);
    await tx.wait();
    console.log(`Election ID: ${electionId} is now OPEN for voting.`);

    //Voting
    tx = await contract.connect(voter1).vote(electionId, 1,"25JE0901");
    await tx.wait();
    
    //After voting, if a voter tries to fetch results.
    const c1 = await contract.connect(voter1).getCandidate(electionId, 1);
    console.log("Candidate 1 (visible to voter during open election):", c1); //Will not be able to see vote count. Though admin can.

    //Closing election
    tx = await contract.connect(manager).closeElection(electionId);
    await tx.wait();
    
    //Now, results will be publicly visible.

    const r1 = await contract.getCandidate(electionId, 1);
    console.log("Candidate 1 (after election closed):", r1); //Will be able to see vote count now.
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});