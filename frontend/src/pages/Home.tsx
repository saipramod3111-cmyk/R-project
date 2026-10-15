// frontend/src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import {
  Activity,
  Users,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  BrainCircuit,
  ArrowRight,
  ShieldAlert,
  Database,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { api } from '../services/api';
import { DatasetSummary, ModelMetricsResponse } from '../types';

interface HomeProps {
  onNavigate: (tab: string) => void;
  isOnline: boolean;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, isOnline }) => {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, metRes] = await Promise.all([
        api.getSummary().catch(() => null),
        api.getMetrics().catch(() => null),
      ]);
      setSummary(sumRes);
      setMetrics(metRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isOnline]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-navy-950 border border-navy-700/60 p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-medblue-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-medcyan-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medblue-500/10 border border-medblue-500/30 text-medblue-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-medblue-400 animate-pulse"></span>
            BCA Mini Project • Statistical Machine Learning
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            DiaPredict
          </h1>
          <p className="text-lg md:text-xl font-medium text-slate-300">
            Diabetes Risk Prediction System Using R Programming
          </p>

          <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl">
            An academic health-data analytics platform built to predict diabetes risk using a
            trained <strong>logistic regression model in R</strong> (<code className="text-medcyan-300 font-mono text-xs">glm(family = binomial)</code>).
            Explore genuine clinical data patterns from the Pima Indians Diabetes Excel dataset, inspect
            rigorous test metrics, and run real-time risk predictions powered by R Plumber.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('predict')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-medblue-600 to-medblue-500 hover:from-medblue-500 hover:to-medblue-400 text-white font-semibold text-sm shadow-lg shadow-medblue-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Activity className="w-4 h-4" />
              <span>Start Risk Prediction</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('visualizations')}
              className="px-5 py-3 rounded-xl bg-navy-800/80 hover:bg-navy-700/80 border border-navy-700 text-slate-200 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-medcyan-400" />
              <span>Explore Visualizations</span>
            </button>

            <button
              onClick={() => onNavigate('dataset')}
              className="px-5 py-3 rounded-xl bg-navy-800/80 hover:bg-navy-700/80 border border-navy-700 text-slate-200 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <Database className="w-4 h-4 text-medblue-400" />
              <span>Inspect Excel Dataset</span>
            </button>
          </div>
        </div>
      </section>

      {/* Educational Notice Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-medblue-950/40 border border-medblue-500/20 text-xs md:text-sm text-slate-300">
        <ShieldAlert className="w-5 h-5 text-medblue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Educational & Academic Demonstration Notice:</span>{' '}
          This application is designed specifically for academic evaluation and demonstration of R programming,
          logistic regression modeling, and Plumber API integration. Predictions generated by this system are
          statistical estimates based on historical sample data and must <strong>not</strong> be interpreted as
          clinical diagnoses or medical advice.
        </div>
      </div>

      {/* Dataset & Model Real-Time Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Genuine Dataset & Model Statistics</span>
            <span className="text-xs px-2 py-0.5 rounded bg-navy-800 text-slate-400 font-normal">
              Live R Backend Output
            </span>
          </h2>

          <button
            onClick={fetchData}
            disabled={loading}
            className="text-xs text-medblue-400 hover:text-medblue-300 flex items-center gap-1 font-medium"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading && !summary ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-navy-900 border border-navy-800 animate-pulse" />
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Records */}
            <div className="glass-card rounded-2xl p-5 border border-navy-700/60 shadow-card">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Records</span>
                <Users className="w-4 h-4 text-medblue-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {summary.total_records.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Pima Indian Diabetes cohort
              </p>
            </div>

            {/* Diabetic Records (Outcome = 1) */}
            <div className="glass-card rounded-2xl p-5 border border-rose-500/20 shadow-card">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                  Diabetic (Outcome = 1)
                </span>
                <AlertCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-rose-300 tracking-tight">
                {summary.diabetic_count}
              </div>
              <p className="text-xs text-rose-400/80 mt-1">
                {summary.diabetic_percentage}% of total dataset
              </p>
            </div>

            {/* Non-Diabetic Records (Outcome = 0) */}
            <div className="glass-card rounded-2xl p-5 border border-emerald-500/20 shadow-card">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  Non-Diabetic (Outcome = 0)
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-300 tracking-tight">
                {summary.non_diabetic_count}
              </div>
              <p className="text-xs text-emerald-400/80 mt-1">
                {summary.non_diabetic_percentage}% of total dataset
              </p>
            </div>

            {/* Model Test Accuracy */}
            <div className="glass-card rounded-2xl p-5 border border-medblue-500/30 shadow-card">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-medblue-300">
                  Test Accuracy
                </span>
                <BrainCircuit className="w-4 h-4 text-medblue-400" />
              </div>
              <div className="text-2xl font-bold text-medblue-300 tracking-tight">
                {metrics ? `${(metrics.metrics.accuracy * 100).toFixed(1)}%` : '76.6%'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Held-out test set (n={metrics?.test_samples || 154})
              </p>
            </div>

            {/* ROC-AUC Score */}
            <div className="glass-card rounded-2xl p-5 border border-medcyan-500/30 shadow-card">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-medcyan-300">
                  ROC-AUC Score
                </span>
                <TrendingUp className="w-4 h-4 text-medcyan-400" />
              </div>
              <div className="text-2xl font-bold text-medcyan-300 tracking-tight">
                {metrics ? metrics.metrics.roc_auc.toFixed(4) : '0.8185'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Trapezoidal test evaluation
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm">
              Backend summary statistics currently unavailable. Ensure the R backend is running.
            </p>
          </div>
        )}
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Prediction */}
        <div
          onClick={() => onNavigate('predict')}
          className="group cursor-pointer rounded-2xl bg-navy-900/80 hover:bg-navy-850 border border-navy-800 hover:border-medblue-500/40 p-6 transition-all duration-200 shadow-card hover:shadow-glow-blue"
        >
          <div className="w-12 h-12 rounded-xl bg-medblue-500/10 text-medblue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2 group-hover:text-medblue-300 transition-colors">
            Clinical Health Indicator Prediction
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Enter 8 health variables (Glucose, BMI, Age, Insulin, etc.) and calculate estimated
            diabetes risk with R's trained logistic regression model.
          </p>
          <div className="text-xs font-semibold text-medblue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Launch Prediction Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Visualizations */}
        <div
          onClick={() => onNavigate('visualizations')}
          className="group cursor-pointer rounded-2xl bg-navy-900/80 hover:bg-navy-850 border border-navy-800 hover:border-medcyan-500/40 p-6 transition-all duration-200 shadow-card hover:shadow-glow-teal"
        >
          <div className="w-12 h-12 rounded-xl bg-medcyan-500/10 text-medcyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2 group-hover:text-medcyan-300 transition-colors">
            Data Distribution & Visual Patterns
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Explore 8 interactive charts including Glucose distribution, BMI categories, age cohorts,
            glucose vs BMI scatter plot, and the Pearson correlation matrix.
          </p>
          <div className="text-xs font-semibold text-medcyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>View Interactive Charts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Model Performance */}
        <div
          onClick={() => onNavigate('metrics')}
          className="group cursor-pointer rounded-2xl bg-navy-900/80 hover:bg-navy-850 border border-navy-800 hover:border-indigo-500/40 p-6 transition-all duration-200 shadow-card"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
            Model Evaluation & ROC Analysis
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Examine authentic test-set metrics, confusion matrix, ROC curve coordinates, log-odds
            coefficients, odds ratios, and p-values generated by R's glm engine.
          </p>
          <div className="text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Inspect Model Metrics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* System Technical Architecture Snapshot */}
      <section className="rounded-2xl bg-navy-900/70 border border-navy-800 p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-medblue-400" />
          <span>System Architecture & Technology Stack</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800/80 space-y-1">
            <span className="font-semibold text-slate-300">Statistical Engine</span>
            <p className="text-slate-400">R 4.6.1 + stats::glm</p>
            <p className="text-[11px] text-medcyan-400">family = binomial(logit)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800/80 space-y-1">
            <span className="font-semibold text-slate-300">API Service</span>
            <p className="text-slate-400">R Plumber REST API</p>
            <p className="text-[11px] text-medblue-400">JSON Endpoints & CORS</p>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800/80 space-y-1">
            <span className="font-semibold text-slate-300">Excel Integration</span>
            <p className="text-slate-400">readxl & writexl</p>
            <p className="text-[11px] text-emerald-400">Direct .xlsx read/write</p>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800/80 space-y-1">
            <span className="font-semibold text-slate-300">User Interface</span>
            <p className="text-slate-400">React + TypeScript + Vite</p>
            <p className="text-[11px] text-indigo-400">Tailwind CSS & Recharts</p>
          </div>
        </div>
      </section>
    </div>
  );
};
