export function formatTime(min, short = false) {
  const m = Number(min) || 0;
  if (m < 60) return short ? `${m}′` : `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h${String(r).padStart(2, "0")}` : `${h}h`;
}
