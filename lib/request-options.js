const merge = require('./utils/merge');

module.exports = class RequestOptions {
    constructor (opts) {
        this.env = opts.env || {};

        this.description = opts.description || null;
        this.skip = opts.skip || (() => false);

        this.headers = () => {
            return merge((this.env.headers || {}), (opts.headers ? opts.headers() : {}) || {})
        };

        this.inputs = () => {
            return merge((this.env.inputs || {}), (opts.inputs ? opts.inputs() : {}) || {})
        };

        this.queryString = () => {
            return merge((this.env.queryString || {}), (opts.queryString ? opts.queryString() : {}) || {})
        };
        
        this.persist = opts.persist || (() => {});
        this.bodyMust = opts.bodyMust || (() => {});
        this.responseMust = opts.responseMust || (() => {});
    }
}