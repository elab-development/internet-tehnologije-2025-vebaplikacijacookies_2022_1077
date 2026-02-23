interface RateLimitContext {
  count: number;
  lastReset: number;
}

const ipCache = new Map<string, RateLimitContext>();

export function checkRateLimit(ip: string, limit: number = 10, windowMs: number = 60000) {
  const now = Date.now();
  const record = ipCache.get(ip);

  if (!record) {
    ipCache.set(ip, { count: 1, lastReset: now });
    return { success: true };
  }

  // Resetuj prozor ako je prošlo vreme
  if (now - record.lastReset > windowMs) {
    record.count = 1;
    record.lastReset = now;
    return { success: true };
  }

  // Proveri limit
  if (record.count >= limit) {
    return { success: false, retryAfter: Math.ceil((windowMs - (now - record.lastReset)) / 1000) };
  }

  // Inkrementiraj
  record.count++;
  return { success: true };
}

// Čišćenje keša svakih 5 minuta da ne curi memorija
setInterval(() => {
  ipCache.clear();
}, 5 * 60 * 1000);
