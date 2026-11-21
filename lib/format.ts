export function formatStars(stars: number): string {
  return stars >= 1000 ? `${Math.round(stars / 1000)}k` : String(stars);
}
