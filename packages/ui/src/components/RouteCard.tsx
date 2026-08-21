import React, { useState } from 'react';
import Badge from './Badge';
import RequestForm from './RequestForm';
import { InternalRoute } from '../utils/api';

interface Props {
  route: InternalRoute;
  bearerToken?: string;
}

const RouteCard: React.FC<Props> = ({ route, bearerToken }) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => setExpanded((prev) => !prev);

  return (
    <div className="border border-gray-200 dark:border-gray-700/80 rounded-xl shadow-sm bg-white dark:bg-gray-800/90 transition hover:shadow-md overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition"
        onClick={toggle}
      >
        <div className="flex items-center space-x-3">
          <Badge method={route.method} />
          <code className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700/60 px-2 py-0.5 rounded border border-gray-200/60 dark:border-gray-600/40">
            {route.path}
          </code>
        </div>
        <div className="flex items-center space-x-3">
          {route.middleware.length > 0 && (
            <span className="hidden sm:inline-block text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-medium">
              {route.middleware.length} middleware
            </span>
          )}
          <button className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-1">
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <strong className="text-gray-700 dark:text-gray-300 block mb-1">Middleware:</strong>
              {route.middleware.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {route.middleware.map((m, i) => (
                    <span key={i} className="font-mono bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded px-1.5 py-0.5">
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400 dark:text-gray-500 italic">None</span>
              )}
            </div>
            <div>
              <strong className="text-gray-700 dark:text-gray-300 block mb-1">Handler:</strong>
              <div className="flex flex-wrap gap-1">
                {route.handlers.map((h, i) => (
                  <span key={i} className="font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 rounded px-1.5 py-0.5">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <RequestForm route={route} bearerToken={bearerToken} />
        </div>
      )}
    </div>
  );
};

export default RouteCard;
