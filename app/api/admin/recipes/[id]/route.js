import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { deleteRecipe, updateRecipe } from "@/lib/recipes";

export async function PUT(request, { params }) {
  const u = await getCurrentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  const d = await request.json();
  if (!d.name || !d.cat) return NextResponse.json({ error: "Nom et catégorie requis." }, { status: 400 });
  await updateRecipe(params.id, d);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request, { params }) {
  const u = await getCurrentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  await deleteRecipe(params.id);
  return NextResponse.json({ ok: true });
}
