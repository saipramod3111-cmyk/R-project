# backend/train_model.R
# Trains a Logistic Regression model using glm(family = binomial) on the Diabetes Excel dataset.
# Evaluates genuinely on an 80/20 train/test split with reproducible seed.

library(readxl)
library(dplyr)
library(jsonlite)

set.seed(42)

data_path <- file.path("data", "diabetes.xlsx")
if (!file.exists(data_path)) {
  data_path <- file.path("backend", "data", "diabetes.xlsx")
}
if (!file.exists(data_path)) {
  stop("Dataset not found at data/diabetes.xlsx or backend/data/diabetes.xlsx")
}

cat("Loading dataset from Excel:", data_path, "\n")
df <- as.data.frame(readxl::read_excel(data_path))

# Check columns
expected_cols <- c("Pregnancies", "Glucose", "BloodPressure", "SkinThickness", 
                   "Insulin", "BMI", "DiabetesPedigreeFunction", "Age", "Outcome")
stopifnot(all(expected_cols %in% names(df)))

# Identify physiologically invalid zeros (Glucose, BloodPressure, SkinThickness, Insulin, BMI)
zero_cols <- c("Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI")
imputation_medians <- list()

# Calculate medians from positive non-zero entries for imputation
for (col in zero_cols) {
  valid_vals <- df[[col]][df[[col]] > 0 & !is.na(df[[col]])]
  imputation_medians[[col]] <- round(median(valid_vals, na.rm = TRUE), 2)
}

cat("Calculated imputation medians for biological features with 0 values:\n")
print(imputation_medians)

# Create preprocessed copy where 0s in biological metrics are imputed with median
df_clean <- df
for (col in zero_cols) {
  df_clean[[col]][df_clean[[col]] == 0 | is.na(df_clean[[col]])] <- imputation_medians[[col]]
}

# 80/20 Train / Test Split
n <- nrow(df_clean)
train_indices <- sample(seq_len(n), size = floor(0.80 * n), replace = FALSE)
train_data <- df_clean[train_indices, ]
test_data  <- df_clean[-train_indices, ]

cat(sprintf("Training samples: %d | Test samples: %d\n", nrow(train_data), nrow(test_data)))

# Train Logistic Regression Model using glm with family = binomial
model_formula <- Outcome ~ Pregnancies + Glucose + BloodPressure + SkinThickness + Insulin + BMI + DiabetesPedigreeFunction + Age
model <- glm(model_formula, data = train_data, family = binomial(link = "logit"))

cat("Model fitting complete.\n")

# Evaluation on held-out test set
test_probs <- predict(model, newdata = test_data, type = "response")
threshold <- 0.50
test_preds <- ifelse(test_probs >= threshold, 1, 0)
actuals <- test_data$Outcome

# Confusion matrix calculation
tp <- sum(test_preds == 1 & actuals == 1)
tn <- sum(test_preds == 0 & actuals == 0)
fp <- sum(test_preds == 1 & actuals == 0)
fn <- sum(test_preds == 0 & actuals == 1)
total_test <- length(actuals)

accuracy    <- (tp + tn) / total_test
precision   <- ifelse((tp + fp) > 0, tp / (tp + fp), 0)
recall      <- ifelse((tp + fn) > 0, tp / (tp + fn), 0) # Sensitivity
specificity <- ifelse((tn + fp) > 0, tn / (tn + fp), 0)
f1_score    <- ifelse((precision + recall) > 0, 2 * (precision * recall) / (precision + recall), 0)

# Calculate ROC Curve & AUC via trapezoidal integration
roc_thresholds <- seq(0, 1, by = 0.01)
roc_points <- list()

for (th in roc_thresholds) {
  p_class <- ifelse(test_probs >= th, 1, 0)
  cur_tp <- sum(p_class == 1 & actuals == 1)
  cur_fp <- sum(p_class == 1 & actuals == 0)
  cur_tn <- sum(p_class == 0 & actuals == 0)
  cur_fn <- sum(p_class == 0 & actuals == 1)
  
  tpr <- ifelse((cur_tp + cur_fn) > 0, cur_tp / (cur_tp + cur_fn), 0)
  fpr <- ifelse((cur_tn + cur_fp) > 0, cur_fp / (cur_tn + cur_fp), 0)
  
  roc_points[[length(roc_points) + 1]] <- list(
    threshold = round(th, 2),
    fpr = round(as.numeric(fpr), 4),
    tpr = round(as.numeric(tpr), 4)
  )
}

