import type { NextConfig } from "next";
import path from "node:path";

const projectRoot = __dirname;
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Pin workspace root so Turbopack does not pick up /cff/package-lock.json
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  ...(isGithubPages
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  ...(basePath ? { basePath, assetPrefix: `${basePath}/` } : {}),
};

export default nextConfig;
