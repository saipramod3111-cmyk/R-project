# install_packages.R
# Script to install required R dependencies for DiaPredict

options(repos = c(CRAN = "https://cloud.r-project.org"))

required_pkgs <- c("plumber", "readxl", "writexl", "dplyr", "jsonlite")

for (pkg in required_pkgs) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    cat(sprintf("Installing %s...\n", pkg))
    install.packages(pkg, type = "binary")
  } else {
    cat(sprintf("%s is already installed.\n", pkg))
  }
}

cat("Package verification complete!\n")
