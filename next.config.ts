import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 全静态导出。服务器只有 1.7G 内存，为了一个纯静态站养一个 Node 进程不值当。
  // 代价：next.config 的 redirects 不支持 export，/projects → / 的 308 改由 Caddy 发。
  output: "export",
  // 导出后没有 /_next/image 这个优化端点，头像会 404；站点只有一张图，直接原图发
  images: { unoptimized: true },
};

export default nextConfig;
