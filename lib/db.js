import { createClient } from "@libsql/client";

export const DB_ENABLED = Boolean(process.env.TURSO_DATABASE_URL);

let client = global._mijoteClient;

export function getClient() {
  if (!DB_ENABLED) return null;
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    global._mijoteClient = client;
  }
  return client;
}

export async function query(sql, params = []) {
  const c = getClient();
  if (!c) return null;
  const res = await c.execute({ sql, args: params });
  return res.rows;
}

export async function run(sql, params = []) {
  const c = getClient();
  if (!c) return null;
  return c.execute({ sql, args: params });
}
