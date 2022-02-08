#!/bin/sh

em++ fib.cpp -o fib.js -s MODULARIZE -s EXPORTED_FUNCTIONS=_fib -s EXPORTED_RUNTIME_METHODS=ccall
