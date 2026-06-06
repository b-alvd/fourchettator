import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { findUserById } from "@/lib/users";

const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me-en-prod";
export const SESSION_COOKIE = "mijote_session";

export function hashPassword(password) {
  const salt = randomBytes(16);
  const dk = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${dk.toString("hex")}`;
}

export function verifyPassword(password, stored) {
  const [saltHex, hashHex] = String(stored).split(":");
  if (!saltHex || !hashHex) return false;
  const dk = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  const a = Buffer.from(hashHex, "hex");
  return a.length === dk.length && timingSafeEqual(a, dk);
}

const b64 = (buf) => Buffer.from(buf).toString("base64url");

export function signSession(uid, sv = 0, days = 30) {
  const payload = b64(JSON.stringify({ uid, sv, exp: Date.now() + days * 86400000 }));
  const sig = b64(createHmac("sha256", SECRET).update(payload).digest());
  return `${payload}.${sig}`;
}

export function readSession(token) {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = b64(createHmac("sha256", SECRET).update(payload).digest());
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { uid, sv = 0, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (Date.now() > exp) return null;
    return { uid, sv };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const sess = readSession(token);
  if (!sess) return null;
  const u = await findUserById(sess.uid);
  if (!u) return null;
  if (Number(u.session_version || 0) !== Number(sess.sv || 0)) return null;
  return u ? { id: u.id, email: u.email, name: u.name, emailVerified: !!u.email_verified, marketingOptIn: u.marketing_opt_in == null ? true : !!u.marketing_opt_in } : null;
}

export function unsubSig(uid) {
  return b64(createHmac("sha256", SECRET).update("unsub:" + uid).digest());
}
export function checkUnsub(uid, sig) {
  const expected = unsubSig(uid);
  const a = Buffer.from(sig || ""), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isAdmin(user) {
  if (!user) return false;
  const list = (process.env.ADMIN_EMAILS || "")
    .toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
  return list.includes(String(user.email).toLowerCase());
}
