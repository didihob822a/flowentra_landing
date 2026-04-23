import { type ReactNode } from "react";
import { AlertTriangle, RefreshCw, type LucideIcon } from "lucide-react";
import { toast as sonnerToast } from "sonner";

/**
 * Shared admin UX primitives — use across every admin list view so loading,
 * error, empty, and toast feedback all look and behave the same.
 */

// ---------- Skeleton primitives ----------

export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-muted/60 rounded animate-pulse ${className}`} />
);

interface SkeletonListProps {
  rows?: number;
  /** Visual variant — "row" for tables/lists, "card" for grid cards. */
  variant?: "row" | "card";
  className?: string;
}

/**
 * Drop-in skeleton for any admin list view. Mimics the final layout density so
 * the page doesn't jump on load.
 */
export const SkeletonList = ({ rows = 5, variant = "row", className = "" }: SkeletonListProps) => {
  if (variant === "card") {
    return (
      <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    );
  }
  return (
    <div className={`rounded-xl border border-border bg-card overflow-hidden ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 px-4 py-4 ${i < rows - 1 ? "border-b border-border" : ""}`}
        >
          <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2.5 w-2/3" />
          </div>
          <Skeleton className="w-16 h-6 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
};

// ---------- Empty state ----------

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ icon: Icon, title, description, action, className = "" }: EmptyStateProps) => (
  <div
    className={`rounded-xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center ${className}`}
  >
    {Icon && <Icon className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />}
    <h3 className="font-semibold text-foreground mb-1">{title}</h3>
    {description && <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>}
    {action}
  </div>
);

// ---------- Error state with retry ----------

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void | Promise<void>;
  retrying?: boolean;
  className?: string;
}

export const ErrorState = ({
  title = "Something went wrong",
  message = "We couldn't load this data. Check your connection and try again.",
  onRetry,
  retrying = false,
  className = "",
}: ErrorStateProps) => (
  <div
    className={`rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center flex flex-col items-center justify-center ${className}`}
  >
    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
      <AlertTriangle className="w-6 h-6 text-destructive" />
    </div>
    <h3 className="font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4 max-w-md">{message}</p>
    {onRetry && (
      <button
        onClick={() => onRetry()}
        disabled={retrying}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-4 h-4 ${retrying ? "animate-spin" : ""}`} />
        {retrying ? "Retrying…" : "Try again"}
      </button>
    )}
  </div>
);

// ---------- Standardized toast helper ----------

/**
 * Centralized toast helper — use these instead of sonner directly so every
 * admin surface speaks with the same voice (durations, descriptions, retry).
 */
export const adminToast = {
  success(message: string, opts?: { description?: string }) {
    return sonnerToast.success(message, {
      description: opts?.description,
      duration: 2500,
    });
  },
  info(message: string, opts?: { description?: string }) {
    return sonnerToast(message, {
      description: opts?.description,
      duration: 2500,
    });
  },
  /**
   * Standard error toast. Pass `retry` to render an inline "Try again" action.
   * Always uses a longer duration so the user can read the message.
   */
  error(
    message: string,
    opts?: { description?: string; retry?: () => void | Promise<void> }
  ) {
    return sonnerToast.error(message, {
      description: opts?.description,
      duration: 5000,
      action: opts?.retry
        ? { label: "Retry", onClick: () => void opts.retry?.() }
        : undefined,
    });
  },
  /**
   * Wrap an async operation with success/error toasts. Returns the promise's
   * resolved value so it can be chained.
   */
  async promise<T>(
    fn: () => Promise<T>,
    messages: { loading: string; success: string; error: string },
  ): Promise<T> {
    const id = sonnerToast.loading(messages.loading);
    try {
      const result = await fn();
      sonnerToast.success(messages.success, { id, duration: 2500 });
      return result;
    } catch (err: any) {
      sonnerToast.error(messages.error, {
        id,
        description: err?.message,
        duration: 5000,
      });
      throw err;
    }
  },
};
