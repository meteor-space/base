
class Space.Application extends Space.Module

  constructor: (properties) ->

    super properties
    @modules = {}

    @injector ?= new Space.Injector()
    @injector.map('Injector').to @injector

    # Map Meteor standard packages
    if Package.ejson?
      @injector.map('EJSON').to Package.ejson.EJSON
    if Package.ddp?
      @injector.map('DDP').to Package.ddp.DDP
    if Package.random?
      @injector.map('Random').to Package.random.Random
    @injector.map('underscore').to _
    if Package.mongo?
      @injector.map('Mongo').to Package.mongo.Mongo

    if Meteor.isClient
      if Package.tracker?
        @injector.map('Tracker').to Package.tracker.Tracker
      if Package.templating?
        @injector.map('Template').to Package.templating.Template
      if Package.session?
        @injector.map('Session').to Package.session.Session
      if Package.blaze?
        @injector.map('Blaze').to Package.blaze.Blaze

    if Meteor.isServer
      @injector.map('check').to check
      @injector.map('Match').to Match
      @injector.map('process').to process
      @injector.map('Future').to Npm.require 'fibers/future'

      if Package.email?
        @injector.map('Email').to Package.email.Email

    if Package['accounts-base']?
      @injector.map('Accounts').to Package['accounts-base'].Accounts

    if Package['reactive-var']?
      @injector.map('ReactiveVar').toInstancesOf Package['reactive-var'].ReactiveVar

    @initialize()

  initialize: -> super this, @injector

  @define: (appName, prototype) ->
    prototype.toString = -> appName # For better debugging
    return @extend prototype
