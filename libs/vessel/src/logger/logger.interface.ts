export interface ILogger {
  log(...message: any): void
  error(...message: any): any;
  warn(...message: any): any;
  debug?(...message: any): any;
  verbose?(...message: any): any;
}
