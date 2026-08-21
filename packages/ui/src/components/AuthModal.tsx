import React, { useEffect, useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSave: (newToken: string) => void;
  onClear: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  token,
  onSave,
  onClear,
}) => {
  const [inputToken, setInputToken] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputToken(token);
    }
  }, [isOpen, token]);

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
    onSave(inputToken.trim());
    onClose();
  };

  const handleClear = () => {
    onClear();
    setInputToken('');
    onClose();
  };

  const getMaskedToken = (val: string) => {
    if (!val) return '';
    return val.length > 8 ? `${val.substring(0, 8)}...` : val;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6 relative space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>Bearer Token Authorization</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {token && (
          <div className="text-xs bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 p-2.5 rounded-lg flex items-center justify-between">
            <span className="font-semibold">Active Token:</span>
            <span className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
              {getMaskedToken(token)}
            </span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
              Token Value
            </label>
            <input
              type="text"
              placeholder="Enter Bearer token..."
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            {token && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-sm font-semibold rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
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
