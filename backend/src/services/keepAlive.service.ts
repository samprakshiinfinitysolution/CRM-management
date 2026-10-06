import { config } from "../config/env.js";

export class KeepAliveService {
  private static timer: NodeJS.Timeout | null = null;
  private static isRunning = false;

  static getTargetUrl(): string {
    const baseUrl =
      config.serverUrl?.trim() || `http://127.0.0.1:${config.port}`;

    return `${baseUrl.replace(/\/+$/, "")}/api/health`;
  }

  static async pingServer(): Promise<boolean> {
    const url = this.getTargetUrl();
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10_000);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "CRM-HealthCheck/1.0",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        console.warn(
          `[KeepAlive] Health check failed: ${response.status} ${response.statusText}`,
        );

        return false;
      }

      console.log(`[KeepAlive] Health check successful: ${response.status}`);

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.warn(`[KeepAlive] Health check failed: ${message}`);

      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  static start(): void {
    if (this.isRunning) {
      return;
    }

    if (!config.keepAlive.enabled || config.nodeEnv === "test") {
      return;
    }

    const intervalMinutes = config.keepAlive.intervalMinutes || 14;

    const intervalMs = intervalMinutes * 60 * 1000;

    this.isRunning = true;

    console.log(
      `[KeepAlive] Starting health check every ${intervalMinutes} minutes`,
    );

    this.timer = setInterval(() => {
      void this.pingServer();
    }, intervalMs);
  }

  static stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.isRunning = false;

    console.log("[KeepAlive] Health check stopped.");
  }

  static getStatus() {
    return {
      isRunning: this.isRunning,
      targetUrl: this.getTargetUrl(),
      intervalMinutes: config.keepAlive.intervalMinutes || 14,
    };
  }
}
