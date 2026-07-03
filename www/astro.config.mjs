// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://cera.love",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: "pl",
    locales: ["pl", "ua", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
