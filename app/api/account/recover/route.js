import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { consumeToken } from "@/lib/tokens";
import { findUserById, updatePassword, bumpSessionVersion } from "@/lib/users";
import { hashPassword, signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST(request) {
  const { token, next } = await request.json();
  if (!next || String(next).length < 6) return NextResponse.json({ error: "Mot de passe trop court (6 min)." }, { status: 400 });
  const uid = await consumeToken(token, "recover");
  if (!uid) return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 400 });

  await updatePassword(uid, hashPassword(next));
  const sv = await bumpSessionVersion(uid);
  const u = await findUserById(uid);
  cookies().set(SESSION_COOKIE, signSession(uid, sv), sessionCookieOptions);
  return NextResponse.json({ user: { id: u.id, email: u.email, name: u.name, emailVerified: !!u.email_verified } });
}
