#include <emscripten.h>
#include <iostream>



extern "C" {

EMSCRIPTEN_KEEPALIVE
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

EMSCRIPTEN_KEEPALIVE
float *getArrayTest(int size, float fillValue) {
    float * result = (float*)malloc(sizeof(float) * size);
    for (int i = 0; i < size; ++i)
    {
        result[i] = fillValue;
    }
    return result;
}

}

