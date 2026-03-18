import alchemy from "alchemy";
import { TanStackStart } from "alchemy/cloudflare";
import { config } from "dotenv";

// Determine environment: "production" or "development"
const env = process.env.NODE_ENV || "development";
const isProd = env === "production";

// Load env files in order (later files override earlier ones)
// 1. Base .env files (defaults)
config({ path: "../../apps/web/.env" });
config({ path: "./.env" });

// 2. Environment-specific files (override defaults)
if (isProd) {
  config({ path: "../../apps/web/.env.production", override: true });
  config({ path: "./.env.production", override: true });
}

console.log(`Environment: ${env}`);

const app = await alchemy("auroville-events");

export const web = await TanStackStart("web", {
  name: "auroville-events",
  cwd: "../../apps/web",
  bindings: {
    VITE_SERVER_URL: alchemy.env.VITE_SERVER_URL!,
  },
});

console.log(`Web    -> ${web.url}`);

await app.finalize();
