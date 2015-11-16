
if (Meteor.isServer) {

  let getenv = Npm.require('getenv');
  // Wrapper
  Space.getenv = getenv;

  Space.configuration = Space.getenv.multi({
    sysLog: {
      enabled: ['SPACE_SYSLOG_ENABLED', false, 'bool']
    },
    appLog: {
      enabled: ['SPACE_APPLOG_ENABLED', false, 'bool']
    }
  });

  // Pass down the
  Meteor.settings = {
    "public": {
      sysLog: {
        enabled: Space.configuration.sysLog.enabled
      },
      appLog: {
        enabled: Space.configuration.appLog.enabled
      }
    }
  };

  __meteor_runtime_config__.PUBLIC_SETTINGS = Meteor.settings.public;

}

if (Meteor.isClient) {

  Space.configuration = {
    sysLog: {
      enabled: Meteor.settings.public.sysLog.enabled
    },
    appLog: {
      enabled: Meteor.settings.public.appLog.enabled
    }
  };
}
