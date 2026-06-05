import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/users";
import { createToken, clearTokens } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request) {
  const { email } = await request.json();
  const mail = String(email || "").trim().toLowerCase();
  const user = await findUserByEmail(mail);
  if (user && !user.email_verified) {
    await clearTokens(user.id, "verify");
    const token = await createToken(user.id, "verify");
    await sendVerificationEmail(mail, token);
  }
  return NextResponse.json({ ok: true });
}
