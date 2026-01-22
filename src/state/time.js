export function getWeekId(d = new Date()) {
  // Simple week id: YYYY-WW (consistent; not ISO-perfect but fine)
  const year = d.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const days = Math.floor((d - jan1) / 86400000);
  const week = Math.floor((days + jan1.getDay()) / 7) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
}
