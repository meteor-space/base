
class Space.Application extends Space.Module

  constructor: (properties) ->
    super properties
    @modules = {}

    @injector ?= new Dependance.Injector()
    @injector.map('Space.Application.Injector').toStaticValue @injector

    # Map Meteor standard packages

    @injector.map('Meteor').toStaticValue Meteor
    @injector.map('EJSON').toStaticValue EJSON
    @injector.map('DDP').toStaticValue DDP
    @injector.map('Random').toStaticValue Random
    @injector.map('underscore').toStaticValue _
    @injector.map('Mongo').toStaticValue Mongo

    if Meteor.isClient
      @injector.map('Tracker').toStaticValue Tracker
      @injector.map('Template').toStaticValue Template
      @injector.map('Session').toStaticValue Session
      @injector.map('Blaze').toStaticValue Blaze

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

  initialize: -> super(@injector, @modules)

  run: -> @modules[module].run() for module of @modules
