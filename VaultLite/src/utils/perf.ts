export function mark(name: string) {
  if (typeof performance === 'undefined') return;
  performance.mark(name);
}

export function measure(name: string, startMark: string, endMark: string) {
  if (typeof performance === 'undefined') return;
  performance.measure(name, startMark, endMark);
}

export function getMeasures(prefix?: string): Array<{ name: string; duration: number }> {
  if (typeof performance === 'undefined') return [];
  return performance
    .getEntriesByType('measure')
    .filter((e) => (prefix ? e.name.startsWith(prefix) : true))
    .map((e) => ({ name: e.name, duration: e.duration }));
}
