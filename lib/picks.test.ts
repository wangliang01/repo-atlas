import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { ALL_CATEGORIES } from "./categories.ts";
import { getPicksSnapshot } from "./content.ts";
import {
  categoriesOf,
  filterPicks,
  formatPerDay,
  pickCategories,
  RISING_TOP,
  risingRepos,
  type PickDetailInfo,
  type PickLike,
} from "./picks.ts";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const has = (p: string) => existsSync(new URL(p, root));

let seq = 0;
const like = (over: Partial<PickLike> = {}): PickLike => ({
  repo: `owner/repo-${++seq}`,
  topics: [],
  description: "",
  stars: 0,
  starsPerDay: 0,
  ...over,
});

const detail = (categories: string[]): PickDetailInfo => ({
  slug: "owner--repo",
  summary: "中文摘要",
  categories,
  verdict: "watch",
});

test("分类来自详情页，没有详情才归到「其他」", () => {
  const entry = like({ repo: "a/b" });
  const details = { "a/b": detail(["前端", "图像与设计"]) };
  assert.deepEqual(categoriesOf(entry, details), ["前端", "图像与设计"]);
  assert.deepEqual(categoriesOf(like({ repo: "c/d" }), details), ["其他"]);
});

test("分类计数：全部排第一，只出非空分类，按分类表顺序", () => {
  const a = like({ repo: "a/one" });
  const b = like({ repo: "b/two" });
  const c = like({ repo: "c/three" });
  const details = {
    "a/one": detail(["前端"]),
    "b/two": detail(["前端", "架构"]),
    "c/three": detail(["视频剪辑"]),
  };
  const categories = pickCategories([a, b, c], details);
  assert.deepEqual(
    categories.map((category) => category.label),
    [ALL_CATEGORIES, "视频剪辑", "前端", "架构"],
  );
  assert.equal(categories[0].count, 3);
  assert.equal(categories.find((category) => category.label === "前端")!.count, 2);
});

test("涨得快：取 stars/天 最高的前 10 个，不是固定阈值", () => {
  const entries = Array.from({ length: 26 }, (_, i) => like({ starsPerDay: 2000 - i * 10 }));
  const rising = risingRepos(entries);
  assert.equal(rising.size, RISING_TOP);
  assert.ok(rising.has(entries[0].repo));
  assert.equal(rising.has(entries[RISING_TOP].repo), false);
});

test("双轴过滤：分类和涨得快正交", () => {
  const entries = [
    ...Array.from({ length: 6 }, (_, i) => like({ repo: `agent/${i}`, starsPerDay: 100 - i })),
    ...Array.from({ length: 6 }, (_, i) => like({ repo: `mcp/${i}`, starsPerDay: 94 - i })),
  ];
  const details: Record<string, PickDetailInfo> = {};
  for (const entry of entries) details[entry.repo] = detail([entry.repo.startsWith("agent/") ? "Agent 框架" : "办公"]);

  const count = (category: string, risingOnly: boolean) =>
    filterPicks(entries, { category, risingOnly }, details).length;

  assert.equal(count(ALL_CATEGORIES, false), 12);
  assert.equal(count(ALL_CATEGORIES, true), 10);
  assert.equal(count("Agent 框架", false), 6);
  assert.equal(count("Agent 框架", true), 6);
  assert.equal(count("办公", false), 6);
  assert.equal(count("办公", true), 4);
});

test("不认识的分类返回空，不会退化成全部", () => {
  const entries = [like({ repo: "a/b" })];
  assert.equal(filterPicks(entries, { category: "不存在的分类", risingOnly: false }, {}).length, 0);
});

test("涨速格式：整数不拖小数，小数保留一位", () => {
  assert.equal(formatPerDay(2130.3), "+2130/天");
  assert.equal(formatPerDay(4.25), "+4.3/天");
});

