import { useState } from 'react';
import { formatNum, formatDuration, formatRelativeDate, engagementRate, viewVelocity } from '@/lib/utils';
import { Flame, Eye, ThumbsUp, MessageSquare, Play } from 'lucide-react';

export default function VideoCard({ video, maxViews, velocityThreshold }) {
  const [imgFailed, setImgFailed] = useState(false);
  const er = engagementRate(video);
  const velocity = viewVelocity(video);
  const isTrending = velocity >= velocityThreshold;
  const viewPct = maxViews > 0 ? (video.viewCount / maxViews) * 100 : 0;

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 hover:shadow-xl hover:shadow-black/30 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-zinc-800 flex-shrink-0">
        {video.thumbnail && !imgFailed ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play size={22} className="text-zinc-700" />
          </div>
        )}

        {/* Duration */}
        <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </span>

        {/* Trending badge */}
        {isTrending && (
          <span className="absolute top-2 left-2 flex items-center gap-1 bg-orange-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Flame size={9} />
            Trending
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        {/* Title */}
        <p className="text-sm font-medium text-zinc-100 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
          {video.title}
        </p>

        {/* Date */}
        <p className="text-xs text-zinc-500">{formatRelativeDate(video.publishedAt)}</p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Eye size={11} /> {formatNum(video.viewCount)}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp size={11} /> {formatNum(video.likeCount)}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={11} /> {formatNum(video.commentCount)}
          </span>
        </div>

        {/* View share bar */}
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500/50 rounded-full"
            style={{ width: `${viewPct.toFixed(1)}%` }}
          />
        </div>

        {/* Engagement + velocity */}
        <div className="flex items-center justify-between mt-auto">
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              er >= 5
                ? 'bg-green-500/15 text-green-400'
                : er >= 2
                ? 'bg-amber-500/15 text-amber-400'
                : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            {er.toFixed(2)}% Engagement
          </span>

          {isTrending && (
            <span className="text-[11px] text-orange-400 font-medium">
              {formatNum(Math.round(velocity))} Views/day
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
