/**
 * 全站唯一的星数格式。以前 lib/format.ts 和 lib/picks.ts 各有一份，
 * 首页显示 32k、精选显示 32.0k，同一个数字两种写法。
 */
export function formatStars(stars: number): string {
  // 999950 起进位到 M，否则会显示成 "1000.0k"
  if (stars >= 999_950) return `${(stars / 1_000_000).toFixed(1)}M`;
  return stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : String(stars);
}
