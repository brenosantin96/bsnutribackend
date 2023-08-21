export const createArrayOfObjects = (numbers: number[]): { id: number }[] => {
    return numbers.map((num) => ({ id: num }));
}

