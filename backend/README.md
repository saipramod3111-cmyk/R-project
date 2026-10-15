# DiaPredict — R Plumber API Service

This is the backend service for the **DiaPredict** Diabetes Risk Prediction System, implemented in **R** using **Plumber**, **stats::glm**, **readxl**, **writexl**, and **dplyr**.

---

## 📁 Backend Directory Structure

```
backend/
├── app.R                  # Main server launcher (pr$run on port 8000)
├── plumber.R              # Plumber REST API routes and CORS filters
├── train_model.R          # Logistic regression training & genuine evaluation script
├── predict.R              # Real-time inference engine using trained glm model
├── analysis.R             # Dataset summaries, chart aggregates & paginated records
├── prepare_data.R         # Converts benchmark data to Excel (.xlsx) and CSV
├── Dockerfile             # Production container for cloud deployment (Render, Fly.io, Railway)
├── data/
│   ├── diabetes.xlsx      # Primary Excel dataset (768 patient records)
│   └── diabetes.csv       # CSV copy of the dataset
└── models/
    ├── diabetes_glm_model.rds # Trained logistic regression model object
    ├── model_metrics.json     # Genuine test-set evaluation metrics (ROC, AUC, accuracy, etc.)
    ├── model_metrics.rds      # R binary copy of metrics
    └── preprocessor.rds       # Feature medians for clinical imputation
```

---

## 🚀 Local Setup & Execution

### 1. Prerequisites
- **R (>= 4.0.0)** installed on your machine.
- Verify R in terminal:
  ```bash
  Rscript --version
  ```

### 2. Install Required R Packages
Run the provided installer script:
```bash
Rscript ../install_packages.R
```
Or directly from the R console:
```R
install.packages(c("plumber", "readxl", "writexl", "dplyr", "jsonlite"), repos = "https://cloud.r-project.org")
```

### 3. Prepare Data & Train Model
```bash
Rscript prepare_data.R
Rscript train_model.R
```

### 4. Start the Plumber Server
```bash
Rscript app.R
```
The server will start on `http://127.0.0.1:8000`. You can test it by visiting `http://127.0.0.1:8000/__docs__/` for the interactive Swagger documentation.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Healthcheck and R version inspection |
| `GET` | `/summary` | Total records, outcome split, and column statistics |
| `GET` | `/records?page=1&limit=15&search=&outcome=all` | Paginated and filtered patient records |
| `GET` | `/charts` | Precomputed aggregations for interactive Recharts visualizations |
| `GET` | `/metrics` | Genuine test-set evaluation metrics, ROC coordinates, and coefficients |
| `POST` | `/predict` | Evaluates patient metrics and returns probability via R GLM model |
| `GET` | `/download` | Direct binary download of active Excel (.xlsx) dataset |
| `GET` | `/download-csv` | Direct download of active CSV dataset |
| `POST` | `/upload` | Multipart file upload of custom .xlsx or .csv dataset with schema validation |

### Sample `POST /predict` Payload
```json
{
  "Pregnancies": 6,
  "Glucose": 148,
  "BloodPressure": 72,
  "SkinThickness": 35,
  "Insulin": 125,
  "BMI": 33.6,
  "DiabetesPedigreeFunction": 0.627,
  "Age": 50,
  "threshold": 0.50
}
```

---

## ☁️ Deployment Instructions

### Option 1: Render (Recommended Free/Easy Docker Service)
1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com).
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository.
5. In settings:
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Docker Context**: `backend`
   - **DockerfilePath**: `backend/Dockerfile`
6. Click **Deploy Web Service**.
7. Copy your assigned Render URL (e.g. `https://diapredict-api.onrender.com`) and set it as `VITE_API_URL` on Vercel.

### Option 2: Railway
1. Sign in to [Railway.app](https://railway.app).
2. Create **New Project** → **Deploy from GitHub repo**.
3. Select your repo and point the root directory to `backend`. Railway will detect the `Dockerfile` automatically.

### Option 3: Fly.io
```bash
cd backend
fly launch
fly deploy
```
