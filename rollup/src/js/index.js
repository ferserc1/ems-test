
const loadScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.type = "text/javascript";
        script.src = "fib.js";
        let loaded = false;
        script.onload = script.onreadystatechange = function() {
            loaded = true;
            resolve();
        }
        document.head.appendChild(script);
    })
}


loadScript().then(() => {
    FibModule().then(instance => {
        console.log(`fib(12) = ${instance._fib(12)}`);
    });
});