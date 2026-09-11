import React, { useState } from 'react';
import Badge from './Badge';
import RequestForm from './RequestForm';
import { InternalRoute, AuthConfig } from '../utils/api';

interface Props {
  route: InternalRoute;
  authConfig?: AuthConfig;
  baseUrl?: string;
  index?: number;
  highlight?: string;
}

const highlightText = (text: string, term: string): React.ReactNode => {
  if (!term) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-amber-200 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200 rounded px-0.5">{part}</mark>
      : part
  );
};

const methodThemes: Record<string, { border: string; bg: string; expandedBg: string }> = {
  GET: {
    border: 'border-swagger-get dark:border-swagger-get/60',
    bg: 'bg-sky-500/[0.08] hover:bg-sky-500/[0.14] dark:bg-sky-500/5 dark:hover:bg-sky-500/10',
    expandedBg: 'bg-sky-500/[0.12] dark:bg-sky-500/10',
  },
  POST: {
    border: 'border-swagger-post dark:border-swagger-post/60',
    bg: 'bg-emerald-500/[0.08] hover:bg-emerald-500/[0.14] dark:bg-emerald-500/5 dark:hover:bg-emerald-500/10',
    expandedBg: 'bg-emerald-500/[0.12] dark:bg-emerald-500/10',
  },
  PUT: {
    border: 'border-swagger-put dark:border-swagger-put/60',
    bg: 'bg-amber-500/[0.08] hover:bg-amber-500/[0.14] dark:bg-amber-500/5 dark:hover:bg-amber-500/10',
    expandedBg: 'bg-amber-500/[0.12] dark:bg-amber-500/10',
  },
  DELETE: {
    border: 'border-swagger-delete dark:border-swagger-delete/60',
    bg: 'bg-rose-500/[0.08] hover:bg-rose-500/[0.14] dark:bg-rose-500/5 dark:hover:bg-rose-500/10',
    expandedBg: 'bg-rose-500/[0.12] dark:bg-rose-500/10',
  },
  PATCH: {
    border: 'border-swagger-patch dark:border-swagger-patch/60',
    bg: 'bg-teal-500/[0.08] hover:bg-teal-500/[0.14] dark:bg-teal-500/5 dark:hover:bg-teal-500/10',
    expandedBg: 'bg-teal-500/[0.12] dark:bg-teal-500/10',
  },
  HEAD: {
    border: 'border-swagger-head dark:border-swagger-head/60',
    bg: 'bg-slate-500/[0.08] hover:bg-slate-500/[0.14] dark:bg-slate-500/5 dark:hover:bg-slate-500/10',
    expandedBg: 'bg-slate-500/[0.12] dark:bg-slate-500/10',
  },
  OPTIONS: {
    border: 'border-swagger-options dark:border-swagger-options/60',
    bg: 'bg-slate-500/[0.08] hover:bg-slate-500/[0.14] dark:bg-slate-500/5 dark:hover:bg-slate-500/10',
    expandedBg: 'bg-slate-500/[0.12] dark:bg-slate-500/10',
  },
};

const RouteCard: React.FC<Props> = ({ route, authConfig, baseUrl, index = 0, highlight = '' }) => {
  const [expanded, setExpanded] = useState(false);
  const [isTryItOut, setIsTryItOut] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const toggle = () => setExpanded((prev) => !prev);
  const theme = methodThemes[route.method] ?? methodThemes.HEAD;

  const handleCancel = () => {
    setIsTryItOut(false);
    setResetKey((prev) => prev + 1);
  };

  return (
    <div
      style={{ animationDelay: `${index * 50}ms` }}
      className={`animate-slideUp border rounded-xl shadow-xs transition-all duration-200 overflow-hidden ${
        theme.border
      } ${expanded ? theme.expandedBg : theme.bg}`}
    >
      <div
        className="flex items-center justify-between p-3.5 sm:p-4 cursor-pointer transition-colors"
        onClick={toggle}
      >
        <div className="flex items-center space-x-3.5 min-w-0">
          <Badge method={route.method} />
          <code className={`text-sm sm:text-base font-mono font-bold text-gray-950 dark:text-gray-100 truncate ${route.deprecated ? 'line-through opacity-60' : ''}`}>
            {highlightText(route.path, highlight)}
          </code>
          {route.deprecated && (
            <span className="text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">
              Deprecated
            </span>
          )}
          {route.tags && route.tags.length > 0 && (
            <div className="hidden md:flex items-center space-x-1 shrink-0">
              {route.tags.map((tag, i) => (
                <span key={i} className="text-[10px] bg-white/90 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-md font-medium border border-gray-300 dark:border-zinc-700 shadow-2xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white p-1 transition-transform"
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
        <div className="p-5 border-t border-inherit bg-white dark:bg-zinc-900 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
              API Specification
            </h4>
            {isTryItOut ? (
              <button
                type="button"
                onClick={handleCancel}
                className="border border-rose-500 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsTryItOut(true)}
                className="border border-gray-400 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-900 dark:text-gray-100 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-all"
              >
                Try it out
              </button>
            )}
          </div>

          {route.description && (
            <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 bg-gray-50/70 dark:bg-zinc-800/60 p-3 rounded-xl border border-gray-300 dark:border-zinc-700">
              <strong className="text-gray-800 dark:text-gray-300 block mb-1 uppercase text-[11px] font-bold tracking-wider">Description</strong>
              {route.description}
            </div>
          )}
          <div className="bg-gray-50/70 dark:bg-zinc-800/60 p-3 rounded-xl border border-gray-300 dark:border-zinc-700 text-xs sm:text-sm">
            <strong className="text-gray-800 dark:text-gray-300 block mb-1.5 uppercase text-[11px] font-bold tracking-wider">Handler</strong>
            <div className="flex flex-wrap gap-1.5">
              {route.handlers.map((h, i) => (
                <span key={i} className="font-mono bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30 rounded-md px-2 py-0.5 text-xs font-semibold">
                  {h}
                </span>
              ))}
            </div>
          </div>
          {route.responses && Object.keys(route.responses).length > 0 && (
            <div className="bg-gray-50/70 dark:bg-zinc-800/60 p-3 rounded-xl border border-gray-300 dark:border-zinc-700 space-y-2">
              <strong className="text-gray-800 dark:text-gray-300 block uppercase text-[11px] font-bold tracking-wider">
                Expected Responses
              </strong>
              <div className="space-y-1.5">
                {Object.entries(route.responses).map(([code, { description }]) => {
                  const status = Number(code);
                  const isSuccess = status >= 200 && status < 300;
                  const isClient = status >= 400 && status < 500;
                  return (
                    <div key={code} className="flex items-center space-x-3 text-xs font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] border ${
                        isSuccess
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          : isClient
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                      }`}>
                        {code}
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 font-sans">{description}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <RequestForm
            key={resetKey}
            route={route}
            authConfig={authConfig}
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
