const fs = require('fs');
let content = fs.readFileSync('src/lib/team-data.ts', 'utf8');
content = content.replace(/\s*position:\s*"[^"]+",/g, '');
fs.writeFileSync('src/lib/team-data.ts', content);
console.log('Done');
