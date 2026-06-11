import { DB_ENABLED, query, run } from "@/lib/db";
import { RECIPES } from "@/lib/data";

const mem = (global._mijoteRecipes ||= {
  list: RECIPES.map((r) => ({ ...r, ing: r.ing.map((i) => [...i]), steps: [...r.steps] })),
  seq: (RECIPES.length ? Math.max(...RECIPES.map((r) => r.id)) : 0) + 1,
  ratings: new Map(), // recipeId -> Map(userId -> value)
});

function memAgg(recipeId, base) {
  const m = mem.ratings.get(recipeId);
  if (!m || m.size === 0) return { rating: base, votes: 0 };
  const vals = [...m.values()];
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return { rating: Math.round(avg * 10) / 10, votes: vals.length };
}

function filterSort(list, { q = "", cat = "Tous", sort = "pop" } = {}) {
  let out = list.filter((r) => !cat || cat === "Tous" || r.cat === cat);
  if (q && q.trim()) {
    const needle = q.toLowerCase();
    out = out.filter(
      (r) =>
        r.name.toLowerCase().includes(needle) ||
        r.cat.toLowerCase().includes(needle) ||
        r.ing.some((i) => i[0].toLowerCase().includes(needle))
    );
  }
  if (sort === "time") out.sort((a, b) => a.time - b.time);
  else if (sort === "az") out.sort((a, b) => a.name.localeCompare(b.name));
  else out.sort((a, b) => b.rating - a.rating);
  return out;
}

async function hydrate(row) {
  const [ing, steps] = await Promise.all([
    query("SELECT name, qty, unit, section, section_group FROM ingredients WHERE recipe_id = ? ORDER BY position", [row.id]),
    query("SELECT content, section, section_group FROM steps WHERE recipe_id = ? ORDER BY position", [row.id]),
  ]);
  return {
    id: row.id, name: row.name, cat: row.cat, emoji: row.emoji, image: row.image, grad: row.grad,
    time: row.time, diff: row.diff, rating: Number(row.rating), kcal: row.kcal, serv: row.serv,
    blurb: row.blurb,
    ing: ing.map((i) => [i.name, Number(i.qty), i.unit, i.section || "", i.section_group === null || i.section_group === undefined ? null : Number(i.section_group)]),
    steps: steps.map((s) => ({
      content: s.content,
      section: s.section || "",
      group: s.section_group === null || s.section_group === undefined ? null : Number(s.section_group),
    })),
    votes: 0,
  };
}

export async function getRecipes(opts = {}) {
  if (!DB_ENABLED) {
    const list = mem.list.map((r) => ({ ...r, ...memAgg(r.id, r.rating) }));
    return filterSort(list, opts);
  }
  const rows = await query("SELECT * FROM recipes");
  const full = await Promise.all(rows.map(hydrate));
  const agg = await query("SELECT recipe_id, AVG(value) AS avg, COUNT(*) AS cnt FROM ratings GROUP BY recipe_id");
  const map = new Map(agg.map((a) => [a.recipe_id, a]));
  for (const r of full) {
    const a = map.get(r.id);
    if (a && Number(a.cnt) > 0) { r.rating = Math.round(Number(a.avg) * 10) / 10; r.votes = Number(a.cnt); }
  }
  return filterSort(full, opts);
}

export async function getRecipe(id) {
  const rid = Number(id);
  if (!DB_ENABLED) {
    const r = mem.list.find((x) => x.id === rid);
    return r ? { ...r, ...memAgg(r.id, r.rating) } : null;
  }
  const rows = await query("SELECT * FROM recipes WHERE id = ?", [rid]);
  if (!rows || !rows.length) return null;
  const r = await hydrate(rows[0]);
  const a = await query("SELECT AVG(value) AS avg, COUNT(*) AS cnt FROM ratings WHERE recipe_id = ?", [rid]);
  if (a[0] && Number(a[0].cnt) > 0) { r.rating = Math.round(Number(a[0].avg) * 10) / 10; r.votes = Number(a[0].cnt); }
  return r;
}

function normSteps(steps) {
  return (steps || [])
    .map((s) => (typeof s === "string"
      ? { content: s, section: "", group: null }
      : {
          content: (s && s.content) || "",
          section: (s && s.section) || "",
          group: s && s.group !== null && s.group !== undefined ? Number(s.group) : null,
        }))
    .filter((s) => s.content.trim());
}

function normalize(d) {
  return {
    name: d.name, cat: d.cat, image: (d.image || "").trim(),
    grad: d.grad || "linear-gradient(135deg,#f3c969,#c0532b)",
    time: Number(d.time) || 0, diff: d.diff || "Facile", rating: Number(d.rating) || 0,
    kcal: Number(d.kcal) || 0, serv: Number(d.serv) || 4, blurb: d.blurb || "",
    ing: (d.ing || []).filter((i) => i[0]), steps: normSteps(d.steps),
  };
}

