/**
 * 首页「最近在写」的仓库列表。
 *
 * 为什么不写同步脚本拉 190 个：里面大半是学习练习和 fork，自动同步会把噪声
 * 一起搬上来。这里是策展过的 8 个，描述直接用仓库自己的 description，
 * 没描述的就写名字本身能说明的那点，不补戏。
 */
export type Repo = {
  name: string;
  desc: string;
  lang: string;
  /** 最近一次推送，YYYY-MM */
  updated: string;
  url: string;
};

export const REPOS: Repo[] = [
  {
    name: "resume-forge-skill",
    desc: "中文简历 agent skill：审计 → 重写 → A4 模板 → 导出 PDF → 验版，npx skills add 可装",
    lang: "Agent Skill",
    updated: "2026-11",
    url: "https://github.com/wangliang01/resume-forge-skill",
  },
  {
    name: "my-vue3",
    desc: "学习 Vue3 源码",
    lang: "TypeScript",
    updated: "2025-12",
    url: "https://github.com/wangliang01/my-vue3",
  },
  {
    name: "image-compressor",
    desc: "图片压缩小工具",
    lang: "JavaScript",
    updated: "2025-04",
    url: "https://github.com/wangliang01/image-compressor",
  },
  {
    name: "koa-api-template",
    desc: "Koa 接口模板",
    lang: "JavaScript",
    updated: "2025-01",
    url: "https://github.com/wangliang01/koa-api-template",
  },
  {
    name: "vue-todo-list",
    desc: "Vue 3 + Pinia + Bootstrap 5.2 的待办应用，支持无限滚动加载",
    lang: "Vue",
    updated: "2024-12",
    url: "https://github.com/wangliang01/vue-todo-list",
  },
  {
    name: "imooc-backend",
    desc: "用 Koa 写的 Node 项目",
    lang: "JavaScript",
    updated: "2024-09",
    url: "https://github.com/wangliang01/imooc-backend",
  },
  {
    name: "imooc-frontend",
    desc: "Vue3 + Tailwind CSS + Layui 实现的社区应用前端",
    lang: "JavaScript",
    updated: "2024-08",
    url: "https://github.com/wangliang01/imooc-frontend",
  },
  {
    name: "bingchao-shop-miniprogram",
    desc: "用微信云开发做的商城小程序",
    lang: "JavaScript",
    updated: "2024-07",
    url: "https://github.com/wangliang01/bingchao-shop-miniprogram",
  },
];
