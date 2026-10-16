// frontend/src/components/Header.tsx
import React, { useState } from 'react';
import {
  Activity,
  Server,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  isChecking: boolean;
  onRefreshHealth: () => void;
  apiUrl: string;
  onUpdateApiUrl: (url: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  isChecking,
  onRefreshHealth,
  apiUrl,
  onUpdateApiUrl,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'predict', label: 'Risk Prediction', icon: '🩺' },
    { id: 'dataset', label: 'Dataset Management', icon: '📁' },
    { id: 'visualizations', label: 'Data Visualizations', icon: '📈' },
    { id: 'metrics', label: 'Model Performance', icon: '🧠' },
    { id: 'project-info', label: 'Project Info', icon: '📘' },
  ];

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateApiUrl(tempUrl);
    setShowConfigModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-navy-900/90 backdrop-blur-md border-b border-navy-700/80 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-medblue-600 to-medcyan-500 shadow-glow-blue text-white">
              <Activity className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-medblue-200 bg-clip-text text-transparent">
                  DiaPredict
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-medblue-500/10 border border-medblue-400/30 text-medblue-400">
                  R Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Diabetes Risk Prediction System Using R Programming
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-navy-950/60 p-1.5 rounded-xl border border-navy-800">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-medblue-600 text-white shadow-sm shadow-medblue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status & Tools */}
          <div className="flex items-center gap-2.5">
            {/* Backend Connectivity Status Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isOnline
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}
            >
              {isOnline ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span className="hidden sm:inline">
                {isOnline ? 'R API Connected' : 'R API Offline'}
              </span>
              <button
                onClick={onRefreshHealth}
                title="Refresh connection status"
                disabled={isChecking}
                className="hover:text-white transition-colors"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`}
                />
              </button>
            </div>

            {/* API Settings Button */}
            <button
              onClick={() => {
                setTempUrl(apiUrl);
                setShowConfigModal(true);
              }}
              title="API Configuration"
              className="p-2 rounded-lg bg-navy-800/80 border border-navy-700 text-slate-300 hover:text-white hover:bg-navy-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-300"
            >
              <span className="sr-only">Toggle navigation</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-navy-800 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    active
                      ? 'bg-medblue-600 text-white'
                      : 'bg-navy-800/60 text-slate-300 hover:bg-navy-800'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* API Endpoint Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-medblue-500/10 text-medblue-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">R Plumber Backend Settings</h3>
                <p className="text-xs text-slate-400">Configure target API endpoint URL</p>
              </div>
            </div>

            <form onSubmit={handleSaveUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  R API Base URL
                </label>
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://r-project-uup0.onrender.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-slate-100 text-sm focus:outline-none focus:border-medblue-500 transition-colors"
                />
                <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Cloud: <code className="text-medcyan-400">https://r-project-uup0.onrender.com</code> or Local: <code className="text-medblue-400">http://127.0.0.1:8000</code>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-navy-950/60 border border-navy-800 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">How to start R Plumber backend locally:</p>
                <code className="block bg-navy-900 px-2 py-1 rounded text-medcyan-400 font-mono text-[11px]">
                  Rscript backend/app.R
                </code>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-medblue-600 hover:bg-medblue-500 text-white shadow-md transition-colors"
                >
                  Save & Reconnect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
