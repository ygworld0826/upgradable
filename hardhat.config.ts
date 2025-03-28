import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: '0.8.28',
  networks: {
    kairos: {
      url: 'https://public-en-kairos.node.kaia.io',
      accounts: [process.env.ADMIN_PRIVATE_KEY || ''],
    },
  },
};

export default config;
