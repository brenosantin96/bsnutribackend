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

    let stringValueInput = inputString.toString();

    console.log("INPUT STRING: ", stringValueInput)
    console.log("TYPE OF INPUT STRING: ", typeof (stringValueInput));

    if (stringValueInput.includes(",")) {
        return stringValueInput.replace(/,/g, ".");
    }

    return stringValueInput;
}