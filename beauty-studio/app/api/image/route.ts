import { NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set(["coresg-normal.trae.ai"]);

function normalizeImageUrl(url: string) {
  return url.replaceAll("text-to-image", "text_to_image");
}

const transparentPng = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/axu3B8AAAAASUVORK5CYII=",
  ),
  (c) => c.charCodeAt(0),
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get("url");

  if (!urlParam) {
    return new NextResponse(transparentPng, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  }

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return new NextResponse(transparentPng, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  }

  if (
    target.protocol !== "https:" ||
    !ALLOWED_HOSTS.has(target.hostname) ||
    !target.pathname.startsWith("/api/ide/v1/")
  ) {
    return new NextResponse(transparentPng, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  }

  const normalized = normalizeImageUrl(target.toString());

  try {
    const upstream = await fetch(normalized, {
      headers: {
        Accept: "image/*",
      },
    });

    if (!upstream.ok) {
      return new NextResponse(transparentPng, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    }

    const body = await upstream.arrayBuffer();
    const contentType = upstream.headers.get("content-type") ?? "image/png";
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return new NextResponse(transparentPng, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  }
}

