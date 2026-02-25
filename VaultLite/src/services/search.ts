export function buildFtsQuery(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => `${token.replace(/"/g, '""')}*`)
    .join(' ');
}
