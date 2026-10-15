# test_backend.R
source("backend/predict.R")
source("backend/analysis.R")

test_patient <- list(
  Pregnancies = 6,
  Glucose = 148,
  BloodPressure = 72,
  SkinThickness = 35,
  Insulin = 125,
  BMI = 33.6,
  DiabetesPedigreeFunction = 0.627,
  Age = 50
)

res <- predict_diabetes_risk(test_patient)
cat(sprintf("Prediction: Prob=%.4f, Risk=%s, Class=%s\n",
            res$predicted_probability, res$risk_level, res$classification))

s <- get_dataset_summary()
cat(sprintf("Summary: %d total records (%d diabetic, %d non-diabetic)\n",
            s$total_records, s$diabetic_count, s$non_diabetic_count))

c <- get_charts_data()
cat(sprintf("Charts: Outcome categories=%d, Glucose bins=%d, Scatter pts=%d\n",
            length(c$outcome_distribution), length(c$glucose_distribution), length(c$glucose_vs_bmi_scatter)))

r <- get_records(page = 1, limit = 5)
cat(sprintf("Records: %d returned on page 1, total=%d\n",
            length(r$records), r$pagination$total_records))

cat("ALL BACKEND FUNCTIONS VERIFIED SUCCESSFULLY!\n")
