const merge = require('./utils/merge');

module.exports = class RequestOptions {
    constructor (opts) {
        this.env = opts.env || {};

        this.description = opts.description || null;

        this.headers = merge((this.env.headers || {}), opts.headers || {});
        this.inputs = merge((this.env.inputs || {}), opts.inputs || {});
        this.queryString = merge((this.env.queryString || {}), opts.queryString || {});
        
        this.persist = opts.persist || (() => {});
        this.bodyMust = opts.bodyMust || (() => {});
        this.responseMust = opts.responseMust || (() => {});
    }
}