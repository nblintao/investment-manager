const investment_manager = require('./investment_manager');

test("test parseDollars", () => {
    expect(investment_manager.parseDollars("$1,234.56")).toBe(1234.56);
    expect(investment_manager.parseDollars("1,234.56")).toBe(1234.56);
    expect(investment_manager.parseDollars("1234.56")).toBe(1234.56);
    expect(investment_manager.parseDollars("$1234.56")).toBe(1234.56);
    expect(investment_manager.parseDollars("$0")).toBe(0);
    expect(investment_manager.parseDollars("0")).toBe(0);
    expect(investment_manager.parseDollars("0.00")).toBe(0);
});






test('test parseSchwabCSV simple', () => {
    // Downloaded from Schwab.
    SCHWAB_CSV_1 = `
"Positions for account Personal ...977 as of 07:28 PM ET, 2023/06/04","","","","","","","","","","","","","","","",""
"","","","","","","","","","","","","","","","",""
"Symbol","Description","Quantity","Price","Price Change %","Price Change $","Market Value","Day Change %","Day Change $","Cost Basis","Gain/Loss %","Gain/Loss $","Ratings","Reinvest Dividends?","Capital Gains?","% Of Account","Security Type"
"Cash & Cash Investments","--","--","--","--","--","$0.00","0%","$0.00","--","--","--","--","--","--","N/A","Cash and Money Market"
"Account Total","--","--","--","--","--","$0.00","0%","$0.00","N/A","N/A","N/A","--","--","--","--","--"
`
    expect(investment_manager.parseSchwabCSV(SCHWAB_CSV_1)).toStrictEqual({
        cash: 0,
        equities: [],
        totalMarketValue: 0
    });

    // Upload 1 to Google Sheets and then export as csv.
    SCHWAB_CSV_2 = `
"Positions for account Personal ...977 as of 07:28 PM ET, 2023/06/04",,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,
Symbol,Description,Quantity,Price,Price Change %,Price Change $,Market Value,Day Change %,Day Change $,Cost Basis,Gain/Loss %,Gain/Loss $,Ratings,Reinvest Dividends?,Capital Gains?,% Of Account,Security Type
Cash & Cash Investments,--,--,--,--,--,$0.00,0%,$0.00,--,--,--,--,--,--,N/A,Cash and Money Market
Account Total,--,--,--,--,--,$0.00,0%,$0.00,N/A,N/A,N/A,--,--,--,--,--
`
    expect(investment_manager.parseSchwabCSV(SCHWAB_CSV_2)).toStrictEqual({
        cash: 0,
        equities: [],
        totalMarketValue: 0
    });
});

