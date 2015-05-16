
class Space.Application extends Space.Module

  constructor: (properties) ->

    super properties
    @modules = {}

    @injector ?= new Space.Injector()
    @injector.map('Injector').toStaticValue @injector

    # Map Meteor standard packages

    @injector.map('Meteor').toStaticValue Meteor
    if Package.ejson?
      @injector.map('EJSON').toStaticValue Package.ejson.EJSON
    if Package.ddp?
      @injector.map('DDP').toStaticValue Package.ddp.DDP
    if Package.random?
      @injector.map('Random').toStaticValue Package.random.Random
    @injector.map('underscore').toStaticValue _
    if Package.mongo?
      @injector.map('Mongo').toStaticValue Package.mongo.Mongo

    if Meteor.isClient
      if Package.tracker?
        @injector.map('Tracker').toStaticValue Package.tracker.Tracker
      if Package.templating?
        @injector.map('Template').toStaticValue Package.templating.Template
      if Package.session?
        @injector.map('Session').toStaticValue Package.session.Session
      if Package.blaze?
        @injector.map('Blaze').toStaticValue Package.blaze.Blaze

    if Meteor.isServer
      @injector.map('check').toStaticValue check
      @injector.map('Match').toStaticValue Match
      @injector.map('process').toStaticValue process
      @injector.map('Future').toStaticValue Npm.require 'fibers/future'

    if Package.email?
      @injector.map('Email').toStaticValue Package.email.Email

    if Package['accounts-base']?
      @injector.map('Accounts').toStaticValue Package['accounts-base'].Accounts

    if Package['reactive-var']?
      @injector.map('ReactiveVar').toClass Package['reactive-var'].ReactiveVar

    @initialize()

  initialize: -> super this, @injector

  run: -> @modules[module].start() for module of @modules
