export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export class LoggerService {
  private readonly serviceName: string;

  constructor(serviceName = "TWGT") {
    this.serviceName = serviceName;
  }

  /**
   * Log debug information.
   */
  public debug(message: string): void {
    this.write(LogLevel.DEBUG, message);
  }

  /**
   * Log informational messages.
   */
  public info(message: string): void {
    this.write(LogLevel.INFO, message);
  }

  /**
   * Log warnings.
   */
  public warn(message: string): void {
    this.write(LogLevel.WARN, message);
  }

  /**
   * Log errors.
   */
  public error(message: string, error?: unknown): void {
    const details = LoggerService.describeError(error);

    this.write(
      LogLevel.ERROR,
      details ? `${message} ${details}` : message
    );
  }

  /**
   * Extract human-readable detail from an error without losing the stack.
   */
  private static describeError(error: unknown): string | undefined {
    if (error === undefined || error === null) {
      return undefined;
    }

    if (error instanceof Error) {
      return error.stack ?? `${error.name}: ${error.message}`;
    }

    return String(error);
  }

  /**
   * Internal log formatter.
   */
  private write(
    level: LogLevel,
    message: string
  ): void {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level}] [${this.serviceName}] ${message}`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(line);
        break;
      case LogLevel.WARN:
        console.warn(line);
        break;
      default:
        console.log(line);
    }
  }
}
