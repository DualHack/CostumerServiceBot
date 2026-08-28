const path = require('node:path');

module.exports = {
  cacheDirectory: path.join(process.cwd(), '.cache', 'puppeteer')
};
