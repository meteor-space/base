# space:base [![Build Status](https://travis-ci.org/CodeAdventure/meteor-space.svg?branch=master)](https://travis-ci.org/CodeAdventure/meteor-space)

*Space* is a simple but modular application architecture for Meteor.

It allows you to create applications that are based on
small encapsulated modules which follow these rules:

1. Explicit dependencies
2. Highly configurable
3. Easy to test

## Explicit dependencies
Modules declare which other modules they require and what runtime
dependencies they have, by putting the special properties
`RequiredModules` and `Dependencies` on their prototypes:

```JavaScript
Space.Module.extend(function() {

  /* Note: We use a static constructor here,
     <this> refers to the extending class and
     this function is only run once when while
     creating the class */

  // Statically register this module in the Space environment
  this.publish(this, 'MyModule');

  // Prototype of the module:
  return {

    // Declare which other Space modules are require
    RequiredModules: [
      'OtherModule',
      'YetAnotherModule'
    ],

    // Declare injected runtime dependencies
    Dependencies: {
      someService: 'OtherModule.SomeService',
      anotherService: 'YetAnotherModule.AnotherService'
    },

    // This method is called by the Space framework after all
    // required modules are initialized and the dependencies
    // are resolved and injected into the instance of this module.
    configure: function() {

      // Add mappings to the shared dependency injection system
      this.injector.map('MyModule.TestValue').to('test');

      // Use required dependencies
      this.someService.doSomeMagic()
      this.anotherService.beAwesome()
    }
  };
```

## Creating Applications based on Modules
Here is an example using CoffeeScript:

```CoffeeScript
class MyApplication extends Space.Application

  RequiredModules: ['MyModule']

  Dependencies:
    testValue: 'MyModule.TestValue'

  # this is called when all required modules are initialized and configured.
  configure: -> console.log @testValue # logs 'test' (see module above)
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
    expect(@meteor).to.equal Meteor
    expect(@tracker).to.equal Tracker
    expect(@ejson).to.equal EJSON
    expect(@ddp).to.equal DDP
    expect(@accounts).to.equal Package['accounts-base'].Accounts
    expect(@random).to.equal Random
    expect(@underscore).to.equal _
    expect(@reactiveVar).to.be.instanceof Package['reactive-var'].ReactiveVar
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
    expect(@templates).to.equal Template
    expect(@session).to.equal Session
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
    expect(@email).to.equal Package['email'].Email
    expect(@process).to.equal process
    expect(@Future).to.equal Npm.require 'fibers/future'
```

## Further Examples
You can look at the tests of this package to see all features that the
Space architecture provides for you.

## Install
`meteor add space:base`

## Run the tests
`mrt test-packages ./`

## Release History
* 1.2.1 - Completes old injector API compability and fixes some bugs (see [full changelog](https://github.com/CodeAdventure/meteor-space/blob/master/CHANGELOG.md#121))
* 1.2.0 - Added space class system and space injector (see [full changelog](https://github.com/CodeAdventure/meteor-space/blob/master/CHANGELOG.md#120))
* 1.1.0 - Added mappings to core Meteor packages
* 1.0.0 - Publish first version to Meteor package system
* 0.1.0 - Initial release of Space

## License
Copyright (c) 2014 Code Adventure
Licensed under the MIT license.
