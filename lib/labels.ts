import type { NoteFrontmatter, ProjectFrontmatter } from "./schema.ts";

export const DEPLOY_LABEL: Record<ProjectFrontmatter["deploy"], string> = {
  docker: "Docker",
  binary: "二进制",
  cloud: "云托管",
  library: "库",
};

export const SETUP_LABEL: Record<ProjectFrontmatter["setupTime"], string> = {
  "5min": "5 分钟",
  "30min": "30 分钟",
  halfday: "半天",
  "day+": "一天以上",
};

export const MAINTENANCE_LABEL: Record<ProjectFrontmatter["maintenance"], string> = {
  active: "活跃",
  slowing: "变慢",
  stale: "停滞",
};

export const NOTE_KIND_LABEL: Record<NoteFrontmatter["kind"], string> = {
  source: "源码",
  architecture: "架构",
  rebuild: "重建",
  tool: "工具",
};

export const VERDICT_LABEL: Record<ProjectFrontmatter["verdict"], string> = {
  recommend: "推荐",
  watch: "观望",
  avoid: "别碰",
};

// 首页左栏的图例：三个标签以前只出现在卡片上，没有任何解释
export const VERDICT_NOTE: Record<ProjectFrontmatter["verdict"], string> = {
  recommend: "现在就在用，愿意推荐给同事",
  watch: "跑通了，但有明显的取舍",
  avoid: "踩过坑，不建议再走一遍",
};

// 手机上横排图例放不下整句，压成一行
export const VERDICT_HINT: Record<ProjectFrontmatter["verdict"], string> = {
  recommend: "现在就在用",
  watch: "有取舍",
  avoid: "踩过坑",
};
