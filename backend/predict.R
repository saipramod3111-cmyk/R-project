# backend/predict.R
# Loads the trained R GLM Logistic Regression model and computes prediction probability
# along with feature impact explanations, risk tier, and educational disclaimer.

get_model_path <- function() {
  candidates <- c(
    file.path("models", "diabetes_glm_model.rds"),
    file.path("backend", "models", "diabetes_glm_model.rds"),
    file.path("..", "models", "diabetes_glm_model.rds")
  )
  for (c in candidates) {
    if (file.exists(c)) return(c)
  }
  stop("Trained model not found at models/diabetes_glm_model.rds. Run train_model.R first.")
}

get_preprocessor_path <- function() {
  candidates <- c(
    file.path("models", "preprocessor.rds"),
    file.path("backend", "models", "preprocessor.rds"),
    file.path("..", "models", "preprocessor.rds")
  )
  for (c in candidates) {
    if (file.exists(c)) return(c)
  }
  NULL
}

# Cache model and preprocessor in memory
.model_env <- new.env()
.model_env$model <- NULL
.model_env$imputation_medians <- NULL

load_prediction_engine <- function() {
  if (is.null(.model_env$model)) {
    model_file <- get_model_path()
    .model_env$model <- readRDS(model_file)
    cat("Loaded trained GLM model:", model_file, "\n")
    
    prep_file <- get_preprocessor_path()
    if (!is.null(prep_file) && file.exists(prep_file)) {
      .model_env$imputation_medians <- readRDS(prep_file)
    } else {
      # Defaults if preprocessor not found
      .model_env$imputation_medians <- list(
        Glucose = 117, BloodPressure = 72, SkinThickness = 29, Insulin = 125, BMI = 32.3
      )
    }
  }
  .model_env$model
}

# Pre-load on sourcing
tryCatch({
  load_prediction_engine()
}, error = function(e) {
  warning("Model could not be pre-loaded at source: ", e$message)
})

# Clinical reference thresholds for contributing factor explanations
CLINICAL_BENCHMARKS <- list(
  Pregnancies = list(normal_max = 2, unit = "count", name = "Pregnancies"),
  Glucose = list(normal_max = 140, warning_threshold = 125, unit = "mg/dL", name = "Fasting/2h Glucose"),
  BloodPressure = list(normal_max = 80, warning_threshold = 90, unit = "mm Hg", name = "Diastolic Blood Pressure"),
  SkinThickness = list(normal_max = 25, unit = "mm", name = "Triceps Skinfold"),
  Insulin = list(normal_max = 160, unit = "mu U/ml", name = "2-Hour Serum Insulin"),
  BMI = list(normal_max = 25, warning_threshold = 30, unit = "kg/m²", name = "Body Mass Index"),
  DiabetesPedigreeFunction = list(normal_max = 0.50, unit = "score", name = "Genetic Pedigree Function"),
  Age = list(normal_max = 45, unit = "years", name = "Patient Age")
)

