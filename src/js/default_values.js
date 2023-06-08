export const INIT_PERSONAL_CONFIG = {
    hardcodePrice: {
        "VTI": 212.70,
        "VXUS": 55.74
    },
    bufferCash: 1000,
    outsideHoldings: [
        { symbol: 'VTI', quantity: 152.69587 },
        { symbol: 'VXUS', quantity: 376.48986 },
    ],
    targetPercentage: {
        "VTI": 54,
        "VXUS": 36,
        "VTEB": 10
    },
    defaultMapTo: null,
    mapping: {
        "VXUS": [
            // Foreign developed stocks
            "VEA", "SCHF",
            // Emerging market stocks
            "VWO", "IEMG"
        ],
        // Municipal bonds
        "VTEB": [
            "TFI", "MUB"
        ],
        "VTI": [
            // US stocks
            "VXF", "VB",
            // Dividend growth stocks
            "VIG", "SCHD",
            // Direct indexing
            "A", "AAL", "AAPL", "ABBV", "ABT", "ACGL", "ACI", "ACN", "ADI", "ADM", "ADP", "ADSK", "AEE", "AFL", "AGR", "AIG", "AJG", "ALL", "ALNY", "AMAT", "AME", "AMGN", "AMP", "AMZN", "ANET", "ANSS", "AON", "APD", "APH", "APO", "APP", "APTV", "ARES", "ATVI", "AVB", "AVGO", "AWK", "AXP", "BA", "BAC", "BBWI", "BBY", "BDX", "BEN", "BF/A", "BIIB", "BK", "BKI", "BLK", "BMRN", "BMY", "BRK/B", "BRO", "BSX", "BSY", "BURL", "BWA", "BX", "BXP", "C", "CAG", "CAH", "CARR", "CAT", "CB", "CBOE", "CBRE", "CCL", "CDNS", "CDW", "CE", "CEG", "CFG", "CHD", "CHRW", "CHWY", "CINF", "CL", "CLX", "CMCSA", "CME", "CMI", "CMS", "COO", "COP", "COST", "CPB", "CPRT", "CRM", "CSCO", "CSGP", "CTAS", "CTRA", "CTSH", "CTVA", "CVX", "D", "DASH", "DD", "DDOG", "DE", "DELL", "DFS", "DGX", "DHI", "DISH", "DKNG", "DLR", "DOCU", "DOV", "DOW", "DRI", "DUK", "DVA", "DVN", "DXCM", "EA", "EBAY", "ECL", "ED", "EDR", "EIX", "ELV", "EMR", "ENPH", "EOG", "EPAM", "EQIX", "EQT", "ESS", "ETN", "ETSY", "EVRG", "EW", "EXC", "EXPD", "EXPE", "F", "FANG", "FAST", "FBIN", "FCX", "FDS", "FDX", "FE", "FERG", "FI", "FIS", "FITB", "FNF", "FSLR", "FTV", "GD", "GE", "GEHC", "GEN", "GILD", "GIS", "GL", "GM", "GOOG", "GOOGL", "GPC", "GRMN", "GS", "GWW", "HAL", "HAS", "HBAN", "HCA", "HD", "HES", "HIG", "HOLX", "HON", "HPE", "HPQ", "HRL", "HSY", "HUBB", "HUM", "HWM", "HZNP", "IBKR", "IBM", "IDXX", "INCY", "INTC", "INTU", "IP", "IPG", "IQV", "IR", "IRM", "ISRG", "ITW", "JBHT", "JCI", "JNJ", "JPM", "K", "KDP", "KEY", "KHC", "KLAC", "KMB", "KMI", "KMX", "KO", "KR", "L", "LBRDK", "LDOS", "LEN", "LIN", "LKQ", "LLY", "LMT", "LNG", "LNT", "LOW", "LRCX", "LULU", "LVS", "LW", "LYB", "MA", "MAR", "MAS", "MCD", "MCHP", "MCK", "MCO", "MDB", "MDLZ", "MDT", "MET", "META", "MGM", "MKC", "MKL", "MKTX", "MMC", "MMM", "MNST", "MO", "MOH", "MPC", "MRK", "MRNA", "MRO", "MS", "MSCI", "MSFT", "MSI", "MTN", "MU", "NDAQ", "NEM", "NET", "NFLX", "NI", "NKE", "NLY", "NOC", "NTAP", "NUE", "NVDA", "NWS", "NWSA", "O", "ODFL", "OKE", "OKTA", "OMC", "ON", "ORCL", "ORLY", "OTIS", "OXY", "PANW", "PATH", "PAYX", "PCAR", "PCG", "PEAK", "PEG", "PEP", "PFE", "PFG", "PG", "PGR", "PH", "PHM", "PINS", "PLD", "PLTR", "PM", "PODD", "POOL", "PPG", "PPL", "PRU", "PSA", "PSX", "PWR", "PXD", "PYPL", "RBLX", "RE", "REG", "REGN", "RIVN", "RJF", "RMD", "ROK", "ROKU", "ROL", "ROP", "ROST", "RPRX", "RSG", "RTX", "RVTY", "SBUX", "SGEN", "SHW", "SJM", "SLB", "SNA", "SNAP", "SNOW", "SNPS", "SPG", "SPGI", "SPLK", "SQ", "SRE", "SSNC", "STLD", "STT", "STX", "SUI", "SWK", "SYK", "T", "TAP", "TEAM", "TEL", "TER", "TFC", "TFX", "TGT", "TJX", "TMUS", "TOST", "TROW", "TRU", "TRV", "TSCO", "TSLA", "TSN", "TT", "TTD", "TTWO", "TW", "TWLO", "TXN", "TXT", "TYL", "UAL", "UBER", "UHS", "UNH", "UNP", "UPS", "URI", "USB", "V", "VFC", "VICI", "VLO", "VMC", "VMW", "VRTX", "VST", "VTRS", "VZ", "WAB", "WBA", "WBD", "WCN", "WELL", "WM", "WMB", "WMT", "WPC", "WST", "WTW", "WY", "XOM", "XYL", "YUM", "Z", "ZBH", "ZI", "ZTS"
        ]
    },
}

export const INIT_SCHWAB_CSV = `
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
Cash & Cash Investments,--,--,--,--,--,"$50,000.00",0%,$0.00,--,--,--,--,--,--,N/A,Cash and Money Market
Account Total,--,--,--,--,--,"$999,999.99",0%,$0.00,N/A,N/A,N/A,--,--,--,--,--
`
