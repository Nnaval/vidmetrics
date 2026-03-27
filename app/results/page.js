'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart2,
  ArrowLeft,
  Eye,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Play,
  Flame,
  Calendar,
  Clock,
  ChevronUp,
  ChevronDown,
  GitCompare,
} from 'lucide-react';

import ChannelHeader from '@/components/ChannelHeader';
import VideoCard from '@/components/VideoCard';
import SortFilter from '@/components/SortFilter';
import TopVideosChart from '@/components/charts/TopVideosChart';
import CompareModal from '@/components/CompareModal';
import ChannelComparison from '@/components/ChannelComparison';
import { formatNum, formatDuration, formatRelativeDate, engagementRate, viewVelocity } from '@/lib/utils';

const SESSION_KEY = 'vidmetrics_result';

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, highlight }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-center gap-2 text-zinc-500 mb-2">
        <Icon size={13} />
        <span className="text-sm font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${highlight ? 'text-red-400' : 'text-white'}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-zinc-600 mt-1">{sub}</div>}
    </div>
  );
}

// ─── Table view ──────────────────────────────────────────────────────────────

function SortableTh({ label, sortKey, sort, onSort }) {
  const active = sort.by === sortKey;
  const Icon = active && sort.order === 'asc' ? ChevronUp : ChevronDown;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide cursor-pointer select-none hover:text-zinc-300 transition-colors whitespace-nowrap"
    >
      <span className="flex items-center gap-1">
        {label}
        <Icon
          size={11}
          className={active ? 'text-zinc-300' : 'text-zinc-700'}
        />
      </span>
    </th>
  );
}

