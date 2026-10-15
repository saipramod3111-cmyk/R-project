// frontend/src/pages/ModelPerformance.tsx
import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Info,
  TrendingUp,
  Percent,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { api } from '../services/api';
import { ModelMetricsResponse } from '../types';
import { toNumber, toFixed } from '../utils/formatters';

interface ModelPerformanceProps {
  isOnline: boolean;
}

export const ModelPerformance: React.FC<ModelPerformanceProps> = ({ isOnline }) => {
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMetrics();
      setMetrics(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load model metrics from R backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [isOnline]);

  if (loading && !metrics) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-medblue-400" />
        <p className="text-sm text-slate-400">Loading model metrics from R backend...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-8 rounded-2xl bg-navy-900 border border-navy-800 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Evaluation Metrics Unavailable</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-medblue-600 hover:bg-medblue-500 text-white rounded-xl text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const m = metrics.metrics;
  const cm = metrics.confusion_matrix;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>Statistical Model Validation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            R Logistic Regression Model Performance
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Genuine evaluation metrics calculated strictly on an independent 20% held-out test set
            (n={metrics.test_samples}) using reproducible random seed (<code className="text-medcyan-300 font-mono text-xs">seed = {metrics.seed}</code>).
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-850 border border-navy-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Model Architecture & Training Protocol Card */}
      <div className="p-6 rounded-2xl bg-navy-900/90 border border-navy-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Model Specification & Training Protocol
        </h3>
        <div className="p-3 rounded-xl bg-navy-950 font-mono text-xs text-medcyan-300 border border-navy-800 overflow-x-auto">
          {metrics.formula}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div>
            <span className="text-slate-500">Algorithm:</span>{' '}
            <strong className="text-slate-200">GLM (family = binomial)</strong>
          </div>
          <div>
            <span className="text-slate-500">Split Ratio:</span>{' '}
            <strong className="text-slate-200">80% Train / 20% Test</strong>
          </div>
          <div>
            <span className="text-slate-500">Train Samples:</span>{' '}
            <strong className="text-slate-200">{metrics.train_samples}</strong>
          </div>
          <div>
            <span className="text-slate-500">Test Samples:</span>{' '}
            <strong className="text-slate-200">{metrics.test_samples}</strong>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Accuracy */}
        <div className="glass-card rounded-2xl p-4 border border-medblue-500/30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Test Accuracy
          </span>
          <div className="text-2xl font-black text-medblue-300 mt-1">
            {toFixed(toNumber(m.accuracy) * 100, 1)}%
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Held-out test set</span>
        </div>

        {/* ROC-AUC */}
        <div className="glass-card rounded-2xl p-4 border border-medcyan-500/30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            ROC-AUC
          </span>
          <div className="text-2xl font-black text-medcyan-300 mt-1">
            {toFixed(m.roc_auc, 4)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Trapezoidal rule</span>
        </div>

        {/* F1 Score */}
        <div className="glass-card rounded-2xl p-4 border border-indigo-500/30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            F1-Score
          </span>
          <div className="text-2xl font-black text-indigo-300 mt-1">
            {toFixed(m.f1_score, 4)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Harmonic mean</span>
        </div>

        {/* Sensitivity / Recall */}
        <div className="glass-card rounded-2xl p-4 border border-rose-500/30">
          <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider">
            Sensitivity / Recall
          </span>
          <div className="text-2xl font-black text-rose-300 mt-1">
            {toFixed(toNumber(m.sensitivity) * 100, 1)}%
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">TP / (TP + FN)</span>
        </div>

        {/* Specificity */}
        <div className="glass-card rounded-2xl p-4 border border-emerald-500/30">
          <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
            Specificity
          </span>
          <div className="text-2xl font-black text-emerald-300 mt-1">
            {toFixed(toNumber(m.specificity) * 100, 1)}%
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">TN / (TN + FP)</span>
        </div>

        {/* Precision */}
        <div className="glass-card rounded-2xl p-4 border border-amber-500/30">
          <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
            Precision
          </span>
          <div className="text-2xl font-black text-amber-300 mt-1">
            {toFixed(toNumber(m.precision) * 100, 1)}%
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">TP / (TP + FP)</span>
        </div>
      </div>

      {/* Confusion Matrix and ROC Curve Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Confusion Matrix (5 cols) */}
        <div className="lg:col-span-5 bg-navy-900/90 rounded-2xl border border-navy-800 p-6 shadow-card space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-medblue-400" />
              <span>Confusion Matrix (Held-out Test Set)</span>
            </h3>
            <p className="text-xs text-slate-400">Total test samples: n = {cm.total}</p>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div></div>
              <div className="font-semibold text-emerald-400">Pred: Negative (0)</div>
              <div className="font-semibold text-rose-400">Pred: Positive (1)</div>

              <div className="font-semibold text-slate-300 flex items-center justify-end pr-2 text-[11px]">
                Actual: Non-Diabetic (0)
              </div>
              {/* True Negative */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                <div className="text-xl font-black">{cm.true_negative}</div>
                <div className="text-[10px] font-semibold text-emerald-400">True Negative (TN)</div>
              </div>
              {/* False Positive */}
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300">
                <div className="text-xl font-black">{cm.false_positive}</div>
                <div className="text-[10px] font-semibold text-amber-400">False Positive (FP)</div>
              </div>

              <div className="font-semibold text-slate-300 flex items-center justify-end pr-2 text-[11px]">
                Actual: Diabetic (1)
              </div>
              {/* False Negative */}
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
                <div className="text-xl font-black">{cm.false_negative}</div>
                <div className="text-[10px] font-semibold text-rose-400">False Negative (FN)</div>
              </div>
              {/* True Positive */}
              <div className="p-4 rounded-xl bg-medblue-950/40 border border-medblue-500/30 text-medblue-300">
                <div className="text-xl font-black">{cm.true_positive}</div>
                <div className="text-[10px] font-semibold text-medblue-400">True Positive (TP)</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
            <p>
              <strong className="text-slate-200">Clinical Context:</strong> In screening models,
              False Negatives (<span className="text-rose-400 font-semibold">{cm.false_negative}</span>)
              are critical because a patient with elevated diabetes risk is told they are healthy.
              Lowering the classification threshold from 0.50 to ~0.35 reduces False Negatives at the cost of more False Positives.
            </p>
          </div>
        </div>

        {/* ROC Curve Chart (7 cols) */}
        <div className="lg:col-span-7 bg-navy-900/90 rounded-2xl border border-navy-800 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-medcyan-400" />
                <span>Receiver Operating Characteristic (ROC Curve)</span>
              </h3>
              <p className="text-xs text-slate-400">
                True Positive Rate vs. False Positive Rate across all cutoffs (AUC = {m.roc_auc.toFixed(4)})
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-medcyan-500/10 border border-medcyan-500/30 text-medcyan-400 font-bold text-xs">
              AUC: {m.roc_auc.toFixed(4)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.roc_curve} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="fpr" type="number" domain={[0, 1]} stroke="#64748B" fontSize={11} unit=" FPR" />
                <YAxis dataKey="tpr" type="number" domain={[0, 1]} stroke="#64748B" fontSize={11} unit=" TPR" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#273456', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(val: any, name: any) => [val, name === 'tpr' ? 'Sensitivity (TPR)' : '1 - Specificity (FPR)']}
                  labelFormatter={(th: any) => `Cutoff Threshold: ${th}`}
                />
                <Line
                  type="monotone"
                  dataKey="tpr"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  dot={false}
                  name="Model ROC"
                />
                {/* Diagonal random chance reference line */}
                <ReferenceLine
                  segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]}
                  stroke="#475569"
                  strokeDasharray="4 4"
                  label={{ value: 'Random Guess (AUC=0.5)', fill: '#64748B', fontSize: 10, position: 'insideBottomRight' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-400">
            An AUC of <strong className="text-medcyan-300">{toFixed(m.roc_auc, 4)}</strong> indicates
            strong discriminative ability (well above 0.50 random classifier), signifying that a randomly
            selected diabetic individual has an ~82% probability of receiving a higher predicted risk score
            than a randomly chosen non-diabetic individual.
          </p>
        </div>
      </div>

      {/* Model Coefficients & Statistical Significance Table */}
      <div className="bg-navy-900/90 rounded-2xl border border-navy-800 p-6 shadow-card space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-medblue-400" />
            <span>R Logistic Regression Coefficients & Odds Ratios</span>
          </h3>
          <p className="text-xs text-slate-400">
            Fitted log-odds coefficients (<code className="text-medcyan-300 font-mono text-xs">β</code>) and exponentiated odds ratios (<code className="text-medcyan-300 font-mono text-xs">exp(β)</code>)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-navy-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-navy-800 font-sans">
              <tr>
                <th className="p-3">Predictor Variable</th>
                <th className="p-3">Estimate (β)</th>
                <th className="p-3">Std. Error</th>
                <th className="p-3">z Value</th>
                <th className="p-3">p Value</th>
                <th className="p-3">Odds Ratio (e^β)</th>
                <th className="p-3 text-right">Significance (p &lt; 0.05)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-slate-300 text-[11px]">
              {metrics.coefficients.map((c) => (
                <tr key={c.variable} className="hover:bg-navy-800/30">
                  <td className="p-3 font-semibold text-white font-sans">{c.variable}</td>
                  <td className="p-3">{toFixed(c.estimate, 4)}</td>
                  <td className="p-3 text-slate-400">{toFixed(c.std_error, 4)}</td>
                  <td className="p-3">{toFixed(c.z_value, 4)}</td>
                  <td className={`p-3 font-bold ${c.significant ? 'text-medcyan-400' : 'text-slate-500'}`}>
                    {toNumber(c.p_value) < 0.0001 ? '< 0.0001' : toFixed(c.p_value, 4)}
                  </td>
                  <td className="p-3 font-bold text-medblue-300">{toFixed(c.odds_ratio, 3)}</td>
                  <td className="p-3 text-right font-sans">
                    {c.significant ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold">
                        Statistically Significant
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-navy-800 text-slate-500 text-[10px]">
                        Not Significant
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Model Diagnostics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-navy-950 border border-navy-800 text-xs">
          <div>
            <span className="text-slate-500">Akaike Info Criterion (AIC):</span>{' '}
            <strong className="text-white font-mono">{metrics.diagnostics.aic}</strong>
          </div>
          <div>
            <span className="text-slate-500">Null Deviance:</span>{' '}
            <strong className="text-white font-mono">{metrics.diagnostics.null_deviance}</strong>
          </div>
          <div>
            <span className="text-slate-500">Residual Deviance:</span>{' '}
            <strong className="text-white font-mono">{metrics.diagnostics.residual_deviance}</strong>
          </div>
          <div>
            <span className="text-slate-500">Residual DF:</span>{' '}
            <strong className="text-white font-mono">{metrics.diagnostics.df_residual}</strong>
          </div>
        </div>
      </div>

      {/* Academic Limitations and Discussion */}
      <div className="p-6 rounded-2xl bg-navy-900/70 border border-navy-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-medblue-400" />
          <span>Academic Discussion: Assumptions, Imbalance & Limitations</span>
        </h4>
        <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5 leading-relaxed">
          <li>
            <strong className="text-slate-300">Demographic Bias:</strong> The dataset is derived from
            the Pima Indian female population aged 21 and older living near Phoenix, Arizona. Findings may
            not directly generalize across other ethnicities, age brackets, or male populations.
          </li>
          <li>
            <strong className="text-slate-300">Missing Data Imputation:</strong> Non-physiological zero
            values (e.g., Blood Pressure = 0, Glucose = 0) were replaced with feature medians calculated
            from genuine non-zero records to prevent numerical instability in <code className="text-medcyan-300 font-mono">glm()</code>.
          </li>
          <li>
            <strong className="text-slate-300">Class Imbalance:</strong> With ~65% non-diabetic and 35% diabetic
            cases, accuracy alone can be deceptive. Precision, Sensitivity, Specificity, and ROC-AUC provide
            a more balanced clinical evaluation.
          </li>
        </ul>
      </div>
    </div>
  );
};
