const MagicMock = require('./index');

describe('MagicMock suite', () => {

    test('should instantiate', () => {
        expect(() => MagicMock()).not.toThrow();
    });

    test('should return an entity for any arbitrary named key', () => {
        const mock = MagicMock();

        expect(mock.whatever).not.toBeUndefined();
    });

    test('should accept object properties via the constructor', () => {
        const mock = MagicMock({
            something: 'yep'
        });

        expect(mock.something).toBe('yep');
    });

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

    test('should allow assignment of arbitrarily named/dynamic keys', () => {
        const mock = MagicMock();

        mock.something.what.yes.i.made.all.this.up = 'something';

        expect(mock.something.what.yes.i.made.all.this.up).toBe('something');
    });

    test('should allow invocation of arbitrarily assigned keys', () => {
        const mock = MagicMock();

        expect(() => {
            mock.something.what.yes.i.made.all.this.up();
            mock.__blarg_.yes.sure.whynot();
        }).not.toThrow();
    });

    test('"in" keyword with arbitrary keys', () => {
        const mock = MagicMock();

        expect('something' in mock).toEqual(true);
    });

    test('"in" keyword with deeply nested arbitrary keys', () => {
        const mock = MagicMock();

        expect('something' in mock.whatever.something.else).toEqual(true);
    });

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

    test('can reference indexed properties without defining an array', () => {
        const mock = MagicMock();

        expect(mock.something.else[0]).not.toBeUndefined();
    });

    test('can invoke indexed propertes', () => {
        const mock = MagicMock([]);

        mock[0]('c', 'd');

        expect(mock[0].__mock.calls[0].arguments).toEqual(
            ['c', 'd']
        );
    });

    test('can invoke deeply nested indexed propertes', () => {
        const mock = MagicMock([]);

        mock[0].whatever[2].yes('e', 'f');

        expect(mock[0].whatever[2].yes.__mock.calls[0].arguments).toEqual(
            ['e', 'f']
        );
    });

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

    describe('mock API', () => {

        describe('setting return values', () => {

            test('should return value specified via returnValue', () => {
                const mock = MagicMock();

                mock.__mock.returnValue('asdf')
    
                expect(mock()).toEqual('asdf');
            });

            test('should return the exact entity specified via returnValue', () => {
                const mock = MagicMock();
                const testReturnValue = Symbol('test-symbol');

                mock.__mock.returnValue(testReturnValue)
    
                expect(mock()).toEqual(testReturnValue);
            });

            test('deeply nested entities should respect returnValue', () => {
                const mock = MagicMock();

                mock.i.made.this.up.__mock.returnValue('asdf')
    
                expect(mock.i.made.this.up()).toEqual('asdf');
            });
        });

        describe('with no calls', () => {

            test('should have an empty calls array', () => {
                const mock = MagicMock();
    
                expect(mock.__mock.calls).toEqual([]);
            });

            test('should have a property `called` that is false', () => {
                const mock = MagicMock();
    
                expect(mock.__mock.called).toBe(false);
            });

        });

        describe('with calls', () => {

            test('number of entry in calls should match number of function calls', () => {
                const mock = MagicMock();

                mock();
                mock();
                mock();

                expect(mock.__mock.calls.length).toBe(3);
            });

            test('should have a property `called` that is true', () => {
                const mock = MagicMock();

                mock();
    
                expect(mock.__mock.called).toBe(true);
            });

            test('each call arguments should be available', () => {
                const mock = MagicMock();

                mock.something(1, 'a');
                mock.something(2, 'b');

                expect(mock.something.__mock.calls[0].arguments)
                    .toEqual([1, 'a']);
                expect(mock.something.__mock.calls[1].arguments)
                    .toEqual([2, 'b']);
                expect(mock.something.__mock.calls[2])
                    .toBeUndefined();
            });

            test('calls should remain scoped to their object path', () => {
                const mock = MagicMock();

                mock.something(1, 'a');
                mock.something.else(2, 'b');

                expect(mock.__mock.called).toBe(false);
                expect(mock.__mock.calls.length).toBe(0);
                expect(mock.something.__mock.called).toBe(true);
                expect(mock.something.__mock.calls.length).toBe(1);
                expect(mock.something.__mock.calls[0].arguments)
                    .toEqual([1, 'a']);
                expect(mock.something.else.__mock.called).toBe(true);
                expect(mock.something.else.__mock.calls.length).toBe(1);
                expect(mock.something.else.__mock.calls[0].arguments)
                    .toEqual([2, 'b']);
            });
        });
    });
});
