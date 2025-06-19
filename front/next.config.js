/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 输出静态HTML和JS以便于部署
  output: 'standalone',
  // 支持导出静态文件
  images: {
    unoptimized: true,
  },
  // 配置基础路径，部署到子目录时使用
  // basePath: '/panel',
};

module.exports = nextConfig;