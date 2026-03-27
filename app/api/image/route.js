/**
 * Server-side image proxy for YouTube assets.
 * Whitelists only known YouTube image hostnames to prevent SSRF abuse.
 * Usage: /api/image?url=<encoded-image-url>
 */

// Allow any subdomain of these trusted Google/YouTube image CDNs
const ALLOWED_SUFFIXES = [
  '.googleusercontent.com',
  '.ytimg.com',
  '.ggpht.com',
];

function isAllowedUrl(raw) {
  try {
    const { hostname, protocol } = new URL(raw);
    if (protocol !== 'https:') return false;
    return ALLOWED_SUFFIXES.some((s) => hostname.endsWith(s));
  } catch {
    return false;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  if (!isAllowedUrl(imageUrl)) {
    return new Response('URL not allowed', { status: 403 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        Referer: 'https://www.youtube.com/',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      return new Response('Failed to fetch image', { status: res.status });
    }

    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      return new Response('Image request timed out', { status: 504 });
    }
    return new Response('Image proxy error', { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
