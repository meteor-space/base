
if (Meteor.isServer) {

  let getenv = Npm.require('getenv');
  // Wrapper
  Space.getenv = getenv;
}
