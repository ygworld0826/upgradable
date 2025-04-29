import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import dotenv from 'dotenv';

dotenv.config();

// Validate private key
const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
if (!adminPrivateKey || adminPrivateKey.length < 64) {
  console.warn(
    "Warning: ADMIN_PRIVATE_KEY is missing or invalid in your .env file. " +
    "Make sure it's properly set for deployment networks."
  );
}

const config: HardhatUserConfig = {
  solidity: '0.8.28',
  networks: {
    hardhat: {
      // Local development network
    },
    kairos: {
      url: 'https://public-en-kairos.node.kaia.io',
      accounts: adminPrivateKey ? [adminPrivateKey] : [],
    },
  },
  // Separate etherscan configuration instead of inside networks
  etherscan: {
    apiKey: {
      kairos: "NO_API_KEY_REQUIRED" // Use a placeholder if no API key is needed
    },
    customChains: [
      {
        network: "kairos",
        chainId: 1337, // You might need to update this with the actual chain ID
        urls: {
          apiURL: "https://kairos-explorer.kaia.io/api",
          browserURL: "https://kairos-explorer.kaia.io"
        }
      }
    ]
  },
  // Add path configuration if needed
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};

export default config;