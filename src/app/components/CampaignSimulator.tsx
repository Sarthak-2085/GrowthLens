'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FlaskConical, Sparkles, Lock, AlertCircle, Loader2 } from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
import EmptyState from '@/components/ui/EmptyState';
import { useCampaigns } from './CampaignsProvider';
import {
  getMLStatus,
  predictCampaignOutcome,
  ApiError,
  type MLStatus,
  type PredictionResponse,
  type MLConfidence,
} from '@/lib/api';
import { formatINR } from '@/lib/metrics';

const confidenceStyles: Record<MLConfidence, { badge: string; label: string }> = {
  high: { badge: 'bg-positive/15 text-positive', label: 'High confidence' },
  medium: { badge: 'bg-warning/15 text-warning', label: 'Medium confidence' },
  low: { badge: 'bg-muted text-muted-foreground', label: 'Low confidence' },
};

function successScoreColor(score: number): string {
  if (score >= 70) return 'text-positive';
  if (score >= 40) return 'text-warning';
  return 'text-negative';
}

export default function CampaignSimulator() {
  const { campaigns } = useCampaigns();

  const [status, setStatus] = useState<MLStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [channel, setChannel] = useState('');
  const [budget, setBudget] = useState('');
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  const knownChannels = useMemo(
    () => Array.from(new Set(campaigns.map((c) => c.channel))).sort(),
    [campaigns]
  );

  useEffect(() => {
    let cancelled = false;
    setStatusLoading(true);
    setStatusError(null);

    getMLStatus()
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setStatusError(err.message || 'Failed to check prediction readiness.');
      })
      .finally(() => {
        if (!cancelled) setStatusLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBudget = parseFloat(budget);

    if (!channel.trim()) {
      setPredictError('Enter a channel to simulate.');
      return;
    }
    if (!parsedBudget || parsedBudget <= 0) {
      setPredictError('Enter a budget greater than 0.');
      return;
    }

    setPredictLoading(true);
    setPredictError(null);
    setPrediction(null);

    try {
      const result = await predictCampaignOutcome({ channel: channel.trim(), budget: parsedBudget });
      setPrediction(result);
    } catch (err) {
      setPredictError(err instanceof ApiError ? err.message : 'Prediction failed. Please try again.');
    } finally {
      setPredictLoading(false);
    }
  };

  return (
    <div className="card-glass p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15">
          <FlaskConical size={14} className="text-accent" />
        </div>
        <div>
          <h2 className="text-base font-600 text-foreground">Campaign Simulator</h2>
          <p className="text-xs text-muted-foreground">
            Predict how a new campaign might perform, based on your own data
          </p>
        </div>
      </div>

      {statusLoading ? (
        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
          <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
        </div>
      ) : statusError ? (
        <EmptyState
          icon={<AlertCircle size={24} />}
          title="Couldn't check prediction readiness"
          description={statusError}
        />
      ) : status && !status.ready ? (
        <EmptyState
          icon={<Lock size={24} />}
          title="Not enough data yet"
          description={status.message}
          action={
            <a
              href="/upload-data"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-600 text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-95"
            >
              Upload more campaigns
            </a>
          }
        />
      ) : (
        <>
          {status && status.sample_size < 15 && (
            <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles size={12} className="text-warning flex-shrink-0" />
              {status.message}
            </p>
          )}

          <form onSubmit={handlePredict} className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="sim-channel" className="mb-1.5 block text-xs font-500 text-muted-foreground">
                Channel
              </label>
              <input
                id="sim-channel"
                type="text"
                list="sim-channel-options"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="e.g. Google Ads"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <datalist id="sim-channel-options">
                {knownChannels.map((ch) => (
                  <option key={ch} value={ch} />
                ))}
              </datalist>
            </div>
            <div className="flex-1">
              <label htmlFor="sim-budget" className="mb-1.5 block text-xs font-500 text-muted-foreground">
                Proposed Budget (₹)
              </label>
              <input
                id="sim-budget"
                type="number"
                min="1"
                step="1"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 150000"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              disabled={predictLoading}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-600 text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {predictLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Predicting…
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Predict
                </>
              )}
            </button>
          </form>

          {predictError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-negative/20 bg-negative/5 px-3 py-2.5">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-negative" />
              <p className="text-xs text-negative">{predictError}</p>
            </div>
          )}

          {predictLoading && !prediction && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`sim-skel-${i}`} className="h-24 animate-pulse rounded-xl bg-muted/60" />
              ))}
            </div>
          )}

          {prediction && !predictLoading && (
            <div className="animate-fade-in space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <MetricCard
                  label="Predicted Revenue"
                  value={formatINR(prediction.predicted_revenue, true)}
                  icon={<Sparkles size={18} />}
                  variant="positive"
                />
                <MetricCard
                  label="Predicted ROI"
                  value={`${prediction.predicted_roi >= 0 ? '+' : ''}${prediction.predicted_roi}%`}
                  icon={<Sparkles size={18} />}
                  variant={prediction.predicted_roi >= 0 ? 'positive' : 'negative'}
                />
                <MetricCard
                  label="Predicted Clicks"
                  value={prediction.predicted_clicks.toLocaleString('en-IN')}
                  icon={<Sparkles size={18} />}
                  variant="default"
                />
                <MetricCard
                  label="Predicted Conversions"
                  value={prediction.predicted_conversions.toLocaleString('en-IN')}
                  subValue={`${prediction.predicted_cvr}% CVR`}
                  icon={<Sparkles size={18} />}
                  variant="default"
                />
                <MetricCard
                  label="Success Score"
                  value={`${prediction.success_score}/100`}
                  icon={<Sparkles size={18} />}
                  variant="accent"
                />
                <div className="card-glass card-glow-accent p-5 flex flex-col justify-between">
                  <p className="text-xs font-600 uppercase tracking-widest text-muted-foreground mb-2">
                    Confidence
                  </p>
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-600 ${confidenceStyles[prediction.confidence].badge}`}
                  >
                    {confidenceStyles[prediction.confidence].label}
                  </span>
                  <p className="mt-2 text-2xs text-muted-foreground">
                    Based on {prediction.sample_size} campaigns
                    {prediction.r2_score !== null ? ` · R² ${prediction.r2_score}` : ''}
                  </p>
                </div>
              </div>

              <p className={`text-xs ${successScoreColor(prediction.success_score)}`}>
                This proposed campaign would rank in the {prediction.success_score >= 50 ? 'top' : 'bottom'}{' '}
                {prediction.success_score >= 50 ? 100 - prediction.success_score : prediction.success_score}% of
                your historical campaigns on ROI and conversion rate combined.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
