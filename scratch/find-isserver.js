import fs from 'fs';
import path from 'path';

const searchDir = './';

function searchFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === '.gemini') continue;
    
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchFiles(fullPath);
    } else if (stat.isFile() && file.startsWith('.env')) {
      console.log(`Found .env file: ${fullPath}`);
    }
  }
}

searchFiles(searchDir);
