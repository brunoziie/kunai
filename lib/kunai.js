const Request = require('./request.js');
const RequestOptions = require('./request-options.js');
const merge = require('./utils/merge');
const PromiseSeq = require('./utils/promise-seq.js');
const colors = require('colors/safe');
const fs = require('fs');
const path = require('path');

const parser = require('./parser.js');
const getBlocks = parser.getBlocks;
const compile = parser.compile;

const readSpecFile = () => {
    const file = path.join(process.cwd(), 'spec.kunai');
    return fs.readFileSync(file).toString();
}

const Kunai = function () {
    this._env = {};
    this._queue = [];
}

Kunai.assignment = function (lines) {
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
            .replace('@env.', 'kunai.env().');

        return `$$['${_key}'] = ${_value}`;
    });

    assignments.push('return $$;');

    return `($$ => { ${assignments.join('; ')} })({})`;
}

Kunai.callback = function (lines, args) {
    const _value = lines.map(line => {
        return line.trim()
            .replace(/^@write\.([a-zA-Z]*)\((.*)\)/, 'kunai.write(\'$1\', $2)')
            .replace('@assert(', 'kunai.assert(')
            .replace('@log(', 'kunai.log(');
    })

    return `(${args.join(',')}) => { ${_value.join('; ')} }`;
}

Kunai.parseSpec = function () {
    const file = readSpecFile();

    const lines = file.split('\n')
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

Kunai.prototype.log = function () {
    console.log.apply(console, arguments);
}

Kunai.prototype.request = function (method, url, options) {
    options.env = this._env;

    this._queue.push(() => {
        return new Request(method, url, new RequestOptions(options));
    });
}

Kunai.prototype.run = function () {
    PromiseSeq(this._queue)
        .then(e => console.log('done!'))
        .catch(e => console.log('fail!', e));
}

Kunai.prototype.file = function (filename) {
    const file = path.join(process.cwd(), filename);
    return fs.readFileSync(file);
}

Kunai.prototype.assert = function (condition, description) {
    const icon = (condition) ? '✔' : '✖';
    const message = `  ${icon} ${description}` 
    
    if (condition) {
        console.log(colors.green(message));
    } else {
        console.log(colors.red(message));
        throw new Error(description);
    }
}

Kunai.prototype.write = function (type, key, value) {
    if (type === 'qs') {
        type = 'queryString';
    }

    if (!this._env[type]) {
        this._env[type] = {};
    }

    this._env[type][key] = value;
}

module.exports.Kunai = Kunai;