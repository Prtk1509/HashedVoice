import { ethers } from "hardhat";

async function main() {
    const [admin, electionAdmin, candidateManager] = await ethers.getSigners();

    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; //Deployed contract address
    const HashedVoice = await ethers.getContractAt("HashedVoice", CONTRACT_ADDRESS);

    const ADMIN_ROLE = await HashedVoice.ADMIN_ROLE();
    const ELECTION_ADMIN_ROLE = await HashedVoice.ELECTION_ADMIN_ROLE();
    const CANDIDATE_MANAGER_ROLE = await HashedVoice.CANDIDATE_MANAGER_ROLE();

    await HashedVoice.grantRole(ADMIN_ROLE, admin.address);
    console.log(`Granted ADMIN_ROLE to admin: ${admin.address}`);
    await HashedVoice.grantRole(ELECTION_ADMIN_ROLE, electionAdmin.address);
    console.log(`Granted ELECTION_ADMIN_ROLE to election admin: ${electionAdmin.address}`);
    await HashedVoice.grantRole(CANDIDATE_MANAGER_ROLE, candidateManager.address);
    console.log(`Granted CANDIDATE_MANAGER_ROLE to candidate manager: ${candidateManager.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});