import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com", // GCS assets
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Unsplash remote images used by the app
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
