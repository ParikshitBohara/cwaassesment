export function logEvent(event: string, data: any = {}) {
  console.log(`[INSTRUMENTATION] ${new Date().toISOString()} | ${event}`, data);
}
