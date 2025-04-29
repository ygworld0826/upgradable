// scripts/create-env.js
// This script creates a properly formatted .env file

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env file
const envPath = path.resolve(__dirname, '../.env');

console.log('This script will create a properly formatted .env file');
console.log('Existing .env file will be backed up if present');

// Create backup of existing file if it exists
if (fs.existsSync(envPath)) {
  const backupPath = `${envPath}.backup.${Date.now()}`;
  fs.copyFileSync(envPath, backupPath);
  console.log(`Existing .env file backed up to: ${backupPath}`);
}

// Get private key from user
rl.question('Enter your private key (with or without 0x prefix): ', (key) => {
  // Remove any quotes, spaces, or newlines
  let cleanKey = key.trim().replace(/['"]/g, '');
  
  // Add 0x prefix if missing
  if (!cleanKey.startsWith('0x')) {
    console.log('Adding 0x prefix to key');
    cleanKey = '0x' + cleanKey;
  }
  
  // Create .env file content
  const envContent = `ADMIN_PRIVATE_KEY=${cleanKey}\n`;
  
  // Write to file
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log(`Created .env file at: ${envPath}`);
  console.log('Content written (not showing full key for security):');
  console.log(`ADMIN_PRIVATE_KEY=0x${cleanKey.substring(2, 6)}...${cleanKey.substring(cleanKey.length - 4)}`);
  
  rl.close();
});