test("真实快照：字段齐全，头像文件真的在 public 里", () => {
  const snapshot = getPicksSnapshot();
  assert.ok(snapshot, "content/picks 里没有快照");
  assert.ok(snapshot.entries.length >= 1, "快照里没有条目");
  assert.ok(!Number.isNaN(snapshot.syncedAt.getTime()), "syncedAt 不是有效日期");

  for (const entry of snapshot.entries) {
    assert.match(entry.repo, /^[\w.-]+\/[\w.-]+$/, `${entry.name} 的 repo 写法不对`);
    assert.equal(entry.repo.split("/")[0], entry.owner, `${entry.name} 的 owner 和 repo 前缀不一致`);
    assert.ok(entry.stars >= 0, `${entry.name} 的 stars 是负数`);
    if (entry.avatar) {
      assert.ok(has(`public${entry.avatar}`), `${entry.name} 指向的头像 ${entry.avatar} 不存在，构建会失败`);
    }
  }
});

test("真实快照：按趋势分倒序，不出现重复仓库", () => {
  const entries = getPicksSnapshot()?.entries ?? [];
  const scores = entries.map((entry) => entry.trendScore ?? 0);
  assert.deepEqual(scores, [...scores].sort((a, b) => b - a), "快照没有按 trendScore 倒序");
  assert.equal(new Set(entries.map((e) => e.repo)).size, entries.length, "快照里有重复仓库");
});

test("精选行不再直接跳 GitHub，有详情走站内", () => {
  const row = read("components/pick-row.tsx");
  assert.equal(row.includes("https://github.com/${entry.repo}"), false, "精选行还在直接跳 GitHub");
  assert.ok(row.includes('href={href ?') || row.includes("href ?"), "精选行没有站内链接分支");
  assert.equal(has("app/projects"), false, "评测路由不该再存在");
});

test("首次上榜台账：每条都有 firstSeen，history.json 覆盖全部条目", () => {
  const snapshot = getPicksSnapshot();
  assert.ok(snapshot, "没有快照");
  const history = JSON.parse(read("content/picks/history.json")) as {
    version: number;
    seen: Record<string, string>;
  };
  assert.equal(history.version, 1, "台账版本不对");
  for (const entry of snapshot.entries) {
    assert.ok(entry.firstSeen instanceof Date, `${entry.name} 缺 firstSeen`);
    assert.ok(!Number.isNaN(entry.firstSeen.getTime()), `${entry.name} 的 firstSeen 不是有效日期`);
    assert.ok(history.seen[entry.repo], `台账里没有 ${entry.repo}，下次同步会把它当新上榜`);
  }
});

test("定时任务：一天 4 次，且只提交精选路径", () => {
  assert.ok(has("scripts/picks-cron.mjs"), "缺定时任务入口");
  assert.ok(has("scripts/picks-cron.cmd"), "缺 Windows 计划任务用的 cmd 包装");
  assert.ok(has("scripts/install-picks-task.ps1"), "缺计划任务注册脚本");
  assert.ok(has(".github/workflows/picks.yml"), "缺 GitHub Actions 定时任务");

  const cron = read("scripts/picks-cron.mjs");
  assert.ok(cron.includes("content/picks"), "定时任务没限定提交路径");
  assert.ok(cron.includes('"commit"'), "定时任务没提交");
  assert.ok(cron.includes('"--"'), "git commit 没有用 -- 限定路径");

  const workflow = read(".github/workflows/picks.yml");
  assert.match(workflow, /cron: "0 1,7,13,19 \* \* \*"/, "CI 不是一天 4 次");
  assert.ok(workflow.includes("contents: write"), "CI 没有写权限，推不上去");
});

test("无限滚动：先渲染一屏，滚动再追加", () => {
  const view = read("components/picks-view.tsx");
  assert.ok(view.includes("PAGE_SIZE"), "没有分页大小");
  assert.ok(view.includes("IntersectionObserver"), "没有滚动监听");
  assert.ok(view.includes("slice(0, limit)"), "列表没有按页截断");
  assert.ok(view.includes("加载更多"), "缺手动兜底入口");
});

