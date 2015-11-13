winston = Npm.require('winston');

Space.log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
  ]
});
