import type { MetadataRoute } from "next";

import { resolveRuntimeCatalog } from "@/lib/learning/runtime-content";

const BASE_URL = "https://skillpath.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await resolveRuntimeCatalog({ includeCourseEntities: false });

  const trackUrls: MetadataRoute.Sitemap = catalog.courses.map((course) => ({
    url: `${BASE_URL}/tracks/${course.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/tracks`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/missions`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/leaderboard`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/career`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/community`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  return [...staticUrls, ...trackUrls];
}
