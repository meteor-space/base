
Munit.run

  name: 'Space'

  tests: [

    name: 'application loads required module correctly'

    func: (test) ->

      testValue = {}
      testResult = null

      class FirstModule extends Space.Module

        @publish this, 'FirstModule'

        configure: -> @injector.map('testValue').toStaticValue testValue

      class Application extends Space.Application

        RequiredModules: ['FirstModule']

        Dependencies: testValue: 'testValue'

        configure: -> testResult = @testValue

      app = new Application()

      expect(testResult).to.equal testValue

  ]

  tearDown: ->
    # reset published space modules
    Space.Module.published = {}
