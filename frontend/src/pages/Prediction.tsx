// frontend/src/pages/Prediction.tsx
import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Sliders,
  HelpCircle,
  Info,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { api } from '../services/api';
import { PredictionRequest, PredictionResponse } from '../types';

interface PredictionProps {
  isOnline: boolean;
}

const PRESET_PATIENTS: Record<string, { label: string; values: PredictionRequest; badge: string }> = {
  highRisk: {
    label: 'High-Risk Profile (Outcome 1)',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    values: {
      Pregnancies: 6,
      Glucose: 168,
      BloodPressure: 84,
      SkinThickness: 38,
      Insulin: 180,
      BMI: 36.8,
      DiabetesPedigreeFunction: 0.78,
      Age: 52,
    },
  },
  lowRisk: {
    label: 'Healthy / Low-Risk Profile',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    values: {
      Pregnancies: 1,
      Glucose: 88,
      BloodPressure: 68,
      SkinThickness: 20,
      Insulin: 85,
      BMI: 22.4,
      DiabetesPedigreeFunction: 0.24,
      Age: 24,
    },
  },
  moderateRisk: {
    label: 'Borderline / Moderate-Risk Profile',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    values: {
      Pregnancies: 3,
      Glucose: 122,
      BloodPressure: 76,
      SkinThickness: 28,
      Insulin: 110,
      BMI: 28.5,
      DiabetesPedigreeFunction: 0.45,
      Age: 41,
    },
  },
};

const INITIAL_FORM: PredictionRequest = {
  Pregnancies: 2,
  Glucose: 120,
  BloodPressure: 72,
  SkinThickness: 25,
  Insulin: 100,
  BMI: 27.5,
  DiabetesPedigreeFunction: 0.38,
  Age: 35,
};

