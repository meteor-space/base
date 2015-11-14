var getenv = Npm.require('getenv');

// Wrapper
Space.getenv = getenv;

Space.configuration = Space.getenv.multi({
  log:{
    enabled: ['SPACE_LOG_ENABLED', false, 'bool']
  }
});
