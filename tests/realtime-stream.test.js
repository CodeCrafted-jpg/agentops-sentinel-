const assert = require('assert');
const fs = require('fs');
const path = require('path');

const streamPath = path.join(process.cwd(), 'app', 'api', 'stream', 'route.ts');
assert.ok(fs.existsSync(streamPath), 'Expected streaming route to exist');
console.log('Realtime stream route present');