export const Prediction: React.FC<PredictionProps> = ({ isOnline }) => {
  const [formData, setFormData] = useState<PredictionRequest>(INITIAL_FORM);
  const [threshold, setThreshold] = useState<number>(0.50);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof PredictionRequest, val: string) => {
    const num = parseFloat(val);
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(num) ? 0 : num,
    }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const loadPreset = (presetKey: string) => {
    const p = PRESET_PATIENTS[presetKey];
    if (p) {
      setFormData({ ...p.values });
      setFieldErrors({});
      setResult(null);
      setError(null);
    }
  };

  const handleClear = () => {
    setFormData({
      Pregnancies: 0,
      Glucose: 0,
      BloodPressure: 0,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 0,
      DiabetesPedigreeFunction: 0,
      Age: 0,
    });
    setResult(null);
    setError(null);
    setFieldErrors({});
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.Pregnancies < 0 || formData.Pregnancies > 25) {
      errors.Pregnancies = 'Enter between 0 and 25';
    }
    if (formData.Glucose < 40 || formData.Glucose > 400) {
      errors.Glucose = 'Enter plausible glucose (40 - 400 mg/dL)';
    }
    if (formData.BloodPressure < 40 || formData.BloodPressure > 200) {
      errors.BloodPressure = 'Enter diastolic BP (40 - 200 mm Hg)';
    }
    if (formData.SkinThickness < 0 || formData.SkinThickness > 100) {
      errors.SkinThickness = 'Enter between 0 and 100 mm';
    }
    if (formData.Insulin < 0 || formData.Insulin > 900) {
      errors.Insulin = 'Enter between 0 and 900 mu U/ml';
    }
    if (formData.BMI < 10 || formData.BMI > 80) {
      errors.BMI = 'Enter plausible BMI (10 - 80 kg/m²)';
    }
    if (formData.DiabetesPedigreeFunction <= 0 || formData.DiabetesPedigreeFunction > 3.0) {
      errors.DiabetesPedigreeFunction = 'Enter pedigree function (0.01 - 3.00)';
    }
    if (formData.Age < 15 || formData.Age > 115) {
      errors.Age = 'Enter age between 15 and 115 years';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: PredictionRequest = {
        ...formData,
        threshold,
      };
      const response = await api.predict(payload);
      setResult(response);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error evaluating model prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-medblue-400 mb-1">
          <Activity className="w-4 h-4" />
          <span>Logistic Regression Inference</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Diabetes Risk Prediction
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Enter clinical indicators to evaluate the probability of diabetes onset using our
          trained R binomial logistic regression model (<code className="text-medcyan-300 font-mono text-xs">stats::glm</code>).
        </p>
      </div>

      {/* Preset Test Profiles */}
      <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-medcyan-400" />
          <span>Quick Academic Demo Profiles:</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {Object.entries(PRESET_PATIENTS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => loadPreset(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${item.badge} hover:brightness-125`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7 bg-navy-900/90 rounded-2xl border border-navy-700/60 p-6 md:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-navy-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Patient Clinical Metrics</h3>
              <p className="text-xs text-slate-400">All 8 diagnostic predictor variables</p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Form</span>
            </button>
          </div>

          <form onSubmit={handlePredict} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pregnancies */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pregnancies <span className="text-slate-500 font-normal">(times pregnant)</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="25"
                  value={formData.Pregnancies || ''}
                  onChange={(e) => handleInputChange('Pregnancies', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border ${
                    fieldErrors.Pregnancies ? 'border-rose-500' : 'border-navy-700'
                  } text-slate-100 text-sm focus:outline-none focus:border-medblue-500 transition-colors`}
                  placeholder="e.g. 2"
                />
                {fieldErrors.Pregnancies && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.Pregnancies}</p>
                )}
                <span className="text-[10px] text-slate-500">Normal Range: 0 - 6</span>
              </div>

              {/* Glucose Level */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Glucose Level <span className="text-medcyan-400 font-normal">(mg/dL)</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="40"
                  max="400"
                  value={formData.Glucose || ''}
                  onChange={(e) => handleInputChange('Glucose', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border ${
                    fieldErrors.Glucose ? 'border-rose-500' : 'border-navy-700'
                  } text-slate-100 text-sm focus:outline-none focus:border-medblue-500 transition-colors`}
                  placeholder="e.g. 120"
                />
                {fieldErrors.Glucose && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.Glucose}</p>
                )}
                <span className="text-[10px] text-slate-500">Normal Fasting: 70 - 125 mg/dL</span>
              </div>

              {/* Diastolic Blood Pressure */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Diastolic Blood Pressure <span className="text-medcyan-400 font-normal">(mm Hg)</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="40"
                  max="200"
                  value={formData.BloodPressure || ''}
                  onChange={(e) => handleInputChange('BloodPressure', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border ${
                    fieldErrors.BloodPressure ? 'border-rose-500' : 'border-navy-700'
                  } text-slate-100 text-sm focus:outline-none focus:border-medblue-500 transition-colors`}
                  placeholder="e.g. 72"
                />
                {fieldErrors.BloodPressure && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.BloodPressure}</p>
                )}
                <span className="text-[10px] text-slate-500">Normal Diastolic: 60 - 80 mm Hg</span>
              </div>

              {/* Skin Thickness */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Triceps Skinfold <span className="text-medcyan-400 font-normal">(mm)</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={formData.SkinThickness || ''}
                  onChange={(e) => handleInputChange('SkinThickness', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border ${
                    fieldErrors.SkinThickness ? 'border-rose-500' : 'border-navy-700'
                  } text-slate-100 text-sm focus:outline-none focus:border-medblue-500 transition-colors`}
                  placeholder="e.g. 25"
                />
                {fieldErrors.SkinThickness && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.SkinThickness}</p>
                )}
                <span className="text-[10px] text-slate-500">Benchmark: 10 - 35 mm</span>
              </div>

              {/* Insulin */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  2-Hour Serum Insulin <span className="text-medcyan-400 font-normal">(mu U/ml)</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="900"
                  value={formData.Insulin || ''}
                  onChange={(e) => handleInputChange('Insulin', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border ${
                    fieldErrors.Insulin ? 'border-rose-500' : 'border-navy-700'
                  } text-slate-100 text-sm focus:outline-none focus:border-medblue-500 transition-colors`}
                  placeholder="e.g. 100"
                />
                {fieldErrors.Insulin && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.Insulin}</p>
                )}
                <span className="text-[10px] text-slate-500">Normal 2h: 16 - 166 mu U/ml</span>
              </div>

              {/* BMI */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Body Mass Index (BMI) <span className="text-medcyan-400 font-normal">(kg/m²)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="80"
                  value={formData.BMI || ''}
                  onChange={(e) => handleInputChange('BMI', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border ${
                    fieldErrors.BMI ? 'border-rose-500' : 'border-navy-700'
                  } text-slate-100 text-sm focus:outline-none focus:border-medblue-500 transition-colors`}
                  placeholder="e.g. 28.5"
                />
                {fieldErrors.BMI && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.BMI}</p>
                )}
                <span className="text-[10px] text-slate-500">Normal: 18.5 - 24.9 kg/m²</span>
              </div>

              {/* Diabetes Pedigree Function */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Diabetes Pedigree Function <span className="text-slate-500 font-normal">(score)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="3.00"
                  value={formData.DiabetesPedigreeFunction || ''}
                  onChange={(e) => handleInputChange('DiabetesPedigreeFunction', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border ${
                    fieldErrors.DiabetesPedigreeFunction ? 'border-rose-500' : 'border-navy-700'
                  } text-slate-100 text-sm focus:outline-none focus:border-medblue-500 transition-colors`}
                  placeholder="e.g. 0.45"
                />
                {fieldErrors.DiabetesPedigreeFunction && (
                  <p className="text-[11px] text-rose-400 mt-1">
                    {fieldErrors.DiabetesPedigreeFunction}
                  </p>
                )}
                <span className="text-[10px] text-slate-500">Genetic history score (0.08 - 2.42)</span>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Age <span className="text-medcyan-400 font-normal">(years)</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="15"
                  max="115"
                  value={formData.Age || ''}
                  onChange={(e) => handleInputChange('Age', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border ${
                    fieldErrors.Age ? 'border-rose-500' : 'border-navy-700'
                  } text-slate-100 text-sm focus:outline-none focus:border-medblue-500 transition-colors`}
                  placeholder="e.g. 35"
                />
                {fieldErrors.Age && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.Age}</p>
                )}
                <span className="text-[10px] text-slate-500">Adult patient cohort: 21+</span>
              </div>
            </div>

            {/* Threshold Slider (Academic Requirement: Configurable & Documented) */}
            <div className="pt-2 border-t border-navy-800">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <span className="flex items-center gap-1 font-medium">
                  <Sliders className="w-3.5 h-3.5 text-medblue-400" />
                  Decision Cutoff Threshold:
                </span>
                <span className="font-mono font-bold text-medblue-400 bg-navy-950 px-2 py-0.5 rounded border border-navy-800">
                  {threshold.toFixed(2)} ({Math.round(threshold * 100)}%)
                </span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.80"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-medblue-500 cursor-pointer h-1.5 bg-navy-950 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.20 (Sensitive / Low False Negatives)</span>
                <span className="text-slate-400 font-semibold">0.50 (Standard Logistic Default)</span>
                <span>0.80 (Specific / Low False Positives)</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-medblue-600 via-medblue-500 to-medcyan-500 hover:from-medblue-500 hover:to-medcyan-400 text-white font-bold text-sm shadow-lg shadow-medblue-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Evaluating R Logistic Regression Model...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    <span>Calculate Diabetes Risk (R glm Model)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Output Results Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-200">
                <AlertCircle className="w-4 h-4" />
                <span>Prediction Error</span>
              </div>
              <p>{error}</p>
              {!isOnline && (
                <p className="text-slate-400 pt-1">
                  Ensure the R backend is running via <code className="bg-navy-950 px-1 py-0.5 rounded text-medcyan-400">Rscript backend/app.R</code>.
                </p>
              )}
            </div>
          )}

          {result ? (
            <div className="rounded-2xl bg-navy-900 border border-navy-700 p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
              {/* Risk Level Header */}
              <div className="flex items-center justify-between border-b border-navy-800 pb-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Model Classification
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {result.classification}
                  </h3>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    result.outcome_code === 1
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {result.risk_level}
                </div>
              </div>

              {/* Probability Visual Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-medium text-slate-300">Estimated Probability</span>
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {result.predicted_percentage}%
                  </span>
                </div>

                <div className="w-full bg-navy-950 rounded-full h-3.5 p-0.5 border border-navy-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      result.predicted_probability >= threshold
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : 'bg-gradient-to-r from-emerald-500 to-medcyan-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, result.predicted_percentage))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0% (Lowest Risk)</span>
                  <span className="text-medblue-400 font-semibold">
                    Cutoff: {Math.round(result.classification_threshold * 100)}%
                  </span>
                  <span>100% (Highest Risk)</span>
                </div>
              </div>

              {/* Factor Contribution Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-medcyan-400" />
                  <span>Key Risk Factor Contributions</span>
                </h4>

                <div className="divide-y divide-navy-800/80 rounded-xl bg-navy-950/60 border border-navy-800 overflow-hidden text-xs">
                  {result.contributing_factors.map((f) => (
                    <div key={f.field} className="p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-200">{f.name}</span>
                        <div className="text-[11px] text-slate-400">
                          {f.value} {f.unit} • Odds Ratio: {f.odds_ratio}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          f.impact === 'Increases Risk'
                            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        {f.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Citation */}
              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="text-slate-300 font-semibold font-sans text-xs">
                  R Model Specifications:
                </div>
                <div>Algorithm: {result.model_type}</div>
                <div>Model Version: {result.model_version}</div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>{result.disclaimer}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-navy-900/60 border border-navy-800 p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-navy-800 text-slate-500 flex items-center justify-center mx-auto">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-300">No Prediction Evaluated Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Fill in the 8 clinical metrics or click one of the quick test profiles above,
                  then click <strong>Calculate Diabetes Risk</strong> to invoke R's glm engine.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-left text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300">How R processes this:</span>
                <ol className="list-decimal list-inside text-[11px] space-y-1 text-slate-400">
                  <li>Validates numeric physiological ranges.</li>
                  <li>Imputes missing biological values using dataset medians.</li>
                  <li>Applies logistic link: <code className="text-medcyan-300 font-mono">p = 1 / (1 + e^-(β·X))</code>.</li>
                  <li>Returns probability and classification without hardcoded rules.</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
