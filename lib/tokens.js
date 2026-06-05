import { randomBytes } from "node:crypto";
import { DB_ENABLED, query } from "@/lib/db";

const mem = (global._mijoteTokens ||= new Map());

export async function createToken(userId, type, ttlMs = 24 * 3600 * 1000) {
  const token = randomBytes(32).toString("hex");
  const exp = Date.now() + ttlMs;
  if (!DB_ENABLED) { mem.set(token, { user_id: Number(userId), type, exp }); return token; }
  await query("INSERT INTO tokens (token, user_id, type, expires_at) VALUES (?,?,?,?)", [token, Number(userId), type, exp]);
  return token;
}

export async function consumeToken(token, type) {
  if (!token) return null;
  if (!DB_ENABLED) {
    const t = mem.get(token);
    if (!t || t.type !== type || t.exp < Date.now()) return null;
    mem.delete(token);
    return t.user_id;
  }
  const rows = await query("SELECT user_id, type, expires_at FROM tokens WHERE token = ?", [token]);
  const t = rows[0];
  if (!t || t.type !== type || Number(t.expires_at) < Date.now()) return null;
  await query("DELETE FROM tokens WHERE token = ?", [token]);
  return Number(t.user_id);
}

export async function clearTokens(userId, type) {
  if (!DB_ENABLED) {
    for (const [k, v] of mem) if (v.user_id === Number(userId) && (!type || v.type === type)) mem.delete(k);
    return;
  }
  if (type) await query("DELETE FROM tokens WHERE user_id = ? AND type = ?", [Number(userId), type]);
  else await query("DELETE FROM tokens WHERE user_id = ?", [Number(userId)]);
}
