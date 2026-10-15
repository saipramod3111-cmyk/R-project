# DiaPredict — Diabetes Risk Prediction Using R Programming

> **BCA Mini Project:** Diabetes Risk Prediction System Using R  
> **Academic Demonstration Platform:** Machine Learning & Statistical Computing in Healthcare Analytics

---

## 📌 1. Project Overview

**DiaPredict** is an end-to-end healthcare analytics web application developed for a Bachelor of Computer Applications (BCA) mini project. It estimates diabetes risk using an authentic **logistic regression statistical model trained in R** (`glm()` with `family = binomial`).

Unlike superficial demonstration apps that use hardcoded rules or emulate ML models in JavaScript, DiaPredict features a **genuine, distributed architecture**:
- The **R Backend** loads an Excel dataset (`readxl`), preprocesses clinical indicators, imputes physiological zeros, fits a binomial GLM model, calculates genuine held-out evaluation metrics, and serves real-time predictions via an **R Plumber REST API**.
- The **React + TypeScript + Vite Frontend** provides a responsive, dark navy healthcare dashboard with interactive charts (powered by **Recharts**) and connects directly to the R API service.

---

## 🛠️ 2. Technology Stack

| Tier | Technology | Purpose |
|---|---|---|
| **Statistical Modeling** | **R (v4.6.1 / >= 4.0.0)** | Model training, log-odds calculation, ROC-AUC integration |
| **Statistical Function** | `stats::glm(family = binomial)` | Binary logistic regression with logit link function |
| **Backend REST API** | **Plumber** (R package) | High-performance JSON HTTP API with CORS support |
| **Excel Integration** | **`readxl` & `writexl`** | Native ingestion and export of `.xlsx` spreadsheets |
| **Data Manipulation** | **`dplyr` & `jsonlite`** | Aggregations, binned distributions, JSON serialization |
| **Frontend Framework** | **React 19, TypeScript, Vite** | Single-page application architecture |
| **Styling & Icons** | **Tailwind CSS & Lucide Icons** | Healthcare dark navy palette, glassmorphism cards |
| **Data Visualization** | **Recharts** | Interactive ROC curve, scatter plots, distributions |
| **Frontend Deployment** | **Vercel** | Edge-hosted frontend with SPA routing rewrites |
| **Backend Deployment** | **Render / Railway / Docker** | Persistent R runtime container |

---

## 🏗️ 3. Repository Structure

```
diabetes-risk-prediction-r/
├── frontend/                     # React + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx        # Top navigation with live R API status pill
│   │   │   └── BackendAlert.tsx  # Offline connectivity alert & quick recovery
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Page 1: Dashboard overview & live R metrics
│   │   │   ├── Prediction.tsx    # Page 2: Clinical indicator prediction form
│   │   │   ├── DatasetPage.tsx   # Page 3: Excel dataset table, search, export & upload
│   │   │   ├── Visualizations.tsx# Page 4: 7 interactive Recharts charts & correlation matrix
│   │   │   ├── ModelPerformance.tsx # Page 5: Held-out test metrics, confusion matrix & ROC curve
│   │   │   └── ProjectInfo.tsx   # Page 6: Academic report, formulas, and architecture
│   │   ├── services/
│   │   │   └── api.ts            # Typed HTTP client communicating with R Plumber
│   │   ├── types/
│   │   │   └── index.ts          # Complete TypeScript interfaces
│   │   ├── App.tsx               # Main router & layout container
│   │   ├── index.css             # Tailwind base & healthcare theme definitions
│   │   └── main.tsx              # React DOM entrypoint
│   ├── public/
│   │   └── activity.svg          # Medical pulse favicon
│   ├── package.json              # Frontend npm dependencies
│   ├── tailwind.config.js        # Custom dark navy healthcare palette
│   ├── postcss.config.js         # PostCSS configuration
│   ├── vite.config.ts            # Vite build configuration
│   ├── vercel.json               # SPA routing rewrites for Vercel
│   └── .env.example              # Environment variables template
├── backend/                      # R Statistical Engine & Plumber API
│   ├── app.R                     # Main server entrypoint (launches on port 8000)
│   ├── plumber.R                 # API endpoints definition with CORS filter
│   ├── train_model.R             # Model training & genuine test-set evaluation script
│   ├── predict.R                 # Real-time inference engine using trained GLM model
│   ├── analysis.R                # Exploratory data analysis, summaries & pagination
│   ├── prepare_data.R            # Builds benchmark dataset into Excel (.xlsx) and CSV
│   ├── Dockerfile                # Production Docker container for cloud deployment
│   ├── data/
│   │   ├── diabetes.xlsx         # Primary Excel dataset (768 patient records)
│   │   └── diabetes.csv          # CSV mirror of the dataset
│   ├── models/
│   │   ├── diabetes_glm_model.rds # Serialized R GLM model object
│   │   ├── model_metrics.json    # Genuine evaluation metrics (Accuracy, ROC, AUC, F1)
│   │   ├── model_metrics.rds     # R binary copy of metrics
│   │   └── preprocessor.rds      # Imputation medians for physiological zeros
│   └── README.md                 # Detailed backend technical documentation
├── install_packages.R            # Automated R package installer
├── start_project.bat             # One-click Windows launcher for both backend & frontend
├── run_backend.bat               # Windows batch script to launch R Plumber
├── run_frontend.bat              # Windows batch script to launch Vite dev server
├── vercel.json                   # Root Vercel monorepo configuration
├── .gitignore                    # Git ignore rules for node_modules, R artifacts & cache
└── README.md                     # Project master documentation
```

