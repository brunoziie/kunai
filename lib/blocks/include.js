const parser = require('../parser.js');

module.exports = {
    verb: ['INCLUDE'],

    compiler: (block) => {
        const Kunai = require('../kunai.js').Kunai;
        const [signature, verb, file] = block.signature.match(/([A-Z]+)\s?'(.*)'/);
        return Kunai.include(file);
    }
}