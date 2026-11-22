import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { formatStars } from "./format.ts";

test("星数格式：k / M 进位，不出现 1000.0k", () => {
  assert.equal(formatStars(999), "999");
  assert.equal(formatStars(1000), "1.0k");
  assert.equal(formatStars(472937), "472.9k");
  assert.equal(formatStars(999999), "1.0M");
  assert.equal(formatStars(1200000), "1.2M");
});

test("全站只有一份 formatStars：首页和精选不能一个 32k 一个 32.0k", () => {
  const picks = readFileSync(new URL("./picks.ts", import.meta.url), "utf8");
  assert.equal(picks.includes("export function formatStars"), false, "lib/picks.ts 里又冒出第二份");
});
