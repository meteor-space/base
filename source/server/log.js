winston = Npm.require('winston');

//Space.Object.extend(Space, 'Logger', {
//
//  _logger: null,
//
//  Constructor: function(){
//    this._logger = new (winston.Logger)({
//      transports: [
//        new (winston.transports.Console)()
//      ]
//    });
//  },
//
//  info: function(){
//    this._logger.info();
//  },
//
//  warn: function(){
//    this._logger.warn();
//  },
//
//  error: function(){
//    this._logger.error();
//  }
//
//});

Space.log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)()
  ]
});
