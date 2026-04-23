import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json directly to ensure we get the fresh version (no cache)
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

const files = [
  'dist/manifest.json',
  'dist/manifest-v2.json'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(/\$_\{\s*VERSION\s*\}/g, pkg.version);
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated ${file} to version ${pkg.version}`);
    }
  }
});
