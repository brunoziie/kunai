const request = require('request');
const get = require('lodash.get');
const colors = require('colors/safe');

const isEmptyObject = (obj) => {
    JSON.stringify(obj) === '{}';
};

const interporlate = (segment, env) => {
    return segment.replace(/:([a-zA-Z0-9_\.]*):/g, function (match, path) {
        return get(env, path);
    });
}

module.exports = class Request {
    constructor (method, url, options) {
        return this.mountRequest(method, url, options);
    }

    mountRequest(method, url, options) {
        const params = {
            baseUrl: options.env.baseurl,
            method: method,
            url: interporlate(url, options.env),
            headers: options.headers
        };

        if (!isEmptyObject(options.queryString)) {
            params.qs = options.queryString;
        }

        if (!isEmptyObject(options.inputs)) {
            params.formData = options.inputs;
        }

        return new Promise((resolve, reject) => {
            console.log(colors.bold(`▶ ${options.description}`));

            request(params, (err, response, body) => {
                if (err) {
                    return reject(err);
                }

                const _response = response.toJSON();
                _response.body = this.tryDecodeBodyJSON(_response.body);

                try {
                    options.responseMust(_response);
                    options.bodyMust(_response.body);
                    options.persist(_response, _response.body);

                    resolve();
                } catch (error) {
                    if (options.env.verbose) {
                        console.log(_response);
                    }
                    
                    reject(error);
                }
            })
        });
    }

    tryDecodeBodyJSON (body) {
        try {
            return JSON.parse(body);
        } catch (error) {
            return body;
        }
    }
}
