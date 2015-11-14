if(Meteor.isServer)
  winston = Npm.require('winston');

Space.Logger = Space.Object.extend(Space, 'Logger', {

  _logger: null,
  _state: 'stopped',

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

  start: function(){
    if(this._state == 'stopped') {
      this._state = 'running'
    }
  },

  stop: function(){
    if(this._state == 'running') {
      this._state = 'stopped'
    }
  },

  info: function(message){
    if(this.shouldLog())
      this._logger.info(message)
  },

  warn: function(message){
    if(this.shouldLog())
      this._logger.warn(message)
  },

  error: function(message){
    if(this.shouldLog())
      this._logger.error(message)
  },

  shouldLog: function () {
    if(this._state == 'running') return true
  }

});

// System log
Space.log = new Space.Logger();

if(Space.configuration.sysLog.enabled)
  Space.log.start()
