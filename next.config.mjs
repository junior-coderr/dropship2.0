/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com"],
  },
  experimental: {
    serverActions: true,
  },
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

export default nextConfig;
