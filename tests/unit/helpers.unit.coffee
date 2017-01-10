import Space from '../../source/space.js';

global = this

describe 'Space.resolvePath', ->

  it 'returns a deeply nested object', ->
    expect(Space.resolvePath 'Space.Application').to.equal Space.Application

  it 'returns the global context if path is empty', ->
    expect(Space.resolvePath '').to.equal global
