var filterOptionData = {
    startDate: "",
    endDate: "",

    accident_1: false,
    accident_2: false,
    accident_3: false,

    weather_sp: false,
    weather_su: false,
    weather_au: false,
    weather_wi: false
};

function onShowCameraGeoPositionData(event) {
    console.log('Camera Position:', event.latlng.lat, event.latlng.lng);
}

function resetCanvas(){
    $('#barChart').remove(); // this is my <canvas> element
    $('#bar-container').append('<canvas id="barChart"><canvas>');
    
}

function initialStatics()
{
    evtType1 = evtType2 = evtType3 = evtType4 = evtType5 = evtType6 = evtType7 = evtType8 = 0;
    
    for (var i = 0; i < statisticsInfo.length; i++) {        
        for (var j = 0; j < statisticsInfo[i].evt.length; j++) {            
            switch (statisticsInfo[i].evt[j].type) {
                case 1:
                    evtType1 += statisticsInfo[i].evt[j].count;
                    break;
                case 2:
                    evtType2 += statisticsInfo[i].evt[j].count;
                    break;
                case 3:
                    evtType3 += statisticsInfo[i].evt[j].count;
                    break;
                case 4:
                    evtType4 += statisticsInfo[i].evt[j].count;
                    break;
                case 5:
                    evtType5 += statisticsInfo[i].evt[j].count;
                    break;
                case 6:
                    evtType6 += statisticsInfo[i].evt[j].count;
                    break;
                case 7:
                    evtType7 += statisticsInfo[i].evt[j].count;
                    break;
                case 8:
                    evtType8 += statisticsInfo[i].evt[j].count;
                    break;
            }
        }
    }
}

function zoneChart(zoneCode) {
    resetCanvas();
    
    var btnvideo = document.getElementById("btnvideo");
    var canvas = document.getElementById("barChart");
    var ctx = canvas.getContext("2d");
    var zoneID = 0, areaID = 0, cameraID = 0;
    var idArray = zoneCode.split("-");

    zoneID = parseInt(idArray[0]);
    areaID = parseInt(idArray[1]);
    cameraID = parseInt(idArray[2]);
    btnvideo.disabled = false; 
    btnvideo.style.color = "black";
    btnvideo.style.borderColor = "black";
    btnvideo.href = 'simulator.html?zone=' + zoneID + '&area=' + areaID + '&camera=' + cameraID;
    evtType1 = evtType2 = evtType3 = evtType4 = evtType5 = evtType6 = evtType7 = evtType8 = 0;

    for (var i = 0; i < statisticsInfo.length; i++) {
        if (statisticsInfo[i].zone == zoneID && statisticsInfo[i].area == areaID && statisticsInfo[i].camera == cameraID) {
            for (var j = 0; j < statisticsInfo[i].evt.length; j++) {
                switch (statisticsInfo[i].evt[j].type) {
                    case 1:
                        evtType1 += statisticsInfo[i].evt[j].count;
                        break;
                    case 2:
                        evtType2 += statisticsInfo[i].evt[j].count;
                        break;
                    case 3:
                        evtType3 += statisticsInfo[i].evt[j].count;
                        break;
                    case 4:
                        evtType4 += statisticsInfo[i].evt[j].count;
                        break;
                    case 5:
                        evtType5 += statisticsInfo[i].evt[j].count;
                        break;
                    case 6:
                        evtType6 += statisticsInfo[i].evt[j].count;
                        break;
                    case 7:
                        evtType7 += statisticsInfo[i].evt[j].count;
                        break;
                    case 8:
                        evtType8 += statisticsInfo[i].evt[j].count;
                        break;
                }
            }
            break;
        }
    }
    Chart.defaults.global.defaultFontColor = 'black';
    Chart.defaults.global.defaultFontSize = 12;

    var chartLabel = ["Type-1", "Type-2", "Type-3", "Type-4", "Type-5", "Type-6", "Type-7", "Type-8"];
    var chartData = [evtType1, evtType2, evtType3, evtType4, evtType5, evtType6, evtType7, evtType8];

    var data = {
        labels: chartLabel,
        datasets: [
            {
                label: "Statistics",
                backgroundColor: "#ff9900",
                data: chartData
            }
        ]
    };
    var options = {
        hover: {
            mode: 'index',
            intersect: true
        },
        tooltips: {
            mode: 'index',
            intersect: true,
            position: 'average',

            filter: (item) => (item.value !== 'NaN' && 1 * item.value > 0),

            backgroundColor: '#202631',
            bodyFontColor: '#fff',
            titleFontSize: 14,
            titleFontColor: '#fff',
            bodyFontSize: 12,
            footerFontSize: 14,

            xPadding: 4,
            yPadding: 4,
            cornerRadius: 8,

            titleSpacing: 6,
            titleMarginBottom: 4,
            bodySpacing: 6,

            caretPadding: 4,

            callbacks: {
                title: function (tooltipItem, data) {
                    var total = 0;
                    for (var i = 0; i < tooltipItem.length; i++) {
                        total += (1 * tooltipItem[i].value) || 0
                    }

                    return [tooltipItem[0].label, total]
                }
            }
        },
        legend: {
            display: false
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,

                },
                stacked: true
            }],
            xAxes: [{
                stacked: true
            }]

        },

        plugins: {
            crosshair: {
                line: {
                    color: '#00000099',
                    width: 1,
                    dashPattern: [5, 5]
                },

                zoom: {
                    enabled: false
                },

                snap: {
                    enabled: true
                }
            }
        }
    };
    var myBarChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options
    });

    
    showStatisticsPanel();
};

