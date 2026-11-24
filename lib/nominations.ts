/**
 * 精选的「提名」台账：GitHub 搜索之外的人工来源。
 *
 * 头条收藏里提到的仓库、last30days 发现的项目都先落到这里，状态是 pending；
 * 只有 approved 才会被同步脚本纳入快照。rejected 保留原因，下次导入不复活。
 */
export type Mention = {
  kind: "toutiao" | "last30days";
  title: string;
  notePath: string;
  url: string;
  date: string;
};

export type NominationStatus = "pending" | "approved" | "rejected";

export type Nomination = {
  repo: string;
  status: NominationStatus;
  mentions: Mention[];
  addedAt: string;
  note?: string;
};

export type NominationsFile = {
  version: 1;
  items: Record<string, Nomination>;
};

export const NOMINATIONS_VERSION = 1;

/** GitHub 自身页面，看着像 owner/repo，其实不是仓库 */
const RESERVED_OWNERS = new Set([
  "about",
  "apps",
  "collections",
  "enterprise",
  "explore",
  "features",
  "login",
  "marketplace",
  "orgs",
  "pricing",
  "security",
  "settings",
  "site",
  "sponsors",
  "topics",
  "trending",
]);

const GITHUB_URL = /https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)[^\s)\]"'，。；、]*/gi;

/** 从正文里抽显式 GitHub 链接，清洗 .git 和子路径，按小写去重 */
export function extractRepos(text: string): string[] {
  const found = new Map<string, string>();
  for (const match of text.matchAll(GITHUB_URL)) {
    const owner = match[1].replace(/[.,;:!?]+$/, "");
    const repo = match[2]
      .replace(/[.,;:!?]+$/, "")
      .replace(/\.git$/i, "");
    if (RESERVED_OWNERS.has(owner.toLowerCase())) continue;
    if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) continue;
    const key = `${owner}/${repo}`.toLowerCase();
    if (!found.has(key)) found.set(key, `${owner}/${repo}`);
  }
  return [...found.values()];
}

export function emptyNominations(): NominationsFile {
  return { version: NOMINATIONS_VERSION, items: {} };
}

function mentionKey(mention: Mention): string {
  return `${mention.kind}:${mention.notePath}`;
}

/** 把本轮抽取到的仓库并进台账：保留人工状态，只追加新出处 */
export function mergeNominations(
  file: NominationsFile,
  found: { repo: string; mention: Mention }[],
  today: string,
): NominationsFile {
  const items: Record<string, Nomination> = {};
  for (const [key, item] of Object.entries(file.items)) items[key] = { ...item, mentions: [...item.mentions] };

  for (const entry of found) {
    const key = entry.repo.toLowerCase();
    const existing = items[key];
    if (!existing) {
      items[key] = {
        repo: entry.repo,
        status: "pending",
        mentions: [entry.mention],
        addedAt: today,
      };
      continue;
    }
    const seen = new Set(existing.mentions.map(mentionKey));
    if (!seen.has(mentionKey(entry.mention))) existing.mentions.push(entry.mention);
  }

  // 键排序 + 出处排序：每次重写都稳定，diff 里只出现真正的变化
  const sorted: Record<string, Nomination> = {};
  for (const key of Object.keys(items).sort()) {
    const item = items[key];
    item.mentions.sort((a, b) => a.date.localeCompare(b.date) || a.notePath.localeCompare(b.notePath));
    sorted[key] = item;
  }
  return { version: NOMINATIONS_VERSION, items: sorted };
}

export function approvedRepos(file: NominationsFile): string[] {
  return Object.values(file.items)
    .filter((item) => item.status === "approved")
    .map((item) => item.repo);
}

export function isReservedOwner(owner: string): boolean {
  return RESERVED_OWNERS.has(owner.toLowerCase());
}
