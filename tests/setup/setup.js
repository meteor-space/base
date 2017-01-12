import chai from 'chai';
import sinonChai from 'sinon-chai';
import spaceTesting from 'space-testing';

before(function() {
  chai.use(sinonChai);
  chai.use(spaceTesting);
});
