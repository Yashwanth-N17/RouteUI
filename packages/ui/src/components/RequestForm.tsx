import React, { useState } from 'react';
import { InternalRoute, fillPathParams } from '../utils/api';

interface RequestFormProps {
  route: InternalRoute;
  bearerToken?: string;
  isTryItOut?: boolean;
  onCancel?: () => void;
}

interface KeyValue {
  key: string;
  value: string;
}

interface ResponseState {
  status: number;
  headers: Record<string, string>;
  body: string;
  duration: number;
}

interface HistoryEntry {
  id: string;
  timestamp: string;
  status: number;
  duration: number;
  method: string;
  path: string;
  body: string;
  headers: Record<string, string>;
}

/**
 * Simple regex-based syntax highlighter for JSON.
 * Security Note: Input strings are first sanitized by escaping standard HTML entities
 * (&, <, >) to prevent XSS injection prior to applying syntax highlighting spans.
 * Response headers and non-body text are rendered safely as standard React child nodes.
 */
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

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const getDurationColor = (ms: number): string => {
  if (ms < 200) return 'text-emerald-400';
  if (ms <= 1000) return 'text-amber-400';
  return 'text-rose-400';
};

const RequestForm: React.FC<RequestFormProps> = ({
  route,
  bearerToken,
  isTryItOut = false,
  onCancel,
}) => {
  const paramNames = Array.from(route.path.matchAll(/:([a-zA-Z0-9_]+)/g)).map((m) => m[1]);

  const [pathParams, setPathParams] = useState<Record<string, string>>(
    paramNames.reduce((acc, name) => ({ ...acc, [name]: '' }), {})
  );
  const [queryParams, setQueryParams] = useState<KeyValue[]>([]);
  const [headerParams, setHeaderParams] = useState<KeyValue[]>([]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<ResponseState | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

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

  const removeRow = (
    setList: React.Dispatch<React.SetStateAction<KeyValue[]>>,
    index: number
  ) => {
    setList((prev) => prev.filter((_, i) => i !== index));
  };

  const buildUrl = () => {
    const filledPath = fillPathParams(route.path, pathParams);
    const url = new URL(filledPath, window.location.origin);
    queryParams.forEach(({ key, value }) => {
      if (key) url.searchParams.append(key, value);
    });
    return url.toString();
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const handleCopyCurl = () => {
    const url = buildUrl();
    const headersList: string[] = [];
    let hasManualAuth = false;

    headerParams.forEach(({ key, value }) => {
      if (key) {
        headersList.push(`-H "${key}: ${value}"`);
        if (key.toLowerCase() === 'authorization') {
          hasManualAuth = true;
        }
      }
    });

    if (bearerToken && !hasManualAuth) {
      headersList.push(`-H "Authorization: Bearer ${bearerToken}"`);
    }

    let bodyStr = '';
    if (['POST', 'PUT', 'PATCH'].includes(route.method) && body) {
      if (!headerParams.some((h) => h.key.toLowerCase() === 'content-type')) {
        headersList.push(`-H "Content-Type: application/json"`);
      }
      bodyStr = ` -d '${body.replace(/'/g, "'\\''")}'`;
    }

    const headersStr = headersList.length > 0 ? ' ' + headersList.join(' ') : '';
    const curlCommand = `curl -X ${route.method} "${url}"${headersStr}${bodyStr}`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(curlCommand).then(() => {
        setCopiedCurl(true);
        setTimeout(() => setCopiedCurl(false), 2000);
      }).catch(() => {
        fallbackCopyTextToClipboard(curlCommand);
      });
    } else {
      fallbackCopyTextToClipboard(curlCommand);
    }
  };

  const sendRequest = async () => {
    setSending(true);
    setError(null);
    setResponse(null);
    const startTime = performance.now();
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
      const duration = Math.round(performance.now() - startTime);

      // Collect headers
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        resHeaders[k] = v;
      });

      let resBody = await res.text();
      try {
        const parsed = JSON.parse(resBody);
        resBody = JSON.stringify(parsed, null, 2);
      } catch {
        // Not JSON, leave raw text
      }

      const newResponse: ResponseState = {
        status: res.status,
        headers: resHeaders,
        body: resBody,
        duration,
      };

      setResponse(newResponse);

      // Push to history
      const newEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        status: res.status,
        duration,
        method: route.method,
        path: route.path,
        body: resBody,
        headers: resHeaders,
      };
      setHistory((prev) => [newEntry, ...prev].slice(0, 5));
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      setError(err.message ? `${err.message}` : `Request failed after ${formatDuration(duration)}`);
    } finally {
      setSending(false);
    }
  };

  const bodyLines = response ? response.body.split('\n') : [];
  const lockedClass = isTryItOut ? '' : 'pointer-events-none opacity-50';

  return (
    <div className="space-y-4 pt-1">
      {/* Path params */}
      {paramNames.length > 0 && (
        <div className={`bg-gray-50/80 dark:bg-[#161616] border border-gray-200/80 dark:border-[#1f1f1f] rounded-xl p-4 space-y-3 ${lockedClass}`}>
          <strong className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Path Parameters
          </strong>
          {paramNames.map((name) => (
            <div key={name} className="flex items-center space-x-3">
              <span className="w-28 text-xs font-mono text-gray-600 dark:text-gray-400 shrink-0 font-medium">
                :{name}
              </span>
              <input
                type="text"
                placeholder="Value"
                disabled={!isTryItOut}
                value={pathParams[name] || ''}
                onChange={(e) => handlePathChange(name, e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-0 font-mono transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>
          ))}
        </div>
      )}

      {/* Query params */}
      <div className={`bg-gray-50/80 dark:bg-[#161616] border border-gray-200/80 dark:border-[#1f1f1f] rounded-xl p-4 space-y-3 ${lockedClass}`}>
        <strong className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Query Parameters
        </strong>
        {queryParams.map((kv, i) => (
          <div key={i} className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Key"
              disabled={!isTryItOut}
              value={kv.key}
              onChange={(e) =>
                handleKeyValueChange(queryParams, setQueryParams, i, 'key', e.target.value)
              }
              className="flex-1 px-3 py-1.5 text-sm border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-0 font-mono transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
            <input
              type="text"
              placeholder="Value"
              disabled={!isTryItOut}
              value={kv.value}
              onChange={(e) =>
                handleKeyValueChange(queryParams, setQueryParams, i, 'value', e.target.value)
              }
              className="flex-1 px-3 py-1.5 text-sm border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-0 font-mono transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
            {isTryItOut && (
              <button
                type="button"
                onClick={() => removeRow(setQueryParams, i)}
                className="text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 transition-colors shrink-0"
                title="Remove query parameter"
                aria-label="Remove query parameter"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
        {isTryItOut && (
          <button
            type="button"
            onClick={() => addRow(setQueryParams)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
          >
            + Add query parameter
          </button>
        )}
      </div>

      {/* Header params */}
      <div className={`bg-gray-50/80 dark:bg-[#161616] border border-gray-200/80 dark:border-[#1f1f1f] rounded-xl p-4 space-y-3 ${lockedClass}`}>
        <strong className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Headers
        </strong>
        {headerParams.map((kv, i) => (
          <div key={i} className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Header"
              disabled={!isTryItOut}
              value={kv.key}
              onChange={(e) =>
                handleKeyValueChange(headerParams, setHeaderParams, i, 'key', e.target.value)
              }
              className="flex-1 px-3 py-1.5 text-sm border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-0 font-mono transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
            <input
              type="text"
              placeholder="Value"
              disabled={!isTryItOut}
              value={kv.value}
              onChange={(e) =>
                handleKeyValueChange(headerParams, setHeaderParams, i, 'value', e.target.value)
              }
              className="flex-1 px-3 py-1.5 text-sm border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-0 font-mono transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
            {isTryItOut && (
              <button
                type="button"
                onClick={() => removeRow(setHeaderParams, i)}
                className="text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 transition-colors shrink-0"
                title="Remove header"
                aria-label="Remove header"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
        {isTryItOut && (
          <button
            type="button"
            onClick={() => addRow(setHeaderParams)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
          >
            + Add header
          </button>
        )}
        {bearerToken && isTryItOut && (
          <p className="text-xs italic text-gray-400 dark:text-gray-500 pt-1">
            Global Bearer token will be applied
          </p>
        )}
      </div>

      {/* Body */}
      {['POST', 'PUT', 'PATCH'].includes(route.method) && (
        <div className={`bg-gray-50/80 dark:bg-[#161616] border border-gray-200/80 dark:border-[#1f1f1f] rounded-xl p-4 space-y-3 ${lockedClass}`}>
          <strong className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            JSON Body
          </strong>
          <textarea
            rows={5}
            disabled={!isTryItOut}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full p-3 text-sm font-mono border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-0 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
            placeholder='{\n  "key": "value"\n}'
          />
        </div>
      )}

      {/* Control buttons */}
      {isTryItOut && (
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

          <button
            type="button"
            onClick={handleCopyCurl}
            className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 dark:bg-[#1f1f1f] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-gray-800 dark:text-gray-200 text-sm font-semibold rounded-xl border border-gray-200/80 dark:border-gray-700 transition-all flex items-center justify-center space-x-2"
          >
            <span>{copiedCurl ? 'cURL Copied! ✓' : 'Copy cURL'}</span>
          </button>

          {error && <span className="text-red-500 dark:text-red-400 text-sm font-medium">{error}</span>}
        </div>
      )}

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
              <span className="text-gray-600 mx-2">|</span>
              <span className={`text-sm font-mono font-semibold ${getDurationColor(response.duration)}`}>
                {formatDuration(response.duration)}
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

      {/* History Panel */}
      {isTryItOut && history.length > 0 && (
        <div className="mt-6 border border-gray-200/80 dark:border-[#1f1f1f] rounded-2xl bg-white dark:bg-[#111111] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Request History ({history.length}/5)
            </h4>
            <button
              type="button"
              onClick={() => { setHistory([]); setExpandedHistoryId(null); }}
              className="text-xs font-semibold text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition"
            >
              Clear history
            </button>
          </div>

          <div className="space-y-2">
            {history.map((entry) => {
              const isExpanded = expandedHistoryId === entry.id;
              const isSuccess = entry.status >= 200 && entry.status < 300;
              const historyLines = entry.body.split('\n');

              return (
                <div
                  key={entry.id}
                  className="border border-gray-200/60 dark:border-[#1f1f1f] rounded-xl overflow-hidden bg-gray-50/50 dark:bg-[#161616]"
                >
                  <div
                    onClick={() => setExpandedHistoryId(isExpanded ? null : entry.id)}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100/60 dark:hover:bg-[#1f1f1f] transition-colors text-xs font-mono"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          isSuccess
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {entry.status}
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {entry.method}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500">
                        {entry.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`font-semibold ${getDurationColor(entry.duration)}`}>
                        {formatDuration(entry.duration)}
                      </span>
                      <svg
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-200/80 dark:border-[#1f1f1f] bg-[#0d1117] text-gray-100 overflow-hidden">
                      <div className="p-3 border-b border-gray-800/60 bg-[#0d1117]/80">
                        <strong className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block mb-1.5">
                          Response Headers
                        </strong>
                        <div className="font-mono text-xs text-gray-300 space-y-1 max-h-28 overflow-auto">
                          {Object.entries(entry.headers).map(([k, v]) => (
                            <div key={k} className="flex">
                              <span className="text-blue-400 shrink-0 font-medium">{k}:</span>
                              <span className="text-gray-300 ml-2 truncate">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 font-mono text-xs overflow-x-auto max-h-64">
                        <strong className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block mb-1.5">
                          Response Body
                        </strong>
                        <div className="table w-full">
                          {historyLines.map((line, idx) => (
                            <div key={idx} className="table-row hover:bg-gray-800/30">
                              <span className="table-cell select-none text-right pr-3 text-gray-600 text-[10px] w-6">
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
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestForm;
