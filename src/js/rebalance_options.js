function getSellableSymbols(config) {
    if (!Array.isArray(config?.sellableSymbols)) {
        return [];
    }
    return config.sellableSymbols.filter(symbol => typeof symbol === "string");
}

function isSymbolSellable(config, symbol) {
    return getSellableSymbols(config).includes(symbol);
}

function setSellableSymbolMode(config, symbol, enabled) {
    return {
        ...config,
        sellableSymbols: enabled ? [symbol] : []
    };
}

export { isSymbolSellable, setSellableSymbolMode };
