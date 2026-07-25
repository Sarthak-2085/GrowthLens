'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Clock,
  Table2,
  Trash2,
  Eye,
  ChevronRight,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

// Required CSV columns for validation
const REQUIRED_COLUMNS = [
  { key: 'col-campaign_name', name: 'campaign_name', description: 'Unique name for the campaign', example: 'Diwali Sale Q4 2025' },
  { key: 'col-channel', name: 'channel', description: 'Marketing channel (Google Ads, Meta Ads, etc.)', example: 'Google Ads' },
  { key: 'col-budget', name: 'budget', description: 'Total allocated budget in INR', example: '180000' },
  { key: 'col-spend', name: 'spend', description: 'Actual amount spent in INR', example: '174500' },
  { key: 'col-revenue', name: 'revenue', description: 'Attributed revenue in INR', example: '682000' },
  { key: 'col-clicks', name: 'clicks', description: 'Total number of ad clicks', example: '14820' },
  { key: 'col-impressions', name: 'impressions', description: 'Total ad impressions served', example: '312400' },
  { key: 'col-conversions', name: 'conversions', description: 'Total conversion events', example: '892' },
  { key: 'col-start_date', name: 'start_date', description: 'Campaign start date (YYYY-MM-DD)', example: '2025-10-15' },
  { key: 'col-status', name: 'status', description: 'Campaign status (active/paused/completed)', example: 'completed' },
];

const VALID_CHANNELS = ['google ads', 'meta ads', 'instagram', 'email', 'youtube', 'linkedin'];
const VALID_STATUSES = ['active', 'paused', 'completed', 'draft'];

interface UploadHistory {
  id: string;
  filename: string;
  uploadedAt: string;
  rows: number;
  status: 'success' | 'error' | 'processing';
  errorMessage?: string;
}

const uploadHistory: UploadHistory[] = [
  { id: 'upload-001', filename: 'q4_campaigns_2025.csv', uploadedAt: '22 Jul 2026, 14:30', rows: 8, status: 'success' },
  { id: 'upload-002', filename: 'diwali_performance.csv', uploadedAt: '18 Jul 2026, 09:15', rows: 12, status: 'success' },
  { id: 'upload-003', filename: 'meta_campaigns_dec.csv', uploadedAt: '15 Jul 2026, 16:42', rows: 5, status: 'error', errorMessage: 'Missing required column: revenue' },
  { id: 'upload-004', filename: 'annual_report_2025.csv', uploadedAt: '10 Jul 2026, 11:08', rows: 24, status: 'success' },
  { id: 'upload-005', filename: 'q3_google_ads.csv', uploadedAt: '05 Jul 2026, 08:55', rows: 6, status: 'success' },
];

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'error';

interface ColumnValidation {
  key: string;
  name: string;
  present: boolean;
}

interface DataError {
  row: number;
  column: string;
  message: string;
}

interface ParsedRow {
  [key: string]: string;
}

// Real CSV parser
function parseCSV(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/['"]/g, ''));
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
    if (values.length === headers.length) {
      const row: ParsedRow = {};
      headers.forEach((h, idx) => { row[h] = values[idx]; });
      rows.push(row);
    }
  }

  return { headers, rows };
}

function validateRows(rows: ParsedRow[]): DataError[] {
  const errors: DataError[] = [];
  const numericCols = ['budget', 'spend', 'revenue', 'clicks', 'impressions', 'conversions'];

  rows.slice(0, 50).forEach((row, i) => {
    const rowNum = i + 2; // 1-indexed + header row

    numericCols.forEach((col) => {
      if (row[col] !== undefined) {
        const val = parseFloat(row[col]);
        if (isNaN(val) || val < 0) {
          errors.push({ row: rowNum, column: col, message: `"${row[col]}" is not a valid positive number` });
        }
      }
    });

    if (row.channel && !VALID_CHANNELS.includes(row.channel.toLowerCase())) {
      errors.push({ row: rowNum, column: 'channel', message: `"${row.channel}" is not a recognized channel` });
    }

    if (row.status && !VALID_STATUSES.includes(row.status.toLowerCase())) {
      errors.push({ row: rowNum, column: 'status', message: `"${row.status}" must be active/paused/completed/draft` });
    }

    if (row.start_date && !/^\d{4}-\d{2}-\d{2}$/.test(row.start_date)) {
      errors.push({ row: rowNum, column: 'start_date', message: `"${row.start_date}" must be YYYY-MM-DD format` });
    }
  });

  return errors.slice(0, 10); // cap at 10 errors shown
}

