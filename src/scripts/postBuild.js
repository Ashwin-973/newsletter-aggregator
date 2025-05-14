import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy manifest.json to dist folder
const manifestPath = path.join(__dirname, '../manifest.json'); //__dirname only avail in CJS module scope
const destPath = path.join(__dirname, '../../dist/manifest.json');
//Copy content.js to dist folder
const contentSrcPath = path.join(__dirname, '../content.js');
const contentDestPath = path.join(__dirname, '../../dist/content.js');
//Copy background.js to dist folder

const serviceWorkerSrcPath=path.join(__dirname,'../background.js')
const serviceWorkerDestPath=path.join(__dirname,'../../dist/background.js')


fs.copyFileSync(manifestPath, destPath);
console.log('Manifest file copied to dist folder');

fs.copyFileSync(contentSrcPath, contentDestPath);
console.log('Content script copied to dist folder');

fs.copyFileSync(serviceWorkerSrcPath,serviceWorkerDestPath)
console.log('Background script copied to dist folder');

// Copy icon files to dist folder
const iconSizes = [16, 48, 128];
iconSizes.forEach(size => {
  const iconPath = path.join(__dirname, `../../public/icon${size}.png`);
  const iconDestPath = path.join(__dirname, `../../dist/icon${size}.png`);
  console.log(iconPath)
  console.log(iconDestPath)
  if (fs.existsSync(iconPath)) {
    fs.copyFileSync(iconPath, iconDestPath);
    console.log(`Icon${size}.png copied to dist folder`);
  } else {
    console.warn(`Warning: Icon${size}.png not found`);
  }
});