import type { PickEntry } from "./schema.ts";

// 只依赖这几个字段，组件传自己的视图类型也能用，不必强转
export type PickLike = Pick<PickEntry, "repo" | "topics" | "description" | "stars" | "starsPerDay">;

// topics 到分类的映射：一个仓库可以进多个分类，只用于左栏过滤。
// 全部带 \b：description 是英文句子，不加词界 "build" 会因为含 "ui" 被归进工具。
const BUCKETS: { label: string; pattern: RegExp }[] = [
  { label: "Agent", pattern: /\b(agent|agentic|autonomous|computer-use)\b/ },
  { label: "Skill", pattern: /\bskills?\b/ },
  { label: "MCP", pattern: /\bmcp\b|model-context/ },
  { label: "RAG", pattern: /\brag\b|\bretrieval\b|\bvector/ },
  { label: "模型", pattern: /\bllm\b|language-model|\bgpt\b|transformer|diffusion|multimodal/ },
  { label: "工具", pattern: /\b(tool|cli|ui|chat|ide|coding|editor|framework)s?\b/ },
];

export const ALL_CATEGORIES = "全部";
export const RISING_TOP = 10;

export function pickBuckets(entry: PickLike): string[] {
  const haystack = `${entry.topics.join(" ")} ${entry.description}`.toLowerCase();
  const labels = BUCKETS.filter((bucket) => bucket.pattern.test(haystack)).map((bucket) => bucket.label);
  return labels.length > 0 ? labels : ["其它"];
}

// 「涨得快」= 这一批里 stars/天 最高的前 10 个。
// 不设固定阈值：这批仓库动辄几百上千星/天，阈值要么全中要么全不中。
export function risingRepos(entries: PickLike[]): Set<string> {
  const top = [...entries].sort((a, b) => b.starsPerDay - a.starsPerDay).slice(0, RISING_TOP);
  return new Set(top.map((entry) => entry.repo));
}

export type PickCategory = { label: string; count: number };

// 分类计数恒按全集算：否则点了某个分类后榜单数字跳变，人会以为出错
export function pickCategories(entries: PickLike[]): PickCategory[] {
  const present = new Set(entries.flatMap(pickBuckets));
  const order = [
    ...BUCKETS.map((bucket) => bucket.label).filter((label) => present.has(label)),
    ...(present.has("其它") ? ["其它"] : []),
  ];
  return [
    { label: ALL_CATEGORIES, count: entries.length },
    ...order.map((label) => ({
      label,
      count: entries.filter((entry) => pickBuckets(entry).includes(label)).length,
    })),
  ];
}

// 两个轴正交：分类决定看哪一类，涨得快是叠加在上面的布尔开关
export type PickFilter = { category: string; risingOnly: boolean };

export const DEFAULT_FILTER: PickFilter = { category: ALL_CATEGORIES, risingOnly: false };

export function filterPicks<T extends PickLike>(entries: T[], filter: PickFilter): T[] {
  const { category, risingOnly } = filter;
  const rising = risingOnly ? risingRepos(entries) : null;

  return entries.filter((entry) => {
    if (category !== ALL_CATEGORIES && !pickBuckets(entry).includes(category)) return false;
    if (rising && !rising.has(entry.repo)) return false;
    return true;
  });
}

export function formatPerDay(value: number): string {
  return value >= 10 ? `+${Math.round(value)}/天` : `+${value.toFixed(1)}/天`;
}

/** 同一天（按本地时区）。快照日期与 firstSeen 都是 Date，比较到日 */
export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

