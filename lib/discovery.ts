/**
 * 从多路候选里选出当天的精选。
 *
 * 纯 top-N 会让老牌高星项目永远占位，所以这里按来源分桶给配额：
 * 新项目、近期动量、人工提名各有保底名额，锚点只保留少量。任何一步都不联网，
 * 方便单测证明「有新项目时一定进得来」。
 */
import { isWithinDays } from "./queries.ts";

export type Candidate = {
  repo: string;
  stars: number;
  starsPerDay: number;
  createdAt: Date;
  /** 最近 7 天的星数增量；没有采样时留空 */
  starsDelta7d?: number;
  /** 人工提名并通过审批 */
  approved?: boolean;
};

export type PickBucket = "anchor" | "fresh" | "momentum" | "nominated";

export type SelectedPick = Candidate & {
  key: string;
  bucket: PickBucket;
  trendScore: number;
};

export const DEFAULT_LIMIT = 30;
export const QUOTAS: Record<PickBucket, number> = {
  anchor: 8,
  fresh: 10,
  momentum: 8,
  nominated: 4,
};
const FRESH_DAYS = 30;

export function trendScore(candidate: Candidate): number {
  return candidate.starsDelta7d !== undefined
    ? candidate.starsDelta7d / 7
    : candidate.starsPerDay;
}

export function pickBucket(candidate: Candidate, today: Date): PickBucket {
  if (candidate.approved) return "nominated";
  if (isWithinDays(candidate.createdAt, today, FRESH_DAYS)) return "fresh";
  if (candidate.starsDelta7d !== undefined) return "momentum";
  return "anchor";
}

function comparePicks(a: Candidate, b: Candidate): number {
  const byTrend = trendScore(b) - trendScore(a);
  if (byTrend !== 0) return byTrend;
  const byStars = b.stars - a.stars;
  if (byStars !== 0) return byStars;
  return a.repo.toLowerCase().localeCompare(b.repo.toLowerCase());
}

/** 同一个仓库可能从多条 lane 进来：按小写 key 合并，保留信息更全的一条 */
function dedupe(candidates: Candidate[]): Map<string, Candidate> {
  const merged = new Map<string, Candidate>();
  for (const candidate of candidates) {
    const key = candidate.repo.toLowerCase();
    const previous = merged.get(key);
    if (!previous) {
      merged.set(key, candidate);
      continue;
    }
    merged.set(key, {
      ...previous,
      ...candidate,
      stars: Math.max(previous.stars, candidate.stars),
      starsDelta7d: candidate.starsDelta7d ?? previous.starsDelta7d,
      approved: Boolean(previous.approved || candidate.approved),
    });
  }
  return merged;
}

export function selectPicks(
  candidates: Candidate[],
  today: Date,
  limit = DEFAULT_LIMIT,
): SelectedPick[] {
  const unique = [...dedupe(candidates).values()];
  const buckets: Record<PickBucket, Candidate[]> = {
    anchor: [],
    fresh: [],
    momentum: [],
    nominated: [],
  };
  for (const candidate of unique) buckets[pickBucket(candidate, today)].push(candidate);
  for (const list of Object.values(buckets)) list.sort(comparePicks);

  const selected: SelectedPick[] = [];
  const used = new Set<string>();
  const take = (candidate: Candidate) => {
    const key = candidate.repo.toLowerCase();
    if (used.has(key) || selected.length >= limit) return;
    used.add(key);
    selected.push({ ...candidate, key, bucket: pickBucket(candidate, today), trendScore: trendScore(candidate) });
  };

  for (const bucket of ["nominated", "fresh", "momentum", "anchor"] as PickBucket[]) {
    for (const candidate of buckets[bucket].slice(0, QUOTAS[bucket])) take(candidate);
  }

  if (selected.length < limit) {
    for (const candidate of [...unique].sort(comparePicks)) take(candidate);
  }

  // 名额全被提名/动量占满时，仍要保证榜单里至少有一个 30 天内的新项目
  const freshExists = unique.some((candidate) => isWithinDays(candidate.createdAt, today, FRESH_DAYS));
  const freshSelected = selected.some((candidate) => isWithinDays(candidate.createdAt, today, FRESH_DAYS));
  if (freshExists && !freshSelected && selected.length > 0) {
    const replacement = [...unique]
      .filter((candidate) => isWithinDays(candidate.createdAt, today, FRESH_DAYS))
      .sort(comparePicks)[0];
    selected[selected.length - 1] = {
      ...replacement,
      key: replacement.repo.toLowerCase(),
      bucket: pickBucket(replacement, today),
      trendScore: trendScore(replacement),
    };
  }

  return selected.sort(comparePicks);
}
