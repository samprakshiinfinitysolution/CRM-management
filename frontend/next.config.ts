import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
      {
        source: "/socket.io",
        destination: "http://localhost:5000/socket.io",
      },
      {
        source: "/socket.io/:path*",
        destination: "http://localhost:5000/socket.io/:path*",
      },
      {
        source: "/api/:path*",
        destination: "http://192.168.1.10:5000/api/:path*",
      },
      {
        source: "/socket.io",
        destination: "http://[IP_ADDRESS]/socket.io",
      },
      {
        source: "/socket.io/:path*",
        destination: "http://[IP_ADDRESS]/socket.io/:path*",
      },
    ];
  },
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