# Predict risk function
predict_diabetes_risk <- function(input_data) {
  model <- load_prediction_engine()
  medians <- .model_env$imputation_medians
  
  # Validation
  errors <- c()
  req_fields <- c("Pregnancies", "Glucose", "BloodPressure", "SkinThickness", 
                  "Insulin", "BMI", "DiabetesPedigreeFunction", "Age")
  
  for (f in req_fields) {
    if (is.null(input_data[[f]])) {
      errors <- c(errors, paste("Missing required field:", f))
    }
  }
  
  if (length(errors) > 0) {
    return(list(
      success = FALSE,
      error = paste(errors, collapse = "; ")
    ))
  }
  
  # Coerce to numeric
  num_inputs <- list()
  for (f in req_fields) {
    val <- suppressWarnings(as.numeric(input_data[[f]]))
    if (is.na(val)) {
      errors <- c(errors, paste("Field must be a valid number:", f))
    }
    num_inputs[[f]] <- val
  }
  
  if (length(errors) > 0) {
    return(list(
      success = FALSE,
      error = paste(errors, collapse = "; ")
    ))
  }
  
  # Physiological range sanity validation
  if (num_inputs$Age < 1 || num_inputs$Age > 120) {
    return(list(success = FALSE, error = "Age must be between 1 and 120."))
  }
  if (num_inputs$Pregnancies < 0 || num_inputs$Pregnancies > 30) {
    return(list(success = FALSE, error = "Pregnancies must be between 0 and 30."))
  }
  if (num_inputs$Glucose < 0 || num_inputs$Glucose > 500) {
    return(list(success = FALSE, error = "Glucose must be between 0 and 500 mg/dL."))
  }
  if (num_inputs$BloodPressure < 0 || num_inputs$BloodPressure > 250) {
    return(list(success = FALSE, error = "Blood Pressure must be between 0 and 250 mm Hg."))
  }
  if (num_inputs$BMI < 0 || num_inputs$BMI > 90) {
    return(list(success = FALSE, error = "BMI must be between 0 and 90."))
  }
  if (num_inputs$DiabetesPedigreeFunction < 0 || num_inputs$DiabetesPedigreeFunction > 5) {
    return(list(success = FALSE, error = "Diabetes Pedigree Function must be between 0 and 5.0."))
  }
  
  # Impute 0 values if biological indicator is 0 (as in clinical study protocol)
  clean_inputs <- num_inputs
  imputed_fields <- c()
  for (col in c("Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI")) {
    if (clean_inputs[[col]] == 0 && !is.null(medians[[col]])) {
      clean_inputs[[col]] <- medians[[col]]
      imputed_fields <- c(imputed_fields, col)
    }
  }
  
  # Create data frame for predict()
  newdata <- as.data.frame(clean_inputs)
  
  # Calculate prediction using R's glm model
  prob <- as.numeric(predict(model, newdata = newdata, type = "response"))
  prob_round <- round(prob, 4)
  percentage <- round(prob * 100, 2)
  
  # Threshold
  threshold <- if (!is.null(input_data$threshold)) as.numeric(input_data$threshold) else 0.50
  if (is.na(threshold) || threshold <= 0 || threshold >= 1) threshold <- 0.50
  
  # Classification & Risk Tier
  is_diabetic <- prob >= threshold
  classification <- if (is_diabetic) "High Risk / Diabetic (Outcome = 1)" else "Low-Moderate Risk / Non-Diabetic (Outcome = 0)"
  
  risk_level <- if (prob < 0.25) {
    "Low Risk"
  } else if (prob < 0.50) {
    "Moderate Risk"
  } else if (prob < 0.75) {
    "High Risk"
  } else {
    "Very High Risk"
  }
  
  # Factor contribution analysis based on model log-odds
  coefs <- coef(model)
  factor_breakdown <- list()
  
  for (f in req_fields) {
    f_val <- clean_inputs[[f]]
    f_coef <- coefs[[f]]
    bench <- CLINICAL_BENCHMARKS[[f]]
    
    # Is this indicator elevated relative to population baseline?
    is_elevated <- if (!is.null(bench$warning_threshold)) {
      f_val >= bench$warning_threshold
    } else {
      f_val > bench$normal_max
    }
    
    # Impact on logit: positive coef * high value increases risk
    impact <- if (f_coef > 0 && is_elevated) {
      "Increases Risk"
    } else if (f_coef > 0 && !is_elevated) {
      "Protective / Low Impact"
    } else {
      "Neutral / Standard"
    }
    
    factor_breakdown[[length(factor_breakdown) + 1]] <- list(
      field = f,
      name = bench$name,
      value = num_inputs[[f]],
      unit = bench$unit,
      coefficient = round(f_coef, 4),
      odds_ratio = round(exp(f_coef), 3),
      is_elevated = is_elevated,
      impact = impact
    )
  }
  
  list(
    success = TRUE,
    predicted_probability = prob_round,
    predicted_percentage = percentage,
    risk_level = risk_level,
    classification = classification,
    classification_threshold = threshold,
    outcome_code = ifelse(is_diabetic, 1, 0),
    model_type = "Logistic Regression (Binomial GLM)",
    model_version = "1.0.0",
    contributing_factors = factor_breakdown,
    imputed_fields = imputed_fields,
    disclaimer = "Educational estimate, not a medical diagnosis. Generated by an R GLM logistic regression model for academic project demonstration."
  )
}
