// scripts/deploy.ts
import { ethers } from "hardhat";
import { makeAbi } from './makeABI';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Reload environment variables to ensure they're available
dotenv.config();

async function main() {
  console.log("Starting deployment...");
  
  // Debug: Check private key existence and format
  const privateKey = process.env.ADMIN_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("ADMIN_PRIVATE_KEY is not set in your .env file. Please add it and try again.");
  }
  
  console.log("Private key format check:");
  console.log("- Length:", privateKey.length);
  console.log("- Starts with 0x:", privateKey.startsWith("0x"));
  
  // Get the signers from hardhat
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No signers available. Please check your private key and network configuration.");
  }
  
  const deployer = signers[0];
  console.log("Deploying contracts with account:", deployer.address);
  
  try {
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      console.warn("WARNING: Your account has zero balance. Transactions will likely fail.");
    }
  } catch (error: any) { // Type annotation here
    console.error("Error checking balance:", error.message);
    console.log("Continuing anyway...");
  }

  // Get contract factories with the signer specifically attached
  try {
    const V1 = await ethers.getContractFactory("V1", deployer);
    const Proxy = await ethers.getContractFactory("Proxy", deployer);

    console.log('Deploying V1 implementation contract...');

    // Deploy V1 implementation
    const v1 = await V1.deploy();
    await v1.waitForDeployment();
    const v1Address = await v1.getAddress();
    console.log("V1 implementation deployed to:", v1Address);

    console.log('Deploying Proxy contract...');
    
    // Deploy Proxy contract with V1's address
    const proxy = await Proxy.deploy(v1Address);
    await proxy.waitForDeployment(); 
    const proxyAddress = await proxy.getAddress();
    console.log('Proxy contract deployed to:', proxyAddress);

    // Ensure abis directory exists
    const abiDir = path.join(__dirname, "../abis");
    if (!fs.existsSync(abiDir)) {
      fs.mkdirSync(abiDir, { recursive: true });
    }

    // Save ABIs
    console.log("Generating ABI files...");
    await makeAbi('Proxy', proxyAddress);
    await makeAbi('V1', proxyAddress);

    // Additionally create a Proxy.json file with full ABI for the upgrade script
    const proxyArtifact = require("../artifacts/contracts/Proxy.sol/Proxy.json");
    fs.writeFileSync(
      path.join(abiDir, "Proxy.json"),
      JSON.stringify({
        address: proxyAddress,
        abi: proxyArtifact.abi
      }, null, 2)
    );

    console.log("Deployment completed successfully!");
    console.log("V1 address:", v1Address);
    console.log("Proxy address:", proxyAddress);
  } catch (error: any) { // Type annotation here
    console.error("Deployment failed with error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: any) => { // Type annotation here
    console.error("Fatal error:", error.message);
    process.exit(1);
  });