# Sort by FPR ascending for trapezoidal AUC integration
fpr_vec <- sapply(roc_points, function(x) x$fpr)
tpr_vec <- sapply(roc_points, function(x) x$tpr)
ord <- order(fpr_vec, tpr_vec)
sorted_fpr <- fpr_vec[ord]
sorted_tpr <- tpr_vec[ord]

# Trapezoidal rule for AUC
auc <- 0
for (i in 1:(length(sorted_fpr) - 1)) {
  dx <- sorted_fpr[i + 1] - sorted_fpr[i]
  y_mean <- (sorted_tpr[i + 1] + sorted_tpr[i]) / 2
  auc <- auc + (dx * y_mean)
}
auc <- round(as.numeric(auc), 4)

# Model coefficient analysis
s <- summary(model)
coef_df <- as.data.frame(s$coefficients)
coef_list <- list()
for (i in 1:nrow(coef_df)) {
  var_name <- rownames(coef_df)[i]
  coef_val <- coef_df[i, "Estimate"]
  odds_ratio <- exp(coef_val)
  coef_list[[i]] <- list(
    variable = var_name,
    estimate = round(coef_val, 4),
    std_error = round(coef_df[i, "Std. Error"], 4),
    z_value = round(coef_df[i, "z value"], 4),
    p_value = round(coef_df[i, "Pr(>|z|)"], 6),
    odds_ratio = round(odds_ratio, 4),
    significant = coef_df[i, "Pr(>|z|)"] < 0.05
  )
}

# Structure metrics payload
metrics_payload <- list(
  model_type = "Logistic Regression (Binary Binomial GLM)",
  formula = "Outcome ~ Pregnancies + Glucose + BloodPressure + SkinThickness + Insulin + BMI + DiabetesPedigreeFunction + Age",
  seed = 42,
  train_split = 0.80,
  train_samples = nrow(train_data),
  test_samples = nrow(test_data),
  classification_threshold = threshold,
  metrics = list(
    accuracy = round(accuracy, 4),
    precision = round(precision, 4),
    recall = round(recall, 4),
    sensitivity = round(recall, 4),
    specificity = round(specificity, 4),
    f1_score = round(f1_score, 4),
    roc_auc = auc
  ),
  confusion_matrix = list(
    true_positive = tp,
    true_negative = tn,
    false_positive = fp,
    false_negative = fn,
    total = total_test
  ),
  roc_curve = roc_points,
  coefficients = coef_list,
  diagnostics = list(
    aic = round(s$aic, 2),
    null_deviance = round(s$null.deviance, 2),
    residual_deviance = round(s$deviance, 2),
    df_null = s$df.null,
    df_residual = s$df.residual
  ),
  imputation_medians = imputation_medians,
  trained_at = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC", tz = "UTC"),
  version = "1.0.0"
)

# Ensure models directory exists
model_dir <- if (dir.exists("models")) "models" else file.path("backend", "models")
if (!dir.exists(model_dir)) dir.create(model_dir, recursive = TRUE)

saveRDS(model, file = file.path(model_dir, "diabetes_glm_model.rds"))
saveRDS(metrics_payload, file = file.path(model_dir, "model_metrics.rds"))
saveRDS(imputation_medians, file = file.path(model_dir, "preprocessor.rds"))

writeLines(
  jsonlite::toJSON(metrics_payload, pretty = TRUE, auto_unbox = TRUE),
  con = file.path(model_dir, "model_metrics.json")
)

cat("Successfully trained model and exported:\n")
cat("- Model: ", file.path(model_dir, "diabetes_glm_model.rds"), "\n")
cat("- Metrics: ", file.path(model_dir, "model_metrics.json"), "\n")
cat(sprintf("Test Accuracy: %.2f%% | Test AUC: %.4f | F1: %.4f\n",
            accuracy * 100, auc, f1_score))
