# JsMagicMock

A JavaScript implementation of Python's MagicMock. No dependencies, no build system, framework agnostic.

## About

Every MagicMock is:

 - Callable
 - Infinitely nestable
 - Indexable
 - Object-like (key-values)
 - configurable

## API

`MagicMock` is, at its core, a factory that returns a callable.

```
test('should instantiate', () => {
    expect(() => MagicMock()).not.toThrow();
});
```

Every `MagicMock` is an object. By default, all keys will return another `MagicMock` (thus, truthy).

```
test('should return an entity for any arbitrary named key', () => {
    const mock = MagicMock();

    expect(mock.whatever).not.toBeUndefined();
});
```

If you want a specific key to contain a specific value, you can define it in the factory call when your mock is constructed.

```
test('should accept object properties via the constructor', () => {
    const mock = MagicMock({
        something: 'yep'
    });

    expect(mock.something).toBe('yep');
});
```

This same principle works for deeply nested objects as well.

```
test('should accept deeply nested objects via the constructor', () => {
    const mock = MagicMock({
        something: {
            somethingElse: {
                onceMore: 'blarg'
            }
        }
    });

    expect(mock.something.somethingElse.onceMore).toBe('blarg');
});
```

Values do not have to be assigned at the factory. They can also be directly assigned at any time. And since every undefined key returns a `MagicMock`, you can keep going. Forever (or until you're out of memory)

```
test('should allow assignment of arbitrarily named/dynamic keys', () => {
    const mock = MagicMock();

    mock.something.what.yes.i.made.all.this.up = 'something';

    expect(mock.something.what.yes.i.made.all.this.up).toBe('something');
});
```

All object keys are also callable. You can treat any arbitrary key as if it were a function.

```
test('should allow invocation of arbitrarily assigned keys', () => {
    const mock = MagicMock();

    expect(() => {
        mock.something.what.yes.i.made.all.this.up();
        mock.__blarg_.yes.sure.whynot();
    }).not.toThrow();
});
```

The `in` keywork functions as you would expect.

```
test('"in" keyword with arbitrary keys', () => {
    const mock = MagicMock();

    expect('something' in mock).toEqual(true);
});
test('"in" keyword with deeply nested arbitrary keys', () => {
    const mock = MagicMock();

    expect('something' in mock.whatever.something.else).toEqual(true);
});
```

All of these arbitrary, magic keys are also numerically indexable like an array. This works on deeply nested keys as well.

```
test('indexed properties', () => {
    const mock = MagicMock(['a', 'b']);

    expect(mock[0]).toEqual('a');
    expect(mock[1]).toEqual('b');
});

test('deeply nested indexed properties', () => {
    const mock = MagicMock({
        something: ['a', 'b']
    });

    expect(mock.something[0]).toEqual('a');
    expect(mock.something[1]).toEqual('b');
});
```

They do not have to be defined as an array beforehand. Numeric keys will magically exist when you reference them.

```
test('can reference indexed properties without defining an array', () => {
    const mock = MagicMock();

    expect(mock.something.else[0]).not.toBeUndefined();
});
```

And just like other keys, they're callable like functions.

```
test('can invoke indexed propertes', () => {
    const mock = MagicMock([]);

    mock[0]('c', 'd');

    expect(mock[0].mock.calls[0].arguments).toEqual(
        ['c', 'd']
    );
});

test('can invoke deeply nested indexed propertes', () => {
    const mock = MagicMock([]);

    mock[0].whatever[2].yes('e', 'f');

    expect(mock[0].whatever[2].yes.mock.calls[0].arguments).toEqual(
        ['e', 'f']
    );
});
```

But what if you need a key to be purposefully absent? Any deleted keys will remain deleted.

```
describe('deleted keys', () => {

    test('purposefully deleted keys should remain deleted', () => {
        const mock = MagicMock();

        delete mock.whatever;

        expect(mock.whatever).toBeUndefined();
    });

    test('purposefully deleted deeply nested keys should remain deleted', () => {
        const mock = MagicMock();

        delete mock.something.i.made.up.whatever;

        expect(mock.something.i.made.up).not.toBeUndefined();
        expect(mock.something.i.made.up.whatever).toBeUndefined();
    });

    test('reassigning deleted keys works as expected', () => {
        const mock = MagicMock();

        delete mock.something.i.made.up;

        expect(mock.something.i.made.up).toBeUndefined();

        mock.something.i.made.up = 'i am back';

        expect(mock.something.i.made.up).toEqual('i am back');
    });
});
```

### Mock API

There is a special meta object that contains an API for each individual mock.

Here you will find a way to set specific return values if you need, as well as meta information about whether the mock has been called.

```
describe('setting return values', () => {

    test('should return value specified via returnValue', () => {
        const mock = MagicMock();

        mock.mock.returnValue('asdf')

        expect(mock()).toEqual('asdf');
    });

    test('should return the exact entity specified via returnValue', () => {
        const mock = MagicMock();
        const testReturnValue = Symbol('test-symbol');

        mock.mock.returnValue(testReturnValue)

        expect(mock()).toEqual(testReturnValue);
    });

    test('deeply nested entities should respect returnValue', () => {
        const mock = MagicMock();

        mock.i.made.this.up.mock.returnValue('asdf')

        expect(mock.i.made.this.up()).toEqual('asdf');
    });
});

describe('with no calls', () => {

    test('should have an empty calls array', () => {
        const mock = MagicMock();

        expect(mock.mock.calls).toEqual([]);
    });

    test('should have a property `called` that is false', () => {
        const mock = MagicMock();

        expect(mock.mock.called).toBe(false);
    });

});

describe('with calls', () => {

    test('number of entry in calls should match number of function calls', () => {
        const mock = MagicMock();

        mock();
        mock();
        mock();

        expect(mock.mock.calls.length).toBe(3);
    });

    test('should have a property `called` that is true', () => {
        const mock = MagicMock();

        mock();

        expect(mock.mock.called).toBe(true);
    });

    test('each call arguments should be available', () => {
        const mock = MagicMock();

        mock.something(1, 'a');
        mock.something(2, 'b');

        expect(mock.something.mock.calls[0].arguments)
            .toEqual([1, 'a']);
        expect(mock.something.mock.calls[1].arguments)
            .toEqual([2, 'b']);
        expect(mock.something.mock.calls[2])
            .toBeUndefined();
    });

    test('calls should remain scoped to their object path', () => {
        const mock = MagicMock();

        mock.something(1, 'a');
        mock.something.else(2, 'b');

        expect(mock.mock.called).toBe(false);
        expect(mock.mock.calls.length).toBe(0);
        expect(mock.something.mock.called).toBe(true);
        expect(mock.something.mock.calls.length).toBe(1);
        expect(mock.something.mock.calls[0].arguments)
            .toEqual([1, 'a']);
        expect(mock.something.else.mock.called).toBe(true);
        expect(mock.something.else.mock.calls.length).toBe(1);
        expect(mock.something.else.mock.calls[0].arguments)
            .toEqual([2, 'b']);
    });
});
```

If you don't like where this key exists, you can name it anything you want by configuring it when your mock is constructed.

```
test('should return value specified via returnValue', () => {
    const mock = MagicMock(undefined, { metaKey: '___meta' });

    mock.___meta.returnValue('asdf')

    expect(mock()).toEqual('asdf');
});
test('deeply nested entities should respect returnValue', () => {
    const mock = MagicMock(undefined, { metaKey: '___meta' });

    mock.i.made.this.up.___meta.returnValue('asdf')

    expect(mock.i.made.this.up()).toEqual('asdf');
});
test('should have an empty calls array', () => {
    const mock = MagicMock(undefined, { metaKey: '___meta' });

    expect(mock.___meta.calls).toEqual([]);
});
test('number of entry in calls should match number of function calls', () => {
    const mock = MagicMock(undefined, { metaKey: '___meta' });

    mock();
    mock();
    mock();

    expect(mock.___meta.calls.length).toBe(3);
});
```