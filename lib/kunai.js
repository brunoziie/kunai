const Request = require('./request.js');
const RequestOptions = require('./request-options.js');
const merge = require('./utils/merge');
const PromiseSeq = require('./utils/promise-seq.js');
const colors = require('colors/safe');
const fs = require('fs');
const path = require('path');
const assert = require('./assert.js');
const parser = require('./parser.js');
const faker = require('./faker.js');
const getBlocks = parser.getBlocks;
const compile = parser.compile;

const readSpecFile = () => {
    const argfile = process.argv[2];
    let file = null;

    if (argfile) {
        if (argfile.match(/.*\.kunai/)) {
            file = path.join(process.cwd(), argfile);

            if (!fs.existsSync(file)) {
                throw new Error(`File "${argfile}" not found.`);
            }
        } else {
            throw new Error(`The "${argfile}" is not valid kunai file.`);
        }
    }

    if (!file) {
        // For compatibility
        const specFile = path.join(process.cwd(), 'spec.kunai');

        if (fs.existsSync(specFile)) {
            file = specFile;
        } else {
            file = path.join(process.cwd(), 'test.kunai');
        }
    }

    if (!fs.existsSync(file)) {
        throw new Error(`File "${file.replace(process.cwd() + '/', '')}" not found.`);
    }

    const content = fs.readFileSync(file).toString();

    console.log(colors.green.bold(
        `\n    Using: ${file.replace(process.cwd() + '/', '')}`
    ));

    return content;
}

