import {
  extractChannelIdentifier,
  getChannelInfo,
  getChannelVideos,
} from '@/lib/youtube';

/**
 * POST /api/channel
 * Body: { url: string }
 *
 * Resolves a YouTube channel URL → fetches channel info + recent videos
 * in a single response. All API calls are server-side only.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }

  const url = body?.url?.trim();
  if (!url) {
    return Response.json({ error: 'A YouTube channel URL is required' }, { status: 400 });
  }

  try {
    const identifier = extractChannelIdentifier(url);
    const channel = await getChannelInfo(identifier);
    const videos = await getChannelVideos(channel.id);

    return Response.json({ channel, videos });
  } catch (err) {
    const msg = err.message.toLowerCase();
    let status = 500;
    if (msg.includes('not found')) status = 404;
    else if (msg.includes('quota') || msg.includes('forbidden') || msg.includes('access denied')) status = 429;
    else if (msg.includes('invalid url') || msg.includes('unrecognized')) status = 400;

    return Response.json({ error: err.message }, { status });
  }
}
