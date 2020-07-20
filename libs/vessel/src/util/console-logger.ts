import { ILogger } from './logger.interface';
import colors from 'colors/safe';

export type LogLevel = 'log' | 'error' | 'warn' | 'debug';

const localeStringOptions = {
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  day: '2-digit',
  month: '2-digit',
};

export class ConsoleLogger implements ILogger {
  constructor(readonly context?: string) {}

  log(...message: any) {
    this.printMessage(message, 'log', colors.green);
  }

  error(...message: any) {
    this.printMessage(message, 'error', colors.red);
  }

  warn(...message: any) {
    this.printMessage(message, 'warn', colors.yellow);
  }

  debug(...message: any) {
    this.printMessage(message, 'debug', colors.magenta);
  }

  private printMessage(message: any, level: LogLevel, color: (message: string) => string) {
    const timestamp = new Date(Date.now()).toLocaleString(undefined, localeStringOptions);
    const timestampMessage = color(timestamp);
    if (this.context) {
      const contextClause = color(`[${this.context}]`);
      console[level](timestampMessage, contextClause, ...message);
    } else {
      console[level](timestampMessage, ...message);
    }
  }

  withContext(context?: string): ILogger {
    return new ConsoleLogger(context);
  }
}
