
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
        instance._fib2();

        // Pasar un string desde JavaScript
        const message = "This string is passed from JS to C";
        const messagePtr = instance.allocate(instance.intArrayFromString(message), instance.ALLOC_NORMAL);
        instance._printString(messagePtr,1);
        instance._printString(messagePtr,2);
        instance._printString(messagePtr,3);
        instance._free(messagePtr); // Todo lo que hagamos con allocate hay que liberarlo después, cuando no se use
        
        // O también se puede pasar así
        instance.ccall('printString',null,['string','number'],[message, 5]);


        // Recoger un string en JavaScript desde C:
        // Es más sencillo con ccall(), porque ya le estamos diciendo al runtime que queremos obtener
        // un string. Pero aquí tenemos un memory leak (ver el código en C), ya que getString reserva
        // la cadena de texto en el heap y ese string ya no se va a borrar
        const stringFromC = instance.ccall('getString','string',[]);
        console.log(stringFromC);


        // Podemos obtener el string directamente del heap con HEAPU8, pero no sabemos el tamñao del string, así
        // que hay que recorrerlo byte a byte. Otra opción es recorrerlo en trozos, que será más rápido, y así
        // buscar el caracter de fin de cadena
        const strPtr = instance._getString();
        let done = false;
        let offset = 0;
        const chunkSize = 10;
        let stringFromC2 = "";
        while (!done) {
            const chunk = new Uint8Array(instance.HEAPU8.buffer, strPtr + offset, chunkSize);
            const text = new TextDecoder().decode(chunk);
            const endl = text.indexOf('\0');
            if (endl != -1) {
                done = true;
                stringFromC2 += text.substring(0,endl);
            }
            else {
                stringFromC2 += text;
            }
            offset += chunkSize;
        }
        console.log(stringFromC2)
        instance._free(strPtr); // Ahora ya podemos borrar el puntero
        

        const arrayResult = instance._getArrayTest(20,3.4);
        instance.cwrap;
        console.log(arrayResult);
    });
});

