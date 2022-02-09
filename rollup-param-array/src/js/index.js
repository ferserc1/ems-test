
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
        

        // Prueba de estructura de datos compleja
        // Los datos en C tienen esta forma;
        //  {
        //      float number;
        //      int * intArray;
        //      int arraySize;
        //  }
        const structPtr = instance._getComplexData();
        // float + int ptr + int = 4 bytes + 4 bytes + 4 bytes
        const structFloatPtr = structPtr;
        const structIntArrayPtrPtr = structPtr + 4;
        const structArraySizePtr = structPtr + 8;

        const structFloat = new Float32Array(instance.HEAPU8.buffer, structFloatPtr, 1)[0];
        const structIntArrayPtr = new Uint32Array(instance.HEAPU8.buffer, structIntArrayPtrPtr, 1)[0];
        const structArraySize = new Int32Array(instance.HEAPU8.buffer, structArraySizePtr, 1)[0];

        const structIntArray = new Int32Array(instance.HEAPU8.buffer, structIntArrayPtr, structArraySize);

        console.log(`Struct float value: ${structFloat}`);
        console.log(structIntArray);
        console.log(`Struct array length: ${structArraySize}`);

        // Todo lo que se reserva en C tiene que borrarse. Si no se va a borrar en C, hay
        // que borrarlo en JS
        instance._free(structIntArrayPtr);  // El puntero al array, se crea con malloc(sizeof(int) *  arraySize)
        instance._free(structPtr); // El struct se crea con new ComplexData
        
        // En este ejemplo, se obtiene un array desde C. Usamos la técnica de devolver
        // en el primer elemento del array, el tamaño del mismo. En este caso es
        // un array de floats
        const testArrayPtr = instance._getArrayTest(30, 2 * 3.141592);
        const testArraySize = new Float32Array(instance.HEAPU8.buffer, testArrayPtr, 1)[0];
        const testArray = new Float32Array(instance.HEAPU8.buffer, testArrayPtr + 4, testArraySize);
        console.log(`test array length: ${testArraySize}`);
        console.log(testArray);

        // En C el array se reserva con malloc(sizeof(float) * (size + 1))
        instance._free(testArrayPtr);

        const fArrayPtr = instance._getFloatArray(50, 1.33);
        const fArraySize = new Int32Array(instance.HEAPU8.buffer, fArrayPtr, 1)[0];
        const fArrayDataPtr = new Uint32Array(instance.HEAPU8.buffer, fArrayPtr + 4, 1)[0];
        const fArrayData = new Float32Array(instance.HEAPU8.buffer, fArrayDataPtr, fArraySize);

        console.log(fArrayData);

        instance._freeFloatArray(fArrayPtr);

        const jsArray = [3.4, 5.5, 7.43, 9.09, 0.122, 34.18];
        const jsTypedArray = new Float32Array(jsArray);
        const jsToCPtr = instance._malloc(jsTypedArray.length * jsTypedArray.BYTES_PER_ELEMENT);
        instance.HEAPF32.set(jsTypedArray, jsToCPtr / 4);
        instance._printFloatArray(jsToCPtr, jsArray.length);
        instance._free(jsToCPtr);

    });
});

