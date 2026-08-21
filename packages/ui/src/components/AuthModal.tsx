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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200/80 dark:border-[#1f1f1f] w-full max-w-md p-6 relative space-y-5 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1f1f1f] pb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>Bearer Token Authorization</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1f1f1f] transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {token && (
          <div className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl flex items-center justify-between">
            <span className="font-semibold">Active Token:</span>
            <span className="font-mono bg-emerald-500/15 px-2 py-0.5 rounded">
              {getMaskedToken(token)}
            </span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Token Value
            </label>
            <input
              type="text"
              placeholder="Enter Bearer token..."
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-0 font-mono transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3">
            {token && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#161616] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
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
