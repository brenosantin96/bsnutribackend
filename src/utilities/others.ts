export const createArrayOfObjects = (numbers: number[]): { id: number }[] => {
    return numbers.map((num) => ({ id: num }));
}

// Exemplo de uso:
const inputArray: number[] = [1, 3, 5];
const arrayOfObjects = createArrayOfObjects(inputArray);
console.log(arrayOfObjects);