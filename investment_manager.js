var INIT_PERSONAL_CONFIG = {
    hardcodePrice: {
        "VTI": 212.72,
        "VXUS": 55.94
    },
    outsideHoldings: [
        { symbol: 'VTI', quantity: 152.69587 },
        { symbol: 'VXUS', quantity: 376.48986 },
    ],
    mapping: {
        "VTI": [
            // US stocks
            "VXF", "VB",
            // Dividend growth stocks
            "VIG", "SCHD"
        ],
        "VXUS": [
            // Foreign developed stocks
            "VEA", "SCHF",
            // Emerging market stocks
            "VWO", "IEMG"
        ],
        // Municipal bonds
        "VTEB": [
            "TFI", "MUB"
        ]
    },
    defaultMapTo: "VTI",
    targetPercentage: {
        "VTI": 54,
        "VXUS": 36,
        "VTEB": 10
    },
    bufferCash: 2000
}

var INIT_SCHWAB_CSV = `
"Positions for account Personal ...977 as of 07:28 PM ET, 2023/06/04",,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,
Symbol,Description,Quantity,Price,Price Change %,Price Change $,Market Value,Day Change %,Day Change $,Cost Basis,Gain/Loss %,Gain/Loss $,Ratings,Reinvest Dividends?,Capital Gains?,% Of Account,Security Type
VXF,,35,143.41,,,5019.35,,,,,,,,,,
VB,,69,191.21,,,13193.49,,,,,,,,,,
MSFT,,51,335.4,,,17105.4,,,,,,,,,,
AAPL,,95,180.95,,,17190.25,,,,,,,,,,
NVDA,,69,393.27,,,27135.63,,,,,,,,,,
GOOGL,,82,124.67,,,10222.94,,,,,,,,,,
AMZN,,6,124.25,,,745.5,,,,,,,,,,
GOOG,,42,125.23,,,5259.66,,,,,,,,,,
META,,50,272.61,,,13630.5,,,,,,,,,,
VEA,,40,45.99,,,1839.6,,,,,,,,,,
SCHF,,42,35.51,,,1491.42,,,,,,,,,,
VWO,,30,40.35,,,1210.5,,,,,,,,,,
IEMG,,89,49.21,,,4379.69,,,,,,,,,,
VIG,,78,157.27,,,12267.06,,,,,,,,,,
SCHD,,59,71.24,,,4203.16,,,,,,,,,,
VTEB,,47,49.84,,,2342.48,,,,,,,,,,
TFI,,92,45.81,,,4214.52,,,,,,,,,,
MUB,,39,105.96,,,4132.44,,,,,,,,,,
Cash & Cash Investments,--,--,--,--,--,"$123,456.00",0%,$0.00,--,--,--,--,--,--,N/A,Cash and Money Market
Account Total,--,--,--,--,--,"$269,039.59",0%,$0.00,N/A,N/A,N/A,--,--,--,--,--
`

function main(schwabCSV, personalConfig) {
    let schwab = parseSchwabCSV(schwabCSV);
    let allPrices = getAllPrices(schwab.equities, personalConfig.hardcodePrice);
    let mapTo = inverseMapping(personalConfig.mapping);
    let allEquityInfo = getAllEquityInfo(schwab.equities, mapTo, personalConfig.defaultMapTo, personalConfig.outsideHoldings, allPrices, personalConfig.targetPercentage);
    // console.log(allEquityInfo);
    let plan = calculateBuyPlan(allPrices, allEquityInfo, personalConfig.targetPercentage, schwab.cash, personalConfig.bufferCash);
    // console.log(plan);
    return [allEquityInfo, plan];
}

// Log in schwab.com > Select account > "Export"
function parseSchwabCSV(content) {
    SYMBOL = 'Symbol';
    QUANTITY = 'Quantity';
    PRICE = 'Price';
    MARKET_VALUE = 'Market Value';
    ACCOUNT_TOTAL = 'Account Total';
    CASH = 'Cash & Cash Investments'

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
    return result;
}

