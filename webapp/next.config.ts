import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Tell Turbopack exactly where this app lives so it doesn't try to infer the
  // workspace root from multiple lockfiles (we keep a root one for dotenv-cli
  // and a webapp one for app deps).
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Prisma needs to be treated as external on the server (its engine binaries
  // can't be bundled).
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  // Hide the floating Next.js dev indicator (the small "N" pill at the bottom
  // that some folks mistake for a modal — especially noticeable on Safari).
  devIndicators: false,
};

export default nextConfig;
