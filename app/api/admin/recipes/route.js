import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { createRecipe } from "@/lib/recipes";

export async function POST(request) {
  const u = await getCurrentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const d = await request.json();
  if (!d.name || !d.cat) return NextResponse.json({ error: "Nom et catégorie requis." }, { status: 400 });
  const id = await createRecipe(d);
  return NextResponse.json({ id });
}
