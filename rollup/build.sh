#!/bin/sh

em++ src/cpp/fib.cpp -o dist/fib.js -s MODULARIZE -s EXPORTED_FUNCTIONS=_fib -s EXPORTED_RUNTIME_METHODS=ccall -s EXPORT_NAME="'FibModule'"
