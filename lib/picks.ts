import type { PickEntry } from "./schema.ts";
import { ALL_DOMAINS, DOMAINS } from "./categories.ts";

// 「涨得快」= 这一批里 stars/天 最高的前 10 个。
// 不设固定阈值：这批仓库动辄几百上千星/天，阈值要么全中要么全不中。
export const RISING_TOP = 10;

export type PickLike = Pick<PickEntry, "repo" | "stars" | "starsPerDay" | "topics" | "description">;

export function risingRepos(entries: PickLike[]): Set<string> {
  const top = [...entries].sort((a, b) => b.starsPerDay - a.starsPerDay).slice(0, RISING_TOP);
  return new Set(top.map((entry) => entry.repo));
}

/** 详情页里人工写的领域；没有详情的项目先归到「其他」 */
export type DetailSource = Record<string, PickDetailInfo | undefined>;

/** 列表用的详情摘要；由服务端从 content/repos 生成，客户端只消费 */
export type PickDetailInfo = {
  slug: string;
  summary: string;
  domains: string[];
  forms: string[];
  peers: string[];
  verdict: "recommend" | "watch" | "avoid";
};

export function domainsOf(entry: PickLike, details: DetailSource): string[] {
  return details[entry.repo.toLowerCase()]?.domains ?? ["其他"];
}

export function formsOf(entry: PickLike, details: DetailSource): string[] {
  return details[entry.repo.toLowerCase()]?.forms ?? [];
}

export type PickDomain = { label: string; count: number };

// 计数恒按全集算：否则点了领域之后数字跳变，人会以为出错
export function pickDomains(entries: PickLike[], details: DetailSource): PickDomain[] {
  const present = new Set(entries.flatMap((entry) => domainsOf(entry, details)));
  const ordered = DOMAINS.filter((domain) => present.has(domain));
  return [
    { label: ALL_DOMAINS, count: entries.length },
    ...ordered.map((label) => ({
      label,
      count: entries.filter((entry) => domainsOf(entry, details).includes(label)).length,
    })),
  ];
}

// 两个轴正交：领域决定看哪一类，涨得快是叠加在上面的布尔开关
export type PickFilter = { domain: string; risingOnly: boolean };

export const DEFAULT_FILTER: PickFilter = { domain: ALL_DOMAINS, risingOnly: false };

export function filterPicks<T extends PickLike>(
  entries: T[],
  filter: PickFilter,
  details: DetailSource,
): T[] {
  const { domain, risingOnly } = filter;
  const rising = risingOnly ? risingRepos(entries) : null;

  return entries.filter((entry) => {
    if (domain !== ALL_DOMAINS && !domainsOf(entry, details).includes(domain)) return false;
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
