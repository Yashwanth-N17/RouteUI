import React, { useEffect, useState } from 'react';
import { AuthType, AuthConfig } from '../utils/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authConfig: AuthConfig;
  onSave: (newConfig: AuthConfig) => void;
  onClear: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  authConfig,
  onSave,
  onClear,
}) => {
  const [authType, setAuthType] = useState<AuthType>('bearer');
  const [inputToken, setInputToken] = useState('');
  const [apiKeyName, setApiKeyName] = useState('X-API-Key');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [apiKeyIn, setApiKeyIn] = useState<'header' | 'query'>('header');
  const [basicUser, setBasicUser] = useState('');
  const [basicPass, setBasicPass] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAuthType(authConfig.type !== 'none' ? authConfig.type : 'bearer');
      setInputToken(authConfig.token || '');
      setApiKeyName(authConfig.apiKeyName || 'X-API-Key');
      setApiKeyValue(authConfig.apiKeyValue || '');
      setApiKeyIn(authConfig.apiKeyIn || 'header');
      setBasicUser(authConfig.basicUser || '');
      setBasicPass(authConfig.basicPass || '');
    }
  }, [isOpen, authConfig]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig: AuthConfig = { type: authType };
    if (authType === 'bearer') {
      newConfig.token = inputToken.trim();
    } else if (authType === 'apikey') {
      newConfig.apiKeyName = apiKeyName.trim() || 'X-API-Key';
      newConfig.apiKeyValue = apiKeyValue.trim();
      newConfig.apiKeyIn = apiKeyIn;
    } else if (authType === 'basic') {
      newConfig.basicUser = basicUser.trim();
      newConfig.basicPass = basicPass;
    }
    onSave(newConfig);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  const getComputedPreview = () => {
    if (authType === 'basic' && basicUser) {
      const encoded = btoa(`${basicUser}:${basicPass}`);
      return `Authorization: Basic ${encoded}`;
    }
    return null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-300 dark:border-zinc-800 w-full max-w-md p-6 relative space-y-5 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-300 dark:border-zinc-800 pb-4">
          <h2 className="text-lg font-extrabold text-gray-950 dark:text-gray-100 flex items-center gap-2">
            <span>Global Authorization</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-lg font-bold p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex space-x-1 border border-gray-300 dark:border-zinc-700 p-1 rounded-xl bg-gray-50 dark:bg-zinc-900">
          {(['bearer', 'apikey', 'basic'] as AuthType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setAuthType(t)}
              className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authType === t
                  ? 'bg-fastapi text-white shadow-sm'
                  : 'text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800'
              }`}
            >
              {t === 'bearer' ? 'Bearer Token' : t === 'apikey' ? 'API Key' : 'Basic Auth'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {authType === 'bearer' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1.5">
                Token Value
              </label>
              <input
                type="text"
                placeholder="Enter Bearer token..."
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border-b-2 border-gray-300 dark:border-gray-700 bg-transparent text-gray-950 dark:text-gray-100 focus:outline-none focus:border-fastapi focus:ring-0 font-mono transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-500"
                autoFocus
              />
            </div>
          )}

          {authType === 'apikey' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1.5">
                  Key Name
                </label>
                <input
                  type="text"
                  placeholder="X-API-Key"
                  value={apiKeyName}
                  onChange={(e) => setApiKeyName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border-b-2 border-gray-300 dark:border-gray-700 bg-transparent text-gray-950 dark:text-gray-100 focus:outline-none focus:border-fastapi focus:ring-0 font-mono transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1.5">
                  Key Value
                </label>
                <input
                  type="text"
                  placeholder="••••••••••••••••"
                  value={apiKeyValue}
                  onChange={(e) => setApiKeyValue(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border-b-2 border-gray-300 dark:border-gray-700 bg-transparent text-gray-950 dark:text-gray-100 focus:outline-none focus:border-fastapi focus:ring-0 font-mono transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1.5">
                  Send In
                </label>
                <select
                  value={apiKeyIn}
                  onChange={(e) => setApiKeyIn(e.target.value as 'header' | 'query')}
                  className="w-full px-3.5 py-2 text-sm border-b-2 border-gray-300 dark:border-gray-700 bg-transparent text-gray-950 dark:text-gray-100 focus:outline-none focus:border-fastapi focus:ring-0 font-sans transition-colors bg-white dark:bg-zinc-900"
                >
                  <option value="header">Header</option>
                  <option value="query">Query Parameter</option>
                </select>
              </div>
            </div>
          )}

          {authType === 'basic' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="admin"
                  value={basicUser}
                  onChange={(e) => setBasicUser(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border-b-2 border-gray-300 dark:border-gray-700 bg-transparent text-gray-950 dark:text-gray-100 focus:outline-none focus:border-fastapi focus:ring-0 font-mono transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={basicPass}
                  onChange={(e) => setBasicPass(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border-b-2 border-gray-300 dark:border-gray-700 bg-transparent text-gray-950 dark:text-gray-100 focus:outline-none focus:border-fastapi focus:ring-0 font-mono transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-500"
                />
              </div>
              {getComputedPreview() && (
                <div className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 p-2 rounded-lg mt-2">
                  <code className="text-xs text-gray-800 dark:text-gray-300 font-mono break-all font-semibold">
                    {getComputedPreview()}
                  </code>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-3">
            {authConfig.type !== 'none' && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold rounded-lg bg-fastapi hover:bg-fastapi-hover text-white shadow-sm transition-colors"
            >
              Authorize
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
