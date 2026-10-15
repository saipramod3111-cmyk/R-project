# backend/analysis.R
# Provides data exploration, summary statistics, chart summaries, correlation matrix,
# and paginated records for the DiaPredict system using readxl and dplyr.

library(readxl)
library(dplyr)
library(jsonlite)

# Helper to find dataset path
get_data_path <- function() {
  candidates <- c(
    file.path("data", "diabetes.xlsx"),
    file.path("backend", "data", "diabetes.xlsx"),
    file.path("..", "data", "diabetes.xlsx")
  )
  for (cand in candidates) {
    if (file.exists(cand)) return(cand)
  }
  stop("Dataset not found at data/diabetes.xlsx")
}

# Load dataset into memory
load_diabetes_data <- function() {
  path <- get_data_path()
  df <- as.data.frame(readxl::read_excel(path))
  # Ensure column names
  expected_cols <- c("Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
                     "Insulin", "BMI", "DiabetesPedigreeFunction", "Age", "Outcome")
  missing_cols <- setdiff(expected_cols, names(df))
  if (length(missing_cols) > 0) {
    stop(paste("Dataset is missing columns:", paste(missing_cols, collapse = ", ")))
  }
  
  # Add anonymized Patient ID
  df$PatientId <- sprintf("PID-%04d", 1000 + seq_len(nrow(df)))
  return(df)
}

