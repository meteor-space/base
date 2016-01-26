
describe 'Space.resolvePath', ->

  it 'returns a deeply nested object', ->
    expect(Space.resolvePath 'Space.Application').to.equal Space.Application

  it 'throws error if path is empty', ->
    expect(-> Space.resolvePath '').to.throw Error
