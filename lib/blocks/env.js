module.exports = {
    verb: ['ENV', 'CONFIG'],
    compiler: (block) => {
        const Kunai = require('../kunai.js').Kunai;
        const assignments = Kunai.assignment(block.content);
        return `kunai.env(${assignments})`;
    }
}