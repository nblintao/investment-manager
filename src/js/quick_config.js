const AMOUNT_FORMATTER = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const QUICK_CONFIG_AMOUNT_BINDINGS = [
    { id: "f-us-bond", label: "F-US-BOND", symbol: "F-US-BOND" },
    { id: "f-us-stk", label: "F-US-STK", symbol: "F-US-STK" }
];

function parsePastedAmount(input) {
    if (typeof input !== "string") {
        return null;
    }

    const match = input.trim().match(
        /^(?:\$\s*)?((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?)$/u
    );
    if (!match) {
        return null;
    }

    const [whole, fraction = ""] = match[1].replaceAll(",", "").split(".");
    const cents = Number(`${whole}${fraction.padEnd(2, "0")}`);
    if (!Number.isSafeInteger(cents)) {
        return null;
    }
    return cents / 100;
}

function isAmountValid(amount) {
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
        return false;
    }
    const cents = Math.round(amount * 100);
    return Number.isSafeInteger(cents) && cents / 100 === amount;
}

function formatAmount(amount) {
    if (!isAmountValid(amount)) {
        throw new TypeError("Amount must be a non-negative number with at most two decimal places.");
    }
    return AMOUNT_FORMATTER.format(amount);
}

function bindingError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
}

function findOutsideHolding(config, binding) {
    if (!Array.isArray(config?.outsideHoldings)) {
        throw bindingError("invalid_collection", "outsideHoldings must be an array.");
    }

    const matches = config.outsideHoldings.filter(holding => holding?.symbol === binding.symbol);
    if (matches.length === 0) {
        throw bindingError("missing", `${binding.label} is not present in outsideHoldings.`);
    }
    if (matches.length > 1) {
        throw bindingError("duplicate", `${binding.label} appears more than once in outsideHoldings.`);
    }
    return matches[0];
}

function readConfigBinding(config, binding) {
    return findOutsideHolding(config, binding).quantity;
}

function writeConfigBinding(config, binding, amount) {
    if (!isAmountValid(amount)) {
        throw new RangeError(`Invalid amount for ${binding.label}.`);
    }
    findOutsideHolding(config, binding).quantity = amount;
    return config;
}

export {
    QUICK_CONFIG_AMOUNT_BINDINGS,
    formatAmount,
    isAmountValid,
    parsePastedAmount,
    readConfigBinding,
    writeConfigBinding
};
