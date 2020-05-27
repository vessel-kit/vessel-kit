import { ILogger } from './logger.interface';
import colors from 'colors/safe';

export type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

const localeStringOptions = {
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  day: '2-digit',
  month: '2-digit',
};

export class ConsoleLogger implements ILogger {
  constructor() {}

  log(...message: any) {
    ConsoleLogger.printMessage(message, 'log', colors.green);
  }

  error(...message: any) {
    ConsoleLogger.printMessage(message, 'verbose', colors.red);
  }

  warn(...message: any) {
    ConsoleLogger.printMessage(message, 'verbose', colors.yellow);
  }

  debug(...message: any) {
    ConsoleLogger.printMessage(message, 'debug', colors.magenta);
  }

  verbose(...message: any) {
    ConsoleLogger.printMessage(message, 'verbose', colors.cyan);
  }

  private static printMessage(message: any, level: LogLevel, color: (message: string) => string) {
    const timestamp = new Date(Date.now()).toLocaleString(undefined, localeStringOptions);
    const timestampMessage = color(timestamp);
    console[level](timestampMessage, ...message);
  }
}
