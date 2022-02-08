#!/bin/sh

rm build/ -rf
mkdir build
cd build
em++ ../cpp/main.cpp -s WASM=1 -o main.js
mkdir -p ../web/gen
mv main.js ../web/gen/
mv main.wasm ../web/gen/
cd ..