# emscripten test

## Instalar emscripten

### Dependencias

- Windows: Python 3.6. Las versiones más viejas no funcionarán debido a problemas de SSL con GitHub

- macOS:
    * Xcode command line tools: instalar Xcode de la app store y luego las herramientas de terminal desde las preferencias de Xcode
    * CMake: desde la web, el instalador normal, o usando otro método.

- Linux/WSL: con apt-get, instalar python3, cmake y git. Si tienes una verisón de node instalada en el sistema, puedes usarla ajustando el atributo NODE_JS en el archivo .emscripten

Mi recomendación es que si trabajas en Windows uses WSL. Aparte de que la instalación y configuración es más sencilla, hay pasos al final de este documento en los que hay que ejecutar un script de shell desde npm. Esta parte, tal cual está, solamente lo he probado desde Mac y Linux, y en Windows habría que hacer algunos cambios.


### Instalar

El SDK se puede descargar en zip, pero si lo descargamos desde github será más fácil actualizar:

**Linux/WSL/macOS**:

```sh
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

El script `emsdk_env.sh` solamente registra las rutas al compilador emscripten en el path. Si quieres tenerlas disponibles, tendrías que llamar al script en el fichero  `rc` de tu shell (`.bashrc`, `.zshrc`, etc).

**Windows**:

```sh
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
emsdk install latest
emsdk activate latest
emsdk_env.bat
```

El script `emsdk_env.bat` solamente registra las rutas al compilador emscripten en el path. Si quieres tenerlas disponibles siempre, tendrías que ejecutarlo al inicio.

### Actualizar

**Linux/WSL/macOS**:

```sh
cd emsdk
./emsdk update
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

**Windows**:

```sh
cd emsdk
emsdk update
emsdk install latest
emsdk activate latest
emsdk_env.bat
```

## Tutorial

