import { INIT_PERSONAL_CONFIG } from "./default_values.js";
import {
    QUICK_CONFIG_AMOUNT_BINDINGS,
    formatAmount,
    isAmountValid,
    parsePastedAmount,
    readConfigBinding,
    writeConfigBinding
} from "./quick_config.js";

function caughtError(action) {
    try {
        action();
    } catch (error) {
        return error;
    }
    throw new Error("Expected action to throw.");
}

describe("quick amount parsing", () => {
    test.each([
        ["325792", 325792],
        ["$325,792.00", 325792],
        ["  $ 419,408.14  ", 419408.14],
        ["0.5", 0.5]
    ])("parses %p", (input, expected) => {
        expect(parsePastedAmount(input)).toBe(expected);
    });

    test("rejects malformed, negative, over-precise, and unsafe amounts", () => {
        for (const input of [
            "",
            "$",
            "-1",
            "+1",
            "(1,000)",
            "1 2 3",
            "12,34.56",
            "1.234",
            "1e3",
            "9007199254740993"
        ]) {
            expect(parsePastedAmount(input)).toBeNull();
        }
    });

    test("validates the numeric value stored in config", () => {
        expect(isAmountValid(0)).toBe(true);
        expect(isAmountValid(1234.56)).toBe(true);
        expect(isAmountValid(-1)).toBe(false);
        expect(isAmountValid(1.234)).toBe(false);
        expect(isAmountValid(Infinity)).toBe(false);
        expect(isAmountValid("1234.56")).toBe(false);
    });

    test("formats dollar amounts with grouping and two decimal places", () => {
        expect(formatAmount(325792)).toBe("325,792.00");
        expect(formatAmount(419408.14)).toBe("419,408.14");
    });
});

describe("quick amount config bindings", () => {
    const [fUsBondBinding, fUsStkBinding] = QUICK_CONFIG_AMOUNT_BINDINGS;

    test("declares the two outside-holding symbols", () => {
        expect(QUICK_CONFIG_AMOUNT_BINDINGS).toStrictEqual([
            { id: "f-us-bond", label: "F-US-BOND", symbol: "F-US-BOND" },
            { id: "f-us-stk", label: "F-US-STK", symbol: "F-US-STK" }
        ]);
        expect(readConfigBinding(INIT_PERSONAL_CONFIG, fUsBondBinding)).toBe(325792);
        expect(readConfigBinding(INIT_PERSONAL_CONFIG, fUsStkBinding)).toBe(419408.14);
    });

    test("updates only the selected holding", () => {
        const config = {
            name: "personal",
            outsideHoldings: [
                { symbol: "F-US-BOND", quantity: 10, note: "keep" },
                { symbol: "F-US-STK", quantity: 20 }
            ]
        };

        expect(writeConfigBinding(config, fUsBondBinding, 1234.56)).toBe(config);
        expect(config).toStrictEqual({
            name: "personal",
            outsideHoldings: [
                { symbol: "F-US-BOND", quantity: 1234.56, note: "keep" },
                { symbol: "F-US-STK", quantity: 20 }
            ]
        });
    });

    test("reports missing and duplicate symbols without guessing", () => {
        const missing = caughtError(() =>
            readConfigBinding({ outsideHoldings: [{ symbol: "F-US-STK", quantity: 20 }] }, fUsBondBinding)
        );
        const duplicate = caughtError(() =>
            readConfigBinding({
                outsideHoldings: [
                    { symbol: "F-US-BOND", quantity: 10 },
                    { symbol: "F-US-BOND", quantity: 20 }
                ]
            }, fUsBondBinding)
        );

        expect(missing.code).toBe("missing");
        expect(duplicate.code).toBe("duplicate");
    });

    test("rejects malformed collections and invalid writes", () => {
        expect(caughtError(() => readConfigBinding({}, fUsBondBinding)).code).toBe("invalid_collection");

        const config = { outsideHoldings: [{ symbol: "F-US-BOND", quantity: 10 }] };
        expect(() => writeConfigBinding(config, fUsBondBinding, -1)).toThrow(RangeError);
        expect(config.outsideHoldings[0].quantity).toBe(10);
    });
});
