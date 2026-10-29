/**
 * Lightweight sliding-window in-memory rate limiter for single VPS Dokploy deployment
 * Protects sensitive endpoints (AI generation, checkout, auth, webhooks) without external Redis costs.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale keys periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
  if (typeof (cleanupTimer as any)?.unref === "function") {
    (cleanupTimer as any).unref();
  }
}

export interface RateLimitOptions {
  intervalMs?: number; // e.g. 60_000 for 1 minute
  maxRequests?: number; // maximum allowed requests in window
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
} {
  const intervalMs = options.intervalMs || 60_000;
  const maxRequests = options.maxRequests || 30;
  const now = Date.now();

  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + intervalMs,
    });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(intervalMs / 1000),
    };
  }

  if (record.count >= maxRequests) {
    const resetInSeconds = Math.ceil((record.resetAt - now) / 1000);
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetInSeconds,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
  };
}
