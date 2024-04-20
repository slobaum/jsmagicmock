(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.MagicMock = factory();
    }
}(this, function () {
    function type(type, entity) { return typeof entity === type; };
    var isUndefined = type.bind(null, 'undefined');
    var isObject = type.bind(null, 'object');
    var isFunction = type.bind(null, 'function');
    var unsetReturnValueSymbol = Symbol('unsetReturnValue');

    return function MagicMock(mocked, options) {
        var deletedProps = new Set();
        var calls = [];
        var returnValue = unsetReturnValueSymbol;
        var metaKey = (options || {}).metaKey || 'mock';

        mocked = isUndefined(mocked)
            ? function() {}
            : mocked;

        if (isObject(mocked)) {
            // this converts the object into a callable with all the same properties
            mocked = Object.keys(mocked).reduce(
                function (acc, key) {
                    acc[key] = isObject(mocked[key]) || isFunction(mocked[key])
                        ? MagicMock(mocked[key], options)
                        : mocked[key];

                    return acc;
                },
                function() {}
            );
        }

        function ensureKey(obj, key) {
            if (!obj[key] && !deletedProps.has(key))
                obj[key] = MagicMock(undefined, options);

            return obj[key];
        }

        return new Proxy(mocked, {
            has: ensureKey,
            get: function(obj, key) {
                if (key === metaKey) {
                    // mock API
                    return {
                        calls: calls,
                        called: !!calls.length,
                        returnValue: function(value) {
                            return returnValue = value;
                        }
                    };
                }

                return ensureKey(obj, key);
            },
            set: function(obj, key, value) {
                if (deletedProps.has(key))
                    deletedProps.delete(key);

                return obj[key] = (
                    isObject(value) || isFunction(value)
                        ? MagicMock(value, options)
                        : value
                );
            },
            apply: function(func, scope, args) {
                calls.push({
                    scope: scope,
                    arguments: args,
                });

                if (returnValue !== unsetReturnValueSymbol)
                    return returnValue;

                return func.apply(scope, args);
            },
            deleteProperty: function(obj, key) {
                deletedProps.add(key);
                delete obj[key];
            }
        });
    };

}));
