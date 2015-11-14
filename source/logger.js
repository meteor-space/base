if(Meteor.isServer)
  winston = Npm.require('winston');

Space.Logger = Space.Object.extend(Space, 'Logger', {

  _logger: null,

  Constructor: function(){
    if(Meteor.isServer) {
      this._logger = new (winston.Logger)({
        transports: [
          new (winston.transports.Console)()
        ]
      });
    }
    if(Meteor.isClient) {
      this._logger = console
    }
  },

  info: function(message){
    this._logger.info(message)
  },

  warn: function(message){
    this._logger.warn(message)
  },

  error: function(message){
    this._logger.error(message)
  }

});

// Core logging (independent from Application logging)
Space.log = new Space.Logger();