// Add some more info in 2's Google Sheets and then export as csv.
SCHWAB_CSV_3 = `
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
EQUITIES = [
    {
        symbol: 'VXF',
        quantity: 35,
        price: 143.41,
        marketValue: 5019.35
    },
    {
        symbol: 'VB',
        quantity: 69,
        price: 191.21,
        marketValue: 13193.49
    },
    {
        symbol: 'MSFT',
        quantity: 51,
        price: 335.4,
        marketValue: 17105.4
    },
    {
        symbol: 'AAPL',
        quantity: 95,
        price: 180.95,
        marketValue: 17190.25
    },
    {
        symbol: 'NVDA',
        quantity: 69,
        price: 393.27,
        marketValue: 27135.63
    },
    {
        symbol: 'GOOGL',
        quantity: 82,
        price: 124.67,
        marketValue: 10222.94
    },
    { symbol: 'AMZN', quantity: 6, price: 124.25, marketValue: 745.5 },
    {
        symbol: 'GOOG',
        quantity: 42,
        price: 125.23,
        marketValue: 5259.66
    },
    {
        symbol: 'META',
        quantity: 50,
        price: 272.61,
        marketValue: 13630.5
    },
    { symbol: 'VEA', quantity: 40, price: 45.99, marketValue: 1839.6 },
    {
        symbol: 'SCHF',
        quantity: 42,
        price: 35.51,
        marketValue: 1491.42
    },
    { symbol: 'VWO', quantity: 30, price: 40.35, marketValue: 1210.5 },
    {
        symbol: 'IEMG',
        quantity: 89,
        price: 49.21,
        marketValue: 4379.69
    },
    {
        symbol: 'VIG',
        quantity: 78,
        price: 157.27,
        marketValue: 12267.06
    },
    {
        symbol: 'SCHD',
        quantity: 59,
        price: 71.24,
        marketValue: 4203.16
    },
    {
        symbol: 'VTEB',
        quantity: 47,
        price: 49.84,
        marketValue: 2342.48
    },
    { symbol: 'TFI', quantity: 92, price: 45.81, marketValue: 4214.52 },
    {
        symbol: 'MUB',
        quantity: 39,
        price: 105.96,
        marketValue: 4132.44
    }
]
test('test parseSchwabCSV complex', () => {
    expect(investment_manager.parseSchwabCSV(SCHWAB_CSV_3)).toStrictEqual({
        cash: 123456,
        totalMarketValue: 269039.59,
        equities: EQUITIES
    });
});


ALL_PRICES = {
    "AAPL": 180.95, "AMZN": 124.25, "GOOG": 125.23, "GOOGL": 124.67, "IEMG": 49.21, "META": 272.61, "MSFT": 335.4, "MUB": 105.96, "NVDA": 393.27, "SCHD": 71.24, "SCHF": 35.51, "TFI": 45.81, "VB": 191.21, "VEA": 45.99, "VIG": 157.27, "VTEB": 49.84, "VTI": 212.72, "VWO": 40.35, "VXF": 143.41, "VXUS": 55.94
}
test("test getAllPrices", () => {
    expect(investment_manager.getAllPrices(
        EQUITIES,
    )).toStrictEqual({
        "AAPL": 180.95, "AMZN": 124.25, "GOOG": 125.23, "GOOGL": 124.67, "IEMG": 49.21, "META": 272.61, "MSFT": 335.4, "MUB": 105.96, "NVDA": 393.27, "SCHD": 71.24, "SCHF": 35.51, "TFI": 45.81, "VB": 191.21, "VEA": 45.99, "VIG": 157.27, "VTEB": 49.84, "VWO": 40.35, "VXF": 143.41
    });

    expect(investment_manager.getAllPrices(
        EQUITIES,
        {
            "VTI": 212.72,
            "VXUS": 55.94
        }
    )).toStrictEqual(ALL_PRICES);
});


let MAP_TO = {
    VXF: 'VTI',
    VB: 'VTI',
    VIG: 'VTI',
    SCHD: 'VTI',
    VTI: 'VTI',
    VEA: 'VXUS',
    SCHF: 'VXUS',
    VWO: 'VXUS',
    IEMG: 'VXUS',
    VXUS: 'VXUS',
    TFI: 'VTEB',
    MUB: 'VTEB',
    VTEB: 'VTEB'
}
test("test inverseMapping", () => {
    expect(investment_manager.inverseMapping(
        {
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

    )).toStrictEqual(MAP_TO);
});


ALL_EQUITY_INFO = [
    {
        symbol: 'VXF',
        quantity: 35,
        price: 143.41,
        marketValue: 5019.35,
        source: 'Schwab',
        mapTo: 'VTI'
    },
    {
        symbol: 'VB',
        quantity: 69,
        price: 191.21,
        marketValue: 13193.49,
        source: 'Schwab',
        mapTo: 'VTI'
    },
    {
        symbol: 'MSFT',
        quantity: 51,
        price: 335.4,
        marketValue: 17105.4,
        source: 'Schwab',
        mapTo: 'VTI'
    },
    {
        symbol: 'AAPL',
        quantity: 95,
        price: 180.95,
        marketValue: 17190.25,
        source: 'Schwab',
        mapTo: 'VTI'
    },
    {
        symbol: 'NVDA',
        quantity: 69,
        price: 393.27,
        marketValue: 27135.63,
        source: 'Schwab',
        mapTo: 'VTI'
    },
    {
        symbol: 'GOOGL',
        quantity: 82,
        price: 124.67,
        marketValue: 10222.94,
        source: 'Schwab',
        mapTo: 'VTI'
    },
    {
        symbol: 'AMZN',
        quantity: 6,
        price: 124.25,
        marketValue: 745.5,
        source: 'Schwab',
        mapTo: 'VTI'
    },
    {
        symbol: 'GOOG',
        quantity: 42,
        price: 125.23,
        marketValue: 5259.66,
        source: 'Schwab',
        mapTo: 'VTI'
    },
    {
        symbol: 'META',
        quantity: 50,
        price: 272.61,
        marketValue: 13630.5,
        source: 'Schwab',
        mapTo: 'VTI'
    },
    {
        symbol: 'VEA',
        quantity: 40,
        price: 45.99,
        marketValue: 1839.6,
        source: 'Schwab',
        mapTo: 'VXUS'
    },
    {
        symbol: 'SCHF',
        quantity: 42,
        price: 35.51,
        marketValue: 1491.42,
        source: 'Schwab',
        mapTo: 'VXUS'
    },
    {
        symbol: 'VWO',
        quantity: 30,
        price: 40.35,
        marketValue: 1210.5,
        source: 'Schwab',
        mapTo: 'VXUS'
    },
    {
        symbol: 'IEMG',
        quantity: 89,
        price: 49.21,
        marketValue: 4379.69,
        source: 'Schwab',
        mapTo: 'VXUS'
    },
    {
        symbol: 'VIG',
        quantity: 78,
        price: 157.27,
        marketValue: 12267.06,
        source: 'Schwab',
        mapTo: 'VTI'
    },
    {
        symbol: 'SCHD',
        quantity: 59,
        price: 71.24,
        marketValue: 4203.16,
        source: 'Schwab',
        mapTo: 'VTI'
    },
    {
        symbol: 'VTEB',
        quantity: 47,
        price: 49.84,
        marketValue: 2342.48,
        source: 'Schwab',
        mapTo: 'VTEB'
    },
    {
        symbol: 'TFI',
        quantity: 92,
        price: 45.81,
        marketValue: 4214.52,
        source: 'Schwab',
        mapTo: 'VTEB'
    },
    {
        symbol: 'MUB',
        quantity: 39,
        price: 105.96,
        marketValue: 4132.44,
        source: 'Schwab',
        mapTo: 'VTEB'
    },
    {
        symbol: 'VTI',
        quantity: 152.69587,
        price: 212.72,
        marketValue: 32481.465466400005,
        source: 'Outside',
        mapTo: 'VTI'
    },
    {
        symbol: 'VXUS',
        quantity: 376.48986,
        price: 55.94,
        marketValue: 21060.8427684,
        source: 'Outside',
        mapTo: 'VXUS'
    }
]
TARGET_PERCENTAGE = {
    "VTI": 54,
    "VXUS": 36,
    "VTEB": 10
}
test("test analyzeAllEquities", () => {
    expect(investment_manager.getAllEquityInfo(
        EQUITIES, MAP_TO, "VTI",
        [
            { symbol: 'VTI', quantity: 152.69587 },
            { symbol: 'VXUS', quantity: 376.48986 },
        ],
        ALL_PRICES,
        TARGET_PERCENTAGE
    )).toStrictEqual(ALL_EQUITY_INFO);
});
PLAN = {
    plan: {
        VTI: {
            oldMarketValue: 158454.40546640003,
            oldPercentage: 79.57498591145485,
            expectPercentage: 54,
            expectMarketValue: 173114.22504679204,
            addValueNeeded: 14659.81958039201,
            price: 212.72,
            addShares: 69,
            addValueActual: 14677.68,
            newMarketValue: 173132.08546640002,
            newPercentage: 54.00557125018797
        },
        VXUS: {
            oldMarketValue: 29982.0527684,
            oldPercentage: 15.056832403109391,
            expectPercentage: 36,
            expectMarketValue: 115409.483364528,
            addValueNeeded: 85427.430596128,
            price: 55.94,
            addShares: 1527,
            addValueActual: 85420.37999999999,
            newMarketValue: 115402.43276839999,
            newPercentage: 35.99780068800926
        },
        VTEB: {
            oldMarketValue: 10689.439999999999,
            oldPercentage: 5.368181685435767,
            expectPercentage: 10,
            expectMarketValue: 32058.189823480003,
            addValueNeeded: 21368.749823480004,
            price: 49.84,
            addShares: 429,
            addValueActual: 21381.36,
            newMarketValue: 32070.8,
            newPercentage: 10.003933527310629
        }
    },
    cash: 123456,
    bufferCash: 2000,
    addValueActual: 121479.42,
    bufferCashActual: 1976.5800000000017
}
test("test calculateBuyPlan", () => {
    expect(investment_manager.calculateBuyPlan(
        ALL_PRICES,
        ALL_EQUITY_INFO,
        TARGET_PERCENTAGE,
        // cash
        123456,
        // remain cash
        2000
    )).toStrictEqual(PLAN);
});

PERSONAL_CONFIG = {
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
test("test main", () => {
    expect(investment_manager.main(SCHWAB_CSV_3, PERSONAL_CONFIG
    )).toStrictEqual(PLAN)
})
