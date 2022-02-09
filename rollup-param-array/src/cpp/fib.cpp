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
    // Un truco: reservamos un elemento más, y usamos el primer elemento
    // para guardar el tamaño del array
    float * result = (float*)malloc(sizeof(float) * (size + 1));
    result[0] = (float)size;
    for (int i = 1; i < size + 1; ++i)
    {
        result[i] = fillValue;
    }
    return result;
}

typedef struct ComplexDataT {
    float number;
    int * intArray;
    int arraySize;
} ComplexData;

EMSCRIPTEN_KEEPALIVE
ComplexData * getComplexData()
{
    ComplexData * result = new ComplexData;

    result->number = 3.141592f;
    result->arraySize = 20;
    result->intArray = (int*)malloc(sizeof(int) * result->arraySize);
    for (int i = 0; i < result->arraySize; ++i) {
        result->intArray[i] = i * 2;
    }

    return result;
}

typedef struct FloatArrayT {
    unsigned int length;
    float * data;
} FloatArray;

EMSCRIPTEN_KEEPALIVE
FloatArray * getFloatArray(int size, float initialValue)
{
    FloatArray * result = (FloatArray*)malloc(sizeof(FloatArray));
    result->length = size;
    result->data = (float*)malloc(sizeof(float) * size);
    for (int i = 0; i < size; ++i) {
        result->data[i] = initialValue;
    }
    std::cout << "Float array created at address " << result << std::endl;
    return result;
}

EMSCRIPTEN_KEEPALIVE
void freeFloatArray(FloatArray * arrayPtr)
{
    free(arrayPtr->data);
    std::cout << "Releasing float array at address " << arrayPtr << std::endl;
    free(arrayPtr);
}

EMSCRIPTEN_KEEPALIVE
void printFloatArray(float * arrayPtr, int length)
{
    std::cout << "Printing floating point array from C:" << std::endl << "[ ";
    for (int i = 0; i < length; ++i)
    {
        std::cout << arrayPtr[i];
        if (i < length - 1)
        {
            std::cout << ", ";
        }
        else
        {
            std::cout << " ]" << std::endl;
        }
    }
}

}

