// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://cera.love",
  integrations: [react()],
  i18n: {
    defaultLocale: "pl",
    locales: ["pl", "ua", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
