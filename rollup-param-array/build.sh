#!/bin/sh

em++ src/cpp/fib.cpp -o dist/fib.js -s MODULARIZE -s EXPORTED_FUNCTIONS=_fib,_fib2,_printString,_getString,_getArrayTest,_malloc,_free,_getFloatArray,_freeFloatArray,_getComplexData,_printFloatArray -s EXPORTED_RUNTIME_METHODS=ccall,cwrap,ALLOC_NORMAL,allocate,intArrayFromString,getValue,setValue,stringToUTF8  -s EXPORT_NAME="'FibModule'"
