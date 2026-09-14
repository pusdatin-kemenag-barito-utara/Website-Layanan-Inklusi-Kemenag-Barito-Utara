import type { APIRoute } from "astro";

export const prerender = false;

const BACKEND_URL =
  import.meta.env.BACKEND_URL ||
  (typeof process !== "undefined" && process.env ? process.env.BACKEND_URL : undefined) ||
  `http://127.0.0.1:${
    import.meta.env.BACKEND_PORT ||
    (typeof process !== "undefined" && process.env ? process.env.BACKEND_PORT : undefined) ||
    "8080"
  }`;

export const ALL: APIRoute = async ({ request, params }) => {
  const path = params.path || "";
  const url = new URL(request.url);
  const target = `${BACKEND_URL}/api/${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  try {
    const hasBody = !["GET", "HEAD"].includes(request.method);
    const body = hasBody ? await request.arrayBuffer() : undefined;

    const res = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Backend connection error: ${(err as Error).message}` }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
