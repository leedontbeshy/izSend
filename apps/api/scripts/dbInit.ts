import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Client } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load repo root .env (apps/api/scripts -> repo root is 3 levels up)
const repoRoot = path.resolve(__dirname, "..", "..", "..");
dotenv.config({ path: path.join(repoRoot, ".env") });

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

async function main() {
  const connectionString = required("NEON_CONNECTION_STRING");

  const schemaPath = path.resolve(__dirname, "..", "sql", "schema.sql");
  const sql = await fs.readFile(schemaPath, "utf8");

  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("DB init OK");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});