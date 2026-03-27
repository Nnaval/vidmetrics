import { getChannelVideos } from '@/lib/youtube';

/**
 * GET /api/videos?channelId=UCxxxxxx
 *
 * Returns the 20 most recent videos with full stats for a given channel ID.
 * Useful for refreshing the video list independently of channel metadata.
 */
export async function GET(request) {
  const channelId = request.nextUrl.searchParams.get('channelId')?.trim();

  if (!channelId) {
    return Response.json(
      { error: 'channelId query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const videos = await getChannelVideos(channelId);
    return Response.json({ channelId, count: videos.length, videos });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
