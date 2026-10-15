// frontend/src/types/index.ts

export interface HealthResponse {
  status: string;
  service: string;
  r_version: string;
  timestamp: string;
  model_loaded: boolean;
  dataset_source: string;
}

export interface FeatureStat {
  name: string;
  min: number;
  max: number;
  mean: number;
  median: number;
  sd: number;
  missing_or_zero: number;
}

export interface DatasetSummary {
  total_records: number;
  diabetic_count: number;
  non_diabetic_count: number;
  diabetic_percentage: number;
  non_diabetic_percentage: number;
  features: Record<string, FeatureStat>;
  columns: string[];
  last_updated: string;
}

export interface PatientRecord {
  PatientId: string;
  Pregnancies: number;
  Glucose: number;
  BloodPressure: number;
  SkinThickness: number;
  Insulin: number;
  BMI: number;
  DiabetesPedigreeFunction: number;
  Age: number;
  Outcome: number;
}

export interface PaginationInfo {
  current_page: number;
  limit: number;
  total_records: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface RecordsResponse {
  records: PatientRecord[];
  pagination: PaginationInfo;
}

export interface OutcomeDistItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface GlucoseBinItem {
  bin: string;
  count: number;
}

export interface BmiBinItem {
  category: string;
  count: number;
}

export interface AgeBinItem {
  ageGroup: string;
  count: number;
}

export interface AvgOutcomeItem {
  outcome: string;
  avgGlucose?: number;
  avgBMI?: number;
}

export interface ScatterPoint {
  patientId: string;
  glucose: number;
  bmi: number;
  age: number;
  outcome: number;
  outcomeLabel: string;
}

export interface CorrelationItem {
  var1: string;
  var2: string;
  correlation: number;
}

export interface ChartsData {
  outcome_distribution: OutcomeDistItem[];
  glucose_distribution: GlucoseBinItem[];
  bmi_distribution: BmiBinItem[];
  age_distribution: AgeBinItem[];
  glucose_by_outcome: AvgOutcomeItem[];
  bmi_by_outcome: AvgOutcomeItem[];
  glucose_vs_bmi_scatter: ScatterPoint[];
  correlation_matrix: CorrelationItem[];
  numeric_variables: string[];
}

export interface ContributingFactor {
  field: string;
  name: string;
  value: number;
  unit: string;
  coefficient: number;
  odds_ratio: number;
  is_elevated: boolean;
  impact: string;
}

export interface PredictionRequest {
  Pregnancies: number;
  Glucose: number;
  BloodPressure: number;
  SkinThickness: number;
  Insulin: number;
  BMI: number;
  DiabetesPedigreeFunction: number;
  Age: number;
  threshold?: number;
}

export interface PredictionResponse {
  success: boolean;
  predicted_probability: number;
  predicted_percentage: number;
  risk_level: string;
  classification: string;
  classification_threshold: number;
  outcome_code: number;
  model_type: string;
  model_version: string;
  contributing_factors: ContributingFactor[];
  imputed_fields: string[];
  disclaimer: string;
  error?: string;
}

export interface CoefficientItem {
  variable: string;
  estimate: number;
  std_error: number;
  z_value: number;
  p_value: number;
  odds_ratio: number;
  significant: boolean;
}

export interface ModelMetricsResponse {
  model_type: string;
  formula: string;
  seed: number;
  train_split: number;
  train_samples: number;
  test_samples: number;
  classification_threshold: number;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    sensitivity: number;
    specificity: number;
    f1_score: number;
    roc_auc: number;
  };
  confusion_matrix: {
    true_positive: number;
    true_negative: number;
    false_positive: number;
    false_negative: number;
    total: number;
  };
  roc_curve: Array<{
    threshold: number;
    fpr: number;
    tpr: number;
  }>;
  coefficients: CoefficientItem[];
  diagnostics: {
    aic: number;
    null_deviance: number;
    residual_deviance: number;
    df_null: number;
    df_residual: number;
  };
  imputation_medians: Record<string, number>;
  trained_at: string;
  version: string;
}
