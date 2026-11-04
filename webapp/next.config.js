const nextConfig = {
  output: process.env.STATIC_EXPORT ? "export" : undefined,
  images: { unoptimized: !!process.env.STATIC_EXPORT },
};

module.exports = nextConfig; 