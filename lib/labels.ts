import type { ProjectFrontmatter } from "./schema.ts";

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
