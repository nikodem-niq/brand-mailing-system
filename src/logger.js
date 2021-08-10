const winston = require('winston');

const logger = winston.createLogger({
    exitOnError: false,
    transports: [
      new winston.transports.File({ filename: '../output/mailings.log' }),
    ],
});

module.exports = {
    'logger': logger
};