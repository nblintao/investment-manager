import { INIT_PERSONAL_CONFIG } from "./default_values.js";
import { isSymbolSellable, setSellableSymbolMode } from "./rebalance_options.js";

test("setSellableSymbolMode enables only the selected symbol without mutating config", () => {
    const config = { sellableSymbols: ["OTHER"] };

    const updated = setSellableSymbolMode(config, "VTEB", true);

    expect(updated.sellableSymbols).toStrictEqual(["VTEB"]);
    expect(config.sellableSymbols).toStrictEqual(["OTHER"]);
    expect(isSymbolSellable(updated, "VTEB")).toBe(true);
});

test("setSellableSymbolMode disables all selling in buy-only mode", () => {
    const config = { sellableSymbols: ["VTEB", "OTHER"] };

    const updated = setSellableSymbolMode(config, "VTEB", false);

    expect(updated.sellableSymbols).toStrictEqual([]);
    expect(isSymbolSellable(updated, "VTEB")).toBe(false);
});

test("sellable symbols default to an empty list", () => {
    const config = {};

    expect(isSymbolSellable(config, "VTEB")).toBe(false);
    expect(setSellableSymbolMode(config, "VTEB", false)).toStrictEqual({
        sellableSymbols: []
    });
});

test("a malformed sellableSymbols value safely behaves as disabled", () => {
    const config = { sellableSymbols: "VTEB" };

    expect(isSymbolSellable(config, "VTEB")).toBe(false);
    expect(setSellableSymbolMode(config, "VTEB", true).sellableSymbols).toStrictEqual(["VTEB"]);
});

test("the default personal config is buy-only", () => {
    expect(INIT_PERSONAL_CONFIG.sellableSymbols).toStrictEqual([]);
});
