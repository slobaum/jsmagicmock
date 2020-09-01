function type(type, entity) { return typeof entity === type; };
var isUndefined = type.bind(null, 'undefined');
var isObject = type.bind(null, 'object');
var isFunction = type.bind(null, 'function');

export function MagicMock(prototype) {
    var deletedProps = {};
    var calls = [];

    prototype = isUndefined(prototype)
        ? function() {}
        : prototype;

    if (typeof prototype === 'object') {
        // this converts the object into a callable with all the same properties
        prototype = Object.keys(prototype).reduce(
            (acc, current) => {
                acc[current] = isObject(acc[current]) || isFunction(acc[current])
                    ? MagicMock(acc[current])
                    : acc[current];

                return acc;
            },
            function() {}
        )
    }

    function ensureKey(obj, key) {
        if (!obj[key] && !deletedProps[key])
            obj[key] = MagicMock();

        return obj[key];
    }

    return new Proxy(prototype, {
        get: function(obj, key) {
            if (key === '__mock') {
                // mock API
                return {
                    calls: calls,
                    called: !!calls.length,
                    call: function(index) {
                        return calls[index];
                    }
                };
            }

            return ensureKey(obj, key);
        },
        has: ensureKey,
        set: function(obj, key, value) {
            if (deletedProps[key])
                delete deletedProps[key];

            return obj[key] = isObject(value) || isFunction(value)
                ? MagicMock(value)
                : value;
        },
        apply: function(func, scope, args) {
            calls.push({
                scope: scope,
                arguments: args,
            });

            return func.apply(scope, args);
        },
        deleteProperty: function(obj, key) {
            deletedProps[key] = true;
            delete obj[key];
        }
    });
};
