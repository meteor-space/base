import dependencies from '../../src/decorators/dependencies-decorator.js';
import chai, {expect} from 'chai';
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

describe(`dependencies`, function() {
  describe(`string arguments`, () => {
    @dependencies('MyParentDependency')
    class StringParent {}

    @dependencies('MyParentDependency', 'MyParentDependency2')
    class StringMultiParent {}

    @dependencies('MyChildDependency', 'MyChildDependency2')
    class StringChild extends StringParent {}

    @dependencies('MyGrandChildDependency')
    class StringGrandChild extends StringChild {}

    it(`adds single dependency mapping`, () => {
      expect(new StringParent().dependencies).to.be.eql({
        MyParentDependency: 'MyParentDependency'
      });
    });

    it(`adds multiple dependency mappings`, () => {
      expect(new StringMultiParent().dependencies).to.be.eql({
        MyParentDependency: 'MyParentDependency',
        MyParentDependency2: 'MyParentDependency2'
      });
    });

    it(`ensures that dependency mappings from parent class are preserved on
    parent-child inharitance`, () => {
      expect(new StringChild().dependencies).to.be.eql({
        MyChildDependency: 'MyChildDependency',
        MyChildDependency2: 'MyChildDependency2'
      });
    });

    it(`ensures that dependency mappings from parent and child class are preserved
    on parent-child-grandchild inharitance`, () => {
      expect(new StringGrandChild().dependencies).to.be.eql({
        MyGrandChildDependency: 'MyGrandChildDependency'
      });
    });
  });

  describe(`array arguments`, () => {
    @dependencies(['MyParentDependency'])
    class ArrayParent {}

    @dependencies(['MyParentDependency', 'MyParentDependency2'])
    class ArrayMultiParent {}

    @dependencies(['MyChildDependency', 'MyChildDependency2'])
    class ArrayChild extends ArrayParent {}

    @dependencies(['MyGrandChildDependency'])
    class ArrayGrandChild extends ArrayChild {}

    it(`adds a single dependency mapping`, () => {
      expect(new ArrayParent().dependencies).to.be.eql({
        MyParentDependency: 'MyParentDependency'
      });
    });

    it(`adds multiple dependency mappings`, () => {
      expect(new ArrayMultiParent().dependencies).to.be.eql({
        MyParentDependency: 'MyParentDependency',
        MyParentDependency2: 'MyParentDependency2'
      });
    });

    it(`ensures that dependency mappings from parent class are preserved on
    parent-child inharitance`, () => {
      expect(new ArrayChild().dependencies).to.be.eql({
        MyChildDependency: 'MyChildDependency',
        MyChildDependency2: 'MyChildDependency2'
      });
    });

    it(`ensures that dependency mappings from parent and child class are preserved
    on parent-child-grandchild inharitance`, () => {
      expect(new ArrayGrandChild().dependencies).to.be.eql({
        MyGrandChildDependency: 'MyGrandChildDependency'
      });
    });
  });

  describe(`object arguments`, () => {
    @dependencies({'MyParentDependency': 'MyParentDependency'})
    class ObjectParent {}

    @dependencies({
      'MyParentDependency': 'MyParentDependency',
      'MyParentDependency2': 'MyParentDependency2'
    })
    class ObjectMultiParent {}

    @dependencies({
      'MyChildDependency': 'MyChildDependency',
      'MyChildDependency2': 'MyChildDependency2'
    })
    class ObjectChild extends ObjectParent {}

    @dependencies({
      'MyParentDependency': 'MyGrandChildDependency',
      'MyGrandChildDependency': 'MyGrandChildDependency'
    })
    class ObjectGrandChild extends ObjectChild {}

    it(`adds a single dependency mapping`, () => {
      expect(new ObjectParent().dependencies).to.be.eql({
        MyParentDependency: 'MyParentDependency'
      });
    });

    it(`adds multiple dependency mappings`, () => {
      expect(new ObjectMultiParent().dependencies).to.be.eql({
        MyParentDependency: 'MyParentDependency',
        MyParentDependency2: 'MyParentDependency2'
      });
    });

    it(`ensures that dependency mappings from parent class are preserved on
    parent-child inharitance`, () => {
      expect(new ObjectChild().dependencies).to.be.eql({
        MyChildDependency: 'MyChildDependency',
        MyChildDependency2: 'MyChildDependency2'
      });
    });

    it(`ensures that dependency mappings from parent and child class are preserved
    on parent-child-grandchild inharitance and mappings can be overriden`, () => {
      expect(new ObjectGrandChild().dependencies).to.be.eql({
        MyParentDependency: 'MyGrandChildDependency',
        MyGrandChildDependency: 'MyGrandChildDependency'
      });
    });
  });

  describe(`class or object arguments`, () => {
    const name = 'My.Namespaced.Class';
    class MyClass {
      static toString() {return name;}
    }

    @dependencies('MyParentDependency', MyClass)
    class ClassStringParent {}

    @dependencies(['MyParentDependency', MyClass])
    class ClassArrayParent {}

    @dependencies({
      'MyParentDependency': 'MyParentDependency',
      'MyParentDependency2': MyClass
    })
    class ClassObjectParent {}

    it(`converts MyClass to string mapping on multiple string arguments`, () => {
      expect(new ClassStringParent().dependencies).to.be.eql({
        MyParentDependency: 'MyParentDependency',
        [name]: name
      });
    });

    it(`converts MyClass to string mapping on array`, () => {
      expect(new ClassArrayParent().dependencies).to.be.eql({
        MyParentDependency: 'MyParentDependency',
        [name]: name
      });
    });

    it(`converts MyClass to string mapping on object`, () => {
      expect(new ClassObjectParent().dependencies).to.be.eql({
        MyParentDependency: 'MyParentDependency',
        MyParentDependency2: name
      });
    });
  });

  describe(`mixed arguments`, () => {
    const name = 'My.Namespaced.Class';

    class MyClass {
      static toString() {return name;}
    }

    @dependencies(
      'MyStringDependency',
      ['MyArrayDependency'],
      {MyObjectDependency: 'MyObjectDependency'},
      MyClass
    )
    class Mixed {}

    it(`allows to mix arguments together`, () => {
      expect(new Mixed().dependencies).to.be.eql({
        MyStringDependency: 'MyStringDependency',
        MyArrayDependency: 'MyArrayDependency',
        MyObjectDependency: 'MyObjectDependency',
        [name]: name
      });
    });
  });
});
