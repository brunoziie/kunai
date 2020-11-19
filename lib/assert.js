const get = require('lodash.get');
const matches = require('lodash.matches');
const NOT_FOUND = '__undefined__';
const colors = require('colors/safe');

const Assert = function (condition, description, notes) {
    const icon = (condition) ? '✔' : '✖';
    const message = `      ${icon} ${description}`;

    if (condition) {
        console.log(colors.green(message));
    } else {
        let _notes = '';

        if (notes) {
            const arr = (notes instanceof Array) ? notes : [notes];
            _notes = "\n" + arr.map(l => `      |   ${l}`).join('\n') + '\n      └';
        }

        console.log(colors.red(`${message}${_notes}`));
        throw new Error(description);
    }
}

const compare = (expected, current)  => {
    if (typeof expected === 'object' && typeof current === 'object') {
        return matches(expected)(current);
    } else {
        return expected === current;
    }
}

const ts = (obj) => {
    if (obj === null) {
        return 'null';
    }

    if (obj === NOT_FOUND) {
        return 'undefined';
    }

    if (typeof obj === 'number') {
        return obj;
    }

    if (typeof obj === 'string') {
        return `"${obj}"`;
    }

    if (typeof obj === 'object') {
        return JSON.stringify(obj, null, 2).split('\n').map((l, i) => {
            return (i === 0) ? l : `      |   ${l}`;
        }).join('\n');
    }

    return obj;
}

Assert.it = function (context, contextName = '') {
    let ctx = context;
    let ctxName = contextName;

    const renderPath = (path) => {
        return (ctx instanceof Array)
            ? `${ctxName}[${path}]`
            : `${ctxName}.${path}`;
    }

    const rules = {
        __ctx__(context, alias) {
            ctx = context;
            ctxName = (alias) ? alias : contextName;
        },

        object (description) {
            const cond = (ctx !== null && typeof ctx === 'object' && !(ctx instanceof Array));
            Assert(cond, description);
            return this;
        },

        array (description) {
            Assert((ctx instanceof Array), description);
            return this;
        },

        string (description) {
            Assert((typeof ctx === 'string'), description);
            return this;
        },

        null (description) {
            Assert(ctx === null, description);
            return this;
        },

        number (description) {
            Assert((typeof ctx === 'number'), description);
            return this;
        },

        has (path, value, description) {
            const result = get(ctx, path, NOT_FOUND);
            const _path = renderPath(path);

            if (arguments.length === 3) {
                Assert(
                    compare(value, result),
                    description,
                    ['', `expected: ${_path} = ${ts(value)}`, `current:  ${_path} = ${ts(result)}`, '']
                );
            } else if (arguments.length === 2) {
                Assert(
                    result !== NOT_FOUND, 
                    value,
                    ['', `expected: ${_path} = <mixed>`, `current:  ${_path} = ${ts(result)}`, '']
                );
            } else {
                Assert(result !== NOT_FOUND, `has ${path}`);
            } 

            return this;
        },

        equals (compare, description) {
            Assert(ctx === compare, description);
            return this;
        },

        not: {
            __ctx__(context) {
                ctx = context;
            },

            object(description) {
                const cond = !(ctx !== null && typeof ctx === 'object' && !(ctx instanceof Array));
                Assert(cond, description);
                return rules;
            },

            array(description) {
                Assert(!(ctx instanceof Array), description);
                return rules;
            },

            string(description) {
                Assert(!(typeof ctx === 'string'), description);
                return rules;
            },

            null(description) {
                Assert(ctx !== null, description);
                return rules;
            },

            number(description) {
                Assert(!(typeof ctx === 'number'), description);
                return rules;
            },

            has(path, value, description) {
                const result = get(ctx, path, NOT_FOUND);
                const _path = renderPath(path);

                if (arguments.length === 3) {
                    Assert(
                        result === NOT_FOUND || !compare(result, value),
                        description,
                        ['', `expected: ${_path} = ${ts(value)}`, `current:  ${_path} = ${ts(result)}`, '']
                    );
                } else if (arguments.length === 2) {
                    Assert(
                        result === NOT_FOUND, 
                        value, 
                        ['', `expected: ${_path} = undefined`, `current:  ${_path} = ${ts(result)}`, '']
                    );
                } else {
                    Assert(result === NOT_FOUND, `hasn't ${_path}`);
                }

                return this;
            },

            equals(compare, description) {
                Assert(ctx !== compare, description);
                return rules;
            }
        }
    }

    rules.each = function (callback) {
        if (context instanceof Array) {
            for (let i = 0; i < context.length; i++) {
                this.__ctx__(context[i]);
                console.log(`      ${ctxName}[${i}]`);
                callback(this);
                console.log('');
            }
        } else if (typeof context === 'object') {
            for (const key in context) {
                if (context.hasOwnProperty(key)) {
                    this.__ctx__(context[key]);
                    console.log(`      ${ctxName}.${key}`);
                    callback(this);
                    console.log('');
                }
            }
        }

        this.__ctx__(context);
        return this;
    }

    return rules;
}

module.exports = Assert;