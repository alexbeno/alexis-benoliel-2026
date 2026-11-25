export const SITE_NAME = "Alexis Benoliel";
export const SITE_TITLE = "Alexis Benoliel — Product Engineer";
export const SITE_DESCRIPTION =
  "Interfaces that hold, between people and AI. Senior fullstack product engineer based in Paris.";

/**
 * Absolute URL of the site, for metadata, robots and the sitemap.
 * `SITE_URL` wins when set. Otherwise Vercel provides the production domain
 * (the custom one once it is attached) at build time; locally it is the dev
 * server.
 */
export function getSiteUrl() {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelHost) {
    return `https://${vercelHost}`;
  }
  return "http://localhost:3000";
}
