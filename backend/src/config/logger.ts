/**
 * Lightweight structured logger for the Artifex pipeline.
 * No external dependencies — just formatted console output with timestamps.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

const COLORS: Record<LogLevel, string> = {
  info:  "\x1b[36m",  // cyan
  warn:  "\x1b[33m",  // yellow
  error: "\x1b[31m",  // red
  debug: "\x1b[90m",  // gray
};
const RESET = "\x1b[0m";
const BOLD  = "\x1b[1m";

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function log(level: LogLevel, tag: string, message: string, meta?: Record<string, unknown>): void {
  const color = COLORS[level];
  const prefix = `${BOLD}${color}[${level.toUpperCase()}]${RESET}`;
  const tagStr = tag ? ` ${BOLD}[${tag}]${RESET}` : "";
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  console.log(`${prefix}${tagStr} ${timestamp()} — ${message}${metaStr}`);
}

export const logger = {
  info:  (tag: string, message: string, meta?: Record<string, unknown>) => log("info",  tag, message, meta),
  warn:  (tag: string, message: string, meta?: Record<string, unknown>) => log("warn",  tag, message, meta),
  error: (tag: string, message: string, meta?: Record<string, unknown>) => log("error", tag, message, meta),
  debug: (tag: string, message: string, meta?: Record<string, unknown>) => log("debug", tag, message, meta),
};
