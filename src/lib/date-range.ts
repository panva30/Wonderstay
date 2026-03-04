export function rangesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const a1 = new Date(startA).getTime();
  const a2 = new Date(endA).getTime();
  const b1 = new Date(startB).getTime();
  const b2 = new Date(endB).getTime();
  // Half-open ranges [start, end)
  return a1 < b2 && a2 > b1;
}

export function computeNextAvailable(start: string, end: string, windows: { start_date: string; end_date: string }[]) {
  const desiredStart = new Date(start).getTime();
  const desiredEnd = new Date(end).getTime();
  let maxOverlapEnd = desiredStart;
  for (const w of windows) {
    const s = new Date(w.start_date).getTime();
    const e = new Date(w.end_date).getTime();
    const overlaps = desiredStart < e && desiredEnd > s;
    if (overlaps) {
      if (e > maxOverlapEnd) maxOverlapEnd = e;
    }
  }
  const duration = Math.max(1, Math.ceil((desiredEnd - desiredStart) / (1000 * 60 * 60 * 24)));
  const nextStart = new Date(maxOverlapEnd);
  const nextEnd = new Date(maxOverlapEnd);
  nextEnd.setDate(nextEnd.getDate() + duration);
  return {
    fromISO: nextStart.toISOString().slice(0, 10),
    toISO: nextEnd.toISOString().slice(0, 10),
  };
}
