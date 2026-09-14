import { defineMiddleware } from "astro:middleware";

// In-memory status cache on Node.js SSR runtime (2s TTL to guarantee sub-millisecond route checks)
let cachedStatus: string = "unknown";
let lastStatusFetch: number = 0;
const CACHE_TTL_MS = 2000;

async function getAppStatus(): Promise<string> {
  const now = Date.now();
  if (cachedStatus !== "unknown" && now - lastStatusFetch < CACHE_TTL_MS) {
    return cachedStatus;
  }

  try {
    const res = await fetch("http://127.0.0.1:8080/api/apps/status", {
      signal: AbortSignal.timeout(1500),
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      cachedStatus = data.status || "online";
      lastStatusFetch = now;
      return cachedStatus;
    }
  } catch (err) {
    // If backend check temporarily fails, preserve last known status
  }

  return cachedStatus === "unknown" ? "online" : cachedStatus;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // 1. Bypass static assets, images, styles, and API routes
  if (
    pathname.startsWith("/_astro") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.svg" ||
    pathname.match(/\.(svg|png|jpg|jpeg|webp|ico|css|js|woff2?)$/i)
  ) {
    return next();
  }

  // 2. Check central Pusdatin maintenance status
  const status = await getAppStatus();

  // 3. Maintenance mode lock: all pages (including /admin) redirect to /maintenance
  if (status === "maintenance") {
    if (pathname !== "/maintenance") {
      return context.redirect("/maintenance", 307);
    }
    return next();
  }

  // 4. Online mode: if user is on /maintenance, redirect back to home /
  if (status === "online" && pathname === "/maintenance") {
    return context.redirect("/", 307);
  }

  return next();
});
