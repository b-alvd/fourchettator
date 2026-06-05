import { DB_ENABLED, query } from "@/lib/db";

const mem = (global._mijoteFavs ||= new Map());

export async function getFavorites(userId) {
  if (!userId) return [];
  if (!DB_ENABLED) return [...(mem.get(userId) || [])];
  const rows = await query("SELECT recipe_id FROM favorites WHERE user_id = ?", [userId]);
  return rows.map((r) => r.recipe_id);
}

export async function toggleFavorite(userId, recipeId, on) {
  const rid = Number(recipeId);
  if (!DB_ENABLED) {
    const set = mem.get(userId) || new Set();
    on ? set.add(rid) : set.delete(rid);
    mem.set(userId, set);
    return [...set];
  }
  if (on) {
    await query("INSERT OR IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)", [userId, rid]);
  } else {
    await query("DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?", [userId, rid]);
  }
  return getFavorites(userId);
}
