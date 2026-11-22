// 解析 HelloGitHub 某一期的 markdown。抽成纯函数是为了能用 node --test 直接验格式。

export type HelloGitHubEntry = {
  name: string;
  repo: string;
  category: string;
  tagline: string;
};

export function parseHelloGitHub(markdown: string): {
  entries: HelloGitHubEntry[];
  skipped: number;
} {
  const entries: HelloGitHubEntry[] = [];
  let category = "";
  let inContent = false;
  let skipped = 0;

  for (const line of markdown.split(/\r?\n/)) {
    if (/^## /.test(line)) {
      inContent = /^## 内容/.test(line);
      continue;
    }
    if (!inContent) continue;

    if (/^### /.test(line)) {
      category = line.replace(/^###\s+/, "").trim();
      continue;
    }

    // 形如：1、[名字](点击统计跳转?target=https://github.com/owner/repo)：一句话。后面是正文
    const match =
      /^\d+、\[([^\]]+)\]\((https:\/\/hellogithub\.com\/periodical\/statistics\/click\?target=([^)]+))\)[：:](.+)$/.exec(
        line.trim(),
      );
    if (!match) continue;

    const [, name, , target, description] = match;
    const repo = /github\.com\/([\w.-]+)\/([\w.-]+)\/?$/.exec(target.trim());
    if (!repo) {
      skipped += 1;
      continue;
    }

    const firstSentence = description.split("。")[0].trim();
    entries.push({
      name,
      repo: `${repo[1]}/${repo[2]}`,
      category: category || "其它",
      tagline: firstSentence.length > 40 ? `${firstSentence.slice(0, 40)}…` : firstSentence,
    });
  }

  return { entries, skipped };
}
