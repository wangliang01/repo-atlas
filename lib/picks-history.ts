/**
 * 精选的「首次上榜」台账。
 *
 * 每次同步都会重写快照，快照本身记不住「这个仓库是哪天冒出来的」，所以单独
 * 存一份 history.json：repo → 第一次出现在榜单上的日期。同步时把 firstSeen
 * 写回条目里，页面就能标「新上榜」，不需要运行时再查一次。
 */
export type PicksHistory = {
  version: 1;
  /** repo（owner/name）→ 首次上榜日期 YYYY-MM-DD */
  seen: Record<string, string>;
};

export const HISTORY_VERSION = 1;
/** 落榜超过这么多天就忘掉，免得台账无限长 */
export const FORGET_AFTER_DAYS = 120;

export function emptyHistory(): PicksHistory {
  return { version: HISTORY_VERSION, seen: {} };
}

/** ISO 日期往前推 n 天，仍返回 YYYY-MM-DD */
function daysBefore(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * 把本次抓到的仓库并进台账。
 * - 见过的沿用原日期，没见过的记今天
 * - 本次不在榜上、且最后出现早于 keepDays 的，剪掉
 * - 返回的 firstSeen 直接写进快照，added 用来打日志
 */
export function mergeHistory(
  history: PicksHistory,
  repos: string[],
  today: string,
  keepDays = FORGET_AFTER_DAYS,
): { history: PicksHistory; firstSeen: Record<string, string>; added: string[] } {
  const current = new Set(repos);
  const cutoff = daysBefore(today, keepDays);
  const seen: Record<string, string> = {};

  for (const [repo, date] of Object.entries(history.seen)) {
    if (current.has(repo)) {
      seen[repo] = date;
    } else if (date >= cutoff) {
      // 落榜不久，可能过两天又回来，先留着
      seen[repo] = date;
    }
  }

  const firstSeen: Record<string, string> = {};
  const added: string[] = [];
  for (const repo of repos) {
    if (seen[repo]) {
      firstSeen[repo] = seen[repo];
    } else {
      seen[repo] = today;
      firstSeen[repo] = today;
      added.push(repo);
    }
  }

  // 键排序：台账每次重写都保持稳定，diff 里只出现真正的变化
  const sorted: Record<string, string> = {};
  for (const repo of Object.keys(seen).sort()) sorted[repo] = seen[repo];

  return { history: { version: HISTORY_VERSION, seen: sorted }, firstSeen, added };
}

/** 当天首次上榜的仓库，页面用来标「新上榜」 */
export function freshRepos(firstSeen: Record<string, string>, today: string): Set<string> {
  return new Set(Object.entries(firstSeen).filter(([, date]) => date === today).map(([repo]) => repo));
}
