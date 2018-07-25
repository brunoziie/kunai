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
            _notes = "\n" + arr.map(l => `      |   ${l}`).join('\n');
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
        return JSON.stringify(obj);
    }

    return obj;
}

Assert.it = function (ctx) {
    const rules = {
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

            if (arguments.length === 3) {
                Assert(
                    compare(value, result),
                    description,
                    ['', `expected: ${path} = ${ts(value)}`, `current:  ${path} = ${ts(result)}`, '']
                );
            } else if (arguments.length === 2) {
                Assert(result !== NOT_FOUND, value, `${path} = ${ts(result)}`);
            } else {
                throw new Error(`Method "has" must to have 2 or 3 arguments. ${arguments.length} given.`);
            } 

            return this;
        },

        equals (compare, description) {
            Assert(ctx === compare, description);
            return this;
        },

        not: {
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

                if (arguments.length === 3) {
                    Assert(
                        result === NOT_FOUND || !compare(result, value),
                        description,
                        [`expected: ${path} = ${ts(value)}`, `current:  ${path} = ${ts(result)}`]
                    );
                } else if (arguments.length === 2) {
                    Assert(result === NOT_FOUND, value, `${path} = ${ts(result)}`);
                } else {
                    throw new Error(`Method "has" must to have 2 or 3 arguments. ${arguments.length} given.`);
                }

                return this;
            },

            equals(compare, description) {
                Assert(ctx !== compare, description);
                return rules;
            }
        }
    }

    return rules;
}



module.exports = Assert;