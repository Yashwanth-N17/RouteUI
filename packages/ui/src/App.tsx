import React, { useEffect, useState, useCallback, useRef } from 'react';
import { InternalRoute, AuthConfig } from './utils/api';
import RouteCard from './components/RouteCard';
import AuthModal from './components/AuthModal';
import { LockClosedIcon, LockOpenIcon, SunIcon, MoonIcon, ServerStackIcon } from '@heroicons/react/24/outline';

const TOKEN_KEY = 'routeui_bearer_token';
const BASE_URL_KEY = 'routeui_base_url';

const App: React.FC = () => {
  const [routes, setRoutes] = useState<InternalRoute[]>([]);
  const [version, setVersion] = useState<string>('0.1.0');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingOpenApi, setDownloadingOpenApi] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);

  const [baseUrl, setBaseUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(BASE_URL_KEY) || window.location.origin;
    }
    return 'http://localhost:3000';
  });

  const [authConfig, setAuthConfig] = useState<AuthConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('routeui_auth_config');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
      const oldToken = sessionStorage.getItem('routeui_bearer_token');
      if (oldToken) {
        const migrated: AuthConfig = { type: 'bearer', token: oldToken };
        sessionStorage.setItem('routeui_auth_config', JSON.stringify(migrated));
        sessionStorage.removeItem('routeui_bearer_token');
        return migrated;
      }
    }
    return { type: 'none' };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSaveAuth = (newConfig: AuthConfig) => {
    setAuthConfig(newConfig);
    if (newConfig.type !== 'none') {
      sessionStorage.setItem('routeui_auth_config', JSON.stringify(newConfig));
    } else {
      sessionStorage.removeItem('routeui_auth_config');
    }
  };

  const handleClearAuth = () => {
    setAuthConfig({ type: 'none' });
    sessionStorage.removeItem('routeui_auth_config');
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

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    setError(null);
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
        throw new Error('Expected JSON from /__routeui/routes');
      }
      const data: InternalRoute[] = await res.json();
      setRoutes(data);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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
    <div className="min-h-full flex flex-col bg-gray-50/70 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="h-16 h-16-override sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between border-b-2 border-gray-300 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-8 h-8 rounded-lg bg-fastapi/15 border border-fastapi/40 flex items-center justify-center text-fastapi dark:text-swagger-post shrink-0">
            <ServerStackIcon className="w-5 h-5 text-fastapi dark:text-swagger-post" aria-label="RouteUI" />
          </div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-extrabold tracking-tight text-gray-950 dark:text-gray-100">
              RouteUI
            </h1>
            <span className="text-[11px] font-mono font-bold bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-md border border-gray-300 dark:border-zinc-700">
              v{version}
            </span>
            {routes.length > 0 && (
              <span className="text-[11px] font-mono font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md border border-gray-300 dark:border-zinc-700">
                {routes.length} routes
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative hidden sm:block">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3.5 py-1.5 pl-9 text-sm border-b-2 border-gray-400 dark:border-zinc-700 bg-transparent text-gray-950 dark:text-gray-100 focus:outline-none focus:border-fastapi focus:ring-0 w-56 font-sans placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
            />
            <svg
              className="w-4 h-4 text-gray-600 dark:text-gray-400 absolute left-2.5 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {!searchTerm && (
              <span className="absolute right-2.5 top-1.5 text-[10px] font-mono text-gray-700 dark:text-gray-300 border border-gray-400 dark:border-zinc-700 px-1.5 py-0.5 rounded font-bold">
                /
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 shadow-2xs ${
              authConfig.type !== 'none'
                ? 'bg-swagger-post/20 text-fastapi dark:text-swagger-post border-swagger-post'
                : 'border-swagger-post text-fastapi dark:text-swagger-post bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-swagger-post/10 dark:hover:bg-swagger-post/20'
            }`}
          >
            <span className="flex items-center space-x-1.5">
  {authConfig.type !== 'none' ? <LockOpenIcon className="w-4 h-4 text-swagger-post" aria-label="Authorized" /> : <LockClosedIcon className="w-4 h-4 text-fastapi dark:text-swagger-post" aria-label="Authorize" />}
  <span>{authConfig.type === 'none' ? 'Authorize' : (authConfig.type === 'bearer' ? 'Bearer Authorized' : authConfig.type === 'apikey' ? 'API Key Authorized' : 'Basic Authorized')}</span>
</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadOpenApi}
            disabled={downloadingOpenApi}
            className="bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-zinc-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 shrink-0 shadow-2xs"
          >
            {downloadingOpenApi ? 'Downloading...' : 'Download OpenAPI'}
          </button>

          <button
            type="button"
            onClick={fetchData}
            disabled={refreshing}
            className="p-2 rounded-xl text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-300 dark:border-zinc-700 transition-colors disabled:opacity-50"
            aria-label="Refresh routes"
            title="Refresh routes"
          >
            <svg
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            type="button"
            onClick={toggleDark}
            className="p-2 rounded-xl text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-300 dark:border-zinc-700 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Base URL Switcher Bar */}
      <div className="border-b-2 border-gray-300 dark:border-zinc-800 bg-white/60 dark:bg-transparent px-4 sm:px-8 py-2 flex items-center space-x-2 text-xs font-mono text-gray-800 dark:text-gray-300">
        <span className="font-bold text-gray-800 dark:text-gray-300 shrink-0">Base URL:</span>
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
          className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-xs font-mono text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
          placeholder="http://localhost:3000"
        />
      </div>

      {/* Main Content & Sidebar Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-8">
        {/* Desktop Sidebar Navigation */}
        {!loading && !error && groupKeys.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start space-y-2">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider px-3 mb-2">
              Route Groups
            </h3>
            <nav className="space-y-1">
              {groupKeys.map((group) => (
                <button
                  key={group}
                  onClick={() => scrollToGroup(group)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-200/80 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between group"
                >
                  <span className="capitalize truncate">{group === 'default' ? 'General' : group}</span>
                  <span className="text-[10px] font-mono font-bold bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-300 px-1.5 py-0.5 rounded-md border border-gray-300 dark:border-zinc-700">
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
              className="w-full px-3.5 py-2 text-sm border-b-2 border-gray-400 dark:border-zinc-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-fastapi font-sans placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />

            {!loading && !error && groupKeys.length > 0 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
                {groupKeys.map((group) => (
                  <button
                    key={group}
                    onClick={() => scrollToGroup(group)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-zinc-800 whitespace-nowrap capitalize shrink-0 shadow-2xs"
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
                <div key={n} className="relative overflow-hidden border rounded-2xl bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-6 rounded-full bg-gray-200 dark:bg-zinc-800" />
                    <div className="w-48 h-5 rounded bg-gray-200 dark:bg-zinc-800" />
                  </div>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-shimmer" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="border border-rose-500/40 bg-rose-500/10 rounded-2xl p-6 text-center space-y-3 max-w-md mx-auto my-8">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-600 flex items-center justify-center mx-auto text-lg font-bold">
                ✕
              </div>
              <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400">Failed to load routes</h3>
              <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
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
            <div className="border border-gray-300 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 p-10 text-center space-y-4 max-w-md mx-auto my-8 shadow-xs">
              <div className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-950 dark:text-gray-100">No routes detected</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                  Make sure <code className="font-mono bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-fastapi font-semibold">routeui()</code> middleware is registered on your app.
                </p>
              </div>
            </div>
          )}

          {/* Route Groups List */}
          {!loading && !error && groupKeys.length > 0 && (
            <div className="space-y-10">
              {Object.entries(groupedRoutes).map(([group, groupRoutes]: [string, InternalRoute[]]) => (
                <section key={group} id={`group-${group}`} className="space-y-4 scroll-mt-24">
                  <div className="flex items-center space-x-3 border-b-2 border-gray-300 dark:border-zinc-800 pb-3">
                    <h2 className="text-sm font-extrabold text-gray-950 dark:text-gray-100 tracking-tight uppercase tracking-wider">
                      {group === 'default' ? 'General Endpoints (/)' : group}
                    </h2>
                    <span className="text-xs bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 font-bold px-2.5 py-0.5 rounded-full border border-gray-300 dark:border-zinc-700">
                      {groupRoutes.length}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-3.5">
                    {groupRoutes.map((route, idx) => (
                      <RouteCard key={`${route.method}-${route.path}`} index={idx} route={route} authConfig={authConfig} baseUrl={baseUrl} highlight={searchTerm} />
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
        authConfig={authConfig}
        onSave={handleSaveAuth}
        onClear={handleClearAuth}
      />
    </div>
  );
};

export default App;
