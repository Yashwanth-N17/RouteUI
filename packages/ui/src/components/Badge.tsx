import React from 'react';

interface BadgeProps {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
}

const methodStyles: Record<BadgeProps['method'], string> = {
  GET: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
  POST: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30',
  PUT: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
  DELETE: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
  PATCH: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30',
  HEAD: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border border-gray-500/30',
  OPTIONS: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border border-gray-500/30',
};

const Badge: React.FC<BadgeProps> = ({ method }) => {
  const style = methodStyles[method] ?? 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border border-gray-500/30';
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold font-mono tracking-wide min-w-[62px] text-center inline-block transition-colors ${style}`}>
      {method}
    </span>
  );
};

export default Badge;
