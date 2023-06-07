import { runInvestmentManager, INIT_SCHWAB_CSV, INIT_PERSONAL_CONFIG } from "./investment_manager.js"
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
export function handleClick() {
    // Get the inputs from the text boxes
    var inputCSV = document.getElementById("inputCSV").value;
    var inputConfig = JSON.parse(document.getElementById("inputConfig").value);

    var outputs = runInvestmentManager(inputCSV, inputConfig);
    var allEquityInfo = outputs[0];
    var plan = outputs[1];


    let renderNum = DataTable.render.number(',', '.', 3, '');

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

    new DataTable('#plan', {
        data: plan.planList,
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
                data: 'oldMarketValue',
                title: 'Old$',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'oldPercentage',
                title: 'Old%',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'expectPercentage',
                title: 'Expect%',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'expectMarketValue',
                title: 'Expect$',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'addValueNeeded',
                title: 'Add$ (Need)',
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
                title: 'Add$ (Actual)',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'newMarketValue',
                title: 'New$',
                render: renderNum,
                className: "dt-body-right",
            },
            {
                data: 'newPercentage',
                title: 'New%',
                render: renderNum,
                className: "dt-body-right",
            },
        ]
    });

    console.log(plan.planList)

    let cash = plan.cash;
    let bufferCash = plan.bufferCash;
    let addValueActual = plan.addValueActual;
    let bufferCashActual = plan.bufferCashActual;

    let pieBefore = []
    let pieAfter = []
    for (let i = 0; i < plan.planList.length; i++) {
        const e = plan.planList[i];
        pieBefore.push({ name: e.symbol, value: e.oldMarketValue })
        pieAfter.push({ name: e.symbol, value: e.newMarketValue })
    }
    pieBefore.push({ name: "Cash to Invest", value: cash - bufferCash })
    pieBefore.push({ name: "Cash Buffer", value: bufferCash })

    pieAfter.push({ name: "", value: 0 })
    pieAfter.push({ name: "Cash Buffer", value: bufferCashActual })

    const WIDTH = 500;


    const SETTINGS = {
        name: d => d.name,
        value: d => d.value,
        width: WIDTH,
        height: WIDTH,
        colors: d3.schemeTableau10,
        format: "$,.2f"
    }
    document.getElementById("pieBefore").appendChild(PieChart(pieBefore, SETTINGS));
    document.getElementById("pieAfter").appendChild(PieChart(pieAfter, SETTINGS));

    // let fmt = function (num) {
    //     const options = {
    //         minimumFractionDigits: 2,
    //         maximumFractionDigits: 2
    //     };
    //     return Number(num).toLocaleString('en', options);
    // };
    // document.getElementById("planInfo").innerHTML = `
    //     Cash Before: ${fmt(cash)}<br/>
    //     > Invest ${fmt(cash - bufferCash)}<br/>
    //     > Buffer ${fmt(bufferCash)}<br/>
    //     Actual Invested: ${fmt(addValueActual)}<br/>
    //     Cash After: ${fmt(bufferCashActual)}<br/>
    //     > Buffer ${fmt(bufferCashActual)} <br/>
    // `

    // Done. Set button back to disabled to show it's completed.
    document.getElementById("pigBtn").disabled = true;
}

export function inputChanged() {
    document.getElementById("pigBtn").disabled = false;
}



window.addEventListener("DOMContentLoaded", function () {
    const inputCSV = document.getElementById("inputCSV");
    inputCSV.addEventListener("keyup", inputChanged);
    inputCSV.value = INIT_SCHWAB_CSV


    const inputConfig = document.getElementById("inputConfig");
    inputConfig.addEventListener("keyup", inputChanged);
    inputConfig.value = JSON.stringify(INIT_PERSONAL_CONFIG, null, 2);
    handleClick();

    const pigBtn = document.getElementById("pigBtn");
    pigBtn.addEventListener("click", handleClick);
}, false);
