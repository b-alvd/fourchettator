import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin, unsubSig } from "@/lib/auth";
import { getMarketingRecipients } from "@/lib/users";
import { sendPromoEmail, appUrl } from "@/lib/email";

export async function GET() {
  const u = await getCurrentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const recipients = await getMarketingRecipients();
  return NextResponse.json({ count: recipients.length });
}

export async function POST(request) {
  const u = await getCurrentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const { subject, message } = await request.json();
  if (!subject || !message) return NextResponse.json({ error: "Objet et message requis." }, { status: 400 });

  const recipients = await getMarketingRecipients();
  let sent = 0;
  for (const r of recipients) {
    const unsubUrl = `${appUrl()}/desabonnement?u=${r.id}&t=${encodeURIComponent(unsubSig(r.id))}`;
    const res = await sendPromoEmail(r.email, subject, message, unsubUrl);
    if (res && res.ok) sent++;
  }
  return NextResponse.json({ sent, total: recipients.length });
}
