$(document).ready(function () {
    $("#side_bar").hide();
    $('#statictics_refer').show();
    $('.leaflet-top.leaflet-right').hide();
});

var mapviewer_status = 0;
var bShowPanel = false;
function showPanel() {
    bShowPanel = !bShowPanel;
    if (bShowPanel)
    {
        $("#side_bar").show();
        initialStatics();
        eventChart();
        kmeanChart();
    }
    else
    {
        $("#btnvideo").disabled = true;
        $("#btnvideo").css("border-color", "grey");
        $("#btnvideo").css("color", "grey");
        $("#btnvideo").removeAttr("href");
        $("#side_bar").hide();
    }    
}

function showStatisticsPanel() {    
    $("#side_bar").show();
    $("#tabs li:eq(1) a").tab('show');
    bShowPanel = true;
}

function showMapvideo() {

}
// function openStatistics(evt, tabName) {
//     var i, tabcontent, tablinks;
//     tabcontent = document.getElementsByClassName("tabcontent");
//     for (i = 0; i < tabcontent.length; i++) {
//         tabcontent[i].style.display = "none";
//     }
//     tablinks = document.getElementsByClassName("tablinks");
//     for (i = 0; i < tablinks.length; i++) {
//         tablinks[i].className = tablinks[i].className.replace(" active", "");
//     }
//     document.getElementById(tabName).style.display = "block";
//     evt.currentTarget.className += " active";
//     $('#statictics_refer').show();
//     mapviewer_status = 0;
//     map.addLayer(statistics_markers);
//     map.removeLayer(areajson);
//     map.removeLayer(camera_markers);
//     map.removeLayer(jams_markers);
//     map.removeLayer(wazer_markers);
//     map.removeLayer(zonejson);
//     map.removeLayer(regionjson);
//     $('.leaflet-top.leaflet-right').hide();
// }

// function openMapViewer(evt, tabName) {
//     var i, tabcontent, tablinks;
//     tabcontent = document.getElementsByClassName("tabcontent");
//     for (i = 0; i < tabcontent.length; i++) {
//         tabcontent[i].style.display = "none";
//     }
//     tablinks = document.getElementsByClassName("tablinks");
//     for (i = 0; i < tablinks.length; i++) {
//         tablinks[i].className = tablinks[i].className.replace(" active", "");
//     }
//     document.getElementById(tabName).style.display = "block";
//     evt.currentTarget.className += " active";
//     $('#statictics_refer').hide();
//     mapviewer_status = 1
//     map.removeLayer(statistics_markers);
//     ControlLayers();
//     $('.leaflet-top.leaflet-right').show();
// }