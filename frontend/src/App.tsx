// frontend/src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BackendAlert } from './components/BackendAlert';
import { Home } from './pages/Home';
import { Prediction } from './pages/Prediction';
import { DatasetPage } from './pages/DatasetPage';
import { Visualizations } from './pages/Visualizations';
import { ModelPerformance } from './pages/ModelPerformance';
import { ProjectInfo } from './pages/ProjectInfo';
import { api } from './services/api';
import { Activity } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [apiUrl, setApiUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryApi = urlParams.get('api');
      if (queryApi && queryApi.startsWith('http')) {
        const clean = queryApi.trim().replace(/\/$/, '');
        localStorage.setItem('diapredict_api_url', clean);
        api.setBaseUrl(clean);
        return clean;
      }
      const saved = localStorage.getItem('diapredict_api_url');
      if (saved && saved.startsWith('http')) {
        api.setBaseUrl(saved);
        return saved;
      }
    }
    return api.getBaseUrl();
  });

  const checkBackendHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await api.checkHealth();
      setIsOnline(res.status === 'healthy' || res.status?.includes('healthy'));
    } catch {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
    // Periodic health check every 25 seconds
    const interval = setInterval(checkBackendHealth, 25000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  const handleUpdateApiUrl = (newUrl: string) => {
    const cleanUrl = newUrl.trim().replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      localStorage.setItem('diapredict_api_url', cleanUrl);
    }
    api.setBaseUrl(cleanUrl);
    setApiUrl(cleanUrl);
    checkBackendHealth();
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 selection:bg-medblue-500 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        isChecking={isChecking}
        onRefreshHealth={checkBackendHealth}
        apiUrl={apiUrl}
        onUpdateApiUrl={handleUpdateApiUrl}
      />

      {/* Backend Disconnected Alert (Conditional) */}
      {!isOnline && (
        <BackendAlert
          apiUrl={apiUrl}
          isChecking={isChecking}
          onRetry={checkBackendHealth}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Home onNavigate={setActiveTab} isOnline={isOnline} />}
        {activeTab === 'predict' && <Prediction isOnline={isOnline} />}
        {activeTab === 'dataset' && <DatasetPage isOnline={isOnline} />}
        {activeTab === 'visualizations' && <Visualizations isOnline={isOnline} />}
        {activeTab === 'metrics' && <ModelPerformance isOnline={isOnline} />}
        {activeTab === 'project-info' && <ProjectInfo />}
      </main>

      {/* Professional Healthcare Footer */}
      <footer className="mt-auto border-t border-navy-800/80 bg-navy-900/90 backdrop-blur px-4 lg:px-8 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-medblue-500/10 text-medblue-400 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-200">
                DiaPredict — Diabetes Risk Prediction System
              </div>
              <div className="text-[11px] text-slate-500">
                BCA Mini Project • Developed with R Programming, Plumber, React & Vite
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('predict')}
              className="hover:text-white transition-colors"
            >
              Risk Prediction
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('dataset')}
              className="hover:text-white transition-colors"
            >
              Dataset
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('visualizations')}
              className="hover:text-white transition-colors"
            >
              Charts
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('metrics')}
              className="hover:text-white transition-colors"
            >
              Model Metrics
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('project-info')}
              className="hover:text-white transition-colors"
            >
              Documentation
            </button>
          </div>

          <div className="text-[11px] text-slate-500 text-center md:text-right">
            <div>Academic Educational Demonstration Only</div>
            <div className="text-[10px] text-slate-600 mt-0.5">
              Not for clinical diagnosis or prescription
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
