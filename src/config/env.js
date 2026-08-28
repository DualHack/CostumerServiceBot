import dotenv from 'dotenv';

dotenv.config();

const env = {
  port: Number.parseInt(process.env.PORT || '3000', 10),
  healthUrl: `${process.env.SITE_URL}/health` ,
  mongodbUri: process.env.MONGODB_URI,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  openrouterModel: process.env.OPENROUTER_MODEL,
  openrouterSiteUrl: process.env.SITE_URL,
  openrouterAppName: process.env.OPENROUTER_APP_NAME,
  whatsappSessionPath: process.env.WHATSAPP_SESSION_PATH || '.wwebjs_auth'
};

export default env;
