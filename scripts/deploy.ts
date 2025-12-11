import { ethers } from "hardhat";

async function main() {
    const HashedVoice = await ethers.getContractFactory("HashedVoice");
    
    console.log("Deploying HashedVoice contract...");

    const contract = await HashedVoice.deploy();
    await contract.waitForDeployment();

    console.log(`HashedVoice deployed to: ${contract.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});