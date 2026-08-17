import { runInvestmentManager } from "./investment_manager.js"
import { INIT_SCHWAB_CSV, INIT_PERSONAL_CONFIG } from "./default_values.js"
import { isSymbolSellable, setSellableSymbolMode } from "./rebalance_options.js"
import PieChart from "./pie_chart.js"

import DataTable from 'datatables.net-dt';

const VTEB_SYMBOL = "VTEB";
const ALLOCATION_COLOR_DOMAIN = ["VTI", "VXUS", "VTEB", "Cash"];
const ALLOCATION_COLORS = [
    "#82abc7",
    "#83b39e",
    "#d9b866",
    "#b8c1cd",
    "#b0a8d5",
    "#dea596",
    "#9bb5cf",
    "#98bdbd",
    "#cbaac6",
    "#cdb08d"
];
// import 'datatables.net-buttons-dt';
// import 'datatables.net-responsive-dt';
// import JSZip from 'jszip'; // For Excel export
// import PDFMake from 'pdfmake'; // For PDF export

// import 'datatables.net-buttons/js/buttons.html5.mjs';
// import 'datatables.net-buttons/js/buttons.print.mjs';
// import 'datatables.net-buttons/js/buttons.colVis.mjs';

// DataTable.Buttons.jszip(JSZip);
// DataTable.Buttons.pdfMake(PDFMake);

function renderReviewNotes(diagnostics = {}) {
    const details = document.getElementById("reviewNotes");
    const skippedGroup = document.getElementById("skippedRowsGroup");
    const skippedList = document.getElementById("skippedRowsList");
    const defaultGroup = document.getElementById("defaultMappingGroup");
    const defaultList = document.getElementById("defaultMappingList");
    const unusedGroup = document.getElementById("unusedMappingGroup");
    const unusedList = document.getElementById("unusedMappingList");

    const skippedRows = diagnostics.skippedRows ?? [];
    const defaultMappings = Array.from(
        new Map((diagnostics.defaultMappings ?? []).map(item => [
            `${item.symbol}\u0000${item.mapTo}`,
            item
        ])).values()
    ).sort((a, b) => a.symbol.localeCompare(b.symbol));
    const unusedMappings = Array.from(new Set(diagnostics.unusedMappings ?? []))
        .sort((a, b) => a.localeCompare(b));
    const diagnosticCount = skippedRows.length + defaultMappings.length + unusedMappings.length;

    if (diagnosticCount === 0) {
        details.hidden = true;
        details.open = false;
        skippedList.replaceChildren();
        defaultList.replaceChildren();
        unusedList.replaceChildren();
        return;
    }

    details.hidden = false;

    const fieldLabels = {
        quantity: "Quantity",
        price: "Price",
        marketValue: "Market value"
    };
    skippedGroup.hidden = skippedRows.length === 0;
    skippedGroup.querySelector("h3").textContent = `Skipped CSV rows · ${skippedRows.length}`;
    skippedList.replaceChildren(...skippedRows.map(item => {
        const row = document.createElement("li");
        const symbol = document.createElement("code");
        const issues = document.createElement("div");
        symbol.className = "skipped-row-symbol";
        symbol.textContent = item.symbol;
        issues.className = "skipped-row-issues";
        issues.replaceChildren(...item.issues.map(issue => {
            const issueLabel = document.createElement("span");
            const value = issue.value || "empty";
            issueLabel.className = "skipped-row-issue";
            issueLabel.textContent = `${fieldLabels[issue.field] ?? issue.field}: ${value}`;
            return issueLabel;
        }));
        row.append(symbol, issues);
        return row;
    }));

    defaultGroup.hidden = defaultMappings.length === 0;
    defaultGroup.querySelector("h3").textContent = `Using default mapping · ${defaultMappings.length}`;
    defaultList.replaceChildren(...defaultMappings.map(item => {
        const row = document.createElement("li");
        const symbol = document.createElement("code");
        const arrow = document.createElement("span");
        const mapTo = document.createElement("code");
        symbol.textContent = item.symbol;
        symbol.title = item.symbol;
        arrow.className = "default-mapping-arrow";
        arrow.textContent = "→";
        mapTo.textContent = item.mapTo;
        mapTo.title = item.mapTo;
        row.append(symbol, arrow, mapTo);
        return row;
    }));

    unusedGroup.hidden = unusedMappings.length === 0;
    unusedGroup.querySelector("h3").textContent = `Unused mappings · ${unusedMappings.length}`;
    unusedList.replaceChildren(...unusedMappings.map(item => {
        const row = document.createElement("li");
        const symbol = document.createElement("code");
        symbol.textContent = item;
        symbol.title = item;
        row.append(symbol);
        return row;
    }));
}

