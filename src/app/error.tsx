'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Client-side error logging. Kept as console.error for now — swap for a
    // real logging service (e.g. Sentry's free tier) if this ever needs to
    // surface to more than the browser console.
    console.error('GrowthLens client error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-negative/15">
            <AlertTriangle size={28} className="text-negative" />
          </div>
        </div>

        <h2 className="text-2xl font-600 text-foreground mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-8">
          GrowthLens hit an unexpected error. You can try again, or head back to the dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-600 text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-95"
          >
            <RotateCw size={15} />
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-600 text-foreground transition-all duration-150 hover:bg-muted active:scale-95"
          >
            <Home size={15} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
