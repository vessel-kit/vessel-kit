import { ILogger } from './logger.interface';
import colors from 'colors/safe';
import * as _ from 'lodash';

export type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

export class ConsoleLogger implements ILogger {
  private static logLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];
  private static lastTimestamp?: number;
  private static instance?: ILogger = ConsoleLogger;

  constructor(protected context?: string, private readonly isTimestampEnabled = false) {}

  error(message: any, trace = '', context?: string) {
    const instance = this.getInstance();
    if (!this.isLogLevelEnabled('error')) {
      return;
    }
    instance && instance.error.call(instance, message, trace, context || this.context);
  }

  log(message: any, context?: string) {
    this.callFunction('log', message, context);
  }

  warn(message: any, context?: string) {
    this.callFunction('warn', message, context);
  }

  debug(message: any, context?: string) {
    this.callFunction('debug', message, context);
  }

  verbose(message: any, context?: string) {
    this.callFunction('verbose', message, context);
  }

  static log(message: any, context = '', isTimeDiffEnabled = true) {
    this.printMessage(message, colors.green, context, isTimeDiffEnabled);
  }

  static error(message: any, trace = '', context = '', isTimeDiffEnabled = true) {
    this.printMessage(message, colors.red, context, isTimeDiffEnabled);
    this.printStackTrace(trace);
  }

  static warn(message: any, context = '', isTimeDiffEnabled = true) {
    this.printMessage(message, colors.yellow, context, isTimeDiffEnabled);
  }

  static debug(message: any, context = '', isTimeDiffEnabled = true) {
    this.printMessage(message, colors.magenta, context, isTimeDiffEnabled);
  }

  static verbose(message: any, context = '', isTimeDiffEnabled = true) {
    this.printMessage(message, colors.cyan, context, isTimeDiffEnabled);
  }

  private callFunction(name: 'log' | 'warn' | 'debug' | 'verbose', message: any, context?: string) {
    if (!this.isLogLevelEnabled(name)) {
      return;
    }
    const instance = this.getInstance();
    const func = instance && (instance as typeof ConsoleLogger)[name];
    func && func.call(instance, message, context || this.context, this.isTimestampEnabled);
  }

  private getInstance(): ILogger | ConsoleLogger {
    const { instance } = ConsoleLogger;
    return instance === this ? ConsoleLogger : instance;
  }

  private isLogLevelEnabled(level: LogLevel): boolean {
    return ConsoleLogger.logLevels.includes(level);
  }

  private static printMessage(
    message: any,
    color: (message: string) => string,
    context = '',
    isTimeDiffEnabled?: boolean,
  ) {
    const output = _.isObject(message) ? `${color('Object:')}\n${JSON.stringify(message, null, 2)}\n` : color(message);

    const localeStringOptions = {
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      day: '2-digit',
      month: '2-digit',
    };
    const timestamp = new Date(Date.now()).toLocaleString(undefined, localeStringOptions);

    const pidMessage = color(`[Nest] ${process.pid}   - `);
    const contextMessage = context ? colors.yellow(`[${context}] `) : '';
    const timestampDiff = this.updateAndGetTimestampDiff(isTimeDiffEnabled);

    process.stdout.write(`${pidMessage}${timestamp}   ${contextMessage}${output}${timestampDiff}\n`);
  }

  private static updateAndGetTimestampDiff(isTimeDiffEnabled?: boolean): string {
    const includeTimestamp = ConsoleLogger.lastTimestamp && isTimeDiffEnabled;
    const result = includeTimestamp ? colors.yellow(` +${Date.now() - ConsoleLogger.lastTimestamp}ms`) : '';
    ConsoleLogger.lastTimestamp = Date.now();
    return result;
  }

  private static printStackTrace(trace: string) {
    if (!trace) {
      return;
    }
    process.stdout.write(`${trace}\n`);
  }
}
