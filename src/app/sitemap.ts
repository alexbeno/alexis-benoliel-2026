import type { MetadataRoute } from "next";
import { getSiteUrl } from "./_utils/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: getSiteUrl(), changeFrequency: "monthly", priority: 1 }];
}
