// 右栏的个人信息。默认全空：真名、GitHub、邮箱都由你自己填，这里不预置任何假数据。
// 空字段不会渲染——没填的项直接消失，不会在页面上留「未填写」。

export type ProfileLink = { label: string; href: string };

export type Profile = {
  name?: string;
  /** 一句话定位，例如「前端 → 全栈 / AI 应用」 */
  headline?: string;
  /** 头像放 public/ 下，写站内绝对路径 */
  avatar?: string;
  /** 当前状态，例如「在职，偶尔看机会」 */
  status?: string;
  location?: string;
  stack?: string[];
  links?: ProfileLink[];
  /** 最近更新时间，YYYY-MM-DD */
  updatedAt?: string;
};

export const PROFILE: Profile = {
  // name: "",
  // headline: "",
  // avatar: "/me.png",
  // status: "",
  // location: "",
  // stack: [],
  // links: [
  //   { label: "GitHub", href: "https://github.com/your-handle" },
  //   { label: "邮箱", href: "mailto:you@example.com" },
  // ],
  // updatedAt: "2026-11-22",
};

/** 只认这两种 href：外链和邮件。别的（javascript:、相对路径）一律丢掉 */
const SAFE_HREF = /^(https:\/\/|mailto:)/;

const text = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const strings = (values?: string[]) => (values ?? []).map((v) => v.trim()).filter(Boolean);

export type ProfileView = {
  name?: string;
  headline?: string;
  avatar?: string;
  status?: string;
  location?: string;
  stack: string[];
  links: ProfileLink[];
  updatedAt?: string;
};

/** 空白串、空数组、不安全链接全部丢掉，剩下的才是能渲染的 */
export function visibleProfileFields(profile: Profile): ProfileView {
  return {
    name: text(profile.name),
    headline: text(profile.headline),
    avatar: text(profile.avatar),
    status: text(profile.status),
    location: text(profile.location),
    stack: strings(profile.stack),
    links: (profile.links ?? [])
      .map((link) => ({ label: link.label.trim(), href: link.href.trim() }))
      .filter((link) => link.label && SAFE_HREF.test(link.href)),
    updatedAt: text(profile.updatedAt),
  };
}

/** 个人段是不是全空。全空时卡片只渲染站点数字，不摆一排「未填写」 */
export function hasPersonalProfile(profile: Profile): boolean {
  const view = visibleProfileFields(profile);
  return Boolean(
    view.name ||
      view.headline ||
      view.avatar ||
      view.status ||
      view.location ||
      view.stack.length ||
      view.links.length ||
      view.updatedAt,
  );
}
