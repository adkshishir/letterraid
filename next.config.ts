import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /heist was the old marketing/landing page for the game before the
      // hub at "/" took over one-click matchmaking. Removed, but old links,
      // bookmarks and search results should land on the hub, not a 404.
      { source: "/heist", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