test("首页不给精选加右栏：个人卡与笔记条都不在 feed 里", () => {
  const view = read("components/picks-view.tsx");
  for (const gone of ["ProfileCard", "ShellStrip", "updatedAt", "profile"]) {
    assert.equal(view.includes(gone), false, `精选 feed 还带着 ${gone}`);
  }
  const shell = read("components/site-shell.tsx");
  assert.ok(shell.includes("right?"), "SiteShell 的右栏不是可选的");
  assert.ok(shell.includes("SHELL_NO_RIGHT_CLASS"), "没有右栏时没有去掉那一列");
});

test("详情页布局：掘金式两栏，右栏是 项目信息 / 目录 / 相关推荐 三张卡", () => {
  const page = read("app/picks/[slug]/page.tsx");
  assert.ok(page.includes("xl:grid-cols-[minmax(0,1fr)_340px]"), "详情页不是两栏白卡布局");
  assert.ok(page.includes("<PickAside"), "右栏没有拆成独立组件");
  assert.ok(page.includes("GitHub ↗"), "GitHub 链接不在头部 meta 行");
  const aside = read("components/pick-aside.tsx");
  for (const part of ["在 GitHub 打开", "目录", "相关推荐", "Stars"]) {
    assert.ok(aside.includes(part), `右栏缺 ${part}`);
  }
});

test("详情页 banner：有 README 首图才显示，没有就不渲染", () => {
  const page = read("app/picks/[slug]/page.tsx");
  assert.ok(page.includes("data.banner"), "详情页没有 banner 分支");
  assert.ok(page.includes("来自项目 README"), "banner 没有可读的 alt");
  // banner 是外链 GitHub 原始文件，不应出现徽章图
  for (const file of readdirSync("content/repos").filter((f) => f.endsWith(".mdx"))) {
    const src = read(`content/repos/${file}`);
    const banner = (src.match(/^banner: "(.*)"$/m) ?? [])[1];
    if (banner) {
      assert.match(banner, /^https:\/\//, `${file} 的 banner 不是 https`);
      assert.equal(/shields\.io|badge|trendshift|star-history/i.test(banner), false, `${file} 的 banner 是徽章图`);
    }
  }
});

test("代码块常驻深色：两套主题统一 github-dark-default，外壳与复制按钮用暗色", () => {
  const highlight = read("lib/highlight.ts");
  assert.match(
    highlight,
    /const THEMES = \{ light: "github-dark-default", dark: "github-dark-default" \}/,
    "浅色模式又用回亮色代码块",
  );
  const block = read("components/code-block.tsx");
  assert.ok(block.includes("bg-[#0d1117]"), "代码块外壳不是深色");
  assert.ok(block.includes('tone="dark"'), "复制按钮没切暗色");
  assert.equal(block.includes("bg-surface-2"), false, "代码块头部还跟着页面主题走");
  assert.ok(
    read("app/picks/[slug]/page.tsx").includes("preprocessCode(body)"),
    "详情页没走高亮预处理，代码块仍是默认浅色 pre",
  );
});

test("单页方案：/picks 列表页已删，首页承担精选", () => {
  assert.equal(has("app/picks/page.tsx"), false, "独立的 /picks 列表页还在");
  assert.ok(has("app/picks/[slug]/page.tsx"), "详情页路由被误删");
  const header = read("components/site-header.tsx");
  const nav = header.slice(header.indexOf("const NAV"), header.indexOf("];", header.indexOf("const NAV")));
  assert.equal(nav.includes('"/picks"'), false, "导航里还有精选入口");
  assert.ok(read("app/page.tsx").includes("<PicksView"), "首页没有精选 feed");
  assert.ok(read("deploy/Caddyfile").includes("redir /picks / 308"), "Caddy 没有把 /picks 重定向到首页");
});
