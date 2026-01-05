import { ethers } from "hardhat";

async function main() {
  const [admin] = await ethers.getSigners();

  console.log("Admin address:", admin.address);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // your deployed address
  const HashedVoice = await ethers.getContractAt(
    "HashedVoice",
    contractAddress
  );

  const tx = await HashedVoice.createElection(
    "CR Election",
    "Class Representative Election 2025",
    "25JE0853",
    "25JE0992"
  );

  await tx.wait();

  console.log("Election created successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
