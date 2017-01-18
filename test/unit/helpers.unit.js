import {
  isClass,
  parentClass,
  parentClassPrototype
} from '../../src/helpers.js';
import {expect} from 'chai';

describe(`helpers`, function() {
  class Parent {
    myParentMethod() {}
  }
  class Child extends Parent {
    myChildMethod() {}
  }
  class GrandChild extends Child {
    myGrandChildMethod() {}
  }

  describe(`ES6 class classes`, () => {
    describe(`class evaluation`, () => {
      it(`returns true if its a class`, () => {
        expect(isClass(Parent)).to.be.true;
      });

      it(`returns false if its not class`, () => {
        expect(isClass({})).to.be.false;
        expect(isClass(1234)).to.be.false;
        const fn = function() {return null;}
        expect(isClass(fn)).to.be.false;
        expect(isClass(new Parent())).to.be.false;
      });
    });

    describe(`parent class`, () => {
      it(`returns parent class from child class`, () => {
        expect(parentClass(Child)).to.be.equal(Parent);
      });

      it(`returns child class from grand child class`, () => {
        expect(parentClass(GrandChild)).to.be.equal(Child);
      });

      it(`ensures that parent class is not returned from grand child`, () => {
        expect(parentClass(GrandChild)).to.be.not.equal(Parent);
      });

      it(`returns parent class from child instance`, () => {
        expect(parentClass(new Child())).to.be.equal(Parent);
      });

      it(`returns child class from grand child instance`, () => {
        expect(parentClass(new GrandChild())).to.be.equal(Child);
      });

      it(`ensures that parent class is not returned from grand child instance`, () => {
        expect(parentClass(new GrandChild())).to.be.not.equal(Parent);
      });

      it(`returns null if parent class is last on inharitance chain`, () => {
        expect(parentClass(Parent)).to.be.equal(null);
      });
    });

    describe(`parent class prototype`, () => {
      it(`returns parent class prototype from child class`, () => {
        expect(parentClassPrototype(Child)).to.be.equal(Parent.prototype);
      });

      it(`returns child class prototype from grand child class`, () => {
        expect(parentClassPrototype(GrandChild)).to.be.equal(Child.prototype);
      });

      it(`ensures that parent class prototype is not returned from grand child`, () => {
        expect(parentClassPrototype(GrandChild)).to.be.not.equal(Parent.prototype);
      });

      it(`returns parent class prototype from child instance`, () => {
        expect(parentClassPrototype(new Child())).to.be.equal(Parent.prototype);
      });

      it(`returns child class prototype from grand child instance`, () => {
        expect(parentClassPrototype(new GrandChild())).to.be.equal(Child.prototype);
      });

      it(`ensures that parent class prototype is not returned from grand child instance`, () => {
        expect(parentClassPrototype(new GrandChild())).to.be.not.equal(Parent.prototype);
      });

      it(`returns null if parent class is last on inharitance chain`, () => {
        expect(parentClassPrototype(Parent)).to.be.equal(null);
      });
    });
  });
});
