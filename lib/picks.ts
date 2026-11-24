import type { PickEntry } from "./schema.ts";
import { ALL_CATEGORIES, CATEGORIES } from "./categories.ts";

// 「涨得快」= 这一批里 stars/天 最高的前 10 个。
// 不设固定阈值：这批仓库动辄几百上千星/天，阈值要么全中要么全不中。
export const RISING_TOP = 10;

export type PickLike = Pick<PickEntry, "repo" | "stars" | "starsPerDay" | "topics" | "description">;

export function risingRepos(entries: PickLike[]): Set<string> {
  const top = [...entries].sort((a, b) => b.starsPerDay - a.starsPerDay).slice(0, RISING_TOP);
  return new Set(top.map((entry) => entry.repo));
}

/** 详情页里人工写的分类；没有详情的项目先归到「其他」 */
export type CategorySource = Record<string, PickDetailInfo | undefined>;

/** 列表用的详情摘要；由服务端从 content/repos 生成，客户端只消费 */
export type PickDetailInfo = {
  slug: string;
  summary: string;
  categories: string[];
  verdict: "recommend" | "watch" | "avoid";
};

export function categoriesOf(entry: PickLike, details: CategorySource): string[] {
  return details[entry.repo.toLowerCase()]?.categories ?? ["其他"];
}

export type PickCategory = { label: string; count: number };

// 计数恒按全集算：否则点了分类之后数字跳变，人会以为出错
export function pickCategories(entries: PickLike[], details: CategorySource): PickCategory[] {
  const present = new Set(entries.flatMap((entry) => categoriesOf(entry, details)));
  const ordered = CATEGORIES.filter((category) => present.has(category));
  return [
    { label: ALL_CATEGORIES, count: entries.length },
    ...ordered.map((label) => ({
      label,
      count: entries.filter((entry) => categoriesOf(entry, details).includes(label)).length,
    })),
  ];
}

// 两个轴正交：分类决定看哪一类，涨得快是叠加在上面的布尔开关
export type PickFilter = { category: string; risingOnly: boolean };

export const DEFAULT_FILTER: PickFilter = { category: ALL_CATEGORIES, risingOnly: false };

export function filterPicks<T extends PickLike>(
  entries: T[],
  filter: PickFilter,
  details: CategorySource,
): T[] {
  const { category, risingOnly } = filter;
  const rising = risingOnly ? risingRepos(entries) : null;

  return entries.filter((entry) => {
    if (category !== ALL_CATEGORIES && !categoriesOf(entry, details).includes(category)) return false;
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
