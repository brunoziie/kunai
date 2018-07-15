const parser = require('../parser.js');

module.exports = {
    verb: ['GET', 'POST', 'PUT', 'DELETE'],

    compiler: (block) => {
        const [signature, method, url] = block.signature.match(/([A-Z]+)\s?(.*)/);

        const options = block.content.map(parser.compile);
        const renderedOptions = (options.length) ? `{${options.join(', ')}}`: '{}';

        return `kunai.request('${method}', ${url}, ${renderedOptions})`;
    }
}