// scripts/check-env.js
// Using plain JavaScript to avoid TypeScript issues

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Try to load .env file directly
const envPath = path.resolve(__dirname, '../.env');
console.log('Looking for .env file at:', envPath);

if (fs.existsSync(envPath)) {
  console.log('.env file exists');
  
  // Read file content (be careful not to log sensitive information to the console)
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  console.log(`Found ${lines.length} line(s) in .env file`);
  
  // Check for our specific variable without revealing the full key
  for (const line of lines) {
    if (line.startsWith('ADMIN_PRIVATE_KEY=')) {
      const value = line.substring('ADMIN_PRIVATE_KEY='.length);
      console.log('ADMIN_PRIVATE_KEY found in file:');
      console.log('- Length:', value.length);
      console.log('- Starts with 0x:', value.startsWith('0x'));
      console.log('- Contains spaces:', value.includes(' '));
      console.log('- Contains quotes:', value.includes('"') || value.includes("'"));
      
      if (value.startsWith('"') || value.startsWith("'") || value.endsWith('"') || value.endsWith("'")) {
        console.log('⚠️ WARNING: Key appears to be wrapped in quotes. This might be the issue.');
      }
      
      if (value.includes(' ')) {
        console.log('⚠️ WARNING: Key contains spaces. This might be the issue.');
      }
    }
  }
  
  // Try to load with dotenv and check
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.log('Error loading .env file with dotenv:', result.error.message);
  } else {
    console.log('dotenv successfully loaded the .env file');
    console.log('ADMIN_PRIVATE_KEY loaded by dotenv:', !!process.env.ADMIN_PRIVATE_KEY);
    
    if (process.env.ADMIN_PRIVATE_KEY) {
      const key = process.env.ADMIN_PRIVATE_KEY;
      console.log('- Length:', key.length);
      console.log('- Starts with 0x:', key.startsWith('0x'));
    }
  }
} else {
  console.log('❌ ERROR: .env file does NOT exist at expected location');
  console.log('Current working directory:', process.cwd());
  
  // Check if it exists in another common location
  const altPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(altPath)) {
    console.log('However, .env file DOES exist at:', altPath);
  }
}