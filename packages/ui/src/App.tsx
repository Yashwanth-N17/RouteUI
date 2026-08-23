import React, { useEffect, useState } from 'react';
import { InternalRoute } from './utils/api';
import RouteCard from './components/RouteCard';
import AuthModal from './components/AuthModal';
import { LockClosedIcon, LockOpenIcon, SunIcon, MoonIcon, ServerStackIcon } from '@heroicons/react/24/outline';

const TOKEN_KEY = 'routeui_bearer_token';
const BASE_URL_KEY = 'routeui_base_url';

const App: React.FC = () => {
  const [routes, setRoutes] = useState<InternalRoute[]>([]);
  const [version, setVersion] = useState<string>('0.1.0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingOpenApi, setDownloadingOpenApi] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);

  const [baseUrl, setBaseUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(BASE_URL_KEY) || window.location.origin;
    }
    return 'http://localhost:3000';
  });

  const [bearerToken, setBearerToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(TOKEN_KEY) || '';
    }
    return '';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSaveToken = (newToken: string) => {
    setBearerToken(newToken);
    if (newToken) {
      // Bearer token stored in sessionStorage (clears automatically on tab close).
      // sessionStorage is accessible to any JS on the same origin — acceptable for a
      // local dev tool running on localhost. Do NOT use RouteUI in production without
      // authentication middleware protecting the /docs mount path.
      sessionStorage.setItem(TOKEN_KEY, newToken);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  };

  const handleClearToken = () => {
    setBearerToken('');
    sessionStorage.removeItem(TOKEN_KEY);
  };

  const getEndpointUrl = (endpoint: string) => {
    const pathname = window.location.pathname;
    const basePath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    return `${basePath}${endpoint}`;
  };

  const handleDownloadOpenApi = async () => {
    setDownloadingOpenApi(true);
    try {
      const res = await fetch(getEndpointUrl('/__routeui/openapi.json'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'openapi.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setToastError(err.message || 'Failed to download OpenAPI spec');
      setTimeout(() => setToastError(null), 3000);
    } finally {
      setDownloadingOpenApi(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch version
        try {
          const metaRes = await fetch(getEndpointUrl('/__routeui/meta'));
          if (metaRes.ok) {
            const metaData = await metaRes.json();
            if (metaData.version) setVersion(metaData.version);
          }
        } catch {}

        // Fetch routes
        const res = await fetch(getEndpointUrl('/__routeui/routes'));
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Expected JSON response from /__routeui/routes, but received non-JSON. Ensure backend middleware is mounted.');
        }
        const data: InternalRoute[] = await res.json();
        setRoutes(data);
      } catch (e: any) {
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDark = () => setIsDark((prev) => !prev);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoutes = routes.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.path.toLowerCase().includes(term) ||
      r.method.toLowerCase().includes(term) ||
      r.handlers.some((h) => h.toLowerCase().includes(term))
    );
  });

  const groupedRoutes = filteredRoutes.reduce((acc, route) => {
    const segments = route.path.split('/').filter(Boolean);
    let group = 'default';
    if (segments.length > 0) {
      const first = segments[0];
      if (!first.startsWith(':')) {
        group = first;
      }
    }
    if (!acc[group]) acc[group] = [];
    acc[group].push(route);
    return acc;
  }, {} as Record<string, InternalRoute[]>);

  const groupKeys = Object.keys(groupedRoutes);

  const scrollToGroup = (group: string) => {
    const el = document.getElementById(`group-${group}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#f8f8f8] dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="h-16 h-16-override sticky top-0 z-40 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between border-b border-gray-200/80 dark:border-[#1f1f1f]">
        <div className="flex items-center space-x-3.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <ServerStackIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-label="RouteUI" />
          </div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100">
              RouteUI
            </h1>
            <span className="text-[11px] font-mono font-medium bg-gray-100 dark:bg-[#1f1f1f] text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md border border-gray-200/60 dark:border-gray-800">
              v{version}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3.5 py-1.5 pl-9 text-sm border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-0 w-56 font-sans placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-colors"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
              bearerToken
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-gray-100 dark:bg-[#161616] hover:bg-gray-200 dark:hover:bg-[#1f1f1f] text-gray-700 dark:text-gray-300 border-gray-200/80 dark:border-[#1f1f1f]'
            }`}
          >
            <span className="flex items-center space-x-1">
  {bearerToken ? <LockOpenIcon className="w-4 h-4" aria-label="Authorized" /> : <LockClosedIcon className="w-4 h-4" aria-label="Authorize" />}
  {bearerToken ? 'Authorized' : 'Authorize'}
</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadOpenApi}
            disabled={downloadingOpenApi}
            className="bg-gray-100 dark:bg-[#161616] hover:bg-gray-200 dark:hover:bg-[#1f1f1f] text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-[#1f1f1f] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 shrink-0"
          >
            {downloadingOpenApi ? 'Downloading...' : 'Download OpenAPI'}
          </button>

          <button
            type="button"
            onClick={toggleDark}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#161616] border border-transparent dark:border-[#1f1f1f] transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Base URL Switcher Bar */}
      <div className="border-b border-gray-200 dark:border-[#1f1f1f] bg-transparent px-4 sm:px-8 py-2 flex items-center space-x-2 text-xs font-mono text-gray-600 dark:text-gray-400">
        <span className="font-semibold text-gray-500 dark:text-gray-400 shrink-0">Base URL:</span>
        {baseUrl !== window.location.origin && (
          <span
            className="w-2 h-2 rounded-full bg-amber-500 shrink-0 inline-block animate-pulse"
            title="Requests will be sent to an external server"
          />
        )}
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          onBlur={() => {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(BASE_URL_KEY, baseUrl);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem(BASE_URL_KEY, baseUrl);
              }
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-xs font-mono text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
          placeholder="http://localhost:3000"
        />
      </div>

      {/* Main Content & Sidebar Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-8">
        {/* Desktop Sidebar Navigation */}
        {!loading && !error && groupKeys.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
              Route Groups
            </h3>
            <nav className="space-y-1">
              {groupKeys.map((group) => (
                <button
                  key={group}
                  onClick={() => scrollToGroup(group)}
                  className="w-full text-left px-3 py-2 text-xs font-medium rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-[#161616] transition-colors flex items-center justify-between group"
                >
                  <span className="capitalize truncate">{group === 'default' ? 'General' : group}</span>
                  <span className="text-[10px] font-mono bg-gray-200/70 dark:bg-[#1f1f1f] text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md">
                    {groupedRoutes[group].length}
                  </span>
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* Center Content Column (max 768px) */}
        <main className="flex-1 max-w-[768px] mx-auto w-full space-y-6">
          {/* Mobile Search & Tab Strip */}
          <div className="block sm:hidden space-y-3">
            <input
              type="text"
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 font-sans placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />

            {!loading && !error && groupKeys.length > 0 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
                {groupKeys.map((group) => (
                  <button
                    key={group}
                    onClick={() => scrollToGroup(group)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-200/60 dark:bg-[#161616] text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-[#1f1f1f] whitespace-nowrap capitalize shrink-0"
                  >
                    {group === 'default' ? 'General' : group} ({groupedRoutes[group].length})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Skeleton Shimmer Loading State */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="relative overflow-hidden border rounded-2xl bg-white dark:bg-[#111111] border-gray-200/80 dark:border-[#1f1f1f] p-5 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-6 rounded-full bg-gray-200 dark:bg-[#1f1f1f]" />
                    <div className="w-48 h-5 rounded bg-gray-200 dark:bg-[#1f1f1f]" />
                  </div>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-shimmer" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="border border-rose-500/20 bg-rose-500/10 rounded-2xl p-6 text-center space-y-3 max-w-md mx-auto my-8">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto text-lg font-bold">
                ✕
              </div>
              <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400">Failed to load routes</h3>
              <p className="text-xs text-rose-500/80 dark:text-rose-400/80">{error}</p>
              <button
                type="button"
                onClick={() => { setLoading(true); setError(null); window.location.reload(); }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition"
              >
                Retry Request
              </button>
            </div>
          )}

          {/* Empty Routes State */}
          {!loading && !error && routes.length === 0 && (
            <div className="border border-gray-200/80 dark:border-[#1f1f1f] rounded-2xl bg-white dark:bg-[#111111] p-10 text-center space-y-4 max-w-md mx-auto my-8">
              <div className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">No routes detected</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  Make sure <code className="font-mono bg-gray-100 dark:bg-[#1f1f1f] px-1 py-0.5 rounded text-blue-500">routeui()</code> middleware is registered on your app.
                </p>
              </div>
            </div>
          )}

          {/* Route Groups List */}
          {!loading && !error && groupKeys.length > 0 && (
            <div className="space-y-10">
              {Object.entries(groupedRoutes).map(([group, groupRoutes]: [string, InternalRoute[]]) => (
                <section key={group} id={`group-${group}`} className="space-y-4 scroll-mt-24">
                  <div className="flex items-center space-x-3 border-b border-gray-200/60 dark:border-[#1f1f1f] pb-3">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight uppercase tracking-wider">
                      {group === 'default' ? 'General Endpoints (/)' : group}
                    </h2>
                    <span className="text-xs bg-gray-200/60 dark:bg-[#161616] text-gray-600 dark:text-gray-400 font-semibold px-2.5 py-0.5 rounded-full border border-gray-200/80 dark:border-[#1f1f1f]">
                      {groupRoutes.length}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-3.5">
                    {groupRoutes.map((route, idx) => (
                      <RouteCard key={`${route.method}-${route.path}`} index={idx} route={route} bearerToken={bearerToken} baseUrl={baseUrl} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>

      {toastError && (
        <div className="fixed bottom-4 right-4 bg-rose-600 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg z-50 animate-slideUp">
          {toastError}
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        token={bearerToken}
        onSave={handleSaveToken}
        onClear={handleClearToken}
      />
    </div>
  );
};

export default App;
