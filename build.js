const fs = require('fs');

const scriptContent = fs.readFileSync('script.js', 'utf8');
const updatedContent = scriptContent.replace('process.env.UNSPLASH_ACCESS_KEY', `'${process.env.UNSPLASH_ACCESS_KEY}'`);
fs.writeFileSync('dist/script.js', updatedContent);