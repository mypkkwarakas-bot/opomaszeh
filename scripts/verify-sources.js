// Verifies the two original pages are byte-identical to the supplied sources.
const crypto = require('crypto'), fs = require('fs'), path = require('path');
const EXPECTED = {
  'pages/movo.html': 'a8c3c932769c3a0a451d5c606b5d8607c6b7dfc7419c8f47cda1b81cd30259f2',
  'pages/finance-profile.html': '46367c661f85ee2e07729696de13b849fd59e42bf0c8c55fbe6833d357932305'
};
let bad = 0;
for (const [f, want] of Object.entries(EXPECTED)) {
  const got = crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '..', f))).digest('hex');
  console.log((got === want ? 'OK      ' : 'CHANGED ') + f);
  if (got !== want) bad++;
}
process.exit(bad ? 1 : 0);
