/**
 * YouTube Data API v3 helpers — server-side only.
 * Never import this file from a Client Component.
 */

const API_BASE = 'https://www.googleapis.com/youtube/v3';

/** Strips HTML tags from YouTube API error messages before surfacing them to users. */
function cleanApiError(message) {
  return message?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() ?? '';
}

// ─── URL Parsing ─────────────────────────────────────────────────────────────

/**
 * Extracts a typed channel identifier from any YouTube channel URL format.
 *
 * Supported formats:
 *   youtube.com/@handle          → { type: 'handle',   value: 'handle' }
 *   youtube.com/channel/UCxxxxx  → { type: 'id',       value: 'UCxxxxx' }
 *   youtube.com/c/customName     → { type: 'custom',   value: 'customName' }
 *   youtube.com/user/username    → { type: 'username', value: 'username' }
 *   youtube.com/channelName      → { type: 'handle',   value: 'channelName' } (bare path fallback)
 *
 * @param {string} url
 * @returns {{ type: 'id' | 'handle' | 'username' | 'custom', value: string }}
 */
export function extractChannelIdentifier(url) {
  let normalized = url.trim();
  if (!normalized.includes('://')) normalized = `https://${normalized}`;

  let u;
  try {
    u = new URL(normalized);
  } catch {
    throw new Error(`Invalid URL: "${url}"`);
  }

  const path = u.pathname.replace(/\/$/, ''); // strip trailing slash

  // /channel/UCxxxxxx — direct channel ID
  const channelMatch = path.match(/^\/channel\/([^/]+)$/);
  if (channelMatch) return { type: 'id', value: channelMatch[1] };

  // /@handle
  const handleMatch = path.match(/^\/@([^/]+)$/);
  if (handleMatch) return { type: 'handle', value: handleMatch[1] };

  // /c/customName
  const customMatch = path.match(/^\/c\/([^/]+)$/);
  if (customMatch) return { type: 'custom', value: customMatch[1] };

  // /user/username
  const userMatch = path.match(/^\/user\/([^/]+)$/);
  if (userMatch) return { type: 'username', value: userMatch[1] };

  // Bare path — treat as handle (e.g. youtube.com/MrBeast)
  const bareMatch = path.match(/^\/([^/]+)$/);
  if (bareMatch) return { type: 'handle', value: bareMatch[1] };

  throw new Error(
    'Unrecognized YouTube channel URL. Try a URL like youtube.com/@channelname'
  );
}

// ─── Channel Info ─────────────────────────────────────────────────────────────

/**
 * Fetches channel details from the YouTube Data API v3.
 *
 * @param {{ type: string, value: string }} identifier — from extractChannelIdentifier()
 * @returns {Promise<object>}
 */
export async function getChannelInfo(identifier) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not configured');

  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    key: apiKey,
  });

  switch (identifier.type) {
    case 'id':
      params.set('id', identifier.value);
      break;
    case 'handle':
      params.set('forHandle', identifier.value);
      break;
    case 'username':
    case 'custom':
      params.set('forUsername', identifier.value);
      break;
    default:
      throw new Error(`Unknown identifier type: ${identifier.type}`);
  }

  const res = await fetch(`${API_BASE}/channels?${params}`, { cache: 'no-store' });
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 403) throw new Error('YouTube API quota exceeded or access denied. Please try again later.');
    if (res.status === 400) throw new Error(cleanApiError(data.error?.message) || 'Invalid request to YouTube API.');
    throw new Error(cleanApiError(data.error?.message) || 'YouTube API error fetching channel.');
  }

  if (!data.items?.length) {
    throw new Error('Channel not found. Double-check the URL and try again.');
  }

  const c = data.items[0];

  return {
    id: c.id,
    title: c.snippet.title,
    description: c.snippet.description,
    thumbnail:
      c.snippet.thumbnails.high?.url ??
      c.snippet.thumbnails.medium?.url ??
      c.snippet.thumbnails.default?.url,
    subscriberCount: parseInt(c.statistics.subscriberCount ?? 0, 10),
    videoCount: parseInt(c.statistics.videoCount ?? 0, 10),
    viewCount: parseInt(c.statistics.viewCount ?? 0, 10),
    uploadsPlaylistId: c.contentDetails.relatedPlaylists.uploads,
    customUrl: c.snippet.customUrl ?? null,
  };
}

// ─── Channel Videos ───────────────────────────────────────────────────────────

/**
 * Fetches the 20 most recent uploads for a channel with full stats.
 * Makes two API calls: playlistItems (get video IDs) → videos (get stats).
 *
 * @param {string} channelId
 * @returns {Promise<object[]>}
 */
export async function getChannelVideos(channelId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not configured');

  // Step 1 — get the uploads playlist ID
  const channelParams = new URLSearchParams({
    part: 'contentDetails',
    id: channelId,
    key: apiKey,
  });

  const channelRes = await fetch(`${API_BASE}/channels?${channelParams}`, {
    cache: 'no-store',
  });
  const channelData = await channelRes.json();

  if (!channelRes.ok || !channelData.items?.length) {
    throw new Error('Could not retrieve uploads playlist for this channel.');
  }

  const uploadsPlaylistId =
    channelData.items[0].contentDetails.relatedPlaylists.uploads;

  // Step 2 — get the 20 most recent video IDs from that playlist
  const playlistParams = new URLSearchParams({
    part: 'snippet',
    playlistId: uploadsPlaylistId,
    maxResults: '20',
    key: apiKey,
  });

  const playlistRes = await fetch(`${API_BASE}/playlistItems?${playlistParams}`, {
    cache: 'no-store',
  });
  const playlistData = await playlistRes.json();

  if (!playlistRes.ok) {
    if (playlistRes.status === 403) throw new Error('YouTube API quota exceeded. Please try again later.');
    if (playlistRes.status === 404) throw new Error('Channel not found. Double-check the URL and try again.');
    throw new Error(cleanApiError(playlistData.error?.message) || 'Failed to fetch video list from playlist.');
  }

  if (!playlistData.items?.length) return [];

  const videoIds = playlistData.items
    .map((item) => item.snippet.resourceId.videoId)
    .join(',');

  // Step 3 — fetch full stats for those video IDs (single batched call)
  const videosParams = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    id: videoIds,
    key: apiKey,
  });

  const videosRes = await fetch(`${API_BASE}/videos?${videosParams}`, {
    cache: 'no-store',
  });
  const videosData = await videosRes.json();

  if (!videosRes.ok) {
    if (videosRes.status === 403) throw new Error('YouTube API quota exceeded. Please try again later.');
    throw new Error(cleanApiError(videosData.error?.message) || 'Failed to fetch video details.');
  }

  return (videosData.items ?? []).map((v) => ({
    id: v.id,
    title: v.snippet.title,
    thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
    publishedAt: v.snippet.publishedAt,
    duration: v.contentDetails?.duration ?? 'PT0S',
    viewCount: parseInt(v.statistics?.viewCount ?? 0, 10),
    likeCount: parseInt(v.statistics?.likeCount ?? 0, 10),
    commentCount: parseInt(v.statistics?.commentCount ?? 0, 10),
    url: `https://www.youtube.com/watch?v=${v.id}`,
  }));
}
