import { NextResponse } from "next/server";
import { checkUnsub } from "@/lib/auth";
import { setMarketingOptIn } from "@/lib/users";

export async function POST(request) {
  const { u, t } = await request.json();
  if (!checkUnsub(u, t)) return NextResponse.json({ error: "Lien invalide." }, { status: 400 });
  await setMarketingOptIn(u, false);
  return NextResponse.json({ ok: true });
}
