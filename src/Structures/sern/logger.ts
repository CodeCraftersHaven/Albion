import type { Logging, LogPayload } from '@sern/handler';
import { Logger, type LogLevel, type LogStyle } from '@spark.ts/logger';
import { bold, italic } from 'colorette';
import { appendFile } from 'fs';
import { promisify } from 'util';

export class Sparky implements Logging {
  private _spark!: Logger;
  private _date!: Date;
  constructor(logLevel: LogLevel, logStyle: LogStyle) {
    console.clear();
    this._spark = new Logger({ logLevel, logStyle });
    this._date = new Date();
  }

  public warn = this.warning;
  private write = promisify(appendFile);

  private writer = (entry: string) => {
    try {
      entry = entry + '\n'
      this.write('assets/loggerLogs.txt', entry);
    } catch (error) {
      this.info('Error while writing to log file: ' + error);
    }
  }

  success(payload: LogPayload<unknown> | any) {
    payload = payload.message || { payload }.payload;
    let entry = bold(italic(this._date.toISOString() + ' => ' + payload));
    this._spark.success(entry);
    this.writer(entry)
  }
  info(payload: LogPayload<unknown> | any): void {
    payload = payload.message || { payload }.payload;
    let entry = bold(italic(this._date.toISOString() + ' => ' + payload))
    this._spark.info(entry);
    this.writer(entry)
  }
  warning(payload: LogPayload<unknown> | any): void {
    payload = payload.message || { payload }.payload;
    let entry =bold(italic(this._date.toISOString() + ' => ' + payload))
    this._spark.warn(entry);
    this.writer(entry)
  }
  debug(payload: LogPayload<unknown> | any): void {
    payload = payload.message || { payload }.payload;
    let entry =bold(italic(this._date.toISOString() + ' => ' + payload))
    this._spark.debug(entry);
    this.writer(entry)
  }
  error(payload: LogPayload<unknown> | any): void {
    payload = payload.message || { payload }.payload;
    let entry = bold(italic(this._date.toISOString() + ' => ' + payload))
    this._spark.error(entry);
    this.writer(entry)
  }
}
