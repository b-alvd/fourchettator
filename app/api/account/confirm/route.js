import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { consumeToken } from "@/lib/tokens";
import { deleteUser } from "@/lib/users";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(request) {
  const { token } = await request.json();
  const uid = await consumeToken(token, "delete");
  if (!uid) return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 400 });
  await deleteUser(uid);
  cookies().delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
