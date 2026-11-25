/**
 * 分类分三层，各回答一个问题，不许互相兼任：
 *
 * - 用途（DOMAINS）：读者拿它做什么活，一个项目 1–3 个；
 * - 形态（FORMS）：读者从哪儿打开它，1–2 个，一个标签只说一件事；
 * - 身份（IDENTITIES）：谁在搜它，1–2 个，可以空着。
 *
 * 三层都不写「通用」这种兜底词：不属于任何一类的项目宁可不写，
 * 兜底类会把差异藏起来，让筛选失去意义。
 */
export const DOMAINS = [
  "编码与开发",
  "逆向工程",
  "设计与创意",
  "视频与音频",
  "写作与内容",
  "数据与情报",
  "办公与效率",
  "运维与基础设施",
  "安全与合规",
  "营销与增长",
  "学习与研究",
  "其他",
] as const;

export type Domain = (typeof DOMAINS)[number];

/** 形态：只描述交付方式。Agent 运行时、记忆、编排这些是角色，不是形态 */
export const FORMS = [
  "CLI",
  "桌面应用",
  "Web 应用",
  "移动应用",
  "插件",
  "MCP 服务",
  "Skill",
  "提示词",
  "SDK 与库",
  "自托管服务",
  "数据集",
  "文档与模板",
] as const;

export type Form = (typeof FORMS)[number];

/** 身份：写「谁用它」，不写「它用了什么」。内部调了模型不等于身份是 AI */
export const IDENTITIES = [
  "前端",
  "后端",
  "移动端",
  "数据",
  "算法",
  "AI",
  "运维",
  "安全",
  "测试",
  "设计",
  "产品",
  "自媒体",
  "研究",
] as const;

export type Identity = (typeof IDENTITIES)[number];

export const ALL_DOMAINS = "全部";

/** 一个项目最多挂 3 个用途；再多左栏会被挤爆，也不会让人更想点 */
export const MAX_DOMAINS = 3;

/** 形态是标签，最多 2 个；它不该和用途抢主分类的位置 */
export const MAX_FORMS = 2;

/** 身份最多 2 个；跨栈项目写两条，不面向特定人群的留空 */
export const MAX_IDENTITIES = 2;
