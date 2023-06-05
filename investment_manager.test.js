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


test('test parseSchwabCSV complex', () => {
    // Add some more info in 2's Google Sheets and then export as csv.
    SCHWAB_CSV_3 = `
"Positions for account Personal ...977 as of 07:28 PM ET, 2023/06/04",,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,
Symbol,Description,Quantity,Price,Price Change %,Price Change $,Market Value,Day Change %,Day Change $,Cost Basis,Gain/Loss %,Gain/Loss $,Ratings,Reinvest Dividends?,Capital Gains?,% Of Account,Security Type
VXF,,5,143.41,,,717.05,,,,,,,,,,
VTI,,10,212.71,,,2127.10,,,,,,,,,,
AAPL,,7,180.95,,,1266.65,,,,,,,,,,
Cash & Cash Investments,--,--,--,--,--,"$12,345.00",0%,$0.00,--,--,--,--,--,--,N/A,Cash and Money Market
Account Total,--,--,--,--,--,"$16,455.80",0%,$0.00,N/A,N/A,N/A,--,--,--,--,--
`
    expect(investment_manager.parseSchwabCSV(SCHWAB_CSV_3)).toStrictEqual({
        cash: 12345,
        totalMarketValue: 16455.8,
        equities: [
            { symbol: 'VXF', quantity: 5, price: 143.41, marketValue: 717.05 },
            { symbol: 'VTI', quantity: 10, price: 212.71, marketValue: 2127.1 },
            {
                symbol: 'AAPL',
                quantity: 7,
                price: 180.95,
                marketValue: 1266.65
            }
        ]
    });
});