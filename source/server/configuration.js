var getenv = Npm.require('getenv');

// Wrapper
Space.getenv = getenv;

Space.Configuration = Space.getenv.multi({
  log:{
    enabled: ['SPACE_LOG_ENABLED', false, 'bool']
  }
});
