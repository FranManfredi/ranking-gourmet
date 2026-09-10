import { NextRequest } from "next/server";

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

type HeadersWithSetCookie = Headers & {
  getSetCookie?: () => string[];
};

function buildProxyRequestHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);
  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }
  return headers;
}

function buildProxyResponseHeaders(upstreamResponse: Response) {
  const responseHeaders = new Headers();

  upstreamResponse.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();

    if (
      lowerKey === "set-cookie" ||
      lowerKey === "content-encoding" ||
      lowerKey === "content-length" ||
      lowerKey === "transfer-encoding" ||
      lowerKey === "connection"
    ) {
      return;
    }

    responseHeaders.append(key, value);
  });

  const setCookies = (upstreamResponse.headers as HeadersWithSetCookie).getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    responseHeaders.append("set-cookie", cookie);
  }

  return responseHeaders;
}

export async function proxyToUpstream(request: NextRequest, targetUrl: string) {
  const init: RequestInit = {
    method: request.method,
    headers: buildProxyRequestHeaders(request),
    redirect: "manual",
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstreamResponse = await fetch(targetUrl, init);

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: buildProxyResponseHeaders(upstreamResponse),
  });
}
