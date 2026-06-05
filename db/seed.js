import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@libsql/client";
import { RECIPES } from "../lib/data.js";

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
    console.error("⛔ TURSO_DATABASE_URL manquant - rien à faire.");
    console.error("   (ex local : file:dev.db   ·   ex Turso : libsql://xxx.turso.io)");
    process.exit(1);
  }

  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const schema = readFileSync(join(__dirname, "schema.sql"), "utf8");
  await db.executeMultiple(schema);
  console.log("✅ Tables créées.");

  await db.executeMultiple("DELETE FROM ingredients; DELETE FROM steps; DELETE FROM recipes;");

  for (const r of RECIPES) {
    await db.execute({
      sql: "INSERT INTO recipes (id,name,cat,emoji,grad,time,diff,rating,kcal,serv,blurb) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      args: [r.id, r.name, r.cat, r.emoji, r.grad, r.time, r.diff, r.rating, r.kcal, r.serv, r.blurb],
    });
    for (let i = 0; i < r.ing.length; i++) {
      const [name, qty, unit] = r.ing[i];
      await db.execute({
        sql: "INSERT INTO ingredients (recipe_id,position,name,qty,unit) VALUES (?,?,?,?,?)",
        args: [r.id, i, name, qty, unit],
      });
    }
    for (let i = 0; i < r.steps.length; i++) {
      await db.execute({
        sql: "INSERT INTO steps (recipe_id,position,content) VALUES (?,?,?)",
        args: [r.id, i, r.steps[i]],
      });
    }
  }

  console.log(`✅ ${RECIPES.length} recettes insérées.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