function TableView({ videos, sort, onSort, velocityThreshold }) {
  if (!videos.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl py-16 text-center text-zinc-500 text-sm">
        No videos match your filters.
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide w-8">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Video
              </th>
              <SortableTh label="Published"  sortKey="date"        sort={sort} onSort={onSort} />
              <SortableTh label="Views"      sortKey="views"       sort={sort} onSort={onSort} />
              <SortableTh label="Likes"      sortKey="likes"       sort={sort} onSort={onSort} />
              <SortableTh label="Comments"   sortKey="comments"    sort={sort} onSort={onSort} />
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide whitespace-nowrap">
                Duration
              </th>
              <SortableTh label="Engagement" sortKey="engagement"  sort={sort} onSort={onSort} />
              <SortableTh label="Views/Day"  sortKey="velocity"    sort={sort} onSort={onSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {videos.map((video, i) => {
              const er = engagementRate(video);
              const velocity = viewVelocity(video);
              const isTrending = velocity >= velocityThreshold;

              return (
                <tr key={video.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3 text-xs text-zinc-600 font-mono">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 max-w-sm">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <img
                          src={video.thumbnail}
                          alt=""
                          referrerPolicy="no-referrer-when-downgrade"
                          className="w-20 h-[45px] rounded object-cover bg-zinc-800"
                        />
                      </a>
                      <div className="min-w-0">
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-zinc-100 hover:text-red-400 transition-colors line-clamp-2 leading-snug"
                        >
                          {video.title}
                        </a>
                        {isTrending && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-orange-400 font-medium mt-1">
                            <Flame size={9} /> Trending
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                      <Calendar size={10} className="text-zinc-600" />
                      {formatRelativeDate(video.publishedAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-medium whitespace-nowrap">
                    {formatNum(video.viewCount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300 whitespace-nowrap">
                    {formatNum(video.likeCount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300 whitespace-nowrap">
                    {formatNum(video.commentCount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
                      <Clock size={10} className="text-zinc-600" />
                      {formatDuration(video.duration)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        er >= 5
                          ? 'bg-green-500/15 text-green-400'
                          : er >= 2
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {er.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {isTrending ? (
                      <span className="flex items-center gap-1 text-xs text-orange-400 font-medium">
                        <Flame size={11} />
                        {formatNum(Math.round(velocity))}/d
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500">
                        {formatNum(Math.round(velocity))}/d
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-zinc-800 rounded ${className}`} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 py-8">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-16 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
      </div>
    </div>
  );
}

// ─── No data ──────────────────────────────────────────────────────────────────

function NoData({ onBack }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 py-32 text-center px-4">
      <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
        <BarChart2 size={22} className="text-zinc-600" />
      </div>
      <div>
        <p className="text-white font-semibold text-lg">No analysis data found</p>
        <p className="text-zinc-500 text-sm mt-1">
          Go back and analyze a YouTube channel first.
        </p>
      </div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
      >
        <ArrowLeft size={14} />
        Analyze a Channel
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Comparison state
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState('');
  const comparisonRef = useRef(null);

  // Sort / filter state
  const [sortBy, setSortBy] = useState('views');
  const [sortOrder, setSortOrder] = useState('desc');
  const [minViews, setMinViews] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Derived sort object used by table headers
  const sort = { by: sortBy, order: sortOrder };

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        // corrupted data — just show no-data state
      }
    }
    setLoaded(true);
  }, []);

  // ── Derived values ───────────────────────────────────────────────────────

  const velocityThreshold = useMemo(() => {
    if (!data?.videos?.length) return Infinity;
    const velocities = data.videos.map(viewVelocity);
    const avg = velocities.reduce((s, v) => s + v, 0) / velocities.length;
    return avg * 1.5;
  }, [data]);

  const maxViews = useMemo(() => {
    if (!data?.videos?.length) return 1;
    return Math.max(...data.videos.map((v) => v.viewCount));
  }, [data]);

  const processedVideos = useMemo(() => {
    if (!data?.videos) return [];
    let videos = [...data.videos];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      videos = videos.filter((v) => v.title.toLowerCase().includes(q));
    }

    if (minViews && parseInt(minViews, 10) > 0) {
      videos = videos.filter((v) => v.viewCount >= parseInt(minViews, 10));
    }

    videos.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'views':      aVal = a.viewCount;          bVal = b.viewCount;          break;
        case 'likes':      aVal = a.likeCount;          bVal = b.likeCount;          break;
        case 'comments':   aVal = a.commentCount;       bVal = b.commentCount;       break;
        case 'date':       aVal = new Date(a.publishedAt); bVal = new Date(b.publishedAt); break;
        case 'engagement': aVal = engagementRate(a);    bVal = engagementRate(b);    break;
        case 'velocity':   aVal = viewVelocity(a);      bVal = viewVelocity(b);      break;
        default:           aVal = a.viewCount;          bVal = b.viewCount;
      }
      return sortOrder === 'desc'
        ? bVal > aVal ? 1 : -1
        : aVal > bVal ? 1 : -1;
    });

    return videos;
  }, [data, sortBy, sortOrder, minViews, searchQuery]);

  const stats = useMemo(() => {
    if (!data?.videos?.length) return null;
    const { videos } = data;
    const totalViews = videos.reduce((s, v) => s + v.viewCount, 0);
    const avgViews = Math.round(totalViews / videos.length);
    const avgEngagement = (
      videos.reduce((s, v) => s + engagementRate(v), 0) / videos.length
    ).toFixed(2);
    const trendingCount = videos.filter((v) => viewVelocity(v) >= velocityThreshold).length;
    return { totalViews, avgViews, avgEngagement, trendingCount };
  }, [data, velocityThreshold]);

  // ── Compare channel ───────────────────────────────────────────────────────

  async function handleCompare(url) {
    setCompareError('');
    setCompareLoading(true);
    try {
      const res = await fetch('/api/channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to fetch channel');
      setCompareData(json);
      setCompareModalOpen(false);
      setTimeout(() => {
        comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setCompareError(err.message);
    } finally {
      setCompareLoading(false);
    }
  }

  // ── Sort toggle used by table headers ─────────────────────────────────────

  function handleTableSort(key) {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  }

  // ── CSV export ────────────────────────────────────────────────────────────

  function exportCSV() {
    if (!processedVideos.length) return;
    const headers = [
      'Title', 'Published', 'Views', 'Likes', 'Comments',
      'Duration', 'Engagement %', 'Views/Day', 'URL',
    ];
    const rows = processedVideos.map((v) => [
      `"${v.title.replace(/"/g, '""')}"`,
      new Date(v.publishedAt).toLocaleDateString(),
      v.viewCount,
      v.likeCount,
      v.commentCount,
      formatDuration(v.duration),
      engagementRate(v).toFixed(2),
      Math.round(viewVelocity(v)),
      v.url,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${data.channel.title.replace(/\s+/g, '-')}-vidmetrics.csv`;
    link.click();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart2 size={14} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">VidMetrics</span>
          </button>
          <div className="flex items-center gap-2">
            {data && (
              <button
                onClick={() => { setCompareError(''); setCompareModalOpen(true); }}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 hover:border-blue-500/50 rounded-lg px-3 py-1.5 transition-all cursor-pointer"
              >
                <GitCompare size={12} />
                Compare Channel
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft size={12} />
              New Analysis
            </button>
          </div>
        </div>
      </header>

      {!loaded ? (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6">
          <LoadingSkeleton />
        </main>
      ) : !data ? (
        <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6">
          <NoData onBack={() => router.push('/')} />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

          {/* Channel header */}
          <ChannelHeader channel={data.channel} videos={data.videos} />

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Play}
              label="Videos Analyzed"
              value={data.videos.length}
              sub="most recent uploads"
            />
            <StatCard
              icon={Eye}
              label="Total Views"
              value={formatNum(stats.totalViews)}
              sub="across analyzed videos"
              highlight
            />
            <StatCard
              icon={TrendingUp}
              label="Avg Views / Video"
              value={formatNum(stats.avgViews)}
              sub="per video"
            />
            <StatCard
              icon={ThumbsUp}
              label="Avg Engagement"
              value={`${stats.avgEngagement}%`}
              sub="(likes + comments) / views"
            />
          </div>

          {/* Trending callout */}
          {stats.trendingCount > 0 && (
            <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/25 rounded-xl px-4 py-3">
              <Flame size={15} className="text-orange-400 flex-shrink-0" />
              <span className="text-sm text-orange-300">
                <strong>{stats.trendingCount}</strong>{' '}
                {stats.trendingCount === 1 ? 'video is' : 'videos are'} trending — gaining views
                significantly faster than the channel average.
              </span>
            </div>
          )}

          {/* Chart */}
          <TopVideosChart videos={data.videos} sortBy={sortBy} />

          {/* Sort / filter controls */}
          <SortFilter
            sortBy={sortBy}
            sortOrder={sortOrder}
            minViews={minViews}
            searchQuery={searchQuery}
            viewMode={viewMode}
            onSortChange={setSortBy}
            onOrderChange={setSortOrder}
            onMinViewsChange={setMinViews}
            onSearchChange={setSearchQuery}
            onViewModeChange={setViewMode}
            onExport={exportCSV}
            totalCount={data.videos.length}
            filteredCount={processedVideos.length}
          />

          {/* Video grid */}
          {viewMode === 'grid' && (
            <>
              {processedVideos.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl py-16 text-center text-zinc-500 text-sm">
                  No videos match your filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {processedVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      maxViews={maxViews}
                      velocityThreshold={velocityThreshold}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Video table */}
          {viewMode === 'table' && (
            <TableView
              videos={processedVideos}
              sort={sort}
              onSort={handleTableSort}
              velocityThreshold={velocityThreshold}
            />
          )}

          {/* Channel comparison */}
          {compareData && (
            <div ref={comparisonRef} className="scroll-mt-20">
            <ChannelComparison
              channelA={data.channel}
              videosA={data.videos}
              channelB={compareData.channel}
              videosB={compareData.videos}
              onClear={() => setCompareData(null)}
            />
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-5 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-zinc-600">
          <span>VidMetrics</span>
          <span>Powered by YouTube Data API v3</span>
        </div>
      </footer>

      {/* Compare modal */}
      {compareModalOpen && (
        <CompareModal
          onClose={() => setCompareModalOpen(false)}
          onSubmit={handleCompare}
          loading={compareLoading}
          error={compareError}
        />
      )}
    </div>
  );
}