function eventChart() {
    resetCanvas();
    var canvas = document.getElementById("barChart");
    var ctx = canvas.getContext("2d");
    Chart.defaults.global.defaultFontColor = 'black';
    Chart.defaults.global.defaultFontSize = 12;

    var chartLabel = ["Type-1", "Type-2", "Type-3", "Type-4", "Type-5", "Type-6", "Type-7", "Type-8"];
    var chartData = [evtType1, evtType2, evtType3, evtType4, evtType5, evtType6, evtType7, evtType8];

    var data = {
        labels: chartLabel,
        datasets: [
            {
                label: "Statistics",
                backgroundColor: "#ff9900",
                data: chartData
            }
        ]
    };
    var options = {
        hover: {
            mode: 'index',
            intersect: true
        },
        tooltips: {
            mode: 'index',
            intersect: true,
            position: 'average',

            filter: (item) => (item.value !== 'NaN' && 1 * item.value > 0),

            backgroundColor: '#202631',
            bodyFontColor: '#fff',
            titleFontSize: 14,
            titleFontColor: '#fff',
            bodyFontSize: 12,
            footerFontSize: 14,

            xPadding: 4,
            yPadding: 4,
            cornerRadius: 8,

            titleSpacing: 6,
            titleMarginBottom: 4,
            bodySpacing: 6,

            caretPadding: 4,

            callbacks: {
                title: function (tooltipItem, data) {
                    var total = 0;
                    for (var i = 0; i < tooltipItem.length; i++) {
                        total += (1 * tooltipItem[i].value) || 0
                    }

                    return [tooltipItem[0].label, total]
                }
            }
        },
        legend: {
            display: false
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,

                },
                stacked: true
            }],
            xAxes: [{
                stacked: true
            }]

        },

        plugins: {
            crosshair: {
                line: {
                    color: '#00000099',
                    width: 1,
                    dashPattern: [5, 5]
                },

                zoom: {
                    enabled: false
                },

                snap: {
                    enabled: true
                }
            }
        }
    };
    var myBarChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options
    });
}

async function kmeanChart() {
    //alert("aaaa");
    var canvas_plot = document.getElementById("plotChart");
    var ctx_plot = canvas_plot.getContext("2d");
    var data = [];
    var chartData = [];
    var chartColor = [];

    data = await getKmeanData();
    console.log(data);

    for (var i = 0; i < data.length / 3; i++) {
        var data_panel = { x: data[i], y: data[i + data.length / 3] };

        chartData.push(data_panel);
        chartColor.push(data[i + (data.length / 3) * 2]);
    }

    var options = { responsive: true, maintainAspectRatio: false };

    var plotChart = new Chart(ctx_plot, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Statistics Scater',
                data: chartData,
                colorArea: chartColor,
                borderColor: '#2196f3',
                backgroundColor: '#2196f3',
                fill: false,
                pointBackgroundColor: function (context) {
                    var index = context.dataIndex;
                    var value = context.dataset.colorArea[index];
                    return value == 1 ? 'red' :  // draw negative values in red
                        value == 2 ? 'blue' :    // else, alternate values in blue and green
                            'green';
                }
            }]
        },
        options: options
    });
}



async function showStatistics() {
    var check_acc_1 = document.getElementById("idAccident_1");
    var check_acc_2 = document.getElementById("idAccident_2");
    var check_acc_3 = document.getElementById("idAccident_3");
    var check_acc_4 = document.getElementById("idAccident_4");
    var check_acc_5 = document.getElementById("idAccident_5");
    var check_acc_6 = document.getElementById("idAccident_6");
    var check_acc_7 = document.getElementById("idAccident_7");
    var check_acc_8 = document.getElementById("idAccident_8");

    var check_wea_1 = document.getElementById("idWeather_sp");
    var check_wea_2 = document.getElementById("idWeather_su");
    var check_wea_3 = document.getElementById("idWeather_au");
    var check_wea_4 = document.getElementById("idWeather_wi");

    type1 = check_acc_1.checked;
    type2 = check_acc_2.checked;
    type3 = check_acc_3.checked;
    type4 = check_acc_4.checked;
    type5 = check_acc_5.checked;
    type6 = check_acc_6.checked;
    type7 = check_acc_7.checked;
    type8 = check_acc_8.checked;

    spring = check_wea_1.checked;
    summer = check_wea_2.checked;
    autumn = check_wea_3.checked;
    winter = check_wea_4.checked;

    var startDate = new Date(document.getElementById("startDate").value);
    var endDate = new Date(document.getElementById("endDate").value);

    filterOptionData.startDate = startDate.getTime().toString();
    filterOptionData.endDate = endDate.getTime().toString();

    console.log(type1, type2, type3, type4, type5, type6, type7, type8, spring, summer, autumn, winter);
    map.removeLayer(statistics_markers);
    document.getElementById("loading-screen").style.display = "block";
    var res = await getStatisticsDataByFilters();
    statisticsInfo = JSON.parse(atob(res));
    createStatistics();
    eventChart();
    kmeanChart();
    document.getElementById("loading-screen").style.display = "none";
}