import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/teamleader",
        destination: "/team_leader",
        permanent: true,
      },
      {
        source: "/teamleader/:path*",
        destination: "/team_leader/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
