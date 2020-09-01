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

    // it('should correctly implement toString', () => {
    //     const literal = {something: 'what'};
    //     const mock = MagicMock(literal);

    //     expect(mock.toString()).toEqual(literal.toString());
    // });
});