import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname)
// Copy manifest.json to dist folder
const manifestPath = path.join(__dirname, '../manifest.json'); //__dirname only avail in CJS module scope
const destPath = path.join(__dirname, '../../dist/manifest.json');
//Copy content.js to dist folder
const contentSrcPath = path.join(__dirname, '../content.js');
const contentDestPath = path.join(__dirname, '../../dist/content.js');
//Copy background.js to dist folder

const serviceWorkerSrcPath=path.join(__dirname,'../background.js')
const serviceWorkerDestPath=path.join(__dirname,'../../dist/background.js')

const authSrcPath=path.join(__dirname,'../auth/auth.js')
const authDestPath=path.join(__dirname,'../../dist/auth.js')

const apiSrcPath=path.join(__dirname,'../api/gmail.js')
const apiDestPath=path.join(__dirname,'../../dist/gmail.js')

const storageSrcPath=path.join(__dirname,'../lib/storage.js')
const storageDestPath=path.join(__dirname,'../../dist/storage.js')

const readerHtmlSrc = path.join(__dirname, '../../public/reader.html');
const readerHtmlDest = path.join(__dirname, '../../dist/reader.html');





fs.copyFileSync(manifestPath, destPath);
console.log('Manifest file copied to dist folder');

fs.copyFileSync(contentSrcPath, contentDestPath);
console.log('Content script copied to dist folder');

fs.copyFileSync(serviceWorkerSrcPath,serviceWorkerDestPath)
console.log('Background script copied to dist folder');

fs.copyFileSync(authSrcPath,authDestPath)
console.log('auth functions copied to dist folder');

fs.copyFileSync(apiSrcPath,apiDestPath)
console.log('gmail api functions copied to dist folder');

fs.copyFileSync(storageSrcPath,storageDestPath)
console.log('storage module copied to dist folder');

if (fs.existsSync(readerHtmlSrc)) {
  fs.copyFileSync(readerHtmlSrc, readerHtmlDest);
  console.log('reader.html copied to dist folder');
}


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