# backend/prepare_data.R
# Prepares the benchmark Diabetes dataset and exports to both Excel (.xlsx) and CSV

library(writexl)
library(readxl)

raw_path <- file.path(Sys.getenv("TEMP"), "pima.csv")
if (!file.exists(raw_path)) {
  download.file("https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv",
                destfile = raw_path, quiet = TRUE)
}

col_names <- c(
  "Pregnancies",
  "Glucose",
  "BloodPressure",
  "SkinThickness",
  "Insulin",
  "BMI",
  "DiabetesPedigreeFunction",
  "Age",
  "Outcome"
)

df <- read.csv(raw_path, header = FALSE, col.names = col_names)

# Ensure numeric / integer types
df$Pregnancies <- as.integer(df$Pregnancies)
df$Glucose <- as.numeric(df$Glucose)
df$BloodPressure <- as.numeric(df$BloodPressure)
df$SkinThickness <- as.numeric(df$SkinThickness)
df$Insulin <- as.numeric(df$Insulin)
df$BMI <- as.numeric(df$BMI)
df$DiabetesPedigreeFunction <- as.numeric(df$DiabetesPedigreeFunction)
df$Age <- as.integer(df$Age)
df$Outcome <- as.integer(df$Outcome)

# Save to backend/data/
data_dir <- file.path(getwd(), "backend", "data")
if (!dir.exists(data_dir)) dir.create(data_dir, recursive = TRUE)

xlsx_path <- file.path(data_dir, "diabetes.xlsx")
csv_path <- file.path(data_dir, "diabetes.csv")

writexl::write_xlsx(df, path = xlsx_path)
write.csv(df, file = csv_path, row.names = FALSE)

cat(sprintf("Successfully generated:\n- %s (%d rows, %d cols)\n- %s\n",
            xlsx_path, nrow(df), ncol(df), csv_path))

# Verify readxl reading back
test_read <- readxl::read_excel(xlsx_path)
cat(sprintf("readxl verified: %d rows, %d columns loaded successfully.\n", nrow(test_read), ncol(test_read)))