[https://emscripten.org/docs/getting_started/Tutorial.html#tutorial](https://emscripten.org/docs/getting_started/Tutorial.html#tutorial)


El Emscripten Compiler Frontend (emcc) es la herramienta que se encarga de llamar a todos los comandos a más bajo nivel para compilar el código en C/C++ y generar el WebAssembly. Se llama desde la línea de comandos usando `emcc` o `em++`

Nota: en Windows hay que abrir el Emscripten Command Prompt, que está preconfigurado con las rutas del sistema necesarias. Se puede acceder desde el menú inicio de Windows, y escribiendo `emscripten`

Para verificar la instalación:

```
emcc -v
```

Nota: Para que se registre bien el path hay que ejecutar el script emsdk_env.sh con el comando source, en mac/linux

Prueba a ejecutar el ejemplo de la carpeta test en este repo:

```sh
cd test
emcc hello_world.c
```

Si todo ha ido bien, deberías tener los siguientes archivos en la carpeta `test`:

- a.out.js
- a.out.wasm
- hello_world.c (archivo original)

Puedes probar el ejemplo con:

```sh
node a.out.js
```

Nota: si realizas alguna salida de texto por consola, asegúrate de imprimir un caracter de nueva línea al final del último texto, o de lo contrario ese último texto no se imprimirá. Si ocurre esto, se mostrará una advertencia que te lo explica.

El mismo ejemplo se puede ejecutar con C++ cambiando el comando `emcc` por `em++` (ejemplo en la carpeta `test++`):

```c++
#include <iostream>

int main() {
    std::cout << "Hello, World! from C++" << std::endl;
    return 0;
}
```

## emrun

Permite ejecutar un servidor HTTP para probar el código compilado:

```sh
emrun --port 8080 .
```

## Organizar el código

ejemplo: twofiles

Se ha creado una carpeta para el código fuente (cpp) con dos ficheros: `fib.cpp` y `main.cpp`

**fib.cpp**:

```c++
int fib(int x) {
    if (x < 1) {
        return 0;
    }
    if (x == 1) {
        return 1;
    }
    return fib(x-1)+fib(x-2);
}
```

**main.cpp**:

```c++
#include <iostream>
#include "fib.cpp"

int main() {
    std::cout << "fib(5) = " << fib(5) << std::endl;
    return 0;
}
```

Y un script para compilar:

**build.sh**:

```sh
#!/bin/sh

rm build/ -rf
mkdir build
cd build
em++ ../cpp/main.cpp -s WASM=1 -o main.js
mkdir -p ../web/gen
mv main.js ../web/gen/
mv main.wasm ../web/gen/
cd ..
```

```sh
./build.sh
```

Generará la siguiente estructura de ficheros:

|- twofiles
    |- build
    |- cpp
    |   |- fib.cpp
    |   |- hello.cpp
    |- web
        |- gen
        |   |- hello.js
        |   |- hello.wasm
        |- index.html

(el fichero web/index.html ya viene creado)

## Archivos de cabecera

(directorio headers)

Incluir un archivo `cpp` con #include no es buena práctica. lo suyo es utilizar archivos de cabecera, ya que esto permite paralelizar la compilación, compilando cada fichero cpp en un hilo separado.

**fib.h**:

```c++
#ifndef FIB
#define FIB

int fib(int x);

#endif
```

**fib.cpp**:

```c++ 
#include "fib.h"

int fib(int x) {
    if (x < 1) {
        return 0;
    }
    if (x == 1) {
        return 1;
    }
    return fib(x-1)+fib(x-2);
}
```

**main.cpp**:

```c++
#include <iostream>
#include "fib.h"

int main() {
    std::cout << "fib(5) = " << fib(5) << std::endl;
    return 0;
}
```

Modificamos el script de compilación para añadir el fichero `fib.cpp`. Usamos `|| exit 1` para detener el script si la compilación falla.

```sh
em++ ../cpp/main.cpp  ../cpp/fib.cpp -s WASM=1 -o main.js || exit 1
```

## Desensamblar

Nota: esto funciona, pero no le hagas mucho caso. Para exportar funciones a JS no hace falta. Puedes saltarte esta sección.

A veces necesitamos saber cómo se llaman las funciones que se exportan desde C++, por ejemplo, para exportarlas a JS, cosa que haremos en la siguiente sección.

Para eso usamos el comando `wasm-dis`, que tiene que ser instalado en el sistema:

**Mac**

```sh
brew install binaryen
```

**Ubuntu o WSL:**

```sh
apt-get install binaryen
```

```sh
wasm-dis main.cpp -o main.wast
```

En teoría también es posible generar el fichero `wast` añadiendo el flag -g al compilar, pero a mi no me ha funcionado:

```sh
em++ ../cpp/hello.cpp ../cpp/fib.cpp -g -s WASM=1 -o hello.js || exit 1
```

## Exportar funciones de C++ a JS

[https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html](https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html)

De normal solamente se exporta la función `main`. Para especificar las funciones que queremos exportar, se utiliza el parámetro `-s EXPORTED_FUNCTIONS=...` con la lista de funciones separadas por comas. Los nombres de función al exportarse empiezan por `_`, así, si las funciones a exportar se llaman `fib` y `main`, el parámetro será `-s EXPORTED_FUNCTIONS=_fib,_main`. Observa que al usar el parámetro `EXPORTED_FUNCTIONS` tenemos que especificar también la función `_main`.

Además de esto, las funciones tienen que exportarse como código C, o de lo contrario tendremos el error siguiente:

```sh
em++ error: undefined exported symbol: "_nombre_funcion" [-Wundefined] [-Werror]
```

**fib.h**

```c++
#ifndef FIB
#define FIB

extern "C" {

int fib(int x);

}

#endif
```

**fib.cpp**

```c++
#include "fib.h"

extern "C" {

int fib(int x) {
    ...
}

}
```

También tenemos que usar el parámetro `-s EXPORTED_RUNTIME_METHODS` para especificar que queremos exportar a JavaScript las funciones necesarias para interactuar con C:

```sh
em++ ../cpp/main.cpp ../cpp/fib.cpp -s EXPORTED_FUNCTIONS=_fib,_main -s EXPORTED_RUNTIME_METHODS=ccall,cwrap -o main.js || exit 1
```

Ahora podemos utilizar la función `cwrap` para envolver la función de C en JS:

```js
<script src="gen/main.js"></script>
<script>
    fib = Module.cwrap('fib','number',['number`]);

    Module.onRuntimeInitialized = () => {
        console.log("fib(10): " + fib(10));
    }
</script>
```

Es posible también hacer la llamada a la función de C sin envolverla usando la función `ccall`:

```js
<script src="gen/main.js"></script>
<script>
    Module.onRuntimeInitialized = () => {
        console.log("fib(10): " + fib(10));

        const result = Module.ccall('fib', 'number', ['number'],[12]);
        console.log("fib(12): " + result);
    }
