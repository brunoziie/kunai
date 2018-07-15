const vm = require('vm');

module.exports = function (code) {
    const Kunai = require('./kunai.js').Kunai;
    const kunai = new Kunai();
    const context = vm.createContext({ kunai });
    const script = new vm.Script(code);

    script.runInContext(context);
    kunai.run();
}