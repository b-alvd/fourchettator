import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { setMarketingOptIn } from "@/lib/users";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const { on } = await request.json();
  await setMarketingOptIn(user.id, !!on);
  return NextResponse.json({ ok: true, on: !!on });
}
