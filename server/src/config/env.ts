import { config } from "dotenv";
import { z } from "zod";

config();

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/watchio?schema=public"),
  /** कॉमा से अलग ब्राउज़र ओरिजिन — खाली हो तो CORS `*` जैसा व्यवहार (Socket.IO में `true`) */
  CLIENT_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  TRUST_PROXY: z.enum(["0", "1"]).optional(),
});

export const env = schema.parse(process.env);

process.env.DATABASE_URL = env.DATABASE_URL;
