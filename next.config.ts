import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Todas as telas dependem do usuário logado; renderização dinâmica é suficiente.
  // "standalone" gera uma pasta enxuta para o pacote de instalação do escritório.
  output: "standalone",
  // O banco e o segredo locais nunca devem ir para dentro do build.
  outputFileTracingExcludes: { "*": ["dados/**", "backups/**", "runtime/**", "dist/**"] },
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
