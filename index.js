const Kunai = require('./lib/kunai.js').Kunai;
const runner = require('./lib/runner.js');

module.exports.run = () => {
    const code = Kunai.parseSpec();
    runner(code);
}