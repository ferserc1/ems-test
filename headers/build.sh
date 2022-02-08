#!/bin/sh

rm -rf build
mkdir build
cd build
em++ ../cpp/main.cpp  ../cpp/fib.cpp -s WASM=1 -o main.js || exit 1
mkdir -p ../web/gen
mv main.js ../web/gen/
mv main.wasm ../web/gen/
cd ..