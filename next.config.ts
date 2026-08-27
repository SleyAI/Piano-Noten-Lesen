import type { NextConfig } from "next";

// Bei einem Projekt-Repo (https://<user>.github.io/<repo>/) muss der Pfad-Prefix
// gesetzt werden. Fuer ein <user>.github.io-Repo bleibt BASE_PATH leer.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  // Next legt sonst bei jedem Start AGENTS.md und CLAUDE.md an.
  agentRules: false,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
