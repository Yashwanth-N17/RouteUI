import React, { useEffect, useState } from 'react';
import { InternalRoute } from './utils/api';
import RouteCard from './components/RouteCard';

const App: React.FC = () => {
  const [routes, setRoutes] = useState<InternalRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch('/__routeui/routes');
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Expected JSON response from /__routeui/routes, but received non-JSON (HTML/text). Ensure backend middleware is mounted.');
        }
        const data: InternalRoute[] = await res.json();
        setRoutes(data);
      } catch (e: any) {
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
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

  const toggleDark = () => {
    setIsDark((prev) => !prev);
  };

  const [searchTerm, setSearchTerm] = useState('');

  const getGroupTag = (path: string): string => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return 'default';
    if (parts[0] === '__routeui') return 'internal';
    return `/${parts[0]}`;
  };

  const filteredRoutes = routes
    .filter((r) => !r.path.startsWith('/__routeui'))
    .filter((r) =>
      r.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.handlers.some((h) => h.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const groupedRoutes = filteredRoutes.reduce((acc, route) => {
    const tag = getGroupTag(route.path);
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(route);
    return acc;
  }, {} as Record<string, InternalRoute[]>);

  return (
    <div className="min-h-full flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">RouteUI Docs</h1>
          <span className="text-xs bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-semibold">
            FastAPI Style
          </span>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search routes or methods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3.5 py-1.5 border rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={toggleDark}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm border border-gray-300 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 shrink-0"
          >
            <span>{isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
          </button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full">
        {loading && <p className="text-center py-12 text-gray-500 font-medium">Loading routes...</p>}
        {error && (
          <div className="text-center text-red-600 py-12">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => { setLoading(true); setError(null); window.location.reload(); }}
              className="mt-3 px-4 py-1.5 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && routes.length === 0 && (
          <p className="text-center py-12 text-gray-500">No routes found.</p>
        )}

        {!loading && !error && Object.keys(groupedRoutes).length > 0 && (
          <div className="space-y-8">
            {Object.entries(groupedRoutes).map(([group, groupRoutes]: [string, InternalRoute[]]) => (
              <section key={group} className="space-y-3">
                <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 capitalize">
                    {group === 'default' ? 'General Endpoints (/)' : group}
                  </h2>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-2.5 py-0.5 rounded-full">
                    {groupRoutes.length} {groupRoutes.length === 1 ? 'route' : 'routes'}
                  </span>
                </div>
                <div className="flex flex-col space-y-3">
                  {groupRoutes.map((route, idx) => (
                    <RouteCard key={idx} route={route} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
