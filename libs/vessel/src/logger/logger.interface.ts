export interface ILogger {
  withContext(context?: string): ILogger;
  log(...message: any): void;
  error(...message: any): any;
  warn(...message: any): any;
  debug?(...message: any): any;
}
