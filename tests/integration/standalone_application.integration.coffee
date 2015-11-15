
describe 'Meteor integration in applications', ->

  it 'maps Meteor core packages into the Space environment', ->

    class SharedApp extends Space.Application

      dependencies:
        meteor: 'Meteor'
        ejson: 'EJSON'
        ddp: 'DDP'
        accounts: 'Accounts'
        random: 'Random'
        underscore: 'underscore'
        reactiveVar: 'ReactiveVar'
        mongo: 'Mongo'

      onInitialize: ->
        expect(@meteor).to.be.defined
        expect(@meteor).to.equal Meteor

        expect(@ejson).to.be.defined
        expect(@ejson).to.equal EJSON

        expect(@ddp).to.be.defined
        expect(@ddp).to.equal DDP

        expect(@accounts).to.be.defined
        expect(@accounts).to.equal Package['accounts-base'].Accounts

        expect(@random).to.be.defined
        expect(@random).to.equal Random

        expect(@underscore).to.be.defined
        expect(@underscore).to.equal Package.underscore._

        expect(@reactiveVar).to.equal Package['reactive-var'].ReactiveVar

        expect(@mongo).to.be.defined
        expect(@mongo).to.equal Mongo

      new SharedApp()

    # CLIENT ONLY

    if Meteor.isClient

      class ClientApp extends Space.Application

        dependencies:
          tracker: 'Tracker'
          templates: 'Template'
          session: 'Session'
          blaze: 'Blaze'

        onInitialize: ->

          expect(@tracker).to.be.defined
          expect(@tracker).to.equal Tracker

          expect(@templates).to.be.defined
          expect(@templates).to.equal Template

          expect(@session).to.be.defined
          expect(@session).to.equal Session

          expect(@blaze).to.be.defined
          expect(@blaze).to.equal Blaze

      new ClientApp()

    # SERVER ONLY

    if Meteor.isServer

      class ServerApp extends Space.Application

        dependencies:
          email: 'Email'
          process: 'process'
          Future: 'Future'
          mongoInternals: 'MongoInternals'

        onInitialize: ->
          expect(@email).to.be.defined
          expect(@email).to.equal Package['email'].Email
          expect(@process).to.be.defined
          expect(@process).to.equal process
          expect(@Future).to.be.defined
          expect(@Future).to.equal Npm.require 'fibers/future'
          expect(@mongoInternals).to.be.defined
          expect(@mongoInternals).to.equal MongoInternals

      new ServerApp()

  it 'boots core Space Services', ->

    class SharedApp extends Space.Application

      Dependencies:
        log: 'log'

      onInitialize: ->
        expect(@log).to.be.defined
        expect(@log).to.be.instanceOf Space.Logger

      new SharedApp()
