import { NextResponse } from "next/server";
import { getRecipe } from "@/lib/recipes";

export async function GET(_request, { params }) {
  const recipe = await getRecipe(params.id);
  if (!recipe) return NextResponse.json({ error: "Recette introuvable" }, { status: 404 });
  return NextResponse.json({ recipe });
}
