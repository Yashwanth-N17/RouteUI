import React from 'react';

interface BadgeProps {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
}

const methodColors: Record<BadgeProps['method'], string> = {
  GET: 'bg-emerald-600 dark:bg-emerald-500 text-white',
  POST: 'bg-blue-600 dark:bg-blue-500 text-white',
  PUT: 'bg-amber-600 dark:bg-amber-500 text-white',
  DELETE: 'bg-rose-600 dark:bg-rose-500 text-white',
  PATCH: 'bg-purple-600 dark:bg-purple-500 text-white',
  HEAD: 'bg-gray-600 dark:bg-gray-500 text-white',
  OPTIONS: 'bg-gray-600 dark:bg-gray-500 text-white',
};

const Badge: React.FC<BadgeProps> = ({ method }) => {
  const color = methodColors[method] ?? 'bg-gray-600 text-white';
  return (
    <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono tracking-wider shadow-sm min-w-[55px] text-center inline-block ${color}`}>
      {method}
    </span>
  );
};

export default Badge;
