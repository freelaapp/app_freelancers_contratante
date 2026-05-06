/**
 * Utilitário de debug condicional.
 * Ativar via EXPO_PUBLIC_DEBUG=true no ambiente.
 */

const DEBUG = process.env.EXPO_PUBLIC_DEBUG === "true";

type LogLevel = "log" | "warn" | "error";

function formatMessage(level: LogLevel, prefix: string, ...args: unknown[]): void {
  if (!DEBUG) return;

  const timestamp = new Date().toISOString();
  const formattedArgs = args.map((arg) => {
    if (typeof arg === "object" && arg !== null) {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  });

  const message = `[${timestamp}] [${level.toUpperCase()}] [${prefix}]`;

  switch (level) {
    case "warn":
      console.warn(message, ...formattedArgs);
      break;
    case "error":
      console.error(message, ...formattedArgs);
      break;
    default:
      console.log(message, ...formattedArgs);
  }
}

export const debug = {
  log: (prefix: string, ...args: unknown[]) => formatMessage("log", prefix, ...args),
  warn: (prefix: string, ...args: unknown[]) => formatMessage("warn", prefix, ...args),
  error: (prefix: string, ...args: unknown[]) => formatMessage("error", prefix, ...args),
};

/**
 * Função utilitária para logs de desenvolvimento.
 * Usar apenas durante desenvolvimento.
 * @deprecated Use debug.log() em produção
 */
export function devLog(...args: unknown[]): void {
  if (DEBUG) {
    console.log(...args);
  }
}