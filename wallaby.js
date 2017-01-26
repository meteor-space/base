const assign = require('lodash/assign');
const fs = require('fs');

let babelrc = null;
let babelrcFile = null;
try {
  babelrcFile = fs.readFileSync('.babelrc', 'utf8');
} catch (e) {
  console.warn(
    `Babel configuration file '.babelrc' was not found in root directory`
  );
}
if (babelrcFile !== null) {babelrc = JSON.parse(babelrcFile);}

module.exports = function(wallaby) {
  let babelConfig = {babel: require('babel-core')};
  if (babelrc) {
    babelConfig = assign(babelConfig, babelrc);
  }
  const babelCompiler = wallaby.compilers.babel(babelConfig);
  return {
    files: [
      {pattern: 'src/**/*.js'}
    ],
    tests: [
      {pattern: 'test/**/*.js'}
    ],
    compilers: {
      '**/*.js': babelCompiler
    },
    testFramework: 'mocha',
    env: {
      type: 'node',
      runner: 'node',
      params: {
        env: 'NODE_ENV=test'
      }
    },
    delays: {
      run: 1000
    }
  };
};
