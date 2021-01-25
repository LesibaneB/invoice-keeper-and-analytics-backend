import {
  NestjsWinstonLoggerService,
  appendRequestIdToLogger,
  LoggingInterceptor,
  configMorgan,
  morganRequestLogger,
  morganResponseLogger,
  TOKEN_TYPE,
} from 'nestjs-winston-logger';
import { format, transports } from 'winston';
// Relook at this
export const logger = new NestjsWinstonLoggerService({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    format.json(),
    format.colorize({ all: true }),
    format.printf((info) => `${info.level}: ${info.message}`),
  ),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
    new transports.Console(),
  ],
});

configMorgan.appendMorganToken('reqId', TOKEN_TYPE.Request, 'reqId');
