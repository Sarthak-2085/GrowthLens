import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'positive' | 'negative' | 'warning' | 'accent';
  size?: 'default' | 'hero';
  description?: string;
}

export default function MetricCard({
  label,
  value,
  subValue,
  trend,
  trendLabel,
  icon,
  variant = 'default',
  size = 'default',
  description,
}: MetricCardProps) {
  const variantStyles = {
    default: 'card-glass card-glow-primary',
    positive: 'card-glass card-glow-positive',
    negative: 'card-glass card-glow-negative',
    warning: 'card-glass card-glow-warning',
    accent: 'card-glass card-glow-accent',
  };

  const iconBgStyles = {
    default: 'bg-primary/15 text-primary',
    positive: 'bg-positive/15 text-positive',
    negative: 'bg-negative/15 text-negative',
    warning: 'bg-warning/15 text-warning',
    accent: 'bg-accent/15 text-accent',
  };

  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;
  const trendNeutral = trend === 0;

  return (
    <div
      className={`
        ${variantStyles[variant]}
        p-5 transition-all duration-200 hover:scale-[1.01] hover:shadow-glow-primary
        ${size === 'hero' ? 'p-6' : 'p-5'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-600 uppercase tracking-widest text-muted-foreground mb-2">
            {label}
          </p>
          <p
            className={`
              metric-value tabular-nums text-foreground leading-none
              ${size === 'hero' ? 'text-3xl' : 'text-2xl'}
            `}
          >
            {value}
          </p>
          {subValue && <p className="mt-1 text-xs text-muted-foreground font-mono">{subValue}</p>}
          {description && (
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{description}</p>
          )}
          {trend !== undefined && (
            <div className="mt-3 flex items-center gap-1.5">
              {trendPositive && <TrendingUp size={12} className="text-positive flex-shrink-0" />}
              {trendNegative && <TrendingDown size={12} className="text-negative flex-shrink-0" />}
              {trendNeutral && <Minus size={12} className="text-muted-foreground flex-shrink-0" />}
              <span
                className={`text-xs font-600 tabular-nums ${
                  trendPositive
                    ? 'text-positive'
                    : trendNegative
                      ? 'text-negative'
                      : 'text-muted-foreground'
                }`}
              >
                {trendPositive ? '+' : ''}
                {trend}%
              </span>
              {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
            </div>
          )}
        </div>

        <div
          className={`
            flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl
            ${iconBgStyles[variant]}
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
