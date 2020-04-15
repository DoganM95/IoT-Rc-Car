var c = require("chalk");
var program = require("commander");

program
  .version('0.0.2')
  .option('-p, --peppers', 'Add peppers')
  .option('-P, --pineapple', 'Add pineapple')
  .option('-b, --bbq-sauce', 'Add bbq sauce')
  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .parse(process.argv);

console.log('you ordered a pizza with:');
if (program.peppers) console.log('  - peppers');
if (program.pineapple) console.log('  - pineapple');
if (program.bbqSauce) console.log('  - bbq');
console.log('  - %s cheese', program.cheese);



//ANSI Escape Version
console.log('\x1b[36m%s\x1b[0m', 'I am cyan');

//Chalk Module Version
console.log(c.red("hello, i am red"));
console.log(c.green("hello, i am green"));
console.log(c.blue("hello, i am blue"));
