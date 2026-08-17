import { jest } from "@jest/globals";
import { INIT_PERSONAL_CONFIG, INIT_SCHWAB_CSV } from "./default_values.js";
import { parseSchwabCSV, runInvestmentManager } from "./investment_manager.js";

test("the default CSV uses clearly illustrative integer values", () => {
    const schwab = parseSchwabCSV(INIT_SCHWAB_CSV);
    const securitiesTotal = schwab.equities.reduce((sum, item) => sum + item.marketValue, 0);

    expect(INIT_SCHWAB_CSV).toContain("Positions for account Demo ...000");
    expect(schwab.equities.every(item =>
        Number.isInteger(item.quantity) &&
        Number.isInteger(item.price) &&
        Number.isInteger(item.marketValue)
    )).toBe(true);
    expect(Number.isInteger(schwab.cash)).toBe(true);
    expect(securitiesTotal + schwab.cash).toBe(schwab.totalMarketValue);
});

test("the default data demonstrates a buy-only rebalance across every target", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    let result;
    try {
        result = runInvestmentManager(INIT_SCHWAB_CSV, INIT_PERSONAL_CONFIG)[1];
    } finally {
        logSpy.mockRestore();
        warnSpy.mockRestore();
    }

    const plan = Object.fromEntries(result.planList.map(item => [item.symbol, item]));
    for (const [symbol, targetPercentage] of Object.entries(INIT_PERSONAL_CONFIG.targetPercentage)) {
        expect(plan[symbol].addValueNeeded).toBeGreaterThan(0);
        expect(Math.abs(plan[symbol].oldPercentage - targetPercentage)).toBeGreaterThan(2);
        expect(Math.abs(plan[symbol].newPercentage - targetPercentage)).toBeLessThan(0.02);
    }
    expect(INIT_PERSONAL_CONFIG.sellableSymbols).toStrictEqual([]);
    expect(plan.Cash.ableMarketValue).toBe(INIT_PERSONAL_CONFIG.bufferCash);
});
