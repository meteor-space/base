
if (Meteor.isServer) {

  let getenv = Npm.require('getenv');
  // Wrapper
  Space.getenv = getenv;

  Space.configuration = Space.getenv.multi({
    log: {
      enabled: ['SPACE_LOG_ENABLED', false, 'bool'],
      minLevel: ['SPACE_LOG_MIN_LEVEL', 'info', 'string']
    }
  });

  // Pass down to the client
  Meteor.settings = {
    "public": {
      log: {
        enabled: Space.configuration.log.enabled,
        minLevel: Space.configuration.log.minLevel
      }
    }
  };

  __meteor_runtime_config__.PUBLIC_SETTINGS = Meteor.settings.public;

}

if (Meteor.isClient) {

  Space.configuration = {
    log: {
      enabled: Meteor.settings.public.log.enabled,
      minLevel: Meteor.settings.public.log.minLevel
    }
  };
}
