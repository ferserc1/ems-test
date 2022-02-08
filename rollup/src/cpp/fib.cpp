#include <emscripten.h>
#include <iostream>

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

EMSCRIPTEN_KEEPALIVE
int fib2(int y) {
    int r = fib(y);
    std::cout << "Hello" << std::endl;
    std::cerr << "Esto es un error" << std::endl;
    return r * r;
}

}
