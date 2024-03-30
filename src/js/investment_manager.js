import CSVToArray from "./csv_to_array.js"

function runInvestmentManager(schwabCSV, personalConfig) {
    let schwab = parseSchwabCSV(schwabCSV);
    let allPrices = getAllPrices(schwab.equities, personalConfig.hardcodePrice);
    let mapTo = inverseMapping(personalConfig.mapping);
    let allEquityInfo = getAllEquityInfo(schwab.equities, mapTo, personalConfig.defaultMapTo, personalConfig.outsideHoldings, allPrices, personalConfig.targetPercentage);
    // console.log(allEquityInfo);
    let plan = calculateBuyPlan(
        allPrices,
        allEquityInfo,
        personalConfig.targetPercentage,
        schwab.cash + personalConfig.additionalCash, personalConfig.bufferCash
    );
    // console.log(plan);
    return [allEquityInfo, plan];
}

// Log in schwab.com > Select account > "Export"
function parseSchwabCSV(content) {
    const SYMBOL = 'Symbol';
    const QUANTITY = 'Quantity';
    const PRICE = 'Price';
    const MARKET_VALUE = 'Market Value';
    const ACCOUNT_TOTAL = 'Account Total';
    const CASH = 'Cash & Cash Investments'

    let table = CSVToArray(content);
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
    let totalMarketValue = -1;
    for (let i = headRowIndex + 1; i < table.length; i++) {
        let row = table[i];
        let symbol = row[0];
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
    let mapTo = {}
    for (let target in mapping) {
        mapping[target].forEach(source => {
            if (source in mapTo) {
                alert(source + " is defined in mapping multiple times")
            }
            mapTo[source] = target
        });
        // Self should be mapped to itself.
        if (target in mapTo) {
            alert(target + " is defined in mapping multiple times")
        }
        mapTo[target] = target
    }
    return mapTo;
}


function mapSymbol(symbol, mapTo, defaultMapTo, targetPercentage, unusedSymbolsInMapTo) {
    let mapped;
    if (symbol in mapTo) {
        mapped = mapTo[symbol];
    } else {
        if (defaultMapTo == null) {
            alert("equity " + symbol + " cannot be mapped");
        } else {
            mapped = defaultMapTo;
            console.log("equity " + symbol + " uses default " + defaultMapTo)
        }
    }
    if (!(mapped in targetPercentage)) {
        alert(symbol + " is mapped to " + mapped + ", which is not in the target " + targetPercentage)
    }
    if (unusedSymbolsInMapTo.has(symbol)) {
        unusedSymbolsInMapTo.delete(symbol);
    }
    return mapped;
}
function getAllEquityInfo(equities, mapTo, defaultMapTo, outsideHoldings, allPrices, targetPercentage) {
    const unusedSymbolsInMapTo = new Set(Object.keys(mapTo));
    let allEquityInfo = [...equities];
    for (let i = 0; i < allEquityInfo.length; i++) {
        let e = allEquityInfo[i];
        e.source = "Schwab"
        e.mapTo = mapSymbol(e.symbol, mapTo, defaultMapTo, targetPercentage, unusedSymbolsInMapTo);
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
        e.mapTo = mapSymbol(e.symbol, mapTo, defaultMapTo, targetPercentage, unusedSymbolsInMapTo);
        allEquityInfo.push(e)
    }
    console.log("Unused mappings: ", unusedSymbolsInMapTo)
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
    let plan = {}
    for (let symbol in targetPercentage) {
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

    let expectAddValue = cash - bufferCash;
    if (expectAddValue < 0) {
        expectAddValue = 0;
    }
    let expectMarketValue = oldMarketValue + expectAddValue;
    let totalValue = oldMarketValue + cash
    let addValueActual = 0;

    for (let symbol in targetPercentage) {
        let e = plan[symbol];
        e.oldPercentage = e.oldMarketValue / totalValue * 100;
        e.expectPercentage = targetPercentage[symbol]
        e.expectMarketValue = expectMarketValue * e.expectPercentage / 100;
        e.ableMarketValue = e.expectMarketValue;
        e.addValueNeeded = e.ableMarketValue - e.oldMarketValue
    }

    // e.oldMarketValue + e.addValueNeeded always == e.ableMarketValue

    // This section tries to figure out the actual addValueNeeded.
    // Only distributed across the "remain" equities that are underweighted.
    let ableMarketValueOfRemain = oldMarketValue + expectAddValue;
    let targetPercentageOfRemaining = 100;
    var s = new Set(Object.keys(targetPercentage))
    while (true) {
        let equityRemoved = false;
        for (let e of s) {
            if (plan[e].addValueNeeded < 0) {
                plan[e].addValueNeeded = 0;
                plan[e].ableMarketValue = plan[e].oldMarketValue

                ableMarketValueOfRemain -= plan[e].oldMarketValue;
                targetPercentageOfRemaining -= plan[e].expectPercentage;
                s.delete(e);
                equityRemoved = true;
            }
        }
        if (!equityRemoved) {
            break;
        }
        for (let e of s) {
            plan[e].ableMarketValue = ableMarketValueOfRemain * plan[e].expectPercentage / targetPercentageOfRemaining;
            plan[e].addValueNeeded = plan[e].ableMarketValue - plan[e].oldMarketValue;
        }
    }

    for (let symbol in targetPercentage) {
        let e = plan[symbol];
        e.price = allPrices[symbol];
        // e.addShares = Math.round(e.addValueNeeded / e.price)
        e.addShares = e.addValueNeeded / e.price
        // e.addValueActual = e.price * e.addShares;
        // addValueActual += e.addValueActual;
        // e.newMarketValue = e.oldMarketValue + e.addValueActual;
        // e.newPercentage = e.newMarketValue / totalValue * 100
        e.newPercentage = e.ableMarketValue / totalValue * 100
    }
    let planList = []
    for (let symbol in plan) {
        planList.push(plan[symbol]);
    }
    planList.push({
        symbol: 'Cash',
        oldMarketValue: cash,
        oldPercentage: cash / totalValue * 100,
        expectPercentage: null,
        // expectMarketValue: bufferCash,
        expectMarketValue: null,
        // ableMarketValue: null,
        ableMarketValue: cash - expectAddValue,
        // addValueNeeded: null,
        addValueNeeded: -expectAddValue,
        price: null,
        addShares: null,
        // addValueActual: -addValueActual,
        // newMarketValue: cash - addValueActual,
        // newPercentage: (cash - addValueActual) / totalValue * 100
        newPercentage: (cash - expectAddValue) / totalValue * 100
    })
    const fullPlan = {
        planList: planList,
        // cash: cash,
        // bufferCash: bufferCash,
        // addValueActual: addValueActual,
        // bufferCashActual: cash - addValueActual
    }
    console.log(fullPlan);

    return fullPlan;
}

// Can also parse if it does not have dollars.
function parseDollars(str) {
    // Remove "," and "$", then parse as a float.
    return parseFloat(str.replace(/[$,]/g, ""));
}

export { parseDollars, parseSchwabCSV, getAllPrices, inverseMapping, getAllEquityInfo, calculateBuyPlan, runInvestmentManager };