// This is the main function that handles the button click event
function handleClick() {
    // Get the inputs from the text boxes
    var inputCSV = document.getElementById("inputCSV").value;
    var inputConfigElement = document.getElementById("inputConfig");
    var inputConfig = JSON.parse(inputConfigElement.value);
    var allowVtebSell = document.getElementById("allowVtebSell");
    inputConfig = setSellableSymbolMode(inputConfig, VTEB_SYMBOL, allowVtebSell.checked);
    inputConfigElement.value = JSON.stringify(inputConfig, null, 2);

    var outputs = runInvestmentManager(inputCSV, inputConfig);
    var allEquityInfo = outputs[0];
    var plan = outputs[1];
    var diagnostics = outputs[2];
    renderReviewNotes(diagnostics);


    let renderNum = DataTable.render.number(',', '.', 2, '');
    let renderPerNum = DataTable.render.number(',', '.', 1, '');

    let DATA_TABLE_DOM = "<'row mb-0'<'col-sm-12'tr>>" +
        "<'row justify-content-between '<'col-6'i><'col-6 d-flex justify-content-end'B>>";
    let DATA_TABLE_BUTTONS = [
        'copy', 'csv', 'excel', 'pdf', 'print'
    ]

    new DataTable('#allEquityInfo', {
        data: allEquityInfo,
        destroy: true,
        paging: false,
        info: false,
        dom: DATA_TABLE_DOM,
        buttons: DATA_TABLE_BUTTONS,
        columns: [

            {
                data: 'symbol',
                title: 'Symbol',
            },
            {
                data: 'quantity',
                title: 'Shares',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'price',
                title: 'Price$',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'marketValue',
                title: 'Market Value$',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'source',
                title: 'Source',
            },
            {
                data: 'mapTo',
                title: 'Map To',
            },
        ]
    });

    // Keep the orignail order at the beginning.
    for (let i = 0; i < plan.planList.length; i++) {
        const e = plan.planList[i];
        e.originalOrder = i;
    }
    new DataTable('#plan', {
        data: plan.planList,
        order: [[0, 'asc']],
        destroy: true,
        paging: false,
        info: false,
        dom: DATA_TABLE_DOM,
        buttons: DATA_TABLE_BUTTONS,
        columns: [
            {
                data: 'originalOrder',
                visible: false,
                searchable: false
            },
            {
                data: 'symbol',
                title: 'Symbol',
            },
            {
                data: 'oldMarketValue',
                title: 'Before/$',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'oldPercentage',
                title: 'Before/%',
                render: renderPerNum,
                className: "dt-body-right",
            },
            {
                data: 'expectMarketValue',
                title: 'Expect/$',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'expectPercentage',
                title: 'Expect/%',
                render: renderPerNum,
                className: "dt-body-right",
            },
            {
                data: 'ableMarketValue',
                title: 'After/$',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'newPercentage',
                title: 'After/%',
                render: renderPerNum,
                className: "dt-body-right",
            },
            {
                data: 'addValueNeeded',
                title: 'Buy/$',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'price',
                title: 'Price/$',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'addShares',
                title: 'Buy/Shares',
                render: renderNum,
                className: "dt-body-right",
            },
            // {
            //     data: 'addValueActual',
            //     title: 'Add $',
            //     render: renderNum,
            //     className: "dt-body-right",
            // },
            // {
            //     data: 'newMarketValue',
            //     title: 'New $',
            //     render: renderNum,
            //     className: "dt-body-right",
            // },

        ]
    });

    let cash = plan.cash;
    let bufferCash = plan.bufferCash;
    let addValueActual = plan.addValueActual;
    let bufferCashActual = plan.bufferCashActual;

    let pieBefore = []
    let pieAfter = []
    let pieExpect = []
    for (let i = 0; i < plan.planList.length; i++) {
        const e = plan.planList[i];
        pieBefore.push({ name: e.symbol, value: e.oldMarketValue })
        pieAfter.push({ name: e.symbol, value: e.ableMarketValue })
        if (e.expectPercentage) {
            pieExpect.push({ name: e.symbol, value: e.expectPercentage / 100 })
        }
    }
    // pieBefore.push({ name: "Cash to Invest", value: cash - bufferCash })
    // pieBefore.push({ name: "Cash Buffer", value: bufferCash })

    // pieAfter.push({ name: "", value: 0 })
    // pieAfter.push({ name: "Cash Buffer", value: bufferCashActual })

    const WIDTH = 330;


    const SETTINGS = {
        name: d => d.name,
        value: d => d.value,
        width: WIDTH,
        height: WIDTH,
        labelRadius: WIDTH * 0.35,
        names: ALLOCATION_COLOR_DOMAIN,
        colors: ALLOCATION_COLORS,
        strokeWidth: 2,
        format: "$,.2f",
        showPercentage: true
    }
    document.getElementById("pieBefore").replaceChildren(PieChart(pieBefore, SETTINGS));
    document.getElementById("pieAfter").replaceChildren(PieChart(pieAfter, SETTINGS));
    SETTINGS.format = ".0%"
    SETTINGS.showPercentage = false
    document.getElementById("pieExpect").replaceChildren(PieChart(pieExpect, SETTINGS));

    // Done. Set button back to disabled to show it's completed.
    document.getElementById("pigBtn").disabled = true;
}

