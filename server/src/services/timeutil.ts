export function differenceInCalendarDays(a: Date, b: Date): number {
  const MS = 24 * 60 * 60 * 1000;
  const da = new Date(Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()));
  const db = new Date(Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()));
  return Math.round((da.getTime() - db.getTime()) / MS);
}

export function addYears(d: Date, years: number): Date {
  const copy = new Date(d);
  copy.setFullYear(copy.getFullYear() + years);
  return copy;
}

export function formatISO(d: Date): string {
  return d.toISOString();
}
