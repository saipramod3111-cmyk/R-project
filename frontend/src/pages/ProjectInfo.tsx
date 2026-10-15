// frontend/src/pages/ProjectInfo.tsx
import React from 'react';
import {
  BookOpen,
  Code,
  FileSpreadsheet,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Server,
  Workflow,
} from 'lucide-react';

export const ProjectInfo: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-medblue-400 mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Academic Project Documentation</span>
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Project Specification & Methodology
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          BCA Mini Project: <strong>Diabetes Risk Prediction Using R Programming (DiaPredict)</strong>
        </p>
      </div>

      {/* Problem Statement & Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Problem Statement</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Diabetes mellitus is an escalating global health crisis associated with severe microvascular
            and macrovascular complications. Early screening can prevent irreversible organ damage, but
            clinical diagnostic appointments often face bottlenecks. There is a strong need for accessible,
            transparent statistical estimation tools that leverage verified diagnostic indicators
            (such as glucose levels, BMI, pedigree functions, and age) without relying on opaque black-box models.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-3">
          <div className="flex items-center gap-2 text-medcyan-400 font-bold text-sm uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Project Objectives</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>
              Apply <strong>R programming</strong> for statistical computing, data preprocessing, and model estimation.
            </li>
            <li>
              Train and validate a <strong>binomial logistic regression</strong> model (<code className="text-medcyan-300 font-mono">glm()</code>) on a standardized clinical diabetes dataset.
            </li>
            <li>
              Implement direct <strong>Excel integration</strong> via <code className="text-emerald-300 font-mono">readxl</code> and <code className="text-emerald-300 font-mono">writexl</code> in R.
            </li>
            <li>
              Expose R statistical capabilities via a high-performance <strong>Plumber REST API</strong>.
            </li>
            <li>
              Deliver an intuitive, modern, responsive <strong>React & TypeScript</strong> healthcare analytics dashboard.
            </li>
          </ul>
        </div>
      </div>

      {/* Theoretical Foundation: Logistic Regression in R */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <div className="flex items-center gap-2 text-medblue-400 font-bold text-sm uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          <span>Mathematical & Statistical Foundation: Logistic Regression</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          In binary classification, linear regression is inappropriate because predicted probabilities
          can fall outside the <code className="text-medcyan-300 font-mono">[0, 1]</code> bounds. Logistic regression
          solves this by transforming the linear predictor using the <strong>logit link function</strong>:
        </p>

        {/* Math Display */}
        <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 text-center font-mono text-xs text-medcyan-300 space-y-2">
          <div>Log-Odds (Logit): log( p / (1 - p) ) = β₀ + β₁·Pregnancies + β₂·Glucose + ... + β₈·Age</div>
          <div className="text-slate-400">Sigmoid Probability Transformation:</div>
          <div className="text-sm font-bold text-white">p(Outcome = 1 | X) = 1 / ( 1 + e^-(β₀ + Σ βᵢ·Xᵢ) )</div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The regression coefficients <code className="text-medcyan-300 font-mono">β</code> are estimated via
          <strong> Maximum Likelihood Estimation (MLE)</strong> using iteratively reweighted least squares (IRLS)
          in R's standard library <code className="text-medcyan-300 font-mono">stats::glm(family = binomial(link = "logit"))</code>.
          Exponentiating the coefficients (<code className="text-medblue-300 font-mono">exp(βᵢ)</code>) yields the
          <strong> Odds Ratio</strong>, quantifying the multiplicative change in odds of diabetes per one-unit increase in predictor <code className="text-medcyan-300 font-mono">Xᵢ</code>.
        </p>
      </div>

      {/* R Data Preprocessing Pipeline */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
          <Workflow className="w-4 h-4" />
          <span>Data Preprocessing & Excel Pipeline</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
            <span className="font-bold text-white">1. Excel Ingestion</span>
            <p className="text-slate-400">
              The primary dataset is stored as <code className="text-emerald-400 font-mono">diabetes.xlsx</code>.
              R's <code className="text-emerald-400 font-mono">readxl::read_excel()</code> parses sheets directly into an R data frame without external dependencies.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
            <span className="font-bold text-white">2. Physiological 0 Imputation</span>
            <p className="text-slate-400">
              Biological indicators like Glucose, Diastolic BP, Skin Thickness, Insulin, and BMI cannot equal 0 in living subjects.
              The pipeline calculates column medians from non-zero records and imputes missing zeros systematically.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
            <span className="font-bold text-white">3. Train/Test Partitioning</span>
            <p className="text-slate-400">
              An 80/20 train/test split is applied using a fixed random seed (<code className="text-medcyan-300 font-mono">set.seed(42)</code>).
              Metrics are calculated solely on the 154 held-out test rows to prevent optimistic overfitting bias.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack Matrix */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Full Architecture Technology Stack</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-navy-800">
              <tr>
                <th className="p-3">Component</th>
                <th className="p-3">Technology / Library</th>
                <th className="p-3">Role & Responsibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-white">Statistical Core</td>
                <td className="p-3 font-mono text-medcyan-300">R (v4.6.1) + stats::glm</td>
                <td className="p-3">Fits binomial logistic regression, computes deviance and odds ratios</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Excel Integration</td>
                <td className="p-3 font-mono text-emerald-300">readxl & writexl</td>
                <td className="p-3">Reads native .xlsx sheets and generates clean Excel exports</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Backend API</td>
                <td className="p-3 font-mono text-medblue-300">R Plumber REST API</td>
                <td className="p-3">Exposes JSON endpoints (/predict, /records, /charts, /metrics, /download)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Data Wrangling</td>
                <td className="p-3 font-mono text-medcyan-300">dplyr & jsonlite</td>
                <td className="p-3">Transforms dataframes, computes aggregations, serializes JSON</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Frontend Framework</td>
                <td className="p-3 font-mono text-indigo-300">React 19 + TypeScript + Vite</td>
                <td className="p-3">Single Page Application deployed on Vercel with type safety</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Styling & UI</td>
                <td className="p-3 font-mono text-slate-200">Tailwind CSS + Lucide Icons</td>
                <td className="p-3">Modern healthcare dark navy palette, responsive cards and micro-animations</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Visualization</td>
                <td className="p-3 font-mono text-amber-300">Recharts</td>
                <td className="p-3">Interactive ROC curve, scatter plots, distributions, and confusion matrix</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Limitations & Future Enhancements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Current Limitations</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Demographic specificity: cohort limited to Pima Indian females aged 21 and older.</li>
            <li>Moderate sample size: 768 total records restrict sub-group generalization.</li>
            <li>Linearity assumption in log-odds: interaction terms and non-linear splines not yet fitted.</li>
            <li>Cross-sectional measurement: single 2-hour post-challenge glucose rather than continuous monitoring.</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-3">
          <div className="flex items-center gap-2 text-medcyan-400 font-bold text-sm uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>Future Enhancements</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Regularized regression: evaluate LASSO (<code className="text-medcyan-300 font-mono">glmnet</code>) for variable selection.</li>
            <li>Ensemble models: compare GLM performance against Random Forest (<code className="text-medcyan-300 font-mono">ranger</code>) and XGBoost.</li>
            <li>Multi-ethnic benchmark cohorts (e.g. NHANES diabetes survey).</li>
            <li>Automated periodic retraining pipeline triggered upon Excel dataset upload.</li>
          </ul>
        </div>
      </div>

      {/* Academic Disclaimer Card */}
      <div className="p-6 rounded-2xl bg-navy-900/90 border border-medblue-500/30 space-y-3">
        <div className="flex items-center gap-2 text-medblue-400 font-bold text-sm uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Academic Mini Project Disclaimer</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          DiaPredict was developed strictly as an educational mini-project for the Bachelor of Computer Applications (BCA)
          curriculum to demonstrate statistical learning in R, web API architecture with Plumber, and modern frontend design.
          The calculated probabilities are academic estimates and must under no circumstances be used for clinical diagnosis,
          patient triage, or prescription purposes.
        </p>
      </div>
    </div>
  );
};
