import { runInvestmentManager } from "./investment_manager.js"
import { INIT_SCHWAB_CSV, INIT_PERSONAL_CONFIG } from "./default_values.js"
import * as d3 from "d3";
import PieChart from "./pie_chart.js"

import DataTable from 'datatables.net-dt';
// import 'datatables.net-buttons-dt';
// import 'datatables.net-responsive-dt';
// import JSZip from 'jszip'; // For Excel export
// import PDFMake from 'pdfmake'; // For PDF export

// import 'datatables.net-buttons/js/buttons.html5.mjs';
// import 'datatables.net-buttons/js/buttons.print.mjs';
// import 'datatables.net-buttons/js/buttons.colVis.mjs';

// DataTable.Buttons.jszip(JSZip);
// DataTable.Buttons.pdfMake(PDFMake);

// This is the main function that handles the button click event
function handleClick() {
    // Get the inputs from the text boxes
    var inputCSV = document.getElementById("inputCSV").value;
    var inputConfig = JSON.parse(document.getElementById("inputConfig").value);

    var outputs = runInvestmentManager(inputCSV, inputConfig);
    var allEquityInfo = outputs[0];
    var plan = outputs[1];


    let renderNum = DataTable.render.number(',', '.', 2, '');

    let DATA_TABLE_DOM = "<'row mb-0'<'col-sm-12'tr>>" +
        "<'row justify-content-between '<'col-6'i><'col-6 d-flex justify-content-end'B>>";
    let DATA_TABLE_BUTTONS = [
        'copy', 'csv', 'excel', 'pdf', 'print'
    ]

    new DataTable('#allEquityInfo', {
        data: allEquityInfo,
        destroy: true,
        paging: false,
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
                title: 'Old $',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'oldPercentage',
                title: 'Old %',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'expectPercentage',
                title: 'Expect %',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'expectMarketValue',
                title: 'Expect $',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'ableMarketValue',
                title: 'Able $',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'addValueNeeded',
                title: 'Able Add$',
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
                data: 'addShares',
                title: 'Add Shares',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'addValueActual',
                title: 'Add $',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'newMarketValue',
                title: 'New $',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'newPercentage',
                title: 'New %',
                render: renderNum,
                className: "dt-body-right",
            },
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
        pieAfter.push({ name: e.symbol, value: e.newMarketValue })
        if (e.expectPercentage) {
            pieExpect.push({ name: e.symbol, value: e.expectPercentage / 100 })
        }
    }
    // pieBefore.push({ name: "Cash to Invest", value: cash - bufferCash })
    // pieBefore.push({ name: "Cash Buffer", value: bufferCash })

    // pieAfter.push({ name: "", value: 0 })
    // pieAfter.push({ name: "Cash Buffer", value: bufferCashActual })

    const WIDTH = 500;


    const SETTINGS = {
        name: d => d.name,
        value: d => d.value,
        width: WIDTH,
        height: WIDTH,
        colors: d3.schemeTableau10,
        format: "$,.2f"
    }
    document.getElementById("pieBefore").replaceChildren(PieChart(pieBefore, SETTINGS));
    document.getElementById("pieAfter").replaceChildren(PieChart(pieAfter, SETTINGS));
    SETTINGS.format = ".0%"
    document.getElementById("pieExpect").replaceChildren(PieChart(pieExpect, SETTINGS));

    // Done. Set button back to disabled to show it's completed.
    document.getElementById("pigBtn").disabled = true;
}

function inputChanged() {
    document.getElementById("pigBtn").disabled = false;
}

function dropFile(dropEvent, element) {
    dropEvent.preventDefault();

    var file = dropEvent.dataTransfer.files[0];
    var reader = new FileReader();
    reader.onload = function (readEvent) {
        element.value = readEvent.target.result;
        inputChanged();
    };
    reader.readAsText(file);

    return false;
}


window.addEventListener("DOMContentLoaded", function () {
    const inputCSV = document.getElementById("inputCSV");
    inputCSV.addEventListener("keyup", inputChanged);
    inputCSV.ondrop = function (dropEvent) {
        return dropFile(dropEvent, inputCSV);
    };

    const inputConfig = document.getElementById("inputConfig");
    inputConfig.addEventListener("keyup", inputChanged);
    inputConfig.ondrop = function (dropEvent) {
        return dropFile(dropEvent, inputConfig);
    };

    const pigBtn = document.getElementById("pigBtn");
    pigBtn.addEventListener("click", handleClick);

    inputCSV.value = INIT_SCHWAB_CSV
    inputConfig.value = JSON.stringify(INIT_PERSONAL_CONFIG, null, 2);
    handleClick();

}, false);
