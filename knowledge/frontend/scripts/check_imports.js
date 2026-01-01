
const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const srcDir = path.join(__dirname, '../src');
console.log('Scanning ' + srcDir);

walkDir(srcDir, function (filePath) {
    if (!filePath.endsWith('.js')) return;
    const content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('<Text') && !content.match(/import\s+.*Text.*\s+from\s+['"]react-native['"]/)) {
        console.log('MISSING TEXT IMPORT: ' + filePath);
    }

    // Check for TextWrapper definition
    if (content.includes('function TextWrapper') || content.includes('const TextWrapper') || content.includes('class TextWrapper')) {
        console.log('FOUND TextWrapper DEFINITION: ' + filePath);
    }
});
