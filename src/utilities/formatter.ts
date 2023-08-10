export const formatToNumber = (textToFormat: any) => {

    if (textToFormat === "" || textToFormat === undefined || textToFormat === null) {
        textToFormat = 0;
    }


    let numberString = textToFormat.toString();
    numberString = numberString.replace('.', '').replace(',', '.').replace('R$', '').replace('R$ ', '').replace("€", "");
    let floatNumber = parseFloat(numberString);
    return floatNumber;

}

//

export const replaceCommaWithDot = (inputString: string): string => {
    if (inputString.includes(",")) {
        return inputString.replace(/,/g, ".");
    }
    return inputString;
}