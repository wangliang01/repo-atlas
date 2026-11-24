import { test } from "node:test";
import assert from "node:assert/strict";
import {
  approvedRepos,
  emptyNominations,
  extractRepos,
  mergeNominations,
  type Mention,
} from "./nominations.ts";

const mention = (notePath: string, date = "2026-11-20"): Mention => ({
  kind: "toutiao",
  title: notePath,
  notePath,
  url: `https://www.toutiao.com/article/${notePath}`,
  date,
});

test("抽取显式 GitHub 链接，并按小写去重", () => {
  const text = `
    项目：https://github.com/vuejs-ai/skills
    另一个：https://github.com/Vuejs-AI/Skills.git
  `;
  assert.deepEqual(extractRepos(text), ["vuejs-ai/skills"]);
});

test("清洗 .git、子路径和尾部标点", () => {
  const text = `
    https://github.com/MengTo/threeui.git
    https://github.com/harry0703/MoneyPrinterTurbo/tree/main/docs
    https://github.com/andyshi70/tiny-cyber-pusa。
  `;
  assert.deepEqual(extractRepos(text), [
    "MengTo/threeui",
    "harry0703/MoneyPrinterTurbo",
    "andyshi70/tiny-cyber-pusa",
  ]);
});

test("排除 GitHub 自身页面，不把 topics / sponsors 当仓库", () => {
  const text = `
    https://github.com/topics/ai
    https://github.com/sponsors/someone
    https://github.com/features/copilot
    https://github.com/login
  `;
  assert.deepEqual(extractRepos(text), []);
});

test("非 github.com 的域名不抽", () => {
  const text = "https://gist.github.com/a/b https://raw.githubusercontent.com/a/b https://docs.github.com/x";
  assert.deepEqual(extractRepos(text), []);
});

test("合并：新仓库是 pending，已有 approved 不会被导回 pending", () => {
  const first = mergeNominations(
    emptyNominations(),
    [{ repo: "vuejs-ai/skills", mention: mention("notes/技术/a.md") }],
    "2026-11-20",
  );
  assert.equal(first.items["vuejs-ai/skills"].status, "pending");

  first.items["vuejs-ai/skills"].status = "approved";
  const second = mergeNominations(
    first,
    [
      { repo: "vuejs-ai/skills", mention: mention("notes/技术/b.md", "2026-11-21") },
      { repo: "pbakaus/impeccable", mention: mention("notes/技术/c.md") },
    ],
    "2026-11-22",
  );
  assert.equal(second.items["vuejs-ai/skills"].status, "approved");
  assert.equal(second.items["vuejs-ai/skills"].mentions.length, 2);
  assert.equal(second.items["pbakaus/impeccable"].status, "pending");
  assert.deepEqual(approvedRepos(second), ["vuejs-ai/skills"]);
});

test("同一篇笔记重复导入不会产生重复出处", () => {
  const file = mergeNominations(
    emptyNominations(),
    [{ repo: "a/b", mention: mention("notes/x.md") }],
    "2026-11-20",
  );
  const again = mergeNominations(file, [{ repo: "A/B", mention: mention("notes/x.md") }], "2026-11-21");
  assert.equal(again.items["a/b"].mentions.length, 1);
  assert.equal(again.items["a/b"].addedAt, "2026-11-20", "首次发现日期不能被后一次覆盖");
});

test("rejected 保持 rejected，只追加出处", () => {
  const file = mergeNominations(
    emptyNominations(),
    [{ repo: "a/b", mention: mention("notes/x.md") }],
    "2026-11-20",
  );
  file.items["a/b"].status = "rejected";
  const next = mergeNominations(file, [{ repo: "a/b", mention: mention("notes/y.md") }], "2026-11-21");
  assert.equal(next.items["a/b"].status, "rejected");
  assert.equal(next.items["a/b"].mentions.length, 2);
});

test("输出键排序稳定，出处按日期排序", () => {
  const file = mergeNominations(
    emptyNominations(),
    [
      { repo: "z/z", mention: mention("notes/z.md", "2026-11-21") },
      { repo: "a/a", mention: mention("notes/a.md", "2026-11-22") },
      { repo: "a/a", mention: mention("notes/b.md", "2026-11-20") },
    ],
    "2026-11-22",
  );
  assert.deepEqual(Object.keys(file.items), ["a/a", "z/z"]);
  assert.deepEqual(
    file.items["a/a"].mentions.map((item) => item.notePath),
    ["notes/b.md", "notes/a.md"],
  );
});
