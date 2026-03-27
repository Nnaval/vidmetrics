'use client';

import {
  Search,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  List,
  Download,
} from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'views',      label: 'Views' },
  { value: 'likes',      label: 'Likes' },
  { value: 'comments',   label: 'Comments' },
  { value: 'date',       label: 'Date Published' },
  { value: 'engagement', label: 'Engagement Rate' },
  { value: 'velocity',   label: 'View Velocity' },
];

export default function SortFilter({
  sortBy,
  sortOrder,
  minViews,
  searchQuery,
  viewMode,
  onSortChange,
  onOrderChange,
  onMinViewsChange,
  onSearchChange,
  onViewModeChange,
  onExport,
  totalCount,
  filteredCount,
}) {
  const SortIcon = sortOrder === 'desc' ? ArrowDown : ArrowUp;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">

      {/* Row 1: Search + Sort by + Sort order */}
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search videos…"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 sm:px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors cursor-pointer min-w-0 flex-shrink-0"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => onOrderChange(sortOrder === 'desc' ? 'asc' : 'desc')}
          title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
          className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer flex-shrink-0"
        >
          <SortIcon size={13} />
          <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Desc' : 'Asc'}</span>
        </button>
      </div>

      {/* Row 2: Min views + result count + view toggle + export */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 whitespace-nowrap">Min views</span>
          <input
            type="number"
            value={minViews}
            onChange={(e) => onMinViewsChange(e.target.value)}
            placeholder="0"
            min="0"
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-white w-20 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        <span className="text-xs text-zinc-500 whitespace-nowrap">
          {filteredCount === totalCount
            ? `${totalCount} videos`
            : `${filteredCount} / ${totalCount}`}
        </span>

        {/* Push remaining controls to the right */}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex border border-zinc-700 rounded-lg overflow-hidden bg-zinc-800">
            <button
              onClick={() => onViewModeChange('grid')}
              title="Grid view"
              className={`p-2 transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-zinc-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              title="Table view"
              className={`p-2 transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-zinc-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <List size={14} />
            </button>
          </div>

          <button
            onClick={onExport}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:text-white transition-all cursor-pointer whitespace-nowrap"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>
      </div>

    </div>
  );
}
