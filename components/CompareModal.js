'use client';

import { useState, useEffect } from 'react';
import { X, GitCompare, Loader2 } from 'lucide-react';

export default function CompareModal({ onClose, onSubmit, loading, error }) {
  const [url, setUrl] = useState('');

  // Lock body scroll and handle ESC key while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e) {
      if (e.key === 'Escape' && !loading) onClose();
    }
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [loading, onClose]);

  function handleSubmit(e) {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Panel */}
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/15 border border-blue-500/25 rounded-xl flex items-center justify-center flex-shrink-0">
              <GitCompare size={16} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Compare Channel</h2>
              <p className="text-xs text-zinc-500">Analyze a second channel side by side</p>
            </div>
          </div>
          {!loading && (
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-800 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              YouTube Channel URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="youtube.com/@channel or /channel/UC..."
              disabled={loading}
              autoFocus
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/70 transition-colors disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 leading-relaxed">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Fetching channel…
              </>
            ) : (
              <>
                <GitCompare size={14} />
                Compare
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
