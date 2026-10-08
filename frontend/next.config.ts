import type { NextConfig } from "next";
const backendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/socket.io",
        destination: `${backendUrl}/socket.io`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${backendUrl}/socket.io/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/teamleader",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/teamleader/:path*",
        destination: "/dashboard/:path*",
        permanent: true,
      },
      {
        source: "/team_leader",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/team_leader/:path*",
        destination: "/dashboard/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
