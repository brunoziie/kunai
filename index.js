const Kunai = require('./lib/kunai.js').Kunai;
const runner = require('./lib/runner.js');
const colors = require('colors/safe');
const fs = require('fs');

const brand = fs.readFileSync(__dirname + '/lib/brand.txt').toString();

module.exports.run = () => {
    console.log(brand);

    try {
        const code = Kunai.parseSpec();
        runner(code);
    } catch (error) {
        console.log(colors.red.bold(`\n    (!) ${error.message}\n\n`));
    }   
}