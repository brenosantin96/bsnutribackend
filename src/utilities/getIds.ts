import { KeyAndCount } from "../types/KeyAndCountType";

export function removeDuplicatesFromArray(arr: number[]): number[] {
    const uniqueNumbersSet = new Set(arr); // Cria um Set com números únicos
    const uniqueNumbersArray = Array.from(uniqueNumbersSet); // Converte o Set de volta para um array
    return uniqueNumbersArray;
}


export const countSameNumbers = (arr: number[]): KeyAndCount[] => {
    let countItems: KeyAndCount[] = [];

    arr.forEach((numero) => {
        // Verifica se o número já está no array de countItems
        const existingItem = countItems.find((item) => item.key === numero);

        if (existingItem) {
            // Se o número já existe, incrementa o contador (count)
            existingItem.count++;
        } else {
            // Se o número não existe, adiciona um novo item
            countItems.push({ key: numero, count: 1 });
        }
    });

    return countItems;
};


export const countRepetitions = (array: number[]) => {
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


//tsc getIds.ts | node getIds.js

//ts-node getIds.ts && node dist/getIds.js

//nodemon -e ts,json src/utilities/getIds.ts