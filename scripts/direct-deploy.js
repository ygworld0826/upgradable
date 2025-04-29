// scripts/direct-deploy.js
// This script takes a private key directly as a parameter

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function makeAbi(contractName, contractAddress) {
  try {
    // Create directory if it doesn't exist
    const abiDir = path.join(__dirname, "../abis");
    if (!fs.existsSync(abiDir)) {
      fs.mkdirSync(abiDir, { recursive: true });
    }
    
    // Get contract artifact
    const artifactPath = path.join(
      __dirname,
      `../artifacts/contracts/${contractName}.sol/${contractName}.json`
    );
    
    if (!fs.existsSync(artifactPath)) {
      throw new Error(`Artifact for ${contractName} not found at ${artifactPath}`);
    }
    
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // Create ABI file
    const abiContent = {
      address: contractAddress,
      abi: artifact.abi
    };
    
    fs.writeFileSync(
      path.join(abiDir, `${contractName}.json`),
      JSON.stringify(abiContent, null, 2)
    );
    
    console.log(`ABI for ${contractName} created successfully!`);
  } catch (error) {
    console.error(`Error creating ABI for ${contractName}:`, error.message);
    throw error;
  }
}

// Check if private key was provided
if (process.argv.length < 3) {
  console.error("Please provide a private key as an argument");
  console.error("Usage: npx hardhat run scripts/direct-deploy.js \"YOUR_PRIVATE_KEY\"");
  process.exit(1);
}

// Get private key from command line argument
const privateKey = process.argv[2].trim().replace(/['"]/g, '');

async function main() {
  console.log("Starting deployment...");
  
  // Create a wallet with the provided private key
  const wallet = new hre.ethers.Wallet(privateKey, hre.ethers.provider);
  console.log("Deploying contracts with account:", wallet.address);
  
  try {
    const balance = await hre.ethers.provider.getBalance(wallet.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      console.warn("WARNING: Your account has zero balance. Transactions will likely fail.");
    }
  } catch (error) {
    console.error("Error checking balance:", error.message);
    console.log("Continuing anyway...");
  }

  try {
    // Get contract factories
    const V1 = await hre.ethers.getContractFactory("V1", wallet);
    const Proxy = await hre.ethers.getContractFactory("Proxy", wallet);

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
  } catch (error) {
    console.error("Deployment failed with error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error.message);
    process.exit(1);
  });