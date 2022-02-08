const factory = require('./fib.js');

factory().then((instance) => {
    console.log("fib(12): ",instance._fib(12));
    console.log("fib(22): ",instance.ccall("fib","number",["number"],[22]));
});
