/**
 * 精选分类：按「读者拿它做什么」分，不按技术形态分。
 * Agent / Skill / MCP 这些形态留在每行的 topics 标签里，不占左栏。
 * 只有实际有条目的分类才会渲染，空分类不显示。
 */
export const CATEGORIES = [
  "写作",
  "营销",
  "办公",
  "视频剪辑",
  "音频与语音",
  "图像与设计",
  "前端",
  "后端",
  "架构",
  "测试与质量",
  "运维",
  "模型训练",
  "推理优化",
  "记忆与上下文",
  "Agent 框架",
  "浏览器与 RPA",
  "安全",
  "数据与情报",
  "其他",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const ALL_CATEGORIES = "全部";

/** 一个项目最多挂 4 个分类；超过只会把左栏挤爆，不会让人更想点 */
export const MAX_CATEGORIES = 4;
