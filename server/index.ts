// server/index.ts
// Long-running Node dev/self-host entry for the C-HUB API.
// In development the Admin frontend (Vite, port 3005) proxies /api to this
// server (default port 3007). In production you can run this on any host
// (or deploy the api/index.ts serverless function to Vercel instead).

import 'dotenv/config';
import { ensureReady } from './bootstrap.js';
import { app } from './app.js';

const PORT = Number(process.env.PORT) || 3007;

async function main() {
  await ensureReady();
  app.listen(PORT, () => {
    console.log(`C-HUB API ready on http://localhost:${PORT}/api  (health: /api/health)`);
  });
}

main().catch((err) => {
  console.error('❌ C-HUB API startup failed:', err);
  process.exit(1);
});