async function insertChildren(id, r) {
  for (let i = 0; i < r.ing.length; i++) {
    const [name, qty, unit, section, group] = r.ing[i];
    await query("INSERT INTO ingredients (recipe_id,position,name,qty,unit,section,section_group) VALUES (?,?,?,?,?,?,?)", [id, i, name, Number(qty) || 0, unit || "", (section || "").trim() ? section.trim() : null, group === undefined || group === null ? null : group]);
  }
  for (let i = 0; i < r.steps.length; i++) {
    await query("INSERT INTO steps (recipe_id,position,content,section,section_group) VALUES (?,?,?,?,?)", [id, i, r.steps[i].content, r.steps[i].section || null, r.steps[i].group]);
  }
}

export async function createRecipe(d) {
  const r = normalize(d);
  if (!DB_ENABLED) {
    const id = mem.seq++;
    mem.list.push({ id, ...r });
    return id;
  }
  const res = await run(
    "INSERT INTO recipes (name,cat,image,grad,time,diff,rating,kcal,serv,blurb) VALUES (?,?,?,?,?,?,?,?,?,?)",
    [r.name, r.cat, r.image, r.grad, r.time, r.diff, r.rating, r.kcal, r.serv, r.blurb]
  );
  const id = Number(res.lastInsertRowid);
  await insertChildren(id, r);
  return id;
}

export async function updateRecipe(id, d) {
  const rid = Number(id);
  const r = normalize(d);
  if (!DB_ENABLED) {
    const idx = mem.list.findIndex((x) => x.id === rid);
    if (idx !== -1) mem.list[idx] = { ...mem.list[idx], ...r, id: rid };
    return;
  }
  await query(
    "UPDATE recipes SET name=?,cat=?,image=?,grad=?,time=?,diff=?,kcal=?,serv=?,blurb=? WHERE id=?",
    [r.name, r.cat, r.image, r.grad, r.time, r.diff, r.kcal, r.serv, r.blurb, rid]
  );
  await query("DELETE FROM ingredients WHERE recipe_id = ?", [rid]);
  await query("DELETE FROM steps WHERE recipe_id = ?", [rid]);
  await insertChildren(rid, r);
}

export async function deleteRecipe(id) {
  const rid = Number(id);
  if (!DB_ENABLED) {
    mem.list = mem.list.filter((r) => r.id !== rid);
    mem.ratings.delete(rid);
    return;
  }
  await query("DELETE FROM ingredients WHERE recipe_id = ?", [rid]);
  await query("DELETE FROM steps WHERE recipe_id = ?", [rid]);
  await query("DELETE FROM ratings WHERE recipe_id = ?", [rid]);
  await query("DELETE FROM recipes WHERE id = ?", [rid]);
}

export async function rateRecipe(userId, recipeId, value) {
  const rid = Number(recipeId);
  const v = Math.max(1, Math.min(5, Math.round(Number(value))));
  if (!DB_ENABLED) {
    let m = mem.ratings.get(rid);
    if (!m) { m = new Map(); mem.ratings.set(rid, m); }
    m.set(userId, v);
    const base = (mem.list.find((r) => r.id === rid) || {}).rating || 0;
    return memAgg(rid, base);
  }
  await query(
    "INSERT INTO ratings (user_id,recipe_id,value) VALUES (?,?,?) ON CONFLICT(user_id,recipe_id) DO UPDATE SET value=excluded.value",
    [userId, rid, v]
  );
  const a = await query("SELECT AVG(value) AS avg, COUNT(*) AS cnt FROM ratings WHERE recipe_id = ?", [rid]);
  return { rating: Math.round(Number(a[0].avg) * 10) / 10, votes: Number(a[0].cnt) };
}

export async function getRecipeRating(id) {
  const rid = Number(id);
  if (!DB_ENABLED) return memAgg(rid, (mem.list.find((r) => r.id === rid) || {}).rating || 0);
  const a = await query("SELECT AVG(value) AS avg, COUNT(*) AS cnt FROM ratings WHERE recipe_id = ?", [rid]);
  if (a[0] && Number(a[0].cnt) > 0) return { rating: Math.round(Number(a[0].avg) * 10) / 10, votes: Number(a[0].cnt) };
  return { rating: 0, votes: 0 };
}

export async function getUserRating(userId, recipeId) {
  if (!userId) return 0;
  const rid = Number(recipeId);
  if (!DB_ENABLED) { const m = mem.ratings.get(rid); return (m && m.get(userId)) || 0; }
  const rows = await query("SELECT value FROM ratings WHERE user_id = ? AND recipe_id = ?", [userId, rid]);
  return rows[0] ? Number(rows[0].value) : 0;
}
