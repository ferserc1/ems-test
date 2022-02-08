import fib from './fib.js';

fib().then(instance => {
    console.log(`fib(12): ${ instance._fib(12) }`);
});
