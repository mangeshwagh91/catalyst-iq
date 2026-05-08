import { AlertCircle, RefreshCw, type LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

export function StatSkeleton() {
  return (
    <div className="bg-card/60 border border-border p-5 rounded-xl animate-pulse">
      <div className="h-6 w-6 rounded-full bg-secondary/60 mb-3" />
      <div className="h-8 w-16 bg-secondary/60 rounded mb-2" />
      <div className="h-3 w-24 bg-secondary/40 rounded" />
    </div>
  );
}

export function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full bg-secondary/40 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-card/60 border border-border rounded-xl p-5 animate-pulse">
      <div className="h-4 w-40 bg-secondary/60 rounded mb-4" />
      <div className="h-56 bg-secondary/30 rounded-lg" />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="h-14 w-14 rounded-2xl bg-secondary/60 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="font-display text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

interface ErrorStateProps {
  error?: unknown;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const message =
    error instanceof Error
      ? error.message
      : "An unexpected error occurred. The backend may be offline.";

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
        <AlertCircle className="h-7 w-7 text-red-400" />
      </div>
      <h3 className="font-display text-lg mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-card/60 text-sm hover:border-primary/40 transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      )}
    </div>
  );
}

// ─── Page transition ──────────────────────────────────────────────────────────

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div className={cn("animate-fade-in-up", className)}>{children}</div>
  );
}
