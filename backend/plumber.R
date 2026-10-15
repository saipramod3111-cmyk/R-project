# backend/plumber.R
# Plumber REST API Router for DiaPredict — Diabetes Risk Prediction Using R

library(plumber)
library(jsonlite)
library(readxl)
library(writexl)
library(dplyr)

# Determine backend base directory
get_base_dir <- function() {
  if (dir.exists("models") && dir.exists("data")) {
    return(getwd())
  } else if (dir.exists(file.path("backend", "models"))) {
    return(file.path(getwd(), "backend"))
  } else if (file.exists(file.path("..", "models"))) {
    return(normalizePath(".."))
  }
  getwd()
}

base_dir <- get_base_dir()

# Source modules
source(file.path(base_dir, "analysis.R"))
source(file.path(base_dir, "predict.R"))

#* @apiTitle DiaPredict R API Service
#* @apiDescription R Plumber REST API for diabetes risk prediction, statistical dataset analytics, and model evaluation metrics.
#* @apiVersion 1.0.0

#* Enable CORS filter for Vercel and local frontend clients
#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, User-Agent")
  
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  } else {
    plumber::forward()
  }
}

#* Check backend API availability and status
#* @get /health
function() {
  list(
    status = "healthy",
    service = "DiaPredict R Plumber API",
    r_version = R.version.string,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC", tz = "UTC"),
    model_loaded = !is.null(.model_env$model),
    dataset_source = "Pima Indians Diabetes Dataset (.xlsx)"
  )
}

#* Get overall dataset summary statistics
#* @get /summary
function(res) {
  tryCatch({
    get_dataset_summary()
  }, error = function(e) {
    res$status <- 500
    list(error = paste("Failed to compute summary:", e$message))
  })
}

#* Get paginated patient records with search, filter, and sorting
#* @param page:int Page number (1-based, default 1)
#* @param limit:int Records per page (default 15)
#* @param search:str Search term across ID, Age, Glucose, BMI
#* @param outcome:str Filter by outcome ('all', '0', '1')
#* @param sort_by:str Column name to sort by
#* @param sort_order:str 'asc' or 'desc'
#* @get /records
function(page = 1, limit = 15, search = "", outcome = "all", sort_by = "PatientId", sort_order = "asc", res) {
  tryCatch({
    get_records(
      page = as.integer(page),
      limit = as.integer(limit),
      search = as.character(search),
      outcome = as.character(outcome),
      sort_by = as.character(sort_by),
      sort_order = as.character(sort_order)
    )
  }, error = function(e) {
    res$status <- 500
    list(error = paste("Failed to retrieve records:", e$message))
  })
}

#* Get precomputed chart summaries for interactive visualization
#* @get /charts
function(res) {
  tryCatch({
    get_charts_data()
  }, error = function(e) {
    res$status <- 500
    list(error = paste("Failed to generate chart data:", e$message))
  })
}

#* Get genuine model evaluation metrics and confusion matrix
#* @get /metrics
function(res) {
  metrics_file <- file.path(base_dir, "models", "model_metrics.json")
  if (!file.exists(metrics_file)) {
    res$status <- 404
    return(list(error = "Model metrics file not found. Train the model first."))
  }
  
  tryCatch({
    json_txt <- paste(readLines(metrics_file, warn = FALSE), collapse = "\n")
    jsonlite::fromJSON(json_txt, simplifyVector = FALSE)
  }, error = function(e) {
    res$status <- 500
    list(error = paste("Failed to parse metrics:", e$message))
  })
}

#* Predict diabetes risk from patient health indicators using R GLM model
#* @post /predict
function(req, res) {
  body <- tryCatch({
    if (is.character(req$postBody)) {
      jsonlite::fromJSON(req$postBody)
    } else if (is.list(req$args)) {
      req$args
    } else {
      list()
    }
  }, error = function(e) {
    list()
  })
  
  if (length(body) == 0) {
    res$status <- 400
    return(list(success = FALSE, error = "Invalid or empty JSON request body."))
  }
  
  result <- predict_diabetes_risk(body)
  if (!isTRUE(result$success)) {
    res$status <- 400
  }
  result
}

