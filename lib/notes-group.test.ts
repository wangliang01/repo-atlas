import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getAllNotes, groupNotesByKind } from "./content.ts";
import { NOTE_KINDS } from "./schema.ts";

test("笔记分组：只返回非空类型，顺序跟 NOTE_KINDS", () => {
  const notes = getAllNotes();
  const groups = groupNotesByKind(notes);

  assert.ok(groups.length > 0, "一篇笔记都没分到组");
  for (const group of groups) {
    assert.ok(group.notes.length > 0, `${group.label} 是空组，不该出现`);
    assert.ok(group.label.length > 0, "组缺中文名");
  }

  const indexes = groups.map((group) => NOTE_KINDS.indexOf(group.kind));
  assert.deepEqual(indexes, [...indexes].sort((a, b) => a - b), "组的顺序和 NOTE_KINDS 不一致");
});

test("笔记分组：各组计数求和等于总数，没有笔记被吞掉", () => {
  const notes = getAllNotes();
  const sum = groupNotesByKind(notes).reduce((total, group) => total + group.notes.length, 0);
  assert.equal(sum, notes.length);
});

test("笔记页左栏在手机上隐藏：否则「工具 1」和正文的「工具」标题重复", () => {
  const page = readFileSync(new URL("../app/notes/page.tsx", import.meta.url), "utf8");
  assert.ok(page.includes("max-md:hidden"), "左栏没有在 md 以下隐藏");
});
