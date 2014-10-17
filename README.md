# Space Application Architecture [![Build Status](https://travis-ci.org/CodeAdventure/meteor-space.svg?branch=master)](https://travis-ci.org/CodeAdventure/meteor-space)

*Space* is a simple but modular application architecture for Meteor.

It allows you to create applications that are based on
small encapsulated modules which follow these rules:

1. No global variables (direct references to other modules) in the code
2. Clear dependencies between modules
3. Reuse as much as possible through other modules

When you build modules with *Space* you always declare other required
modules and the runtime dependencies by putting special properties on
your prototypes:

## Defining Modules
Here is an example using CoffeeScript:

```Coffeescript
class MyModule extends Space.Module

  @publish this, 'MyModule' # publish this module into the Space environment

  # declare which Space modules you require
  RequiredModules: [
    'OtherModule',
    'YetAnotherModule'
  ]

  # declare your injected runtime dependencies
  Dependencies:
    someService: 'OtherModule.SomeService',
    anotherService: 'YetAnotherModule.AnotherService'

  # this method is called by the Space framework after all
  # required modules are initialized and the dependencies
  # are resolved and injected into the instance of this module
  configure: ->

    # add mappings to the global dependency injection system
    @injector.map('MyModule.TestValue').toStaticValue 'test'

    # use required dependencies
    @someService.doSomeMagic()
    @anotherService.beAwesome()
```

## Creating Applications based on Modules
Here is an example using CoffeeScript:

```CoffeeScript
class MyApplication extends Space.Application

  RequiredModules: ['MyModule']

  Dependencies:
    testValue: 'MyModule.TestValue'

  # this is called when all required modules are initialized
  # and configured. Now you can use any dependencies and rule the world.
  configure: -> console.log @testValue
```

## Requiring Meteor Core Packages
Instead of globally accessing Meteor packages in your codebase
you can add them to your module / application dependencies and
have them injected automatically after initialisation.

### Example for packages on server and client

```CoffeeScript
class SharedApp extends Space.Application

  Dependencies:
    meteor: 'Meteor'
    tracker: 'Tracker'
    ejson: 'EJSON'
    ddp: 'DDP'
    accounts: 'Accounts'
    random: 'Random'
    underscore: 'underscore'
    reactiveVar: 'ReactiveVar'
    mongo: 'Mongo'

  configure: ->
    expect(@meteor).to.be.defined
    expect(@meteor).to.equal Meteor

    expect(@tracker).to.be.defined
    expect(@tracker).to.equal Tracker

    expect(@ejson).to.be.defined
    expect(@ejson).to.equal EJSON

    expect(@ddp).to.be.defined
    expect(@ddp).to.equal DDP

    expect(@accounts).to.be.defined
    expect(@accounts).to.equal Package['accounts-base'].Accounts

    expect(@random).to.be.defined
    expect(@random).to.equal Random

    expect(@underscore).to.be.defined
    expect(@underscore).to.equal _

    expect(@reactiveVar).to.be.instanceof Package['reactive-var'].ReactiveVar

    expect(@mongo).to.be.defined
    expect(@mongo).to.equal Mongo
```

### Example for packages on client only

```CoffeeScript
class ClientApp extends Space.Application

  Dependencies:
    templates: 'Template'
    session: 'Session'
    blaze: 'Blaze'

  configure: ->

    expect(@templates).to.be.defined
    expect(@templates).to.equal Template

    expect(@session).to.be.defined
    expect(@session).to.equal Session

    expect(@blaze).to.be.defined
    expect(@blaze).to.equal Blaze
```

### Example for packages on server only

```CoffeeScript
class ServerApp extends Space.Application

  Dependencies:
    email: 'Email'
    process: 'process'
    Future: 'Future'

  configure: ->

    expect(@email).to.be.defined
    expect(@email).to.equal Package['email'].Email

    expect(@process).to.be.defined
    expect(@process).to.equal process

    expect(@Future).to.be.defined
    expect(@Future).to.equal Npm.require 'fibers/future'
```

## Further Examples
You can look at the tests of this package to see all features that the
Space architecture provides for you.

## Dependency Injection
Space uses the *dependance* package for the dependency injection.
For details of how to declare mappings [read the documentation](http://codeadventure.github.io/meteor-dependance)

## Install
`meteor add space:base`

## Run the tests
`mrt test-packages ./`

## Release History
* 1.1.0 - Added mappings to core Meteor packages
* 1.0.0 - Publish first version to Meteor package system
* 0.1.0 - Initial release of Space

## License
Copyright (c) 2014 Code Adventure
Licensed under the MIT license.
