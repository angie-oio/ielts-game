export function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isYesterday(dateStr: string): boolean {
  if (!dateStr) return false;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yy = y.getFullYear();
  const mm = String(y.getMonth() + 1).padStart(2, '0');
  const dd = String(y.getDate()).padStart(2, '0');
  return dateStr === `${yy}-${mm}-${dd}`;
}
