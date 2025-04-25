const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["antd", "rc-picker", "rc-util"],
  experimental: {
    esmExternals: false, // 중요
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

module.exports = nextConfig;
