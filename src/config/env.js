import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

dotenv.config();

const configuredChromePath = process.env.PUPPETEER_EXECUTABLE_PATH;
const windowsChromePath = process.platform === 'win32'
  ? join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe')
  : '';
const puppeteerExecutablePath = configuredChromePath && existsSync(configuredChromePath)
  ? configuredChromePath
  : windowsChromePath && existsSync(windowsChromePath)
    ? windowsChromePath
    : undefined;

const env = {
  port: Number.parseInt(process.env.PORT || '3000', 10),
  healthUrl: `${process.env.SITE_URL}/health` ,
  mongodbUri: process.env.MONGODB_URI,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  openrouterModel: process.env.OPENROUTER_MODEL,
  openrouterSiteUrl: process.env.SITE_URL,
  openrouterAppName: process.env.OPENROUTER_APP_NAME,
  puppeteerExecutablePath
};

export default env;
