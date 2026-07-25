'use client';

import React, { useState } from 'react';
import { User, Globe, Bell, Download, Check, Moon, Sun, Monitor, Mail, Smartphone, TrendingUp, AlertTriangle, FileText, Database, Table, Save, RefreshCw,  } from 'lucide-react';



// ─── Types ────────────────────────────────────────────────────────────────────

interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  enabled: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
];

const THEMES = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'system', label: 'System', icon: Monitor },
] as const;

const DATE_FORMATS = [
  { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '22/07/2026' },
  { id: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '07/22/2026' },
  { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2026-07-22' },
  { id: 'DD MMM YYYY', label: 'DD MMM YYYY', example: '22 Jul 2026' },
];

const EXPORT_FORMATS = [
  { id: 'csv', label: 'CSV', description: 'Comma-separated values', icon: Table },
  { id: 'json', label: 'JSON', description: 'Structured data format', icon: Database },
  { id: 'pdf', label: 'PDF Report', description: 'Formatted report document', icon: FileText },
];

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({
  icon: SectionIcon,
  title,
  description,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
        <SectionIcon size={16} className="text-primary" />
      </div>
      <div>
        <h2 className="text-base font-700 text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// ─── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        enabled ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-200 ${
          enabled ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function SettingsClient() {
  // User Preferences
  const [displayName, setDisplayName] = useState('Marketing Manager');
  const [email, setEmail] = useState('manager@growthlens.ai');
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [language, setLanguage] = useState('English');

  // Currency
  const [selectedCurrency, setSelectedCurrency] = useState('INR');

  // Notifications
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'email_reports',
      label: 'Weekly Email Reports',
      description: 'Receive a summary of campaign performance every Monday',
      icon: Mail,
      enabled: true,
    },
    {
      id: 'push_alerts',
      label: 'Push Notifications',
      description: 'Get real-time alerts on your device',
      icon: Smartphone,
      enabled: false,
    },
    {
      id: 'roi_alerts',
      label: 'ROI Threshold Alerts',
      description: 'Alert when a campaign ROI drops below your set threshold',
      icon: TrendingUp,
      enabled: true,
    },
    {
      id: 'budget_warnings',
      label: 'Budget Overspend Warnings',
      description: 'Notify when campaign spend exceeds 90% of budget',
      icon: AlertTriangle,
      enabled: true,
    },
  ]);

  const [roiThreshold, setRoiThreshold] = useState('150');
  const [exportFormat, setExportFormat] = useState('csv');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [savedBanner, setSavedBanner] = useState(false);

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const handleSave = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      format: exportFormat,
      currency: selectedCurrency,
      note: 'GrowthLens data export — connect to backend API to enable real data export.',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `growthlens-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeCurrency = CURRENCIES.find((c) => c.code === selectedCurrency)!;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-800 text-foreground tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your preferences, currency, notifications, and data exports
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-600 text-white transition-all hover:bg-primary/90 active:scale-95"
        >
          <Save size={14} />
          Save Changes
        </button>
      </div>

      {/* Saved Banner */}
      {savedBanner && (
        <div className="flex items-center gap-2 rounded-lg border border-positive/30 bg-positive/10 px-4 py-3 text-sm font-500 text-positive">
          <Check size={15} />
          Settings saved successfully
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── User Preferences ─────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-6">
          <SectionHeader
            icon={User}
            title="User Preferences"
            description="Personalise your GrowthLens experience"
          />

          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="mb-1.5 block text-xs font-600 text-muted-foreground uppercase tracking-wider">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-600 text-muted-foreground uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>

            {/* Theme */}
            <div>
              <label className="mb-2 block text-xs font-600 text-muted-foreground uppercase tracking-wider">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map(({ id, label, icon: ThemeIcon }) => (
                  <button
                    key={id}
                    onClick={() => setTheme(id as typeof theme)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-600 transition-all ${
                      theme === id
                        ? 'border-primary bg-primary/10 text-primary' :'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    <ThemeIcon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Format */}
            <div>
              <label className="mb-1.5 block text-xs font-600 text-muted-foreground uppercase tracking-wider">
                Date Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DATE_FORMATS.map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setDateFormat(fmt.id)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-all ${
                      dateFormat === fmt.id
                        ? 'border-primary bg-primary/10 text-primary' :'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    <span className="font-600">{fmt.label}</span>
                    <span className="text-2xs opacity-70">{fmt.example}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="mb-1.5 block text-xs font-600 text-muted-foreground uppercase tracking-wider">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
              >
                {['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi'].map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Currency Selection ────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-6">
          <SectionHeader
            icon={Globe}
            title="Currency Selection"
            description="Choose the currency used across all financial metrics"
          />

          {/* Active currency preview */}
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <span className="text-2xl font-800 text-primary">{activeCurrency.symbol}</span>
            <div>
              <p className="text-sm font-700 text-foreground">{activeCurrency.name}</p>
              <p className="text-xs text-muted-foreground">
                {activeCurrency.code} · {activeCurrency.locale}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1 rounded-full bg-positive/10 px-2 py-0.5 text-2xs font-600 text-positive">
              <Check size={10} />
              Active
            </div>
          </div>

          <div className="space-y-2">
            {CURRENCIES.map((currency) => (
              <button
                key={currency.code}
                onClick={() => setSelectedCurrency(currency.code)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                  selectedCurrency === currency.code
                    ? 'border-primary bg-primary/8 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-white/3 hover:text-foreground'
                }`}
              >
                <span
                  className={`w-8 text-center text-base font-700 ${
                    selectedCurrency === currency.code ? 'text-primary' : ''
                  }`}
                >
                  {currency.symbol}
                </span>
                <div className="flex-1">
                  <span className="text-sm font-600">{currency.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{currency.code}</span>
                </div>
                {selectedCurrency === currency.code && (
                  <Check size={14} className="text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Notification Settings ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-6">
          <SectionHeader
            icon={Bell}
            title="Notification Settings"
            description="Control how and when GrowthLens alerts you"
          />

          <div className="space-y-4">
            {notifications.map((notif) => {
              const NotifIcon = notif.icon;
              return (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-background px-4 py-3"
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                      notif.enabled ? 'bg-primary/15' : 'bg-muted'
                    }`}
                  >
                    <NotifIcon
                      size={14}
                      className={notif.enabled ? 'text-primary' : 'text-muted-foreground'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-foreground">{notif.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                  <Toggle
                    enabled={notif.enabled}
                    onChange={() => toggleNotification(notif.id)}
                  />
                </div>
              );
            })}

            {/* ROI Threshold input */}
            <div className="rounded-lg border border-border bg-background px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-600 text-foreground">ROI Alert Threshold</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Alert when campaign ROI falls below this value
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={roiThreshold}
                  onChange={(e) => setRoiThreshold(e.target.value)}
                  min="0"
                  max="1000"
                  className="w-28 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
                <span className="text-sm text-muted-foreground font-500">% ROI</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Data Export Options ───────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card p-6">
          <SectionHeader
            icon={Download}
            title="Data Export Options"
            description="Export your campaign data and reports in your preferred format"
          />

          <div className="space-y-4">
            {/* Export Format */}
            <div>
              <label className="mb-2 block text-xs font-600 text-muted-foreground uppercase tracking-wider">
                Export Format
              </label>
              <div className="space-y-2">
                {EXPORT_FORMATS.map((fmt) => {
                  const FmtIcon = fmt.icon;
                  return (
                    <button
                      key={fmt.id}
                      onClick={() => setExportFormat(fmt.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                        exportFormat === fmt.id
                          ? 'border-primary bg-primary/8' :'border-border bg-background hover:border-primary/30 hover:bg-white/3'
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                          exportFormat === fmt.id ? 'bg-primary/20' : 'bg-muted'
                        }`}
                      >
                        <FmtIcon
                          size={14}
                          className={exportFormat === fmt.id ? 'text-primary' : 'text-muted-foreground'}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-600 ${
                            exportFormat === fmt.id ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {fmt.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{fmt.description}</p>
                      </div>
                      {exportFormat === fmt.id && (
                        <Check size={14} className="text-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Export Options */}
            <div>
              <label className="mb-2 block text-xs font-600 text-muted-foreground uppercase tracking-wider">
                Include in Export
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                  <div>
                    <p className="text-sm font-600 text-foreground">Charts & Visualisations</p>
                    <p className="text-xs text-muted-foreground">Embed chart images in PDF exports</p>
                  </div>
                  <Toggle enabled={includeCharts} onChange={setIncludeCharts} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                  <div>
                    <p className="text-sm font-600 text-foreground">AI Recommendations</p>
                    <p className="text-xs text-muted-foreground">Include AI-generated insights in export</p>
                  </div>
                  <Toggle enabled={includeRecommendations} onChange={setIncludeRecommendations} />
                </div>
              </div>
            </div>

            {/* Export Actions */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-600 text-white transition-all hover:bg-primary/90 active:scale-95"
              >
                <Download size={14} />
                Export Now
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-600 text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground active:scale-95">
                <RefreshCw size={14} />
                Schedule Export
              </button>
            </div>

            {/* Info note */}
            <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
              Scheduled exports and PDF generation require backend integration. Connect your FastAPI backend to enable full export functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
