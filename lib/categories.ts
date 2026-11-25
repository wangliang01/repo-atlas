/**
 * 分类只回答「读者拿它做什么」，不回答「它是什么形态」。
 *
 * 一个项目必须有 1 个主领域，最多再挂 2 个次领域；Skill / MCP / Agent
 * 运行时这类形态放 FORMS，t3code 与 Orca 这类同层关系放 peers。
 * 三者分开，项目才能既按用途找到，又不会让某个形态词变成万能筐。
 */
export const DOMAINS = [
  "编码与开发",
  "写作与内容",
  "设计与创意",
  "视频与音频",
  "办公与效率",
  "数据与情报",
  "运维与基础设施",
  "安全与合规",
  "营销与增长",
  "学习与研究",
  "通用与跨领域",
  "其他",
] as const;

export type Domain = (typeof DOMAINS)[number];

export const FORMS = [
  "桌面 / Web 应用",
  "CLI / 本地工具",
  "框架 / SDK / 库",
  "Agent 运行时",
  "Agent 控制面 / 编排",
  "Skill / 提示词包",
  "MCP / 协议 / 连接器",
  "记忆 / 上下文",
  "模型 / 训练 / 推理",
  "模板 / 脚手架",
  "工作流 / 方法论",
  "浏览器 / RPA",
  "数据集 / 知识库",
  "文档 / 资料",
  "插件 / 扩展",
] as const;

export type Form = (typeof FORMS)[number];

export const ALL_DOMAINS = "全部";

/** 一个项目最多挂 3 个领域；再多左栏会被挤爆，也不会让人更想点 */
export const MAX_DOMAINS = 3;

/** 形态是标签，最多 2 个；它不该和领域抢主分类的位置 */
export const MAX_FORMS = 2;