---

## ⚡ 4. Quick Start (Running Locally)

### Prerequisites
1. **R (version >= 4.0.0)**: [Download R for Windows](https://cloud.r-project.org/bin/windows/base/)
2. **Node.js (LTS version >= 18.0.0)**: [Download Node.js](https://nodejs.org/)

### Option A: One-Click Launcher (Windows)
Double-click **`start_project.bat`** in the project root.  
It will automatically verify your R packages, train the model if not already generated, and launch both:
- **R Plumber API Backend:** `http://127.0.0.1:8000` (Swagger docs at `http://127.0.0.1:8000/__docs__/`)
- **React Frontend:** `http://localhost:5173`

---

### Option B: Manual Step-by-Step

#### Step 1: Install R Dependencies & Train Model
Open PowerShell or Command Prompt in the project root:
```bash
# 1. Install required R packages (plumber, readxl, writexl, dplyr, jsonlite)
Rscript install_packages.R

# 2. Prepare the benchmark Excel dataset
Rscript backend/prepare_data.R

# 3. Train the GLM logistic regression model
Rscript backend/train_model.R
```

#### Step 2: Start the R Backend
```bash
cd backend
Rscript app.R
```
*Leave this terminal window open. The R server will listen on `http://0.0.0.0:8000`.*

#### Step 3: Start the Frontend
Open a **new** terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🌐 5. Pages & Key Features

### 1. Home / Dashboard
- Displays **live statistics** calculated from the real Excel dataset: total patient records (768), diabetic cases (268, 34.9%), non-diabetic controls (500, 65.1%).
- Real-time display of genuine model performance: **76.6% Test Accuracy** and **0.8185 ROC-AUC**.
- Live indicator of R backend connectivity with automatic health-checking and one-click reconnect settings.

### 2. Diabetes Risk Prediction
- 8 clinical numeric inputs: **Pregnancies, Glucose, Blood Pressure, Skin Thickness, Insulin, BMI, Diabetes Pedigree Function, and Age**.
- Real-time client-side validation against biological reference intervals.
- 3 one-click academic presets: **High-Risk Profile**, **Low-Risk Profile**, and **Borderline Profile**.
- Configurable **Decision Cutoff Threshold slider** (default 0.50, range 0.20 - 0.80).
- Sends JSON payload to R backend `POST /predict`.
- Evaluates risk using R's fitted `glm()` model and displays:
  - Exact predicted probability percentage.
  - Risk tier badge: *Low Risk*, *Moderate Risk*, *High Risk*, or *Very High Risk*.
  - Categorization: *Diabetic (Outcome = 1)* or *Non-Diabetic (Outcome = 0)*.
  - Risk factor contribution breakdown comparing each indicator to clinical benchmarks and reporting model odds ratios.
  - Prominent educational disclaimer.

### 3. Dataset Management
- Directly browses records stored in `backend/data/diabetes.xlsx`.
- Instant search across Patient ID, Age, Glucose, and BMI.
- Filtering by diagnosis outcome (All, Diabetic, Non-Diabetic).
- Multi-column sorting and responsive pagination controls.
- **Export Options:** One-click download of the active Excel file (`.xlsx`) or CSV.
- **Upload Option:** Upload a custom `.xlsx` or `.csv` with automated schema and numeric type verification in R.
- Clinical Data Dictionary with variable descriptions, R data types, and units.

### 4. Data Visualizations
Interactive charts built with **Recharts** driven by aggregated R calculations:
1. **Outcome Distribution:** Donut chart showing dataset class balance.
2. **Average Glucose Comparison:** Mean plasma glucose in diabetics (142 mg/dL) vs non-diabetics (110 mg/dL).
3. **Glucose Frequency Distribution:** Binned histogram across 6 glucose intervals.
4. **BMI Categorization:** Stratification into WHO categories (Underweight, Normal, Overweight, Obese I, II, III).
5. **Patient Age Cohort Distribution:** Breakdown across age decades.
6. **Glucose vs BMI Scatter Plot:** 120-patient representative bivariate sample colored by diabetes outcome.
7. **Pearson Correlation Matrix Heatmap:** Pairwise correlation coefficients ($r$) across all 9 variables.
*Each chart features an academic interpretation highlighting that statistical correlation does not establish causality.*

### 5. Model Performance
- Genuine test-set performance metrics calculated on an independent 20% held-out test partition ($n=154$, seed 42):
  - **Test Accuracy:** 76.62%
  - **ROC-AUC:** 0.8185
  - **F1-Score:** 0.6327
  - **Sensitivity / Recall:** 61.54%
  - **Specificity:** 84.31%
  - **Precision:** 65.31%
- **Interactive Confusion Matrix:** 2x2 grid reporting True Positives (32), False Positives (16), True Negatives (86), and False Negatives (20), with clinical explanations of Type I and Type II errors.
- **ROC Curve Plot:** Recharts line chart plotting Sensitivity (TPR) vs 1-Specificity (FPR) across 100 threshold intervals, including a diagonal random baseline ($AUC=0.50$).
- **Regression Coefficients Table:** Reports $\beta$ estimates, standard errors, $z$-values, $p$-values, exponentiated Odds Ratios ($e^\beta$), and statistical significance flags ($p < 0.05$).
- **Model Diagnostics:** AIC (581.65), Null Deviance (792.69), Residual Deviance (563.65).

### 6. Project Information
- Comprehensive project report covering problem background, project objectives, mathematical derivation of the logit and sigmoid equations, Maximum Likelihood Estimation, R data preprocessing pipeline, technology stack matrix, and project limitations.

---

## 🚀 6. Step-by-Step Vercel Deployment Instructions

Follow these steps to deploy the React frontend on **Vercel**:

### Step 1: Push Code to GitHub
*(See section 8 below for complete Git & GitHub instructions).*

### Step 2: Import into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Select your GitHub repository (`diabetes-risk-prediction-r`).
4. In **Project Configuration**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend` (or leave as root if using the root `vercel.json`).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. In **Environment Variables**:
   - Key: `VITE_API_URL`
   - Value: `https://your-r-api.onrender.com` (Your deployed R backend URL; see Section 7 below).
   *(Note: You can also deploy without the variable initially, and configure the API URL dynamically inside the app using the settings modal in the navigation bar).*
6. Click **Deploy**.

---

## ☁️ 7. Step-by-Step R Backend Deployment Instructions

Because Vercel is designed for static and serverless Node.js runtimes, the persistent R Plumber API must be hosted on a cloud platform supporting Docker or R runtimes.

### Option A: Render (Recommended — Free & Automatic)
1. Sign up at [Render.com](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Name**: `diapredict-r-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`
5. Click **Create Web Service**.
6. Render will build the container using `backend/Dockerfile`, install R dependencies, train the model, and launch the Plumber API.
7. Once deployed, copy your service URL (e.g. `https://diapredict-r-api.onrender.com`).
8. Add this URL as `VITE_API_URL` in your Vercel project settings, or enter it into the DiaPredict frontend settings modal.

### Option B: Railway
1. Sign up at [Railway.app](https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository. In settings, set the **Root Directory** to `backend`.
4. Railway will automatically detect `Dockerfile` and expose your port.

### Option C: Fly.io
```bash
cd backend
fly launch
fly deploy
```

---

## 📦 8. Git & GitHub Upload Instructions

Run the following commands in your project folder (`d:\R project`) to initialize Git and upload your project to GitHub:

```bash
# 1. Initialize local Git repository
git init

# 2. Stage all project files (node_modules and temporary files are excluded by .gitignore)
git add .

# 3. Create initial commit
git commit -m "feat: complete DiaPredict diabetes risk prediction system with R Plumber and React"

# 4. Set main branch
git branch -M main

# 5. Link your remote GitHub repository (replace with your actual GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/diabetes-risk-prediction-r.git

# 6. Push to GitHub
git push -u origin main
```

---

## ⚠️ 9. Academic Project Disclaimer

> **IMPORTANT MEDICAL NOTICE:**  
> DiaPredict is strictly an academic project created for educational demonstration in a Bachelor of Computer Applications (BCA) curriculum. It is intended to illustrate the integration of R statistical computing with modern web technologies.  
> The predicted probabilities and risk categorizations are **statistical estimations** based on historical benchmark datasets and **must not be used for medical diagnosis, clinical treatment, prescription, or health-management decisions**. Consult a certified medical healthcare provider for clinical evaluation.
