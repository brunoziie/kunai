const types = {
    'PERSIST': 'persist',
    'RESPONSE MUST': 'responseMust',
    'BODY MUST': 'bodyMust'
}

module.exports = {
    verb: ['PERSIST', 'RESPONSE MUST', 'BODY MUST'],

    compiler: (block) => {
        const Kunai = require('../kunai.js').Kunai;
        const key = types[block.signature.trim()];
        
        if (!key) {
            throw new Error(`Invalid block ${block.signature}`);
        }

        let args = [];

        if (key === 'bodyMust') args.push('body');
        if (key === 'responseMust') args.push('response');
        if (key === 'persist') args = ['response', 'body'];

        const assignments = Kunai.callback(block.content, args);

        return `${key}: ${assignments}`;
    }
}