// frontend/src/pages/DatasetPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle2,
  Table,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { PatientRecord, PaginationInfo, DatasetSummary } from '../types';

interface DatasetPageProps {
  isOnline: boolean;
}

export const DatasetPage: React.FC<DatasetPageProps> = ({ isOnline }) => {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    limit: 15,
    total_records: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  });
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [search, setSearch] = useState<string>('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('PatientId');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchRecords = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRecords({
        page,
        limit: pagination.limit,
        search,
        outcome: outcomeFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setRecords(data.records);
      setPagination(data.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records from R backend');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const sum = await api.getSummary();
      setSummary(sum);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchRecords(1);
    fetchSummary();
  }, [outcomeFilter, sortBy, sortOrder, isOnline]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords(1);
  };

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setUploadError(null);
    setUploadMessage(null);

    try {
      const res = await api.uploadDataset(uploadFile);
      setUploadMessage(res.message || 'Dataset uploaded and validated successfully!');
      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadFile(null);
        fetchRecords(1);
        fetchSummary();
      }, 1500);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Dataset upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-medblue-400 mb-1">
            <Database className="w-4 h-4" />
            <span>Excel Dataset Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Patient Records & Data Source
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Directly connected to the <code className="text-medcyan-300 font-mono text-xs">diabetes.xlsx</code> file
            loaded and processed in R using <code className="text-medblue-300 font-mono text-xs">readxl</code>.
          </p>
        </div>

        {/* Action Buttons: Export & Upload */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={api.getDownloadUrl('xlsx')}
            download="diabetes.xlsx"
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel (.xlsx)</span>
          </a>

          <a
            href={api.getDownloadUrl('csv')}
            download="diabetes.csv"
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 border border-navy-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-medcyan-400" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-medblue-600 hover:bg-medblue-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-md shadow-medblue-600/20"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Dataset</span>
          </button>
        </div>
      </div>

      {/* Dataset Summary Cards Bar */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Records
            </span>
            <div className="text-xl font-bold text-white mt-1">
              {summary.total_records.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">Pima Cohort</span>
          </div>

          <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
            <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider">
              Diabetic (Outcome 1)
            </span>
            <div className="text-xl font-bold text-rose-300 mt-1">
              {summary.diabetic_count}{' '}
              <span className="text-xs font-normal text-rose-400">
                ({summary.diabetic_percentage}%)
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Positive cases</span>
          </div>

          <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
              Non-Diabetic (Outcome 0)
            </span>
            <div className="text-xl font-bold text-emerald-300 mt-1">
              {summary.non_diabetic_count}{' '}
              <span className="text-xs font-normal text-emerald-400">
                ({summary.non_diabetic_percentage}%)
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Control group</span>
          </div>

          <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
            <span className="text-[11px] font-semibold text-medcyan-300 uppercase tracking-wider">
              Features
            </span>
            <div className="text-xl font-bold text-medcyan-300 mt-1">
              8 Predictors + 1 Target
            </div>
            <span className="text-[10px] text-slate-500">Numeric Clinical Metrics</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records by Patient ID, Age, Glucose, or BMI..."
            className="w-full pl-10 pr-24 py-2 rounded-xl bg-navy-950 border border-navy-700 text-slate-100 text-xs focus:outline-none focus:border-medblue-500 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-medblue-600 hover:bg-medblue-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-medblue-400" />
            <span>Outcome:</span>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-slate-200 text-xs focus:outline-none focus:border-medblue-500"
            >
              <option value="all">All Outcomes</option>
              <option value="1">Diabetic (1)</option>
              <option value="0">Non-Diabetic (0)</option>
            </select>
          </div>

          <button
            onClick={() => fetchRecords(pagination.current_page)}
            disabled={loading}
            title="Refresh table"
            className="p-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Patient Records Table */}
      <div className="bg-navy-900 rounded-2xl border border-navy-800 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-navy-800">
              <tr>
                <th
                  onClick={() => handleSort('PatientId')}
                  className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                >
                  Patient ID {sortBy === 'PatientId' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('Pregnancies')}
                  className="px-3 py-3 cursor-pointer hover:text-white transition-colors"
                >
                  Pregnancies {sortBy === 'Pregnancies' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('Glucose')}
                  className="px-3 py-3 cursor-pointer hover:text-white transition-colors"
                >
                  Glucose {sortBy === 'Glucose' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('BloodPressure')}
                  className="px-3 py-3 cursor-pointer hover:text-white transition-colors"
                >
                  Blood Press. {sortBy === 'BloodPressure' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('SkinThickness')}
                  className="px-3 py-3 cursor-pointer hover:text-white transition-colors"
                >
                  Skin Thick. {sortBy === 'SkinThickness' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('Insulin')}
                  className="px-3 py-3 cursor-pointer hover:text-white transition-colors"
                >
                  Insulin {sortBy === 'Insulin' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('BMI')}
                  className="px-3 py-3 cursor-pointer hover:text-white transition-colors"
                >
                  BMI {sortBy === 'BMI' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('DiabetesPedigreeFunction')}
                  className="px-3 py-3 cursor-pointer hover:text-white transition-colors"
                >
                  Pedigree {sortBy === 'DiabetesPedigreeFunction' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('Age')}
                  className="px-3 py-3 cursor-pointer hover:text-white transition-colors"
                >
                  Age {sortBy === 'Age' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('Outcome')}
                  className="px-4 py-3 cursor-pointer hover:text-white transition-colors text-right"
                >
                  Outcome {sortBy === 'Outcome' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-navy-800/60 font-mono text-[11px] text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 font-sans">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-medblue-400" />
                    <span>Loading patient records from R backend...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 font-sans">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                    <span>No records found matching current search criteria.</span>
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r.PatientId}
                    className="hover:bg-navy-800/40 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-bold text-medcyan-300">
                      {r.PatientId}
                    </td>
                    <td className="px-3 py-2.5">{r.Pregnancies}</td>
                    <td className="px-3 py-2.5 font-semibold text-white">{r.Glucose}</td>
                    <td className="px-3 py-2.5">{r.BloodPressure}</td>
                    <td className="px-3 py-2.5">{r.SkinThickness}</td>
                    <td className="px-3 py-2.5">{r.Insulin}</td>
                    <td className="px-3 py-2.5 font-semibold text-white">{r.BMI}</td>
                    <td className="px-3 py-2.5">{r.DiabetesPedigreeFunction}</td>
                    <td className="px-3 py-2.5">{r.Age}</td>
                    <td className="px-4 py-2.5 text-right font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.Outcome === 1
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {r.Outcome === 1 ? 'Diabetic (1)' : 'Non-Diabetic (0)'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-navy-950/80 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing{' '}
            <span className="font-semibold text-white">
              {pagination.total_records > 0 ? (pagination.current_page - 1) * pagination.limit + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-white">
              {Math.min(pagination.current_page * pagination.limit, pagination.total_records)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-white">{pagination.total_records}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRecords(pagination.current_page - 1)}
              disabled={!pagination.has_prev || loading}
              className="px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-slate-200 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-800 font-semibold text-medblue-400">
              Page {pagination.current_page} of {pagination.total_pages}
            </span>

            <button
              onClick={() => fetchRecords(pagination.current_page + 1)}
              disabled={!pagination.has_next || loading}
              className="px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-slate-200 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Schema & Data Dictionary Accordion */}
      <div className="p-6 rounded-2xl bg-navy-900/70 border border-navy-800 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-medblue-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Dataset Schema & Clinical Variable Dictionary
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The table below documents the 9 benchmark columns defined in the Excel dataset
          (<code className="text-medcyan-300 font-mono">diabetes.xlsx</code>) and processed by R.
          All personal identifiers are anonymized.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { name: 'Pregnancies', type: 'Integer', unit: 'Count', desc: 'Number of times pregnant' },
            { name: 'Glucose', type: 'Numeric', unit: 'mg/dL', desc: 'Plasma glucose concentration 2h in oral glucose tolerance test' },
            { name: 'BloodPressure', type: 'Numeric', unit: 'mm Hg', desc: 'Diastolic blood pressure' },
            { name: 'SkinThickness', type: 'Numeric', unit: 'mm', desc: 'Triceps skin fold thickness' },
            { name: 'Insulin', type: 'Numeric', unit: 'mu U/ml', desc: '2-Hour serum insulin level' },
            { name: 'BMI', type: 'Numeric', unit: 'kg/m²', desc: 'Body mass index (weight in kg / (height in m)²)' },
            { name: 'DiabetesPedigreeFunction', type: 'Numeric', unit: 'Score', desc: 'Diabetes pedigree function scoring genetic predisposition' },
            { name: 'Age', type: 'Integer', unit: 'Years', desc: 'Age of the individual' },
            { name: 'Outcome', type: 'Integer', unit: '0 or 1', desc: 'Class variable (0 = Non-diabetic, 1 = Diabetic)' },
          ].map((col) => (
            <div key={col.name} className="p-3 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white font-mono">{col.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-medblue-500/10 text-medblue-400 text-[10px]">
                  {col.type}
                </span>
              </div>
              <div className="text-[11px] text-medcyan-400">Unit: {col.unit}</div>
              <p className="text-[11px] text-slate-400">{col.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-medblue-500/10 text-medblue-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Upload Compatible Dataset</h3>
                <p className="text-xs text-slate-400">Supports .xlsx (Excel) or .csv format</p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="p-4 rounded-xl border-2 border-dashed border-navy-700 bg-navy-950/60 text-center space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-medblue-400 mx-auto" />
                <div className="text-xs text-slate-300">
                  Select a compatible Excel (.xlsx) or CSV file with the 9 standard columns.
                </div>
                <input
                  type="file"
                  accept=".xlsx, .csv"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-medblue-600 file:text-white hover:file:bg-medblue-500 cursor-pointer"
                />
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{uploadMessage}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-navy-950 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300">Schema Requirement:</span>
                <p>
                  File must contain exact header names:{' '}
                  <code className="text-medcyan-300 font-mono">
                    Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age, Outcome
                  </code>
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || uploading}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-medblue-600 hover:bg-medblue-500 text-white shadow-md disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Validating Schema in R...</span>
                    </>
                  ) : (
                    <span>Upload & Verify</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
