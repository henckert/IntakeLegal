// Lightweight telemetry/analytics wrapper
// Safe no-op logger when analytics not configured

class TelemetryLogger {
  private enabled = false; // Set to true when analytics provider is configured

  track(eventName: string, data?: Record<string, any>) {
    if (!this.enabled) {
      // No-op in production, log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Telemetry]', eventName, data);
      }
      return;
    }

    // TODO: Send to analytics provider (Google Analytics, Segment, etc.)
    // Example:
    // window.gtag?.('event', eventName, data);
    // window.analytics?.track(eventName, data);
  }

  pageView(path: string, data?: Record<string, any>) {
    this.track('page_view', { path, ...data });
  }
}

export const telemetry = new TelemetryLogger();
