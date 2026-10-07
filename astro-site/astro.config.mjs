import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://seo-max.ro",
  vite: {
    plugins: [tailwindcss()],
  },
});
