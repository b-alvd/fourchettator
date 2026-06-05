import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@libsql/client";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ENV = process.env.NODE_ENV || "development";
for (const f of [`.env.${ENV}.local`, ".env.local", `.env.${ENV}`, ".env"]) {
  const p = join(__dirname, "..", f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

async function main() {
  if (!process.env.TURSO_DATABASE_URL) {
    console.error("⛔ TURSO_DATABASE_URL manquant dans .env — rien à faire.");
    process.exit(1);
  }

  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const schema = readFileSync(join(__dirname, "schema.sql"), "utf8");
  await db.executeMultiple(schema);
  console.log("✅ Tables vérifiées.");

  const adds = [
    "ALTER TABLE recipes ADD COLUMN image TEXT",
    "ALTER TABLE steps ADD COLUMN section TEXT",
    "ALTER TABLE steps ADD COLUMN section_group INTEGER",
    "ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN marketing_opt_in INTEGER NOT NULL DEFAULT 1",
  ];
  for (const sql of adds) {
    try {
      await db.execute("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0");
      await db.execute("UPDATE users SET email_verified = 1");
      console.log("➕ users.email_verified (comptes existants marqués vérifiés)");
    } catch (e) {
      if (/duplicate column|already exists/i.test(e.message)) console.log("✔︎ déjà présent : users.email_verified");
      else throw e;
    }

    try {
      await db.execute(sql);
      console.log("➕ " + sql);
    } catch (e) {
      if (/duplicate column|already exists/i.test(e.message)) console.log("✔︎ déjà présent : " + sql);
      else throw e;
    }
  }

  console.log("✅ Migration terminée (aucune donnée supprimée).");
}

main().catch((e) => { console.error(e); process.exit(1); });