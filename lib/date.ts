// 构建时算一次，页面仍是静态的；固定 YYYY.MM.DD 是为了配合等宽数字不抖动
export function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}
