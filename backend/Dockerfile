# backend/Dockerfile
# Production Docker container for DiaPredict R Plumber API

FROM rocker/r-ver:4.3.3

# Install system dependencies for plumber, curl, and libxml2
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libsodium-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install required R packages
RUN R -e "install.packages(c('plumber', 'readxl', 'writexl', 'dplyr', 'jsonlite'), repos='https://cloud.r-project.org')"

# Create working directory
WORKDIR /app

# Copy backend files
COPY . /app

# Ensure model and data are generated
RUN Rscript prepare_data.R || true
RUN Rscript train_model.R || true

# Set environment variables
ENV PORT=8000
ENV HOST=0.0.0.0

# Expose port
EXPOSE 8000

# Start Plumber server
CMD ["Rscript", "app.R"]
