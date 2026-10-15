// frontend/src/components/BackendAlert.tsx
import React from 'react';
import { AlertCircle, RefreshCw, Terminal, ExternalLink } from 'lucide-react';

interface BackendAlertProps {
  apiUrl: string;
  isChecking: boolean;
  onRetry: () => void;
}

export const BackendAlert: React.FC<BackendAlertProps> = ({ apiUrl, isChecking, onRetry }) => {
  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-rose-950/40 to-navy-900 border-b border-amber-500/30 px-4 py-3 text-xs text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">
              R Plumber API Disconnected:
            </span>{' '}
            Could not reach the R backend service at <code className="bg-navy-950 px-1.5 py-0.5 rounded text-amber-300 font-mono">{apiUrl}</code>.
            Live model predictions and real-time dataset operations require the R server.
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>Run: <code className="bg-navy-950 px-1.5 py-0.5 rounded text-medcyan-300 font-mono">Rscript backend/app.R</code></span>
          </div>
          <button
            onClick={onRetry}
            disabled={isChecking}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors font-medium"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
