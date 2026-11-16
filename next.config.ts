import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Todas as telas dependem do usuário logado; renderização dinâmica é suficiente.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
