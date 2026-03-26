import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SkillPath Academy",
    short_name: "SkillPath",
    description: "Role-focused learning for QA engineers, business analysts, and data analysts.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#0ea5e9",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
