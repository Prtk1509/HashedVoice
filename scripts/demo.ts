import { ethers } from "hardhat";

async function main() {
    const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

    const contract = await ethers.getContractAt("HashedVoice", CONTRACT_ADDRESS);

    const [admin,voter1]=await ethers.getSigners();

    console.log("Admin address:",admin.address);
    console.log("Voter1 address:",voter1.address);

    console.log("Adding Candidates...");
    let tx=await contract.connect(admin).addCandidate("Alice");
    await tx.wait();
    tx=await contract.connect(admin).addCandidate("Bob");
    await tx.wait();
    
    console.log("Authorising voter1...");
    tx=await contract.connect(admin).authorizeVoter(voter1.address,"25JE0948");
    await tx.wait();

    console.log("Opening voting...");
    tx=await contract.connect(admin).openVoting();
    await tx.wait();

    console.log("Voter1 voting for candidate 1...");
    tx=await contract.connect(voter1).vote(1);
    await tx.wait();

    const cand1=await contract.getCandidate(1);
    const cand2=await contract.getCandidate(2);

    console.log("Candidate 1:", {
        id:cand1[0].toString(),
        name:cand1[1],
        votes:cand1[2].toString()
    });

    console.log("Candidate 2:", {
        id:cand2[0].toString(),
        name:cand2[1],
        votes:cand2[2].toString()
    });
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});