
Munit.run

  name: 'Space'

  tests: [

    name: 'maps Meteor core packages into the Space environment'

    func: ->

      # CLIENT AND SERVER

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


      new SharedApp()

      # CLIENT ONLY

      if Meteor.isClient

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


        new ClientApp()

      # SERVER ONLY

      if Meteor.isServer

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


        new ServerApp()

  ]
