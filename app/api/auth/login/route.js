import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserByEmail } from "@/lib/users";
import { verifyPassword, signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST(request) {
  const { email, password } = await request.json();
  const mail = String(email || "").trim().toLowerCase();
  const user = await findUserByEmail(mail);
  if (!user || !verifyPassword(password || "", user.password_hash)) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  }
  if (!user.email_verified) {
    return NextResponse.json({ error: "Email non vérifié. Vérifie ta boîte mail.", unverified: true, email: mail }, { status: 403 });
  }
  cookies().set(SESSION_COOKIE, signSession(user.id, user.session_version || 0), sessionCookieOptions);
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, emailVerified: true } });
}