function inputChanged() {
    document.getElementById("pigBtn").disabled = false;
}

function syncVtebSellToggleFromConfig() {
    const inputConfig = document.getElementById("inputConfig");
    const allowVtebSell = document.getElementById("allowVtebSell");
    try {
        const config = JSON.parse(inputConfig.value);
        allowVtebSell.checked = isSymbolSellable(config, VTEB_SYMBOL);
        allowVtebSell.indeterminate = false;
        allowVtebSell.disabled = false;
        return true;
    } catch {
        allowVtebSell.indeterminate = true;
        allowVtebSell.disabled = true;
        return false;
    }
}

function configChanged() {
    const configIsValid = syncVtebSellToggleFromConfig();
    document.getElementById("pigBtn").disabled = !configIsValid;
}

function updateVtebSellOption() {
    const inputConfig = document.getElementById("inputConfig");
    const allowVtebSell = document.getElementById("allowVtebSell");
    const config = JSON.parse(inputConfig.value);
    const updatedConfig = setSellableSymbolMode(config, VTEB_SYMBOL, allowVtebSell.checked);
    inputConfig.value = JSON.stringify(updatedConfig, null, 2);
    inputChanged();
}

function readFileInto(file, element) {
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (readEvent) {
        element.value = readEvent.target.result;
        if (element.id === "inputConfig") {
            configChanged();
        } else {
            inputChanged();
        }
    };
    reader.readAsText(file);
}

function dropFile(dropEvent, element) {
    dropEvent.preventDefault();
    readFileInto(dropEvent.dataTransfer.files[0], element);
    return false;
}


window.addEventListener("DOMContentLoaded", function () {
    const inputCSV = document.getElementById("inputCSV");
    inputCSV.addEventListener("input", inputChanged);
    inputCSV.ondrop = function (dropEvent) {
        return dropFile(dropEvent, inputCSV);
    };

    const inputCSVFile = document.getElementById("inputCSVFile");
    inputCSVFile.addEventListener("change", function (changeEvent) {
        readFileInto(changeEvent.target.files[0], inputCSV);
        changeEvent.target.value = "";
    });
    document.getElementById("inputCSVLabel").addEventListener("click", function () {
        inputCSVFile.click();
    });

    const inputConfig = document.getElementById("inputConfig");
    inputConfig.addEventListener("input", configChanged);
    inputConfig.ondrop = function (dropEvent) {
        return dropFile(dropEvent, inputConfig);
    };

    const pigBtn = document.getElementById("pigBtn");
    pigBtn.addEventListener("click", handleClick);

    const allowVtebSell = document.getElementById("allowVtebSell");
    allowVtebSell.addEventListener("change", updateVtebSellOption);

    inputCSV.value = INIT_SCHWAB_CSV
    inputConfig.value = JSON.stringify(INIT_PERSONAL_CONFIG, null, 2);
    syncVtebSellToggleFromConfig();
    handleClick();

}, false);
