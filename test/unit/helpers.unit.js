import Space from '../../source/space.js';

const global = this;

describe('Space.resolvePath', function() {

  it('returns a deeply nested object', () => {
    expect(Space.resolvePath('Space.Application')).to.equal(Space.Application);
  });

  it('returns the global context if path is empty', () => {
    expect(Space.resolvePath('')).to.equal(global);
  });
});
