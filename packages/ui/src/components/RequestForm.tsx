import React, { useState } from 'react';
import { InternalRoute, fillPathParams } from '../utils/api';

interface RequestFormProps {
  route: InternalRoute;
  bearerToken?: string;
}

interface KeyValue {
  key: string;
  value: string;
}

// Simple regex-based syntax highlighter for JSON
const colorizeJson = (jsonString: string) => {
  const escaped = jsonString
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'text-amber-400'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-blue-400 font-semibold'; // key
        } else {
          cls = 'text-emerald-400'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-purple-400 font-semibold'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-gray-500 italic'; // null
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
};

const RequestForm: React.FC<RequestFormProps> = ({ route, bearerToken }) => {
  const paramNames = Array.from(route.path.matchAll(/:([a-zA-Z0-9_]+)/g)).map((m) => m[1]);

  const [pathParams, setPathParams] = useState<Record<string, string>>(
    paramNames.reduce((acc, name) => ({ ...acc, [name]: '' }), {})
  );
  const [queryParams, setQueryParams] = useState<KeyValue[]>([]);
  const [headerParams, setHeaderParams] = useState<KeyValue[]>([]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<null | {
    status: number;
    headers: Record<string, string>;
    body: string;
  }>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePathChange = (name: string, value: string) => {
    setPathParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeyValueChange = (
    list: KeyValue[],
    setList: React.Dispatch<React.SetStateAction<KeyValue[]>>,
    index: number,
    field: 'key' | 'value',
    val: string
  ) => {
    const newList = [...list];
    newList[index] = { ...newList[index], [field]: val };
    setList(newList);
  };

  const addRow = (setList: React.Dispatch<React.SetStateAction<KeyValue[]>>) => {
    setList((prev) => [...prev, { key: '', value: '' }]);
  };

  const buildUrl = () => {
    const filledPath = fillPathParams(route.path, pathParams);
    const url = new URL(filledPath, window.location.origin);
    queryParams.forEach(({ key, value }) => {
      if (key) url.searchParams.append(key, value);
    });
    return url.toString();
  };

  const sendRequest = async () => {
    setSending(true);
    setError(null);
    setResponse(null);
    try {
      const url = buildUrl();
      const headers = new Headers();
      let hasManualAuth = false;
      headerParams.forEach(({ key, value }) => {
        if (key) {
          headers.append(key, value);
          if (key.toLowerCase() === 'authorization') {
            hasManualAuth = true;
          }
        }
      });
      if (bearerToken && !hasManualAuth) {
        headers.set('Authorization', `Bearer ${bearerToken}`);
      }
      const options: RequestInit = {
        method: route.method,
        headers,
      };
      if (['POST', 'PUT', 'PATCH'].includes(route.method) && body) {
        try {
          JSON.parse(body);
        } catch {
          throw new Error('Invalid JSON body');
        }
        options.body = body;
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json');
        }
      }
      const res = await fetch(url, options);
      const text = await res.text();
      let pretty = text;
      try {
        const json = JSON.parse(text);
        pretty = JSON.stringify(json, null, 2);
      } catch {}
      const respHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        respHeaders[k] = v;
      });
      setResponse({ status: res.status, headers: respHeaders, body: pretty });
    } catch (e: any) {
      setError(e.message || 'Request failed');
    } finally {
      setSending(false);
    }
  };

  const bodyLines = response ? response.body.split('\n') : [];

  return (
    <div className="space-y-5 pt-3 border-t border-gray-200/60 dark:border-[#1f1f1f]">
      {/* Live Request URL Preview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-100/70 dark:bg-[#161616] border border-gray-200/80 dark:border-[#1f1f1f] rounded-xl p-3 text-xs font-mono">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-gray-400 font-semibold uppercase tracking-wider text-[11px] shrink-0">Request URL</span>
          <span className="text-blue-600 dark:text-blue-400 font-medium truncate select-all">{buildUrl()}</span>
        </div>
      </div>

      {/* Path params */}
      {paramNames.length > 0 && (
        <div className="bg-gray-50/80 dark:bg-[#161616] border border-gray-200/80 dark:border-[#1f1f1f] rounded-xl p-4 space-y-3">
          <strong className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Path Parameters
          </strong>
          {paramNames.map((name) => (
            <div key={name} className="relative">
              <input
                type="text"
                placeholder={`:${name}`}
                value={pathParams[name] ?? ''}
                onChange={(e) => handlePathChange(name, e.target.value)}
                className="w-full px-3 py-2 text-sm border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-0 font-mono transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>
          ))}
        </div>
      )}

      {/* Query params */}
      <div className="bg-gray-50/80 dark:bg-[#161616] border border-gray-200/80 dark:border-[#1f1f1f] rounded-xl p-4 space-y-3">
        <strong className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Query Parameters
        </strong>
        {queryParams.map((kv, i) => (
          <div key={i} className="flex space-x-3">
            <input
              type="text"
              placeholder="Key"
              value={kv.key}
              onChange={(e) =>
                handleKeyValueChange(queryParams, setQueryParams, i, 'key', e.target.value)
              }
              className="flex-1 px-3 py-1.5 text-sm border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-0 font-mono transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
            <input
              type="text"
              placeholder="Value"
              value={kv.value}
              onChange={(e) =>
                handleKeyValueChange(queryParams, setQueryParams, i, 'value', e.target.value)
              }
              className="flex-1 px-3 py-1.5 text-sm border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-0 font-mono transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => addRow(setQueryParams)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
        >
          + Add query parameter
        </button>
      </div>

      {/* Header params */}
      <div className="bg-gray-50/80 dark:bg-[#161616] border border-gray-200/80 dark:border-[#1f1f1f] rounded-xl p-4 space-y-3">
        <strong className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Headers
        </strong>
        {headerParams.map((kv, i) => (
          <div key={i} className="flex space-x-3">
            <input
              type="text"
              placeholder="Header"
              value={kv.key}
              onChange={(e) =>
                handleKeyValueChange(headerParams, setHeaderParams, i, 'key', e.target.value)
              }
              className="flex-1 px-3 py-1.5 text-sm border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-0 font-mono transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
            <input
              type="text"
              placeholder="Value"
              value={kv.value}
              onChange={(e) =>
                handleKeyValueChange(headerParams, setHeaderParams, i, 'value', e.target.value)
              }
              className="flex-1 px-3 py-1.5 text-sm border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-0 font-mono transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => addRow(setHeaderParams)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
        >
          + Add header
        </button>
        {bearerToken && (
          <p className="text-xs italic text-gray-400 dark:text-gray-500 pt-1">
            Global Bearer token will be applied
          </p>
        )}
      </div>

      {/* Body */}
      {['POST', 'PUT', 'PATCH'].includes(route.method) && (
        <div className="bg-gray-50/80 dark:bg-[#161616] border border-gray-200/80 dark:border-[#1f1f1f] rounded-xl p-4 space-y-3">
          <strong className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            JSON Body
          </strong>
          <textarea
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full p-3 text-sm font-mono border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-0 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
            placeholder='{\n  "key": "value"\n}'
          />
        </div>
      )}

      {/* Send button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 pt-1">
        <button
          type="button"
          onClick={sendRequest}
          disabled={sending}
          className={`w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-75 transition-all flex items-center justify-center space-x-2 ${
            sending ? 'animate-pulse' : ''
          }`}
        >
          {sending ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Executing...</span>
            </>
          ) : (
            <span>Execute Request</span>
          )}
        </button>
        {error && <span className="text-red-500 dark:text-red-400 text-sm font-medium">{error}</span>}
      </div>

      {/* Response Display */}
      {response && (
        <div className="animate-slideUp mt-6 border border-gray-200/80 dark:border-[#1f1f1f] rounded-2xl bg-[#0d1117] text-gray-100 overflow-hidden shadow-2xl">
          {/* Status Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800 bg-[#161b22]">
            <div className="flex items-center space-x-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Status:</span>
              <span className={`text-2xl font-bold font-mono ${
                response.status >= 200 && response.status < 300
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}>
                {response.status}
              </span>
            </div>
            <span className="text-xs font-mono text-gray-500">HTTP/1.1</span>
          </div>

          {/* Response Headers */}
          <div className="p-4 border-b border-gray-800/60 bg-[#0d1117]/80">
            <strong className="text-xs uppercase tracking-wider font-semibold text-gray-400 block mb-2">Response Headers</strong>
            <div className="font-mono text-xs text-gray-300 space-y-1 max-h-32 overflow-auto pr-2">
              {Object.entries(response.headers).map(([k, v]) => (
                <div key={k} className="flex">
                  <span className="text-blue-400 shrink-0 font-medium">{k}:</span>
                  <span className="text-gray-300 ml-2 truncate">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Response Body with Line Numbers */}
          <div className="p-4 font-mono text-xs overflow-x-auto max-h-96">
            <strong className="text-xs uppercase tracking-wider font-semibold text-gray-400 block mb-2">Response Body</strong>
            <div className="table w-full">
              {bodyLines.map((line, idx) => (
                <div key={idx} className="table-row hover:bg-gray-800/30">
                  <span className="table-cell select-none text-right pr-4 text-gray-600 text-[11px] w-8">
                    {idx + 1}
                  </span>
                  <span
                    className="table-cell whitespace-pre text-gray-200"
                    dangerouslySetInnerHTML={{ __html: colorizeJson(line) }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestForm;
