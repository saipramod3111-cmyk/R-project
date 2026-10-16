// frontend/src/components/BackendAlert.tsx
import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Server, Cloud, ExternalLink } from 'lucide-react';

interface BackendAlertProps {
  apiUrl: string;
  isChecking: boolean;
  onRetry: () => void;
}

export const BackendAlert: React.FC<BackendAlertProps> = ({ apiUrl, isChecking, onRetry }) => {
  const [retryCount, setRetryCount] = useState<number>(0);
  const isCloudHost = apiUrl.includes('render.com') || apiUrl.includes('railway.app') || apiUrl.includes('trycloudflare.com');

  // Auto retry every 8 seconds if cloud host is waking up
  useEffect(() => {
    if (isCloudHost) {
      const timer = setInterval(() => {
        setRetryCount((prev) => prev + 1);
        onRetry();
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [isCloudHost, onRetry]);

  return (
    <div className="bg-gradient-to-r from-amber-950/50 via-navy-900 to-navy-950 border-b border-amber-500/30 px-4 py-3 text-xs text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {isCloudHost ? (
            <Cloud className="w-4 h-4 text-medcyan-400 shrink-0 mt-0.5 animate-pulse" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-semibold text-white">
              {isCloudHost ? 'Connecting to R Cloud Backend...' : 'R Backend Disconnected:'}
            </span>{' '}
            Target URL: <code className="bg-navy-950 px-1.5 py-0.5 rounded text-medcyan-300 font-mono">{apiUrl}</code>.
            {isCloudHost ? (
              <span className="text-slate-300 block sm:inline sm:ml-1">
                (Free cloud instances wake up automatically from idle in ~30–45s. Auto-reconnecting... attempt #{retryCount + 1})
              </span>
            ) : (
              <span className="text-slate-300 block sm:inline sm:ml-1">
                For 24/7 access on laptops & mobile without running your PC, host the backend on Render.com.
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          <button
            onClick={onRetry}
            disabled={isChecking}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-medblue-600/30 hover:bg-medblue-600/50 text-medblue-300 border border-medblue-500/30 transition-colors font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking...' : 'Check Connection'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
