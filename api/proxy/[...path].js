const BACKEND_URL = (process.env.BACKEND_URL || "https://intizom-server.onrender.com").replace(
  /\/+$/,
  "",
);

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function buildTargetUrl(requestUrl) {
  const incomingUrl = new URL(requestUrl, "https://intizom-uz.vercel.app");
  const path = incomingUrl.pathname.replace(/^\/api\/proxy/, "") || "/";
  return `${BACKEND_URL}${path}${incomingUrl.search}`;
}

function copyRequestHeaders(headers) {
  const nextHeaders = new Headers();

  for (const [key, value] of Object.entries(headers)) {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase()) && value !== undefined) {
      nextHeaders.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }

  return nextHeaders;
}

function copyResponseHeaders(source, target) {
  source.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      target.setHeader(key, value);
    }
  });
}

export default async function handler(request, response) {
  const targetUrl = buildTargetUrl(request.url);
  const method = request.method || "GET";

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method,
      headers: copyRequestHeaders(request.headers),
      body: method === "GET" || method === "HEAD" ? undefined : request,
      duplex: "half",
    });

    copyResponseHeaders(upstreamResponse.headers, response);
    response.status(upstreamResponse.status);
    response.send(Buffer.from(await upstreamResponse.arrayBuffer()));
  } catch (error) {
    response.status(502).json({
      error: {
        code: "PROXY_REQUEST_FAILED",
        message: error instanceof Error ? error.message : "Proxy request failed",
      },
    });
  }
}
