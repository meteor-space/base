winston = Npm.require('winston');

Space.logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
  ]
});
