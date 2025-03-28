import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const admin_privateKey = process.env.ADMIN_PRIVATE_KEY || '';
const other_privateKey = process.env.OTHER_PRIVATE_KEY || '';

const provider = new ethers.JsonRpcProvider(
  'https://public-en-kairos.node.kaia.io'
);

const getSigners = (privateKey: string) => {
  return new ethers.Wallet(privateKey, provider);
};

export const admin = getSigners(admin_privateKey);
export const other = getSigners(other_privateKey);