</script>
```

## modularize

Sirve para exportar un API desde C++ a JavaScript mediante un módulo. Se utiliza la macro EMSCRIPTEN_KEEPALIVE para indicar que esas funciones tienen que ser exportadas aunque no se usen (si no el optimizador se las carga), y el parámetro -MODULARIZE para generar la salida como un módulo ES:

```c++
#include <emscripten.h>

EMSCRIPTEN_KEEPALIVE
extern "C" {

int fib(int x) {
    if (x < 1) {
        return 0;
    }
    if (x == 1) {
        return 1;
    }
    return fib(x-1)+fib(x-2);
}

}
```

```sh
em++ fib.cpp -o fib.js -s MODULARIZE -s EXPORTED_FUNCTIONS=_fib -s EXPORTED_RUNTIME_METHODS=ccall
```

Luego podemos usarlo en un módulo con un require:

**index.js**:

```js
const factory = require('./fib.js');

factory().then((instance) => {
    console.log("fib(12): ",instance._fib(12));
    console.log("fib(22): ",instance.ccall("fib","number",["number"],[22]));
});
```

**index.mjs**:

```js
import fib from './fib.js';

fib().then(instance => {
    console.log(`fib(12): ${ instance._fib(12) }`);
});
```

## Rollup

Con el plugin `@rollup/plugin-wasm` es posible cargar módulos en web assembly y ejecutarlos en una app empaquetada con rollup.

**rollup.config.js**

```js
import { wasm } from '@rollup/plugin-wasm';

export default [
    {
        input: 'index.js',

        watch: {
            include: "./**"
        },

        output: {
            file: './dist/rollup-wasm.js',
            format: 'es',
            sourcemap: 'inline'
        },

        plugins: [
            wasm()
        ]
    }
]
```

```js
import fib from 'fib.wasm`;
...
```

Con este plugin no usamos el runtime de JavaScript que genera emscripten, sino que cargamos directamente los archivos `wasm`. Así que esto no sirve prácticamente para nada, porque no podemos usar ninguna función del runtime de C++.

La opción que me ha funcionado es importar el módulo como commonjs para tener disponible de forma global `Module`, y a partir de ahí utilizarlo desde el código que empaquetaremos en rollup.

**rollup.config.js**

```js
export default [
    {
        input: 'index.js',

        watch: {
            include: "./**"
        },

        output: {
            file: './dist/rollup-wasm.js',
            format: 'es',
            sourcemap: 'inline'
        }
    }
]
```

**index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <!-- Importar como commonjs -->
    <script src="../fib.js"></script>

    <!-- Importar el archivo generado por rollup. Desde
    dentro de este archivo ya tenemos acceso a Moldule -->
    <script type="module" src="./rollup-wasm.js"></script>
</head>
<body>
</body>
</html>
```

*index.js**

```js
Module().then(instance => {
    console.log(`fib(12) = ${instance._fib(12)}`);
});
```

## Conclusión: utilizar con rollup/webpack

Como es imposible utilizar ninguno de los plugins de rollup/webpack para cargar correctamente el código generado por `emscripten`, la mejor forma de incluir dicho código es trabajar como un fichero commonJS

Esto tiene dos problemas:

- No se puede empaquetar todo el código en un único fichero javascript. Como mínimo serán tres ficheros:
    1. El fichero principal, generado con rollup.
    2. La biblioteca .js, que hay que incluir a mano en la cabecera del archivo HTML.
    3. El fichero con el código compilado `.wasm`
- El wrapper que genera `emscripten` por defecto se llama `Module`. Si queremos cargar más de una biblioteca, habrá colisión con los nombres, porque ambas se llamarán igual.

### Solución al primer problema

En realidad, distribuir más de un fichero con nuestra biblioteca no es demasiado problemático, y además tendremos la ventaja de que podremos cargar de forma asíncrona la biblioteca, por lo que se puede incluso repartir el tiempo de carga. El problema aquí está más bien en tener que modificar a mano el fichero `*.html` para incluir el script.

Podemos incluir una función para carga asíncrona de código, de forma que evitemos tener que modificar a mano el fichero `html`:

