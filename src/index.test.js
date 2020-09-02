const MagicMock = require('./index');

describe('MagicMock suite', () => {

    it('should instantiate', () => {
        expect(() => MagicMock()).not.toThrow();
    });

    it('should return an entity for any arbitrary named key', () => {
        const mock = MagicMock();

        expect(mock.whatever).not.toBeUndefined();
    });

    it('should accept object properties via the constructor', () => {
        const mock = MagicMock({
            something: 'yep'
        });

        expect(mock.something).toBe('yep');
    });

    it('should accept deeply nested objects via the constructor', () => {
        const mock = MagicMock({
            something: {
                somethingElse: {
                    onceMore: 'blarg'
                }
            }
        });

        expect(mock.something.somethingElse.onceMore).toBe('blarg');
    });

    it('should allow assignment of arbitrarily named/dynamic keys', () => {
        const mock = MagicMock();

        mock.something.what.yes.i.made.all.this.up = 'something';

        expect(mock.something.what.yes.i.made.all.this.up).toBe('something');
    });

    it('should allow invocation of arbitrarily assigned keys', () => {
        const mock = MagicMock();

        expect(() => {
            mock.something.what.yes.i.made.all.this.up();
            mock.__blarg_.yes.sure.whynot();
        }).not.toThrow();
    });

    // it('should correctly implement toString', () => {
    //     const literal = {something: 'what'};
    //     const mock = MagicMock(literal);

    //     expect(mock.toString()).toEqual(literal.toString());
    // });

    describe('mock API', () => {

        describe('with no calls', () => {

            it('should have an empty calls array', () => {
                const mock = MagicMock();
    
                expect(mock.__mock.calls).toEqual([]);
            });

            it('should have a a property `called` that is false', () => {
                const mock = MagicMock();
    
                expect(mock.__mock.called).toBe(false);
            });

        });

        describe('with calls', () => {

            it('number of entry in calls should match number of function calls', () => {
                const mock = MagicMock();

                mock();
                mock();
                mock();

                expect(mock.__mock.calls.length).toBe(3);
            });

        });

    });

});