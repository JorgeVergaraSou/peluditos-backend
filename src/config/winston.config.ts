import * as winston from 'winston';
import * as moment from 'moment-timezone';

const timezoned = () => moment().tz('America/Argentina/Buenos_Aires').format('DD-MM-YYYY HH:mm:ss');

export const winstonConfig = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),         // Colorea la salida en la consola
        winston.format.timestamp({
          format: timezoned,
        }),         // Añade timestamp a cada log
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${level}: ${message}`;
        })
      ),
    }),

new winston.transports.File({
  filename: 'logs/error.log',
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp({ format: timezoned }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message}`;
    })
  ),
}),
/*
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp({
          format: timezoned,
        }),
        winston.format.json()
      ),
    }),*/
  ],

};
