import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createToken, clearTokens } from "@/lib/tokens";
import { sendDeletionEmail } from "@/lib/email";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  await clearTokens(user.id, "delete");
  const token = await createToken(user.id, "delete", 3600 * 1000);
  await sendDeletionEmail(user.email, token);
  return NextResponse.json({ ok: true });
}
