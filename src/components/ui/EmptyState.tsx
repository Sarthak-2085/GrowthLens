import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <h3 className="mb-2 text-base font-600 text-foreground">{title}</h3>
      <p className="mb-6 max-w-xs text-sm text-muted-foreground leading-relaxed">{description}</p>
      {action && action}
    </div>
  );
}