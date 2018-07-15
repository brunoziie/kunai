const types = {
    HEADERS: 'headers',
    QUERYSTRING: 'queryString',
    INPUTS: 'inputs'
}

module.exports = {
    verb: ['WITH'],
    compiler: (block) => {
        const Kunai = require('../kunai.js').Kunai;
        const type = block.signature.replace(/^WITH\s/, '').trim();
        const key = types[type];

        if (!key) {
            throw new Error(`${type} is not a valid argument for WITH block`);
        }

        const assignments = Kunai.assignment(block.content);

        return `${key}: ${assignments}`;
    }
}