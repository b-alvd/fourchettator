import { NextResponse } from "next/server";
import { findUserByEmail, createUser } from "@/lib/users";
import { hashPassword } from "@/lib/auth";
import { createToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request) {
  const { email, password, name } = await request.json();
  if (!email || !password) return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
  if (String(password).length < 6) return NextResponse.json({ error: "Mot de passe trop court (6 caractères min)." }, { status: 400 });

  const mail = String(email).trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  if (await findUserByEmail(mail)) return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });

  const user = await createUser({ email: mail, name: name || null, password_hash: hashPassword(password) });
  const token = await createToken(user.id, "verify");
  await sendVerificationEmail(mail, token);

  return NextResponse.json({ pending: true, email: mail });
}