#* Download the active Excel dataset
#* @serializer contentType list(type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
#* @get /download
function(res) {
  xlsx_path <- file.path(base_dir, "data", "diabetes.xlsx")
  if (!file.exists(xlsx_path)) {
    res$status <- 404
    return(list(error = "Dataset file not found."))
  }
  
  res$setHeader("Content-Disposition", "attachment; filename=\"diapredict_dataset.xlsx\"")
  readBin(xlsx_path, "raw", n = file.info(xlsx_path)$size)
}

#* Download dataset as CSV format
#* @serializer contentType list(type="text/csv")
#* @get /download-csv
function(res) {
  csv_path <- file.path(base_dir, "data", "diabetes.csv")
  if (!file.exists(csv_path)) {
    res$status <- 404
    return(list(error = "CSV file not found."))
  }
  res$setHeader("Content-Disposition", "attachment; filename=\"diapredict_dataset.csv\"")
  readBin(csv_path, "raw", n = file.info(csv_path)$size)
}

#* Upload and validate a new dataset (.xlsx or .csv)
#* @post /upload
function(req, res) {
  # Safe schema validation
  multipart <- mime::parse_multipart(req)
  
  if (is.null(multipart$file)) {
    res$status <- 400
    return(list(success = FALSE, error = "No file uploaded. Expected 'file' parameter."))
  }
  
  temp_upload_path <- multipart$file$datapath
  filename <- multipart$file$name
  ext <- tolower(tools::file_ext(filename))
  
  if (!ext %in% c("xlsx", "csv")) {
    res$status <- 400
    return(list(success = FALSE, error = "Invalid file type. Only .xlsx and .csv files are supported."))
  }
  
  # Read uploaded file
  uploaded_df <- tryCatch({
    if (ext == "xlsx") {
      as.data.frame(readxl::read_excel(temp_upload_path))
    } else {
      read.csv(temp_upload_path, stringsAsFactors = FALSE)
    }
  }, error = function(e) {
    NULL
  })
  
  if (is.null(uploaded_df) || nrow(uploaded_df) == 0) {
    res$status <- 400
    return(list(success = FALSE, error = "Could not parse uploaded dataset or file is empty."))
  }
  
  # Validate schema
  req_cols <- c("Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
                "Insulin", "BMI", "DiabetesPedigreeFunction", "Age", "Outcome")
  missing <- setdiff(req_cols, names(uploaded_df))
  if (length(missing) > 0) {
    res$status <- 400
    return(list(
      success = FALSE,
      error = paste("Schema mismatch. Missing columns:", paste(missing, collapse = ", "))
    ))
  }
  
  # Validate numeric types
  for (c in req_cols) {
    uploaded_df[[c]] <- suppressWarnings(as.numeric(uploaded_df[[c]]))
    if (all(is.na(uploaded_df[[c]]))) {
      res$status <- 400
      return(list(success = FALSE, error = paste("Column must contain numeric values:", c)))
    }
  }
  
  # Save to active dataset
  target_xlsx <- file.path(base_dir, "data", "diabetes.xlsx")
  target_csv  <- file.path(base_dir, "data", "diabetes.csv")
  
  tryCatch({
    writexl::write_xlsx(uploaded_df, path = target_xlsx)
    write.csv(uploaded_df, file = target_csv, row.names = FALSE)
  }, error = function(e) {
    res$status <- 500
    return(list(success = FALSE, error = paste("Failed to save uploaded dataset:", e$message)))
  })
  
  list(
    success = TRUE,
    message = sprintf("Successfully uploaded and verified %d records.", nrow(uploaded_df)),
    total_records = nrow(uploaded_df),
    columns = names(uploaded_df)
  )
}
