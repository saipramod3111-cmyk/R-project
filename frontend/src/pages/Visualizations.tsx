// frontend/src/pages/Visualizations.tsx
import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  ScatterChart as ScatterIcon,
  Grid,
  RefreshCw,
  AlertCircle,
  Info,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { api } from '../services/api';
import { ChartsData } from '../types';

interface VisualizationsProps {
  isOnline: boolean;
}

export const Visualizations: React.FC<VisualizationsProps> = ({ isOnline }) => {
  const [data, setData] = useState<ChartsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCharts();
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data from R backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharts();
  }, [isOnline]);

  if (loading && !data) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-medblue-400" />
        <p className="text-sm text-slate-400">Loading chart analytics from R backend...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-2xl bg-navy-900 border border-navy-800 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Chart Data Unavailable</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
        <button
          onClick={fetchCharts}
          className="px-4 py-2 bg-medblue-600 hover:bg-medblue-500 text-white rounded-xl text-xs font-semibold"
        >
          Retry Loading Charts
        </button>
      </div>
    );
  }

  // Pre-split scatter data for diabetic vs non-diabetic
  const scatterNonDiabetic = data.glucose_vs_bmi_scatter.filter((d) => d.outcome === 0);
  const scatterDiabetic = data.glucose_vs_bmi_scatter.filter((d) => d.outcome === 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-medcyan-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Exploratory Data Analysis</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Data Distribution & Clinical Visualizations
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Interactive charts generated from genuine data aggregates calculated by the R backend.
          </p>
        </div>

        <button
          onClick={fetchCharts}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-850 border border-navy-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Charts</span>
        </button>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Outcome Distribution */}
        <div className="bg-navy-900/90 rounded-2xl border border-navy-800 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-medblue-400" />
                <span>1. Diabetes Outcome Distribution</span>
              </h3>
              <p className="text-xs text-slate-400">Class balance in the study dataset</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.outcome_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="name"
                >
                  {data.outcome_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#273456', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value} patients (${item.payload.percentage}%)`,
                    name,
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800/80 text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-medblue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Interpretation:</span> Approximately{' '}
              <strong className="text-rose-400">{data.outcome_distribution[1]?.percentage}%</strong> of
              the dataset represents diagnosed diabetic individuals (Outcome = 1), whereas{' '}
              <strong className="text-medblue-400">{data.outcome_distribution[0]?.percentage}%</strong> are
              non-diabetic controls. This reflects a ~65:35 class imbalance typical in diagnostic clinical cohorts.
            </div>
          </div>
        </div>

        {/* Chart 2: Average Glucose by Outcome */}
        <div className="bg-navy-900/90 rounded-2xl border border-navy-800 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-medcyan-400" />
                <span>2. Average Glucose Level by Outcome</span>
              </h3>
              <p className="text-xs text-slate-400">Mean plasma glucose (mg/dL) comparison</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.glucose_by_outcome}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="outcome" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} unit=" mg/dL" domain={[0, 180]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#273456', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                  formatter={(val: any) => [`${val} mg/dL`, 'Average Glucose']}
                />
                <Bar dataKey="avgGlucose" fill="#0EA5E9" radius={[8, 8, 0, 0]}>
                  {data.glucose_by_outcome.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.outcome === 'Diabetic' ? '#EF4444' : '#0EA5E9'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800/80 text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-medcyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Interpretation:</span> The average glucose
              level in the diabetic subgroup (~142 mg/dL) is significantly higher than in non-diabetics (~110 mg/dL).
              While elevated blood sugar is strongly associated with diabetes, <em>statistical correlation does not prove causation</em>;
              insulin deficiency or receptor resistance mediates this relationship.
            </div>
          </div>
        </div>

        {/* Chart 3: Glucose Distribution Histogram */}
        <div className="bg-navy-900/90 rounded-2xl border border-navy-800 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>3. Glucose Frequency Distribution</span>
              </h3>
              <p className="text-xs text-slate-400">Binned patient distribution across glucose tiers</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.glucose_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="bin" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={11} unit=" pts" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#273456', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                  formatter={(val: any) => [`${val} patients`, 'Count']}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800/80 text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Interpretation:</span> Glucose levels
              peak in the 90-114 mg/dL normal range, with a substantial right-skewed tail reaching above
              190 mg/dL corresponding to high-risk diabetic presentations.
            </div>
          </div>
        </div>

        {/* Chart 4: BMI Distribution (WHO Categories) */}
        <div className="bg-navy-900/90 rounded-2xl border border-navy-800 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>4. BMI Distribution (WHO Categories)</span>
              </h3>
              <p className="text-xs text-slate-400">Stratification by Body Mass Index classification</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bmi_distribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" stroke="#64748B" fontSize={10} />
                <YAxis dataKey="category" type="category" stroke="#64748B" fontSize={9} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#273456', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                  formatter={(val: any) => [`${val} patients`, 'Count']}
                />
                <Bar dataKey="count" fill="#10B981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800/80 text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Interpretation:</span> A majority of
              patients in this cohort fall within the Overweight and Obese Class I/II brackets (BMI 25 - 39.9).
              Adiposity is a clinically established risk cofactor in metabolic syndrome.
            </div>
          </div>
        </div>

        {/* Chart 5: Age Demographics */}
        <div className="bg-navy-900/90 rounded-2xl border border-navy-800 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>5. Patient Age Cohort Distribution</span>
              </h3>
              <p className="text-xs text-slate-400">Patient count across age decades</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.age_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="ageGroup" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} unit=" pts" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#273456', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800/80 text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Interpretation:</span> The largest cohort
              is aged 21-29. Although younger cohorts have higher overall numbers, incidence rates
              rise sharply in the 30-49 age intervals in the dataset.
            </div>
          </div>
        </div>

        {/* Chart 6: Glucose vs BMI Scatter Plot */}
        <div className="bg-navy-900/90 rounded-2xl border border-navy-800 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ScatterIcon className="w-4 h-4 text-rose-400" />
                <span>6. Glucose vs. BMI by Clinical Outcome</span>
              </h3>
              <p className="text-xs text-slate-400">Bivariate scatter comparison (n=120 sample)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" dataKey="bmi" name="BMI" unit=" kg/m²" stroke="#64748B" fontSize={10} domain={[15, 60]} />
                <YAxis type="number" dataKey="glucose" name="Glucose" unit=" mg/dL" stroke="#64748B" fontSize={10} domain={[50, 210]} />
                <ZAxis range={[35, 35]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#273456', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(val: any, name: any) => [val, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                <Scatter name="Non-Diabetic (Outcome 0)" data={scatterNonDiabetic} fill="#0EA5E9" fillOpacity={0.7} />
                <Scatter name="Diabetic (Outcome 1)" data={scatterDiabetic} fill="#EF4444" fillOpacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800/80 text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Interpretation:</span> Red points (Diabetic)
              cluster toward the upper-right quadrant (elevated Glucose &gt; 130 and BMI &gt; 30).
              Patients in the lower-left quadrant (Glucose &lt; 110, BMI &lt; 26) are overwhelmingly non-diabetic.
            </div>
          </div>
        </div>
      </div>

      {/* Chart 7: Pearson Correlation Matrix Table / Heatmap */}
      <div className="bg-navy-900/90 rounded-2xl border border-navy-800 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Grid className="w-4 h-4 text-medblue-400" />
              <span>7. Pearson Correlation Matrix Heatmap</span>
            </h3>
            <p className="text-xs text-slate-400">
              Pairwise correlation coefficients (<code className="text-medcyan-300 font-mono text-xs">r</code>) across all 8 features and target Outcome
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800">
              <tr>
                <th className="p-2 text-left">Variable</th>
                {data.numeric_variables.map((v) => (
                  <th key={v} className="p-2 font-mono text-[10px] text-slate-300">
                    {v.slice(0, 7)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono text-[11px]">
              {data.numeric_variables.map((rowVar) => (
                <tr key={rowVar} className="hover:bg-navy-800/30">
                  <td className="p-2 text-left font-semibold text-slate-200 font-sans text-xs">
                    {rowVar}
                  </td>
                  {data.numeric_variables.map((colVar) => {
                    const item = data.correlation_matrix.find(
                      (c) => c.var1 === rowVar && c.var2 === colVar
                    );
                    const val = item ? item.correlation : 0;
                    const isSelf = rowVar === colVar;
                    const isOutcome = colVar === 'Outcome' || rowVar === 'Outcome';

                    // Color based on correlation intensity
                    let cellBg = 'bg-navy-950';
                    let cellText = 'text-slate-400';

                    if (isSelf) {
                      cellBg = 'bg-slate-800/60';
                      cellText = 'text-white font-bold';
                    } else if (val >= 0.40) {
                      cellBg = 'bg-rose-500/25 text-rose-300 font-bold';
                    } else if (val >= 0.20) {
                      cellBg = 'bg-amber-500/20 text-amber-300';
                    } else if (val > 0.05) {
                      cellBg = 'bg-medblue-500/10 text-medblue-300';
                    } else if (val < -0.05) {
                      cellBg = 'bg-emerald-500/10 text-emerald-300';
                    }

                    return (
                      <td
                        key={`${rowVar}-${colVar}`}
                        className={`p-2 transition-colors ${cellBg} ${cellText} ${
                          isOutcome ? 'border-l border-navy-700' : ''
                        }`}
                        title={`${rowVar} vs ${colVar}: r = ${val}`}
                      >
                        {val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 rounded-xl bg-navy-950/70 border border-navy-800/80 text-xs text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-medblue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Methodological Note:</span> Glucose exhibits
            the strongest positive linear correlation with diabetes Outcome (<code className="text-rose-300 font-mono">r = 0.47</code>),
            followed by BMI (<code className="text-amber-300 font-mono">r = 0.29</code>) and Age (<code className="text-medblue-300 font-mono">r = 0.24</code>).
            High correlation highlights important feature candidates for logistic regression, but does <strong>not</strong> imply direct causality.
          </div>
        </div>
      </div>
    </div>
  );
};
