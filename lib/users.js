import { DB_ENABLED, query } from "@/lib/db";

const mem = (global._mijoteUsers ||= { list: [], seq: 1 });

export async function findUserByEmail(email) {
  if (!DB_ENABLED) return mem.list.find((u) => u.email === email) || null;
  const rows = await query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const uid = Number(id);
  if (!DB_ENABLED) return mem.list.find((u) => u.id === uid) || null;
  const rows = await query("SELECT * FROM users WHERE id = ?", [uid]);
  return rows[0] || null;
}

export async function createUser({ email, name, password_hash }) {
  if (!DB_ENABLED) {
    const u = { id: mem.seq++, email, name: name || null, password_hash, email_verified: 0, session_version: 0, marketing_opt_in: 1, created_at: new Date().toISOString() };
    mem.list.push(u);
    return u;
  }
  await query("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)", [email, name || null, password_hash]);
  return findUserByEmail(email);
}

export async function getMarketingRecipients() {
  if (!DB_ENABLED) return mem.list.filter((u) => (u.marketing_opt_in ?? 1)).map((u) => ({ id: u.id, email: u.email, name: u.name }));
  const rows = await query("SELECT id, email, name FROM users WHERE COALESCE(marketing_opt_in, 1) = 1");
  return rows.map((r) => ({ id: r.id, email: r.email, name: r.name }));
}

export async function setMarketingOptIn(id, on) {
  const uid = Number(id);
  if (!DB_ENABLED) { const u = mem.list.find((x) => x.id === uid); if (u) u.marketing_opt_in = on ? 1 : 0; return; }
  await query("UPDATE users SET marketing_opt_in = ? WHERE id = ?", [on ? 1 : 0, uid]);
}

export async function bumpSessionVersion(id) {
  const uid = Number(id);
  if (!DB_ENABLED) {
    const u = mem.list.find((x) => x.id === uid);
    if (!u) return 0;
    u.session_version = (u.session_version || 0) + 1;
    return u.session_version;
  }
  await query("UPDATE users SET session_version = COALESCE(session_version, 0) + 1 WHERE id = ?", [uid]);
  const rows = await query("SELECT session_version FROM users WHERE id = ?", [uid]);
  return Number(rows[0]?.session_version || 0);
}

export async function setEmailVerified(id) {
  const uid = Number(id);
  if (!DB_ENABLED) {
    const u = mem.list.find((x) => x.id === uid);
    if (u) u.email_verified = 1;
    return;
  }
  await query("UPDATE users SET email_verified = 1 WHERE id = ?", [uid]);
}

export async function updatePassword(id, password_hash) {
  const uid = Number(id);
  if (!DB_ENABLED) {
    const u = mem.list.find((x) => x.id === uid);
    if (u) u.password_hash = password_hash;
    return;
  }
  await query("UPDATE users SET password_hash = ? WHERE id = ?", [password_hash, uid]);
}

export async function deleteUser(id) {
  const uid = Number(id);
  if (!DB_ENABLED) {
    mem.list = mem.list.filter((u) => u.id !== uid);
    if (global._mijoteFavs) global._mijoteFavs.delete(uid);
    if (global._mijoteTokens) for (const [k, v] of global._mijoteTokens) if (v.user_id === uid) global._mijoteTokens.delete(k);
    return;
  }
  await query("DELETE FROM favorites WHERE user_id = ?", [uid]);
  await query("DELETE FROM ratings WHERE user_id = ?", [uid]);
  await query("DELETE FROM tokens WHERE user_id = ?", [uid]);
  await query("DELETE FROM users WHERE id = ?", [uid]);
}
