const chai = require('chai');
const sinonChai = require("sinon-chai");
const spaceTesting = require('space-testing');

global.expect = chai.expect;

chai.use(sinonChai);
chai.use(spaceTesting);

