import React from 'react';

interface BadgeProps {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
}

const methodStyles: Record<BadgeProps['method'], string> = {
  GET: 'bg-swagger-get text-white',
  POST: 'bg-swagger-post text-white',
  PUT: 'bg-swagger-put text-white',
  DELETE: 'bg-swagger-delete text-white',
  PATCH: 'bg-swagger-patch text-gray-900',
  HEAD: 'bg-swagger-head text-white',
  OPTIONS: 'bg-swagger-options text-white',
};

const Badge: React.FC<BadgeProps> = ({ method }) => {
  const style = methodStyles[method] ?? 'bg-gray-500 text-white';
  return (
    <span className={`px-3 py-1 rounded-md text-xs font-bold font-mono tracking-wider min-w-[70px] text-center inline-block shadow-xs transition-all ${style}`}>
      {method}
    </span>
  );
};

export default Badge;