const separateBlocks = (lines) => {
    return lines.replace(/([^\(])@/g, '$1\n@').split(/\n/);
}

const joinBlocks = (lines) => {
    return lines.map(l => {
        return (typeof l === 'string') ? l : `${l.signature}${joinBlocks(l.content)}`;
    }).join('');
}

const Kunai = function () {
    this._env = {};
    this._queue = [];
}

const _parseAssignment = (lines) => {
    const assignments = lines.map((assignment) => {
        const matches = assignment.match(/^([a-zA-Z0-9_\-\.\[\]]*):\s*(.*)/);

        if (!matches) {
            throw new Error(`Invalid assignment "${assignment}"`);
        }

        const [m, key, value] = matches;

        const _key = key.replace(/\./g, '\'][\'').trim();

        const _value = value
            .replace('@inputs.', 'kunai.env().inputs.')
            .replace('@qs.', 'kunai.env().queryString.')
            .replace('@file(', 'kunai.file(')
            .replace('@headers.', 'kunai.env().headers.')
            .replace('@env.', 'kunai.env().')
            .replace('@faker.', 'kunai.faker().');

        return `$$['${_key}'] = ${_value}`;
    });

    assignments.push('return $$;');

    return assignments;
}

Kunai.assignment = function (lines) {
    const assignments = _parseAssignment(lines);
    return `($$ => { ${assignments.join('; ')} })({})`;
}

Kunai.lazyAssignment = function (lines) {
    const assignments = _parseAssignment(lines);
    return `() => { var $$ = {}; ${assignments.join('; ')} }`;
}

Kunai.callback = function (lines, args) {
    const _lines = separateBlocks(joinBlocks(lines));

    const _value = _lines.map(line => {
        return line.trim()
            .replace(/\)\s+./g, ').')
            .replace(/('[^']*')/g, ($_, $1) => {
                return $1.replace(/\{\{([^\}]*)}}/g, "'+$1+'")
            })
            .replace(/@write\.([^\(]*)\((.*)/g, 'kunai.write(\'$1\', $2')
            .replace(/@write\(/g, 'kunai.write(null,')
            .replace('@assert(', 'kunai.assert(')
            .replace('@assert.', 'kunai.assert.')
            .replace(/@it\(([^\)]*)\)/, 'kunai.assert.it($1, "$1")')
            .replace('@env.', 'kunai.env().')
            .replace('@debug()', 'kunai.log(kunai.env())')
            .replace(/@log\(/g, 'kunai.log(')
            .replace('each({', 'each((__item__) => {')
            .replace('@item.', '__item__.')
            .replace(/@(if|unless)\(([^)]+)\)(.*)/g, 'kunai.condition("$1", ($2))$3')
            .replace(/\.(then|else)\(/g, '.$1(() => ');
    })

    const _outValue = _value.reduce((acc, cur) => {
        return (acc.length && !acc[acc.length - 1].match(/[\-\+\*\/\.\!\=\<\>\{\(]/))
            ? `${acc}; ${cur}`
            : `${acc} ${cur}`;
    }, '');

    return `(${args.join(',')}) => { ${_outValue} }`;
}

Kunai.parseSpec = function () {
    const file = readSpecFile();
    return this.compileBlocks(file);
}

Kunai.compileBlocks = function (fileContent) {
    const lines = fileContent.split('\n')
        .filter(c => !c.match(/^\s+$/))
        .map(l => l.replace(/(.*)\s+$/, '$1'))
        .map(l => l.replace(/^(#.*)$/, ''))
        .map(l => l.replace(/^(\s*#.*)$/, ''))
        .filter(l => l !== '');

    return getBlocks(lines)
        .map(compile)
        .join('\n');
}

Kunai.prototype.env = function (obj) {
    if (obj) {
        this._env = merge(this._env, obj);
        return;
    }

    return this._env;
}

Kunai.prototype.faker = function () {
    return faker;
}

Kunai.prototype.condition = function (type, cond) {
    const realCondValue = (type === 'unless') ? !cond : cond;

    const methods = {
        then (callback) {
            if (realCondValue) {
                callback();
            }
            return { else: (callback) => methods.else(callback) };
        },

        else (callback) {
            if (!realCondValue) {
                callback();
            }
        }
    };

    return methods;
}

Kunai.prototype.log = function () {
    console.log.apply(console, arguments);
}

Kunai.prototype.discuss = function (message) {
    this._queue.push(() => {
        console.log(colors.yellow.bold(`\n    # ${message}`));
        return Promise.resolve();
    });
}

Kunai.prototype.request = function (method, url, options) {
    options.env = this._env;

    const req = function () {
        return new Request(method, url, new RequestOptions(options));
    }

    req.isRequest = true;

    this._queue.push(req);
}

Kunai.prototype.file = function (filename) {
    const file = path.join(process.cwd(), filename);
    return fs.createReadStream(file);
}

Kunai.prototype.run = function () {
    let progress = 0;
    let total = 0;

    const updateProgres = (c, t) => {
        progress = c;
        total = t; 
    };

    console.log(colors.green.bold(`\n    ===> Starting tests...`));

    PromiseSeq(this._queue, updateProgres)
        .then(e => {
            console.log(colors.green.bold(`\n    ===> ${progress} test${progress > 0 ? '' : 's'} complete!\n`));
        })
        .catch(e => {
            console.log(colors.red.bold(`\n    ===> Test failed! :: ${progress}/${total} test${progress>0?'':'s'} complete\n`));
        });
}

Kunai.include = function (file) {
    const filename = (file.match(/\.kunai$/)) ? file : `${file}.kunai`;
    const filepath = path.join(process.cwd(), filename);

    let content = null;

    try {
        content = fs.readFileSync(filepath).toString();
    } catch (error) {
        throw new Error(`Can't include "${filename}"`);
    }

    return Kunai.compileBlocks(content);
}

Kunai.prototype.assert = assert;

Kunai.prototype.write = function (type, key, value) {
    if (type !== null) {
        if (type === 'qs') {
            type = 'queryString';
        }

        if (!this._env[type]) {
            this._env[type] = {};
        }

        this._env[type][key] = value;
    } else {
        this._env[key] = value;
    }
}

module.exports.Kunai = Kunai;