export default function UploadDataClient() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const [columnValidations, setColumnValidations] = useState<ColumnValidation[]>([]);
  const [dataErrors, setDataErrors] = useState<DataError[]>([]);
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processCSV = useCallback((file: File) => {
    setValidationStatus('validating');
    setShowPreview(false);
    setUploadComplete(false);
    setDataErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setValidationStatus('error');
        toast.error('Could not read file', { description: 'File appears to be empty or unreadable.' });
        return;
      }

      const { headers, rows } = parseCSV(text);

      if (headers.length === 0) {
        setValidationStatus('error');
        toast.error('Invalid CSV format', { description: 'Could not parse headers. Ensure the file uses comma-separated values.' });
        return;
      }

      // Column presence check
      const colValidations = REQUIRED_COLUMNS.map((col) => ({
        key: col.key,
        name: col.name,
        present: headers.includes(col.name),
      }));
      setColumnValidations(colValidations);

      const missingCols = colValidations.filter((c) => !c.present);

      if (missingCols.length > 0) {
        setValidationStatus('error');
        toast.error(`Missing ${missingCols.length} required column${missingCols.length > 1 ? 's' : ''}`, {
          description: missingCols.map((c) => c.name).join(', '),
        });
        return;
      }

      // Row-level validation
      const rowErrors = validateRows(rows);
      setDataErrors(rowErrors);
      setTotalRows(rows.length);

      // Preview: first 5 rows, only required columns
      const previewCols = REQUIRED_COLUMNS.map((c) => c.name);
      setPreviewHeaders(previewCols);
      setPreviewRows(rows.slice(0, 5));
      setShowPreview(true);

      if (rowErrors.length > 0) {
        setValidationStatus('error');
        toast.error(`${rowErrors.length} data error${rowErrors.length > 1 ? 's' : ''} found`, {
          description: 'Fix the highlighted issues before uploading.',
        });
      } else {
        setValidationStatus('valid');
        toast.success(`File validated: ${file.name}`, {
          description: `${rows.length} rows · ${REQUIRED_COLUMNS.length} required columns detected. Ready to upload.`,
        });
      }
    };

    reader.onerror = () => {
      setValidationStatus('error');
      toast.error('File read error', { description: 'Could not read the file. Try again.' });
    };

    reader.readAsText(file, 'UTF-8');
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Invalid file type', {
        description: 'GrowthLens accepts CSV files only. Export your data as CSV and try again.',
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Maximum file size is 10MB. Split your dataset into smaller files.',
      });
      return;
    }
    setUploadedFile(file);
    processCSV(file);
  }, [processCSV]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleUpload = useCallback(() => {
    if (!uploadedFile || validationStatus !== 'valid') return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadComplete(true);
      toast.success('Dataset uploaded successfully!', {
        description: `${uploadedFile.name} is being processed. Dashboard will update shortly.`,
      });
    }, 2200);
  }, [uploadedFile, validationStatus]);

  const handleClearFile = useCallback(() => {
    setUploadedFile(null);
    setValidationStatus('idle');
    setColumnValidations([]);
    setDataErrors([]);
    setPreviewRows([]);
    setPreviewHeaders([]);
    setShowPreview(false);
    setUploadComplete(false);
    setTotalRows(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const validCount = columnValidations.filter((c) => c.present).length;
  const invalidCount = columnValidations.filter((c) => !c.present).length;

  const handleDownloadSample = (e: React.MouseEvent) => {
    e.preventDefault();
    const headers = REQUIRED_COLUMNS.map((c) => c.name).join(',');
    const sampleRows = [
      'Diwali Sale — Google Search,Google Ads,180000,174500,682000,14820,312400,892,2025-10-15,completed',
      'Brand Awareness — Meta Reels,Meta Ads,95000,61200,198400,22100,890000,412,2025-12-01,active',
      'New Year Offers — Instagram,Instagram,72000,48300,156800,18450,540000,318,2025-12-20,active',
      'Re-engagement — Email Drip,Email,18000,12400,94200,8640,62000,284,2025-11-10,active',
      'Product Demo — YouTube,YouTube,60000,42800,58200,5820,420000,89,2025-11-01,paused',
    ];
    const csv = [headers, ...sampleRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'growthlens_sample_campaigns.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sample CSV downloaded', { description: 'growthlens_sample_campaigns.csv' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-700 text-foreground tracking-tight">Upload Campaign Data</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Import your marketing campaign CSV to generate AI-powered insights and budget recommendations.
          </p>
        </div>
        <a
          href="#"
          onClick={handleDownloadSample}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-500 text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground active:scale-95"
        >
          <Download size={15} />
          Download Sample CSV
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: Drop zone + validation */}
        <div className="lg:col-span-2 space-y-4">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !uploadedFile && fileInputRef.current?.click()}
            className={`
              relative rounded-2xl border-2 border-dashed transition-all duration-200
              ${uploadedFile ? 'cursor-default border-border bg-card/50' : 'cursor-pointer hover:border-primary/50 hover:bg-primary/3'}
              ${isDragOver ? 'drop-zone-active scale-[1.01]' : 'border-border bg-card/30'}
              ${uploadComplete ? 'border-positive/40 bg-positive/5' : ''}
              ${validationStatus === 'error' && uploadedFile ? 'border-negative/30 bg-negative/3' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleInputChange}
              aria-label="Upload CSV file"
            />
            <div className="flex flex-col items-center justify-center px-8 py-14 text-center">
              {uploadComplete ? (
                <>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-positive/15">
                    <CheckCircle2 size={32} className="text-positive" />
                  </div>
                  <h3 className="text-base font-600 text-foreground mb-1">Upload Complete!</h3>
                  <p className="text-sm text-muted-foreground mb-1">{uploadedFile?.name}</p>
                  <p className="text-xs text-positive">Processing in background — dashboard will update shortly.</p>
                </>
              ) : uploadedFile ? (
                <>
                  <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${validationStatus === 'valid' ? 'bg-positive/15' : validationStatus === 'validating' ? 'bg-primary/15' : 'bg-negative/15'}`}>
                    {validationStatus === 'validating' ? (
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : validationStatus === 'valid' ? (
                      <CheckCircle2 size={32} className="text-positive" />
                    ) : (
                      <XCircle size={32} className="text-negative" />
                    )}
                  </div>
                  <h3 className="text-base font-600 text-foreground mb-1">
                    {validationStatus === 'validating' ? 'Parsing CSV…' : validationStatus === 'valid' ? 'File validated' : 'Validation failed'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-0.5">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                    {totalRows > 0 && ` · ${totalRows} rows`}
                  </p>
                </>
              ) : (
                <>
                  <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-200 ${isDragOver ? 'bg-primary/20 scale-110' : 'bg-muted'}`}>
                    <UploadCloud size={32} className={isDragOver ? 'text-primary' : 'text-muted-foreground'} />
                  </div>
                  <h3 className="text-base font-600 text-foreground mb-2">
                    {isDragOver ? 'Drop your CSV here' : 'Drag & drop your CSV file'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    or <span className="text-primary font-500">click to browse</span>
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">CSV only</span>
                    <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">Max 10MB</span>
                    <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">UTF-8 encoded</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {uploadedFile && !uploadComplete && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpload}
                disabled={validationStatus !== 'valid' || isUploading}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-600 text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Processing…</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={15} />
                    Upload & Analyze
                  </>
                )}
              </button>
              <button
                onClick={handleClearFile}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-500 text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground active:scale-95"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>
          )}

          {uploadComplete && (
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-600 text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-95"
              >
                View Dashboard
                <ChevronRight size={15} />
              </a>
              <button
                onClick={handleClearFile}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-500 text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground active:scale-95"
              >
                Upload Another
              </button>
            </div>
          )}

          {/* Column Validation */}
          {columnValidations.length > 0 && (
            <div className="card-glass p-5 animate-slide-up">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-600 text-foreground">Column Validation</h3>
                  <span className="rounded-full bg-positive/15 px-2 py-0.5 text-2xs font-600 text-positive">
                    {validCount}/{columnValidations.length} found
                  </span>
                  {invalidCount > 0 && (
                    <span className="rounded-full bg-negative/15 px-2 py-0.5 text-2xs font-600 text-negative">
                      {invalidCount} missing
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {columnValidations.map((col) => (
                  <div
                    key={col.key}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      col.present ? 'border-positive/20 bg-positive/5' : 'border-negative/20 bg-negative/5'
                    }`}
                  >
                    {col.present ? (
                      <CheckCircle2 size={14} className="text-positive flex-shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-negative flex-shrink-0" />
                    )}
                    <span className={`text-xs font-mono font-500 ${col.present ? 'text-foreground' : 'text-negative'}`}>
                      {col.name}
                    </span>
                    {!col.present && (
                      <span className="ml-auto text-2xs text-negative">missing</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Errors */}
          {dataErrors.length > 0 && (
            <div className="card-glass p-5 animate-slide-up border border-negative/20">
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle size={14} className="text-negative" />
                <h3 className="text-sm font-600 text-negative">Data Errors ({dataErrors.length})</h3>
                <span className="text-2xs text-muted-foreground">Fix these before uploading</span>
              </div>
              <div className="space-y-2">
                {dataErrors.map((err, i) => (
                  <div key={`err-${i}`} className="flex items-start gap-3 rounded-lg border border-negative/15 bg-negative/5 px-3 py-2.5">
                    <XCircle size={13} className="mt-0.5 flex-shrink-0 text-negative" />
                    <div>
                      <span className="text-xs font-600 text-negative">Row {err.row} · </span>
                      <span className="text-xs font-mono text-negative">{err.column}</span>
                      <span className="text-xs text-muted-foreground"> — {err.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Table */}
          {showPreview && validationStatus === 'valid' && (
            <div className="card-glass overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                  <Eye size={15} className="text-muted-foreground" />
                  <h3 className="text-sm font-600 text-foreground">Data Preview</h3>
                  <span className="text-xs text-muted-foreground">First 5 rows of {totalRows}</span>
                </div>
                <span className="text-xs text-muted-foreground">Scroll horizontally to see all columns</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-xs">
                  <thead className="border-b border-border bg-muted/30">
                    <tr>
                      {previewHeaders.map((col) => (
                        <th key={`th-${col}`} className="px-3 py-2.5 text-left font-600 uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {previewRows.map((row, rowIdx) => (
                      <tr key={`preview-row-${rowIdx}`} className="hover:bg-white/3 transition-colors">
                        {previewHeaders.map((col) => {
                          const val = row[col] ?? '—';
                          const isMonetary = ['budget', 'spend', 'revenue'].includes(col);
                          const isStatus = col === 'status';
                          return (
                            <td key={`cell-${rowIdx}-${col}`} className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                              {isMonetary ? (
                                <span className="font-mono font-500 text-foreground">
                                  ₹{parseInt(val || '0').toLocaleString('en-IN')}
                                </span>
                              ) : isStatus ? (
                                <span className={`rounded-full px-2 py-0.5 text-2xs font-600 ${
                                  val === 'active' ? 'bg-positive/15 text-positive' :
                                  val === 'paused'? 'bg-warning/15 text-warning' : 'bg-accent/15 text-accent'
                                }`}>{val}</span>
                              ) : val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Required columns guide + upload history */}
        <div className="space-y-4">
          {/* Required columns guide */}
          <div className="card-glass p-5">
            <div className="mb-4 flex items-center gap-2">
              <Table2 size={15} className="text-muted-foreground" />
              <h3 className="text-sm font-600 text-foreground">Required Columns</h3>
            </div>
            <div className="space-y-3">
              {REQUIRED_COLUMNS.map((col) => (
                <div key={col.key} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <code className="text-xs font-mono font-600 text-primary">{col.name}</code>
                    <span className="text-2xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">required</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{col.description}</p>
                  <p className="mt-0.5 text-2xs text-muted-foreground/70">e.g. <span className="font-mono">{col.example}</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* Upload History */}
          <div className="card-glass p-5">
            <div className="mb-4 flex items-center gap-2">
              <Clock size={15} className="text-muted-foreground" />
              <h3 className="text-sm font-600 text-foreground">Upload History</h3>
            </div>
            <div className="space-y-2">
              {uploadHistory.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className={`mt-0.5 flex-shrink-0 ${upload.status === 'success' ? 'text-positive' : upload.status === 'error' ? 'text-negative' : 'text-warning'}`}>
                    {upload.status === 'success' ? <CheckCircle2 size={14} /> : upload.status === 'error' ? <XCircle size={14} /> : <AlertCircle size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-500 text-foreground truncate">{upload.filename}</p>
                    <p className="text-2xs text-muted-foreground mt-0.5">{upload.uploadedAt}</p>
                    {upload.status === 'success' && (
                      <p className="text-2xs text-positive mt-0.5">{upload.rows} rows imported</p>
                    )}
                    {upload.status === 'error' && upload.errorMessage && (
                      <p className="text-2xs text-negative mt-0.5 leading-relaxed">{upload.errorMessage}</p>
                    )}
                  </div>
                  <FileText size={13} className="mt-0.5 flex-shrink-0 text-muted-foreground/50" />
                </div>
              ))}
            </div>
          </div>

          {/* Format tip */}
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
            <div className="flex items-start gap-2.5">
              <Info size={15} className="mt-0.5 flex-shrink-0 text-warning" />
              <div>
                <p className="text-xs font-600 text-warning mb-1">INR Formatting Note</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All monetary values (budget, spend, revenue) must be in INR without currency symbols. Use plain integers: <code className="font-mono text-foreground">180000</code> not <code className="font-mono">₹1,80,000</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}