function getAllPrices(equities, hardcodePrice) {
    let allPrices = {}
    for (let i = 0; i < equities.length; i++) {
        let equity = equities[i];
        allPrices[equity.symbol] = equity.price;
    }
    for (let symbol in hardcodePrice) {
        if (symbol in allPrices) {
            alert("no need to hardcode " + symbol)
        }
        allPrices[symbol] = hardcodePrice[symbol]
    }
    return allPrices;
}

function inverseMapping(mapping) {
    mapTo = {}
    for (let target in mapping) {
        mapping[target].forEach(source => {
            mapTo[source] = target
        });
        // Self should be mapped to itself.
        mapTo[target] = target
    }
    return mapTo;
}


function mapSymbol(symbol, mapTo, defaultMapTo, targetPercentage) {
    let mapped;
    if (symbol in mapTo) {
        mapped = mapTo[symbol];
    } else {
        if (defaultMapTo == null) {
            alert("equity " + e.symbol + " cannot be mapped");
        } else {
            mapped = defaultMapTo;
        }
    }
    if (!(mapped in targetPercentage)) {
        alert(symbol + " is mapped to " + mapped + ", which is not in the target " + targetPercentage)
    }
    return mapped;
}
function getAllEquityInfo(equities, mapTo, defaultMapTo, outsideHoldings, allPrices, targetPercentage) {
    let allEquityInfo = [...equities];
    for (let i = 0; i < allEquityInfo.length; i++) {
        let e = allEquityInfo[i];
        e.source = "Schwab"
        e.mapTo = mapSymbol(e.symbol, mapTo, defaultMapTo, targetPercentage);
    }
    for (let i = 0; i < outsideHoldings.length; i++) {
        let e = {}
        e.symbol = outsideHoldings[i].symbol
        e.quantity = outsideHoldings[i].quantity
        if (!(e.symbol in allPrices)) {
            alert("price of " + e.symbol + "is unknown!");
        }
        e.price = allPrices[e.symbol];
        e.marketValue = e.quantity * e.price;
        e.source = "Outside";
        e.mapTo = mapSymbol(e.symbol, mapTo, defaultMapTo, targetPercentage);
        allEquityInfo.push(e)
    }
    // console.log(allEquityInfo)
    return allEquityInfo;
}

function checkTargetPercentage(targetPercentage) {
    let sum = 0;
    for (let key in targetPercentage) {
        sum += targetPercentage[key];
    }
    if (sum != 100) {
        alert("targetPercentage should add up to 100!")
    }
}
function calculateBuyPlan(allPrices, allEquityInfo, targetPercentage, cash, bufferCash) {
    checkTargetPercentage(targetPercentage);
    plan = {}
    for (symbol in targetPercentage) {
        plan[symbol] = {
            symbol: symbol,
            oldMarketValue: 0
        }
    }
    let oldMarketValue = 0
    for (let i = 0; i < allEquityInfo.length; i++) {
        const e = allEquityInfo[i];
        plan[e.mapTo].oldMarketValue += e.marketValue;
        oldMarketValue += e.marketValue;
    }


    let expectMarketValue = oldMarketValue + cash - bufferCash;
    let addValueActual = 0;
    for (symbol in targetPercentage) {
        let e = plan[symbol];
        e.oldPercentage = e.oldMarketValue / oldMarketValue * 100;
        e.expectPercentage = targetPercentage[symbol]
        e.expectMarketValue = expectMarketValue * e.expectPercentage / 100;
        e.addValueNeeded = e.expectMarketValue - e.oldMarketValue
        e.price = allPrices[symbol];
        e.addShares = Math.round(e.addValueNeeded / e.price)
        e.addValueActual = e.price * e.addShares;
        addValueActual += e.addValueActual;
        e.newMarketValue = e.oldMarketValue + e.addValueActual;
        e.newPercentage = e.newMarketValue / expectMarketValue * 100
    }


    planList = []
    for (symbol in plan) {
        planList.push(plan[symbol]);
    }
    fullPlan = {
        planList: planList,
        cash: cash,
        bufferCash: bufferCash,
        addValueActual: addValueActual,
        bufferCashActual: cash - addValueActual
    }
    // console.log(fullPlan);
    return fullPlan;
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


module.exports = { parseDollars, parseSchwabCSV, getAllPrices, inverseMapping, getAllEquityInfo, calculateBuyPlan, main };
