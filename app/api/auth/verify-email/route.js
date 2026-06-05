import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { consumeToken } from "@/lib/tokens";
import { setEmailVerified, findUserById } from "@/lib/users";
import { signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST(request) {
  const { token } = await request.json();
  const uid = await consumeToken(token, "verify");
  if (!uid) return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 400 });
  await setEmailVerified(uid);
  const u = await findUserById(uid);
  cookies().set(SESSION_COOKIE, signSession(uid, u.session_version || 0), sessionCookieOptions);
  return NextResponse.json({ user: { id: u.id, email: u.email, name: u.name, emailVerified: true } });
}
