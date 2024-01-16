"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countSameNumbers = exports.removeDuplicatesFromArray = void 0;
function removeDuplicatesFromArray(arr) {
    var uniqueNumbersSet = new Set(arr); // Cria um Set com números únicos
    var uniqueNumbersArray = Array.from(uniqueNumbersSet); // Converte o Set de volta para um array
    return uniqueNumbersArray;
}
exports.removeDuplicatesFromArray = removeDuplicatesFromArray;
var countSameNumbers = function (arr) {
    var countItems = [];
    arr.forEach(function (numero) {
        if (countItems[numero]) {
            countItems;
        }
    });
};
exports.countSameNumbers = countSameNumbers;
function contarRepeticoes(array) {
    // Inicializar um objeto para armazenar a contagem de repetições
    var contagem = {};
    // Iterar sobre o array e contar as repetições
    array.forEach(function (numero) {
        // Se o número já existir no objeto, incrementar a contagem
        if (contagem[numero]) {
            contagem[numero]++;
        }
        else {
            // Se o número não existir, inicializar a contagem com 1
            contagem[numero] = 1;
        }
    });
    // Converter o objeto em um array de objetos
    var resultado = Object.keys(contagem).map(function (numero) {
        var obj = {};
        obj[numero] = contagem[numero];
        return obj;
    });
    return resultado;
}
var arrayTeste = [1, 1, 1, 1, 2, 3, 3, 3, 4, 5, 6, 7, 8, 8, 9, 9];
var t = contarRepeticoes(arrayTeste);
console.log(t);
