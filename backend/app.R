# backend/app.R
# Main server entrypoint for DiaPredict R Plumber API

library(plumber)

port <- as.numeric(Sys.getenv("PORT", "10000"))
host <- Sys.getenv("HOST", "0.0.0.0")

cat("====================================================\n")
cat("  DiaPredict — Diabetes Risk Prediction R Backend  \n")
cat(sprintf("  Listening on http://%s:%d\n", host, port))
cat("  Endpoints:\n")
cat("    - GET  /health\n")
cat("    - GET  /summary\n")
cat("    - GET  /records\n")
cat("    - GET  /charts\n")
cat("    - GET  /metrics\n")
cat("    - POST /predict\n")
cat("    - GET  /download\n")
cat("    - POST /upload\n")
cat("====================================================\n")

plumber_file <- if (file.exists("plumber.R")) "plumber.R" else file.path("backend", "plumber.R")
pr <- plumber::plumb(plumber_file)
pr$run(host = host, port = port, swagger = TRUE)
