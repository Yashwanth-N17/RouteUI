import React, { useState } from 'react';
import Badge from './Badge';
import RequestForm from './RequestForm';
import { InternalRoute } from '../utils/api';

interface Props {
  route: InternalRoute;
  bearerToken?: string;
  baseUrl?: string;
  index?: number;
}

const methodAccentColors: Record<string, string> = {
  GET: 'border-l-emerald-500',
  POST: 'border-l-blue-500',
  PUT: 'border-l-amber-500',
  DELETE: 'border-l-rose-500',
  PATCH: 'border-l-purple-500',
  HEAD: 'border-l-gray-500',
  OPTIONS: 'border-l-gray-500',
};

const RouteCard: React.FC<Props> = ({ route, bearerToken, baseUrl, index = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const [isTryItOut, setIsTryItOut] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const toggle = () => setExpanded((prev) => !prev);
  const accentColor = methodAccentColors[route.method] ?? 'border-l-gray-500';

  const handleCancel = () => {
    setIsTryItOut(false);
    setResetKey((prev) => prev + 1);
  };

  return (
    <div
      style={{ animationDelay: `${index * 50}ms` }}
      className={`animate-slideUp border rounded-2xl bg-white dark:bg-[#111111] border-gray-200/80 dark:border-[#1f1f1f] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
        expanded ? `border-l-4 ${accentColor}` : ''
      }`}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/60 dark:hover:bg-[#161616] transition-colors"
        onClick={toggle}
      >
        <div className="flex items-center space-x-3.5 min-w-0">
          <Badge method={route.method} />
          <code className={`text-base font-mono font-medium text-gray-900 dark:text-gray-100 truncate ${route.deprecated ? 'line-through opacity-60' : ''}`}>
            {route.path}
          </code>
          {route.deprecated && (
            <span className="text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
              Deprecated
            </span>
          )}
          {route.tags && route.tags.length > 0 && (
            <div className="hidden md:flex items-center space-x-1 shrink-0">
              {route.tags.map((tag, i) => (
                <span key={i} className="text-[10px] bg-gray-100 dark:bg-[#1f1f1f] text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          {route.middleware.length > 0 && (
            <span className="hidden sm:inline-block text-xs bg-gray-100 dark:bg-[#1f1f1f] text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-md font-medium">
              {route.middleware.length} middleware
            </span>
          )}
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 transition-transform"
            aria-label="Toggle details"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expanded ? 'max-h-[2500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-5 border-t border-gray-100 dark:border-[#1f1f1f] bg-gray-50/30 dark:bg-[#0d0d0d] space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              API Specification
            </h4>
            {isTryItOut ? (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 dark:bg-[#1f1f1f] hover:bg-gray-300 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsTryItOut(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs font-semibold rounded-xl transition-all"
              >
                Try it out
              </button>
            )}
          </div>

          {route.description && (
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-[#161616] p-3 rounded-xl border border-gray-200/60 dark:border-[#1f1f1f]">
              <strong className="text-gray-500 dark:text-gray-400 block mb-1 uppercase text-[11px] font-semibold tracking-wider">Description</strong>
              {route.description}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="bg-white dark:bg-[#161616] p-3 rounded-xl border border-gray-200/60 dark:border-[#1f1f1f]">
              <strong className="text-gray-500 dark:text-gray-400 block mb-1.5 uppercase text-[11px] font-semibold tracking-wider">Middleware</strong>
              {route.middleware.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {route.middleware.map((m, i) => (
                    <span key={i} className="font-mono bg-gray-100 dark:bg-[#222] text-gray-800 dark:text-gray-300 rounded-md px-2 py-0.5 text-xs border border-gray-200/50 dark:border-gray-800">
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400 dark:text-gray-600 italic">None</span>
              )}
            </div>
            <div className="bg-white dark:bg-[#161616] p-3 rounded-xl border border-gray-200/60 dark:border-[#1f1f1f]">
              <strong className="text-gray-500 dark:text-gray-400 block mb-1.5 uppercase text-[11px] font-semibold tracking-wider">Handler</strong>
              <div className="flex flex-wrap gap-1.5">
                {route.handlers.map((h, i) => (
                  <span key={i} className="font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-md px-2 py-0.5 text-xs font-medium">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <RequestForm
            key={resetKey}
            route={route}
            bearerToken={bearerToken}
            baseUrl={baseUrl}
            isTryItOut={isTryItOut}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default RouteCard;
