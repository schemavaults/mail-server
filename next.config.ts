import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Tools that request /favicon.ico blindly (without reading the page's
      // <link rel="icon">) should also get the admin-uploaded favicon.
      {
        source: "/favicon.ico",
        destination: "/api/branding/favicon",
      },
    ];
  },
};

export default nextConfig;