# Compute overall dataset summary
get_dataset_summary <- function() {
  df <- load_diabetes_data()
  total_records <- nrow(df)
  diabetic_count <- sum(df$Outcome == 1, na.rm = TRUE)
  non_diabetic_count <- sum(df$Outcome == 0, na.rm = TRUE)
  
  # Column statistical summaries
  feature_cols <- c("Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
                    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age")
  
  feature_stats <- list()
  for (col in feature_cols) {
    vals <- df[[col]]
    feature_stats[[col]] <- list(
      name = col,
      min = round(min(vals, na.rm = TRUE), 2),
      max = round(max(vals, na.rm = TRUE), 2),
      mean = round(mean(vals, na.rm = TRUE), 2),
      median = round(median(vals, na.rm = TRUE), 2),
      sd = round(sd(vals, na.rm = TRUE), 2),
      missing_or_zero = sum(vals == 0, na.rm = TRUE)
    )
  }
  
  list(
    total_records = total_records,
    diabetic_count = diabetic_count,
    non_diabetic_count = non_diabetic_count,
    diabetic_percentage = round((diabetic_count / total_records) * 100, 1),
    non_diabetic_percentage = round((non_diabetic_count / total_records) * 100, 1),
    features = feature_stats,
    columns = names(df)[names(df) != "PatientId"],
    last_updated = format(Sys.time(), "%Y-%m-%d %H:%M:%S")
  )
}

# Generate structured data for interactive charts
get_charts_data <- function() {
  df <- load_diabetes_data()
  
  # 1. Outcome Distribution
  outcome_dist <- list(
    list(name = "Non-Diabetic (Outcome 0)", count = sum(df$Outcome == 0), percentage = round(mean(df$Outcome == 0) * 100, 1), color = "#0284C7"),
    list(name = "Diabetic (Outcome 1)", count = sum(df$Outcome == 1), percentage = round(mean(df$Outcome == 1) * 100, 1), color = "#EF4444")
  )
  
  # 2. Glucose Binned Distribution
  glucose_bins <- c(0, 90, 115, 140, 165, 190, 300)
  glucose_labels <- c("<90", "90-114", "115-139", "140-164", "165-189", "190+")
  g_cut <- cut(df$Glucose[df$Glucose > 0], breaks = glucose_bins, labels = glucose_labels, right = FALSE)
  glucose_dist <- lapply(levels(g_cut), function(lvl) {
    list(bin = lvl, count = sum(g_cut == lvl, na.rm = TRUE))
  })
  
  # 3. BMI Binned Distribution (WHO categories)
  bmi_bins <- c(0, 18.5, 25, 30, 35, 40, 100)
  bmi_labels <- c("Underweight (<18.5)", "Normal (18.5-24.9)", "Overweight (25-29.9)", "Obese Class I (30-34.9)", "Obese Class II (35-39.9)", "Obese Class III (40+)")
  b_cut <- cut(df$BMI[df$BMI > 0], breaks = bmi_bins, labels = bmi_labels, right = FALSE)
  bmi_dist <- lapply(levels(b_cut), function(lvl) {
    list(category = lvl, count = sum(b_cut == lvl, na.rm = TRUE))
  })
  
  # 4. Age Binned Distribution
  age_bins <- c(20, 30, 40, 50, 60, 100)
  age_labels <- c("21-29", "30-39", "40-49", "50-59", "60+")
  a_cut <- cut(df$Age, breaks = age_bins, labels = age_labels, right = FALSE)
  age_dist <- lapply(levels(a_cut), function(lvl) {
    list(ageGroup = lvl, count = sum(a_cut == lvl, na.rm = TRUE))
  })
  
  # 5. Average Glucose by Outcome
  avg_glucose_outcome <- list(
    list(outcome = "Non-Diabetic", avgGlucose = round(mean(df$Glucose[df$Outcome == 0 & df$Glucose > 0], na.rm = TRUE), 1)),
    list(outcome = "Diabetic", avgGlucose = round(mean(df$Glucose[df$Outcome == 1 & df$Glucose > 0], na.rm = TRUE), 1))
  )
  
  # 6. Average BMI by Outcome
  avg_bmi_outcome <- list(
    list(outcome = "Non-Diabetic", avgBMI = round(mean(df$BMI[df$Outcome == 0 & df$BMI > 0], na.rm = TRUE), 1)),
    list(outcome = "Diabetic", avgBMI = round(mean(df$BMI[df$Outcome == 1 & df$BMI > 0], na.rm = TRUE), 1))
  )
  
  # 7. Glucose vs BMI Scatter Sample (anonymized representative sample of 120 points)
  set.seed(123)
  sample_idx <- sample(seq_len(nrow(df)), size = min(120, nrow(df)))
  sample_df <- df[sample_idx, ]
  scatter_data <- lapply(seq_len(nrow(sample_df)), function(i) {
    list(
      patientId = sample_df$PatientId[i],
      glucose = sample_df$Glucose[i],
      bmi = sample_df$BMI[i],
      age = sample_df$Age[i],
      outcome = sample_df$Outcome[i],
      outcomeLabel = ifelse(sample_df$Outcome[i] == 1, "Diabetic", "Non-Diabetic")
    )
  })
  
  # 8. Pearson Correlation Matrix across all numeric features + Outcome
  numeric_cols <- c("Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
                    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age", "Outcome")
  cor_matrix <- cor(df[, numeric_cols], use = "pairwise.complete.obs")
  
  cor_list <- list()
  for (i in seq_along(numeric_cols)) {
    for (j in seq_along(numeric_cols)) {
      cor_list[[length(cor_list) + 1]] <- list(
        var1 = numeric_cols[i],
        var2 = numeric_cols[j],
        correlation = round(cor_matrix[i, j], 3)
      )
    }
  }
  
  list(
    outcome_distribution = outcome_dist,
    glucose_distribution = glucose_dist,
    bmi_distribution = bmi_dist,
    age_distribution = age_dist,
    glucose_by_outcome = avg_glucose_outcome,
    bmi_by_outcome = avg_bmi_outcome,
    glucose_vs_bmi_scatter = scatter_data,
    correlation_matrix = cor_list,
    numeric_variables = numeric_cols
  )
}

# Paginated, filtered, searchable records table
get_records <- function(page = 1, limit = 15, search = "", outcome = "all", sort_by = "PatientId", sort_order = "asc") {
  df <- load_diabetes_data()
  
  # Filter by outcome if specified
  if (outcome == "0" || outcome == "1") {
    target_outcome <- as.integer(outcome)
    df <- df[df$Outcome == target_outcome, ]
  }
  
  # Search query (matches PatientId, Age, Glucose, BMI)
  if (nzchar(search)) {
    s_lower <- tolower(search)
    matches <- grepl(s_lower, tolower(df$PatientId)) |
      grepl(s_lower, as.character(df$Age)) |
      grepl(s_lower, as.character(df$Glucose)) |
      grepl(s_lower, as.character(df$BMI))
    df <- df[matches, ]
  }
  
  # Sorting
  if (sort_by %in% names(df)) {
    ord <- order(df[[sort_by]], decreasing = (tolower(sort_order) == "desc"))
    df <- df[ord, ]
  }
  
  total_records <- nrow(df)
  page <- max(1, as.integer(page))
  limit <- min(100, max(5, as.integer(limit)))
  total_pages <- max(1, ceiling(total_records / limit))
  
  start_idx <- ((page - 1) * limit) + 1
  end_idx <- min(page * limit, total_records)
  
  records_subset <- if (total_records > 0 && start_idx <= total_records) {
    df[start_idx:end_idx, ]
  } else {
    df[0, ]
  }
  
  # Convert rows to list of objects
  rows_list <- lapply(seq_len(nrow(records_subset)), function(i) {
    as.list(records_subset[i, ])
  })
  
  list(
    records = rows_list,
    pagination = list(
      current_page = page,
      limit = limit,
      total_records = total_records,
      total_pages = total_pages,
      has_next = page < total_pages,
      has_prev = page > 1
    )
  )
}
