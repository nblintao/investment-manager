// Log in schwab.com > Select account > "Export"

SYMBOL = 'Symbol';
QUANTITY = 'Quantity';
PRICE = 'Price';
MARKET_VALUE = 'Market Value';
ACCOUNT_TOTAL = 'Account Total';
CASH = 'Cash & Cash Investments'

function parseSchwabCSV(content) {
    table = CSVToArray(content);
    // Find the index of the head row that contains SYMBOL
    let headRowIndex = -1;
    for (let i = 0; i < table.length; i++) {
        if (table[i][0] === SYMBOL) {
            headRowIndex = i;
            break;
        }
    }
    if (headRowIndex === -1) {
        return [];
    }

    // Find the indices of the columns that contain QUANTITY, PRICE, and MARKET_VALUE
    let quantityIndex = -1;
    let priceIndex = -1;
    let marketValueIndex = -1;
    for (let j = 0; j < table[headRowIndex].length; j++) {
        if (table[headRowIndex][j] === QUANTITY) {
            quantityIndex = j;
        } else if (table[headRowIndex][j] === PRICE) {
            priceIndex = j;
        } else if (table[headRowIndex][j] === MARKET_VALUE) {
            marketValueIndex = j;
        }

    }
    if (quantityIndex === -1 || priceIndex === -1 || marketValueIndex === -1) {
        return [];
    }

    let result = {};
    let equities = [];
    totalMarketValue = -1;
    for (let i = headRowIndex + 1; i < table.length; i++) {
        let row = table[i];
        symbol = row[0];
        if (symbol == ACCOUNT_TOTAL) {
            result.totalMarketValue = parseDollars(row[marketValueIndex]);
            break;
        } else if (symbol == CASH) {
            result.cash = parseDollars(row[marketValueIndex]);
            continue;
        }

        let equity = {};
        equity.symbol = symbol;
        equity.quantity = parseDollars(row[quantityIndex]);
        equity.price = parseDollars(row[priceIndex]);
        equity.marketValue = parseDollars(row[marketValueIndex]);
        equities.push(equity);
    }
    result.equities = equities
    console.log(result)
    return result;
}


// Can also parse if it does not have dollars.
function parseDollars(str) {
    // Remove "," and "$", then parse as a float.
    return parseFloat(str.replace(/[$,]/g, ""));
}


// From https://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            (strMatchedDelimiter != strDelimiter)
        ) {

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);

        }


        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"),
                "\""
            );

        } else {

            // We found a non-quoted value.
            var strMatchedValue = arrMatches[3];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return (arrData);
}


module.exports = { parseDollars, parseSchwabCSV };