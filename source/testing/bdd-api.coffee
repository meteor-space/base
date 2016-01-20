registeredBddApis = []

Space.Module.registerBddApi = (api) -> registeredBddApis.push api

Space.Module.test = Space.Application.test = (systemUnderTest, app=null) ->
  throw new Error 'Cannot test <undefined>' unless systemUnderTest?
  testApi = null
  isModule = isSubclassOf(this, Space.Module)
  isApplication = isSubclassOf(this, Space.Application)

  # BDD API relies on dependency injection provided by Application
  if !app?
    if isApplication
      app = this
    else
      app = Space.Application.define('TestApp', {
        configuration: { appId: 'testApp' },
        requiredModules: [this.publishedAs]
      })
    appInstance = new app()

  for api in registeredBddApis
    returnValue = api(appInstance, systemUnderTest)
    testApi = returnValue if returnValue?

  if not testApi? then throw new Error "No testing API found for #{systemUnderTest}"
  return testApi
