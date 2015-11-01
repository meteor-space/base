getenv = Npm.require('getenv')

# Wrapper
Space.getenv = getenv

# process.env API
Space.Configuration = Space.getenv.multi({
  testMode: ['SPACE_TESTMODE', false, 'bool']
  log : {
    enabled: ['SPACE_LOG_ENABLED', false, 'bool']
  }
})

Space.Configuration.log.writeStream = console
