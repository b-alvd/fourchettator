import { NextResponse } from "next/server";
import { getRecipes } from "@/lib/recipes";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const recipes = await getRecipes({
    q: searchParams.get("q") || "",
    cat: searchParams.get("cat") || "Tous",
    sort: searchParams.get("sort") || "pop",
  });
  return NextResponse.json({ recipes });
}
