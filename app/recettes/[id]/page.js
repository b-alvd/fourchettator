import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipe, getUserRating } from "@/lib/recipes";
import { getCurrentUser } from "@/lib/auth";
import RatingStars from "@/components/RatingStars";
import IngredientsPanel from "@/components/IngredientsPanel";

export default async function RecipePage({ params }) {
  const r = await getRecipe(params.id);
  if (!r) notFound();
  const user = await getCurrentUser();
  const mine = user ? await getUserRating(user.id, r.id) : 0;
  const keyOf = (s) => (s.group !== null && s.group !== undefined ? `g${s.group}` : `t:${s.section || ""}`);
  const hasSections = r.steps.some((s) => (s.group !== null && s.group !== undefined) || s.section);
  const raw = [];
  for (const s of r.steps) {
    const key = keyOf(s);
    const last = raw[raw.length - 1];
    if (last && last.key === key) last.steps.push(s.content);
    else raw.push({ key, title: s.section || "", steps: [s.content] });
  }
  let partNo = 0;
  const groups = raw.map((g) => {
    const isSection = g.key.startsWith("g") || !!g.title;
    if (isSection) { partNo += 1; return { isSection: true, label: g.title || `Partie ${partNo}`, steps: g.steps, open: partNo === 1 }; }
    return { isSection: false, steps: g.steps };
  });

  return (
    <>
      <Link href="/recettes" className="back">← Retour aux recettes</Link>
      <div className="detail-hero">
        <div className="ph" style={r.image ? undefined : { background: r.grad }}>{r.image && <img src={r.image} alt={r.name} className="ph-img" />}</div>
        <div>
          <div className="dcat">{r.cat}</div>
          <h1>{r.name}</h1>
          <p className="dblurb">{r.blurb}</p>
          <div className="stats">
            <div className="stat"><div className="v">{r.time}&#39;</div><div className="k">Temps</div></div>
            <div className="stat"><div className="v">{r.diff}</div><div className="k">Niveau</div></div>
            <div className="stat"><div className="v">★{r.rating}</div><div className="k">Note</div></div>
            <div className="stat"><div className="v">{r.kcal}</div><div className="k">kcal/pers</div></div>
          </div>
          <RatingStars recipeId={r.id} avg={r.rating} votes={r.votes || 0} mine={mine} />
        </div>
      </div>

      <div className="detail-body">
        <IngredientsPanel ingredients={r.ing} baseServings={r.serv} />
        <div className="panel">
          <h2>Préparation</h2>
          {hasSections ? (
            <div className="step-groups" style={{ marginTop: 18 }}>
              {groups.map((g, gi) =>
                g.isSection ? (
                  <details key={gi} className="step-group" name="prep" open={g.open}>
                    <summary>{g.label}</summary>
                    <ol className="steps">
                      {g.steps.map((c, i) => <li key={i}><p>{c}</p></li>)}
                    </ol>
                  </details>
                ) : (
                  <ol className="steps" key={gi}>
                    {g.steps.map((c, i) => <li key={i}><p>{c}</p></li>)}
                  </ol>
                )
              )}
            </div>
          ) : (
            <ol className="steps" style={{ marginTop: 18 }}>
              {r.steps.map((s, i) => <li key={i}><p>{s.content}</p></li>)}
            </ol>
          )}
        </div>
      </div>
    </>
  );
}
