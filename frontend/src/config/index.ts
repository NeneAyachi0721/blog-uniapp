export const API_BASE_URL = (
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_API_BASE_URL || "http://localhost:3001"
).replace(/\/$/, "");

export const APP_FALLBACK = {
  siteTitle: "Blog",
  heroTitle: "Blog",
  heroSubtitle: "Ciallo～(∠・ω< )⌒☆",
  heroImage: "/static/hero-default.jpg",
};
