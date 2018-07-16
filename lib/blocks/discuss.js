const parser = require('../parser.js');

module.exports = {
    verb: ['DISCUSS'],

    compiler: (block) => {
        const [signature, verb, message] = block.signature.match(/([A-Z]+)\s?'(.*)'/);
        return `kunai.discuss('${message}')`;
    }
}