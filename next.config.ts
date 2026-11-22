import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 列表页已并进首页；已经发出去的 /projects 链接不能死
  async redirects() {
    return [{ source: "/projects", destination: "/", permanent: true }];
  },
};

export default nextConfig;
