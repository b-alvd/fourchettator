import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, verifyPassword, hashPassword, signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { findUserById, updatePassword, bumpSessionVersion } from "@/lib/users";
import { createToken, clearTokens } from "@/lib/tokens";
import { sendPasswordChangedEmail } from "@/lib/email";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const { current, next } = await request.json();
  if (!next || String(next).length < 6) return NextResponse.json({ error: "Nouveau mot de passe trop court (6 min)." }, { status: 400 });
  const full = await findUserById(user.id);
  if (!verifyPassword(current || "", full.password_hash)) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 400 });
  }
  await updatePassword(user.id, hashPassword(next));

  const sv = await bumpSessionVersion(user.id);
  cookies().set(SESSION_COOKIE, signSession(user.id, sv), sessionCookieOptions);

  await clearTokens(user.id, "recover");
  const token = await createToken(user.id, "recover", 24 * 3600 * 1000);
  await sendPasswordChangedEmail(user.email, token);

  return NextResponse.json({ ok: true });
}
