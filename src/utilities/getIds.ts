export function removeDuplicatesFromArray(arr: number[]): number[] {
    const uniqueNumbersSet = new Set(arr); // Cria um Set com números únicos
    const uniqueNumbersArray = Array.from(uniqueNumbersSet); // Converte o Set de volta para um array
    return uniqueNumbersArray;
}

type keyAndCount = {
    key: number;
    count: number
}

export const countSameNumbers = (arr: number[]) => {

    let countItems: keyAndCount[] = [];

    arr.forEach((numero) => {

        if (countItems[numero] === null) {
            countItems[numero].key = numero;
            

        }

    })
}

export function countRepetitions(array: number[]) {
    // Inicializar um objeto para armazenar a contagem de repetições
    let contagem: Record<string, number> = {};

    // Iterar sobre o array e contar as repetições
    array.forEach(numero => {
        // Se o número já existir no objeto, incrementar a contagem
        if (contagem[numero]) {
            contagem[numero]++;
        } else {
            // Se o número não existir, inicializar a contagem com 1
            contagem[numero] = 1;
        }
    });

    // Converter o objeto em um array de objetos
    let resultado = Object.keys(contagem).map(numero => {
        let obj: Record<string, number> = {};
        obj[numero] = contagem[numero];
        return obj;
    });

    return resultado;
}


let arrayTeste = [1,1,1,1,2,3,3,3,4,5,6,7,8,8,9,9]

let t = countRepetitions(arrayTeste)
console.log(t)

//tsc getIds.ts | node getIds.js

//ts-node getIds.ts && node dist/getIds.js

//nodemon -e ts,json src/utilities/getIds.ts