```js

const loadScript = (scriptUrl) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.type = "text/javascript";
        script.src = scriptUrl;
        let loaded = false;
        script.onload = script.onreadystatechange = function() {
            loaded = true;
            resolve();
        }
        document.head.appendChild(script);
    })
}

...

await loadScript("the-emscripten-wrapper.js");

// Aquí ya podemos usar `Module`
const moduleInstance = await Module();

moduleInstance._wasmFunction();
```

### Solución al segundo problema

Podemos utilizar el parámetro `-s EXPORT_NAME="'NombreDeModulo'"` para especificar el nombre que queremos que se utilize.

```sh
em++ fib.cpp -o fib.js -s MODULARIZE -s EXPORTED_FUNCTIONS=_fib -s EXPORTED_RUNTIME_METHODS=ccall -s EXPORT_NAME="'NombreDeModulo'"
```

```js
await loadScript("the-emscripten-wrapper.js");
// Ahora el módulo se llama 
const moduleInstance = await NombreDeModulo();
moduleInstance._wasmFunction();
```

## Paso de parámetros: strings

Vamos a partir de dos funciones en C que reciben y devuelven un string

```c++
EMSCRIPTEN_KEEPALIVE
void printString(char * text, int n)
{
    std::cout << "Text printed from C: " << text << ", number: " << n << std::endl;
}

EMSCRIPTEN_KEEPALIVE
char * getString()
{
    std::string testString = "Hello World!, from C++";
    char * resultString = new char[testString.size()];
    strcpy(resultString, testString.c_str());
    return resultString;
}
```

Para pasar un string desde JS a C tenemos dos formas:

```js
const message = "This is a string passed form JS to C";
const messagePtr = instance.allocate(instance.intArrayFromString(message), instance.ALLOC_NORMAL);
instance._printString(messagePtr,1);
instance._free(messagePtr); // Hay que borrar la memoria que hemos alojado
```

```js
const message = "This is another test string, passed from JS to C";
insatnce.ccall('printString',null,['string','number'],[message,2]);
// También se puede usar cwrap y luego llamar a la función
```

Con `ccall` y `cwrap` es más fácil, porque la propia función se encarga de convertir los strings.

Pero para devolver un string hay que tener en cuenta que la función `getString` devuelve una dirección de memoria reservada en el heap (hemos hecho un `new char[testString.size()]`). Podemos obtener el string así:

```js
const stringFromC = instance.call('getString','string',[]);
console.log(stringFromC);
```

Pero esto va a provocar un memory leak: el string que se devuelve y que se ha creado en la pila, nunca se libera.

Es posible acceder al heap y convertir su contenido en un typed array. Esto es una posible primera aproximación para obtener strings (o también cualquier otro tipo de punteros) desde C, el problema es que desde C tenemos que traer dos cosas: el punter y el tamaño del string:

```js
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
console.log(stringFromC2);
instance._free(strPtr); // Ahora ya podemos borrar el puntero
```

Este código es brutalmente engorroso, sí, pero nos da una pista de cómo debemos preparar nuestra API de C: si tenemos que devolver punteros al heap, lo mejor es obtener por un lado el puntero y por otro su tamaño

```js
const ptrData = instance._myGetDataPointer();
const size = instance._myGetDataSize();
const data = new Uint8Array(instance.HEAPU8.buffer, ptrData, size);
// A partir de data ya podemos convertirlo al tipo de array que sea
// Por ejemplo, para un string
const string = new TextDecoder().decode(data);
```

## Bonus: usar VS Code

En general, Visual Studio Code funciona bien solamente instalando las extensiones recomendadas de Microsoft para C/C++, pero intellisense no funcionará bien.

Si compilas cualquier fichero con `emcc -v` se mostrará la lista de rutas de inclusión:

```sh
emcc -v test.c
...
#include "..." search starts here:
#include <...> search starts here:
 /home/fernando/desarrollo/emsdk/upstream/emscripten/cache/sysroot/include/SDL
 /home/fernando/desarrollo/emsdk/upstream/emscripten/cache/sysroot/include/compat
 /home/fernando/desarrollo/emsdk/upstream/lib/clang/14.0.0/include
 /home/fernando/desarrollo/emsdk/upstream/emscripten/cache/sysroot/include
End of search list.
...
```

Esa es la ruta de la instalación de emscripten, que dependerá del PC donde se haya instalado. Con esta información, en los ajustes de directorios de inclusión de C++, puedes añadir las rutas para que intellisense detecte las cabeceras de emscripten.


