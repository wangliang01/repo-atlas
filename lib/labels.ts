import type { NoteFrontmatter } from "./schema.ts";

export const NOTE_KIND_LABEL: Record<NoteFrontmatter["kind"], string> = {
  source: "源码",
  architecture: "架构",
  rebuild: "重建",
  tool: "工具",
};
