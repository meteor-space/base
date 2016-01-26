class Namespace {
  constructor(path) {
    Namespace._path = path
  }
  getPath() {
    return this._path;
  }
  toString() {
    return Namespace._path;
  }
}
// Define global namespace for the space framework
Space = new Namespace('Space');
Space.Namespace = Namespace;
Space.registry = {};
