// scripts/upgrade.ts
import { ethers } from "hardhat";
import { makeAbi } from './makeABI';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log("Starting upgrade process...");
  
  // Read the Proxy.json file
  const proxyPath = path.join(__dirname, '../abis/Proxy.json');
  if (!fs.existsSync(proxyPath)) {
    throw new Error(`Proxy.json file not found at ${proxyPath}. Please run the deployment script first.`);
  }
  
  const Proxy = JSON.parse(fs.readFileSync(proxyPath, 'utf8'));
  console.log("Proxy contract address:", Proxy.address);
  
  // Get the signers from hardhat
  const [admin] = await ethers.getSigners();
  console.log("Performing upgrade with account:", admin.address);
  console.log("Account balance:", (await admin.provider.getBalance(admin.address)).toString());
  
  // Create proxy contract instance
  const proxy = new ethers.Contract(Proxy.address, Proxy.abi, admin);
  
  // Get V2 contract factory
  const V2 = await ethers.getContractFactory("V2", admin);

  console.log('Deploying V2 implementation contract...');
  
  // Deploy V2 implementation
  const v2 = await V2.deploy();
  await v2.waitForDeployment();
  const v2Address = await v2.getAddress();
  console.log("V2 implementation deployed to:", v2Address);
  
  // Upgrade proxy to point to V2
  console.log('Upgrading proxy to V2 implementation...');
  const upgradeTx = await proxy.upgrade(v2Address);
  console.log('Upgrade transaction sent:', upgradeTx.hash);
  await upgradeTx.wait();
  console.log('Proxy successfully upgraded to V2');

  // Generate ABI file for V2
  console.log("Updating contract information...");
  await makeAbi('V2', Proxy.address);
  
  console.log("Upgrade completed successfully!");
  console.log("V2 address:", v2Address);
  console.log("Proxy address (unchanged):", Proxy.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });