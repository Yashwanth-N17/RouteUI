import React, { useState } from 'react';
import { InternalRoute, fillPathParams } from '../utils/api';

interface RequestFormProps {
  route: InternalRoute;
}

interface KeyValue {
  key: string;
  value: string;
}

const RequestForm: React.FC<RequestFormProps> = ({ route }) => {
  // Extract param names like :id from the path
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
      headerParams.forEach(({ key, value }) => {
        if (key) headers.append(key, value);
      });
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
      // Try to pretty‑print JSON, fall back to raw text
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

  return (
    <div className="space-y-4 pt-3 border-t border-gray-200 dark:border-gray-700/80">
      {/* Live Request URL Preview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-lg p-2.5 text-xs font-mono">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-gray-500 font-bold uppercase shrink-0">Request URL:</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold truncate select-all">{buildUrl()}</span>
        </div>
      </div>

      {/* Path params */}
      {paramNames.length > 0 && (
        <div>
          <strong className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
            Path Parameters
          </strong>
          {paramNames.map((name) => (
            <input
              key={name}
              type="text"
              placeholder={`:${name}`}
              value={pathParams[name] ?? ''}
              onChange={(e) => handlePathChange(name, e.target.value)}
              className="w-full mb-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>
      )}
      {/* Query params */}
      <div>
        <strong className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
          Query Parameters
        </strong>
        {queryParams.map((kv, i) => (
          <div key={i} className="flex space-x-2 mb-1.5">
            <input
              type="text"
              placeholder="key"
              value={kv.key}
              onChange={(e) =>
                handleKeyValueChange(queryParams, setQueryParams, i, 'key', e.target.value)
              }
              className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="value"
              value={kv.value}
              onChange={(e) =>
                handleKeyValueChange(queryParams, setQueryParams, i, 'value', e.target.value)
              }
              className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <button
          onClick={() => addRow(setQueryParams)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          + Add query param
        </button>
      </div>
      {/* Header params */}
      <div>
        <strong className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
          Headers
        </strong>
        {headerParams.map((kv, i) => (
          <div key={i} className="flex space-x-2 mb-1.5">
            <input
              type="text"
              placeholder="Header"
              value={kv.key}
              onChange={(e) =>
                handleKeyValueChange(headerParams, setHeaderParams, i, 'key', e.target.value)
              }
              className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Value"
              value={kv.value}
              onChange={(e) =>
                handleKeyValueChange(headerParams, setHeaderParams, i, 'value', e.target.value)
              }
              className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <button
          onClick={() => addRow(setHeaderParams)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          + Add header
        </button>
      </div>
      {/* Body */}
      {['POST', 'PUT', 'PATCH'].includes(route.method) && (
        <div>
          <strong className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
            JSON Body
          </strong>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full p-2 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='{"key":"value"}'
          />
        </div>
      )}
      {/* Send button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={sendRequest}
          disabled={sending}
          className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md shadow-sm disabled:opacity-50 transition"
        >
          {sending ? 'Sending...' : 'Execute'}
        </button>
        {error && <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>}
      </div>
      {/* Response */}
      {response && (
        <div className="mt-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-900 text-gray-100 text-xs sm:text-sm font-mono overflow-auto max-h-72 shadow-inner">
          <div className="flex items-center space-x-2 mb-2 pb-1.5 border-b border-gray-800">
            <span className="font-bold text-gray-400">Response Status:</span>
            <span className={`px-2 py-0.5 rounded font-bold ${response.status >= 200 && response.status < 300 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
              {response.status}
            </span>
          </div>
          <div className="mb-2">
            <strong className="text-gray-400 block mb-1">Headers:</strong>
            <pre className="text-gray-300 whitespace-pre-wrap bg-gray-950 p-2 rounded border border-gray-800">{JSON.stringify(response.headers, null, 2)}</pre>
          </div>
          <div>
            <strong className="text-gray-400 block mb-1">Body:</strong>
            <pre className="text-emerald-300 whitespace-pre-wrap bg-gray-950 p-2 rounded border border-gray-800">{response.body}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestForm;
