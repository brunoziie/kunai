module.exports = {
    verb: 'SKIP',

    compiler: (block) => {
        const Kunai = require('../kunai.js').Kunai;
        const [s, v, condition] = block.signature.match(/([A-Z]+)\s+(.*)/);
        const _cond = condition.replace('@env.', 'kunai.env().');
        return `skip: () => !!(${_cond})`;
    }
}