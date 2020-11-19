const axios = require('axios');
const FormData = require('./formdata');
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
            method,
            baseURL: options.env.baseurl,
            url: interporlate(url, options.env),
            headers: options.headers()
        };

        if (!isEmptyObject(options.queryString())) {
            params.qs = options.queryString();
        }

        const inputs = options.inputs();

        if (!isEmptyObject(inputs) && ['PUT', 'POST'].indexOf(method) >= 0) {
            const form = FormData.create(inputs);

            params.data = form;
            params.headers = Object.assign(params.headers, form.getHeaders());
        }

        return new Promise((resolve, reject) => {   
            if (options.skip()) {
                console.log(colors.bold(`\n\n    ${options.description} - SKIPPED`));
                return resolve();
            } else {
                console.log(colors.bold(`\n\n    ${options.description}`));
            }

            function treatResponse (response) {
                try {
                    options.responseMust({
                        statusCode: response.status,
                        headers: response.headers,
                        body: response.data
                    });

                    options.bodyMust(response.data);
                    options.persist(response, response.data);
                    
                    resolve();
                } catch (error) {
                    if (options.env.verbose) {
                        console.log(response);
                    }

                    reject(error);
                }
            }

            axios(params)
                .then(treatResponse)
                .catch((e) => {
                    if (e.response) {
                        treatResponse(e.response);
                        return;
                    }

                    reject(e);
                });
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
