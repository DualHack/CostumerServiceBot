const path = require('node:path');

module.exports = {
  cacheDirectory: process.env.PUPPETEER_CACHE_DIR || path.join(process.cwd(), '.cache', 'puppeteer')
};
