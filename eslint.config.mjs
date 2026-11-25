import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // .scratch 放截图、临时脚本和 CDP 用的 Chrome profile，都不是项目代码
    ignores: [".next/**", "node_modules/**", "out/**", ".scratch/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
