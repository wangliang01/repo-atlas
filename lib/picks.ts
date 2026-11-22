import type { PickEntry } from "./schema.ts";

// 只依赖这几个字段，组件传自己的视图类型也能用，不必强转
export type PickLike = Pick<PickEntry, "repo" | "topics" | "description" | "stars" | "starsPerDay">;

// topics 到分类桶的映射：一个仓库可以进多个桶，只用于 tab 过滤。
// 全部带 \b：description 是英文句子，不加词界 "build" 会因为含 "ui" 被归进工具。
const BUCKETS: { label: string; pattern: RegExp }[] = [
  { label: "Agent", pattern: /\b(agent|agentic|autonomous|computer-use)\b/ },
  { label: "Skill", pattern: /\bskills?\b/ },
  { label: "MCP", pattern: /\bmcp\b|model-context/ },
  { label: "RAG", pattern: /\brag\b|\bretrieval\b|\bvector/ },
  { label: "模型", pattern: /\bllm\b|language-model|\bgpt\b|transformer|diffusion|multimodal/ },
  { label: "工具", pattern: /\b(tool|cli|ui|chat|ide|coding|editor|framework)s?\b/ },
];

export const RISING_TOP = 10;

// 「涨得快」= 这一批里 stars/天 最高的前 10 个。
// 不设固定阈值：这批仓库动辄几百上千星/天，阈值要么全中要么全不中（26 个里 26 个过线）。
export function risingRepos(entries: PickLike[]): Set<string> {
  const top = [...entries].sort((a, b) => b.starsPerDay - a.starsPerDay).slice(0, RISING_TOP);
  return new Set(top.map((entry) => entry.repo));
}

export function pickBuckets(entry: PickLike): string[] {
  const haystack = `${entry.topics.join(" ")} ${entry.description}`.toLowerCase();
  const labels = BUCKETS.filter((bucket) => bucket.pattern.test(haystack)).map((bucket) => bucket.label);
  return labels.length > 0 ? labels : ["其它"];
}

export function isRising(entry: PickLike, rising: Set<string>): boolean {
  return rising.has(entry.repo);
}

export type PickTab = { label: string; count: number };

// 只在真的有条目时才出 tab，避免一排点进去是空的；带条数，省得点进去才知道
export function pickTabs(entries: PickLike[]): PickTab[] {
  const present = new Set(entries.flatMap(pickBuckets));
  const order = [
    "全部",
    // 条目本来就按 stars 排好了，"高星" 就等于头几行，多一个 tab 是重复
    ...(entries.length > RISING_TOP ? ["涨得快"] : []),
    ...BUCKETS.map((bucket) => bucket.label).filter((label) => present.has(label)),
    ...(present.has("其它") ? ["其它"] : []),
  ];
  return order.map((label) => ({ label, count: filterPicks(entries, label).length }));
}

export function filterPicks<T extends PickLike>(entries: T[], tab: string): T[] {
  if (tab === "全部") return entries;
  if (tab === "涨得快") {
    const rising = risingRepos(entries);
    return entries.filter((entry) => rising.has(entry.repo));
  }
  return entries.filter((entry) => pickBuckets(entry).includes(tab));
}

export function formatStars(stars: number): string {
  // 999950 起进位到 M，否则会显示成 "1000.0k"
  if (stars >= 999_950) return `${(stars / 1_000_000).toFixed(1)}M`;
  return stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : String(stars);
}

export function formatPerDay(value: number): string {
  return value >= 10 ? `+${Math.round(value)}/天` : `+${value.toFixed(1)}/天`;
}

// 列表里只留月日，年份挤在等宽小字里没人读
export function formatShortDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${String(date.getFullYear()).slice(2)}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

export function ageInDays(date: Date): number {
  return Math.max(1, Math.round((Date.now() - date.getTime()) / 86400000));
}
