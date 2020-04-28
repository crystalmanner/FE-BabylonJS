var baseUrl = "http://47.108.143.247:8080";
var cameraInfo = [], evtInfo = [], statisticsInfo = [];
var endDate = 1579285501; startDate = 1579281101;
var camera_markers, jams_markers, wazer_markers, statistics_markers;
var LeafIcon;
var cameraIcon, jamsIcon, wazerIcon;
var showCameraIcons = true, showJamsIcons = false, showWazerIcons = false;
var evtType1 = 0, evtType2 = 0, evtType3 = 0, evtType4 = 0, evtType5 = 0, evtType6 = 0, evtType7 = 0, evtType8 = 0;
var type1 = true, type2 = true, type3 = true, type4 = true, type5 = true, type6 = true, type7 = true, type8 = true;
var spring = true, summer = true, autumn = true, winter = true;

function getCamData() {
    return $.ajax({
        url: baseUrl + "/camera",
        type: 'GET',
    });
}

function getKmeanData() {
    return $.ajax({
        url: baseUrl + "/kmean",
        type: 'GET',
        data: {
            to: endDate,
            from: startDate
        },
    });
}

function getEvtData() {
    return $.ajax({
        url: baseUrl + "/event",
        type: 'GET',
        data: {
            to: endDate,
            from: startDate,
        },
    });
}

function getStatisticsDataByFilters() {
    return $.ajax({
        url: baseUrl + "/filter",
        type: 'GET',
        data: {
            from: startDate,
            to: endDate,
            type1: type1,
            type2: type2,
            type3: type3,
            type4: type4,
            type5: type5,
            type6: type6,
            type7: type7,
            type8: type8,
            spring: spring,
            summer: summer,
            autumn: autumn,
            winter: winter
        },
    });
}

async function initData() {
    try {
        var res = await getCamData();
        cameraInfo = JSON.parse(atob(res));
        // showCameras();
        res = await getEvtData();
        evtInfo = JSON.parse(atob(res));
        //  console.log(evtInfo[0]);
        // createEvents();
        res = await getStatisticsDataByFilters();
        statisticsInfo = JSON.parse(atob(res));
        type1 = type2 = type3 = type4 = type5 = type6 = type7 = type8 = false;
        spring = summer = autumn = winter = false;   
        createStatistics();
        document.getElementById("loading-screen").style.display = "none";
    } catch (error) {
        console.log("Error");
    }
}

// create map
var mapboxAccessToken =
    'pk.eyJ1IjoiZGVubmlzd2FsdGVyIiwiYSI6ImNqdHNnZXEwejBwcTk0ZGxhMWVsamM5c2UifQ.2UTF5HZ77qcKVzHf3Txlhw';
var map = L.map('map_viewer').setView([31.549389, 120.379611], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, { id: 'mapbox/light-v9', }).addTo(map);

//map = L.map('map', {crs: L.CRS.EPSG3857, center: [30.6851225, 104.0562385], zoom: 11, });
//L.tileLayer('http://www.arctiler.com:9009/arctiler/arcgis/services/chengdu/MapServer/tile/{z}/{y}/{x}').addTo(map);
initData();

// create island
var region_latlngs = [];
var cnt_region_latlngs = 0;
for (var i = 0; i < regionData['features'][0]['geometry']['coordinates'][0].length; i++) {
    var lat = regionData['features'][0]['geometry']['coordinates'][0][i][1];
    var lng = regionData['features'][0]['geometry']['coordinates'][0][i][0];
    var latlng = [lat, lng];

    region_latlngs[cnt_region_latlngs++] = latlng;
}

var island = L.polygon(region_latlngs, {
    color: '800026',
    fillColor: '#eee',
    fillOpacity: 0.2,
}).addTo(map);

// create layers
var areajson, zonejson, regionjson;

function getColor(d) {
    return d == 'zone_1' ? '#eee' : //800026
        d == 'zone_2' ? '#eee' : //BD0026
            d == 'zone_3' ? '#eee' : //E31A1C
                d == 'zone_4' ? '#eee' : //FC4E2A
                    d == 'region' ? '#eee' : //FEB24C
                        '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.color),
        weight: 2,
        opacity: 1,
        color: '#888',
        dashArray: '3',
        fillOpacity: 0.5
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#00f',
        dashArray: '',
        opacity: 0.5,
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    if (map.hasLayer(areajson)) {
        areajson.resetStyle(e.target);
    }
    if (map.hasLayer(zonejson)) {
        zonejson.resetStyle(e.target);
    }
    if (map.hasLayer(regionjson)) {
        regionjson.resetStyle(e.target);
    }
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

regionjson = L.geoJson(regionData, {
    style: style,
    onEachFeature: onEachFeature
});

zonejson = L.geoJson(zonesData, {
    style: style,
    onEachFeature: onEachFeature
});

areajson = L.geoJson(areasData, {
    style: style,
    onEachFeature: onEachFeature
});

// right top info box
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

info.update = function (props) {

    var zoneid = '', areaid = '';
    try {
        if (props.zoneid) {
            zoneid = 'Zone ID: <b>' + props.zoneid + '</b><br />';
        }

        if (props.areaid) {
            areaid = 'Area ID: <b>' + props.areaid + '</b><br />';
        }
    }
    catch (error) {
        //console.error(error);
    }
    this._div.innerHTML = '<h4>Info</h4>' + (props ?
        zoneid + areaid +
        props.cameras + ' cameras exist' :
        'Hover over a area');
};

info.addTo(map);

// create camera markers

function showCameras() {
    var cameras = [];
    var cnt_cameras = 0;
    LeafIcon = L.Icon.extend({
        options: {
            iconSize: [20, 20],
        }
    });
    cameraIcon = new LeafIcon({
        iconUrl: './assets/camera.png'
    });
    L.icon = function (options) {
        return new L.Icon(options);
    };
    console.log(cameraInfo);
    for (var i = 0; i < cameraInfo.length; i++) {
        var camera = L.marker([cameraInfo[i].lon, cameraInfo[i].lat], {
            icon: cameraIcon
        }).bindPopup("Zone ID: " + cameraInfo[i].zone + "<br>Area ID: " + cameraInfo[i].area + "<br>Camera ID: " + cameraInfo[i].camera + "<br><a href='simulator.html?zone=" + cameraInfo[i].zone + "&area=" + cameraInfo[i].area + "&camera=" + cameraInfo[i].camera + "'>View</a>");
        // camera.addTo(map);
        cameras[cnt_cameras++] = camera;
    }
    camera_markers = L.layerGroup(cameras);
}

function getCameraPos(zone_id, area_id, camera_id) {
    var pos = [];
    for (var i = 0; i < cameraInfo.length; i++) {
        if (cameraInfo[i].zone == zone_id && cameraInfo[i].area == area_id && cameraInfo[i].camera == camera_id) {
            pos = [cameraInfo[i].lon, cameraInfo[i].lat];
            break;
        }
    }
    return pos;
}

function createEvents() {
    var jams = [], wazers = [];
    var cnt_jams = 0, cnt_wazers = 0;
    LeafIcon = L.Icon.extend({
        options: {
            iconSize: [20, 20],
        }
    });
    jamsIcon = new LeafIcon({
        iconUrl: './assets/trafficjam.png'
    });
    wazerIcon = new LeafIcon({
        iconUrl: './assets/accident.png'
    });

    L.icon = function (options) {
        return new L.Icon(options);
    };

    console.log(evtInfo);
    for (var i = 0; i < evtInfo.length; i++) {
        var camPos = getCameraPos(evtInfo[i].zone, evtInfo[i].area, evtInfo[i].camera);
        for (var j = 0; j < evtInfo[i].evt.length; j++) {
            if (evtInfo[i].evt[j].type == 1) {
                var jam = L.marker([camPos[0], camPos[1]], {
                    icon: jamsIcon
                }).bindPopup("Zone ID: " + evtInfo[i].zone + "<br>Area ID: " + evtInfo[i].area + "<br>Camera ID: " + evtInfo[i].camera + "<br>Jams Count: " + evtInfo[i].evt[j].count + "<br><a href='simulator.html?zone=" + evtInfo[i].zone + "&area=" + evtInfo[i].area + "&camera=" + evtInfo[i].camera + "&jams" + "'>View</a>");
                jams[cnt_jams++] = jam;
            }
            if (evtInfo[i].evt[j].type == 2) {
                var wazer = L.marker([camPos[0], camPos[1]], {
                    icon: wazerIcon
                }).bindPopup("Zone ID: " + evtInfo[i].zone + "<br>Area ID: " + evtInfo[i].area + "<br>Camera ID: " + evtInfo[i].camera + "<br>Wazer Count: " + evtInfo[i].evt[j].count + "<br><a href='simulator.html?zone=" + evtInfo[i].zone + "&area=" + evtInfo[i].area + "&camera=" + evtInfo[i].camera + "&wazers" + "'>View</a>");
                wazers[cnt_wazers++] = wazer;
            }
        }
    }
    if (jams.length > 0) {
        jams_markers = L.layerGroup(jams);
        console.log(jams);
    }
    if (wazers.length > 0) {
        wazer_markers = L.layerGroup(wazers);
    }
}

/**
 * show accident statistics
 */
function createStatistics() {
    console.log(statisticsInfo);
    var statistics = [], cnt_statistics = 0;
    evtType1 = evtType2 = evtType3 = evtType4 = evtType5 = evtType6 = evtType7 = evtType8 = 0;
    for (var i = 0; i < statisticsInfo.length; i++) {
        var camPos = getCameraPos(statisticsInfo[i].zone, statisticsInfo[i].area, statisticsInfo[i].camera);
        var evt_sum = 0;
        var strLinks = statisticsInfo[i].zone + "&area=" + statisticsInfo[i].area + "&camera=" + statisticsInfo[i].camera;
        for (var j = 0; j < statisticsInfo[i].evt.length; j++) {
            evt_sum += statisticsInfo[i].evt[j].count;
            strLinks += "&type" + statisticsInfo[i].evt[j].type + "=" + statisticsInfo[i].evt[j].count;
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
        if (evt_sum > 0) {
            var statistics_temp = L.circle([camPos[0], camPos[1]], {
                fillColor: '#f03',
                fillOpacity: evt_sum <= 5 ? 0.3 :
                    evt_sum > 5 && evt_sum < 10 ? 0.7 : 0.9,
                opacity: 0,
                weight: 0,
                radius: evt_sum * 10,
                zIndexOffset: 99999
            }).bindPopup(
                "Zone ID: " +
                statisticsInfo[i].zone +
                "<br>Area ID: " +
                statisticsInfo[i].area +
                "<br>Camera ID: " +
                statisticsInfo[i].camera +
                "<br>" + "<button type='button' data-target='#cameraDetail' class='btn btn-info btn-sm' style='height: 30px; margin-top: 5px;' onclick='zoneChart(\"" + statisticsInfo[i].zone + "-" + statisticsInfo[i].area + "-" + statisticsInfo[i].camera +
                "\")'>" +
                // strLinks +
                "Event Detail View</button><br><a href='simulator.html?zone=" +
                cameraInfo[i].zone +
                "&area=" +
                cameraInfo[i].area +
                "&camera=" +
                cameraInfo[i].camera +
                "' class='btn btn-info btn-sm' style='color: white; cursor: pointer; height: 30px; margin-top: 5px;' target='_blank'>3D Model View</a>"
            );

            statistics[cnt_statistics++] = statistics_temp;
        }
    }
    console.log(statistics);
    if (statistics.length > 0) {
        statistics_markers = L.layerGroup(statistics);
        map.addLayer(statistics_markers);
    }
    
}

// control the layers by levels- region, zones, areas
function ControlLayers() {
    var map_zoom = map.getZoom();
    console.log(map_zoom);
    switch (map_zoom) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
            if (map.hasLayer(areajson)) {
                map.removeLayer(areajson);
                map.removeLayer(camera_markers);
                map.removeLayer(jams_markers);
                map.removeLayer(wazer_markers);
            }
            if (map.hasLayer(zonejson)) {
                map.removeLayer(zonejson);
            }
            if (map.hasLayer(regionjson)) {
                map.removeLayer(regionjson);
            }
            break;
        case 11:
        case 12:

            if (map.hasLayer(areajson) && mapviewer_status == 1) {
                map.removeLayer(areajson);
                map.removeLayer(camera_markers);
                map.removeLayer(jams_markers);
                map.removeLayer(wazer_markers);
            }
            if (map.hasLayer(zonejson) && mapviewer_status == 1) {
                map.removeLayer(zonejson);
            }
            if (map.hasLayer(regionjson) && mapviewer_status == 1) {
                map.removeLayer(regionjson);
            }

            if (!map.hasLayer(regionjson) && mapviewer_status == 1) {
                map.addLayer(regionjson);
            }
            break;
        case 13:

            if (map.hasLayer(areajson) && mapviewer_status == 1) {
                map.removeLayer(areajson);
                map.removeLayer(camera_markers);
                map.removeLayer(jams_markers);
                map.removeLayer(wazer_markers);
            }
            if (map.hasLayer(zonejson) && mapviewer_status == 1) {
                map.removeLayer(zonejson);
            }
            if (map.hasLayer(regionjson) && mapviewer_status == 1) {
                map.removeLayer(regionjson);
            }
            if (!map.hasLayer(zonejson) && mapviewer_status == 1) {
                map.addLayer(zonejson);
            }
            break;
        case 14:
            if (map.hasLayer(areajson) && mapviewer_status == 1) {
                map.removeLayer(areajson);
                map.removeLayer(camera_markers);
                map.removeLayer(jams_markers);
                map.removeLayer(wazer_markers);
            }
            if (map.hasLayer(zonejson) && mapviewer_status == 1) {
                map.removeLayer(zonejson);
            }
            if (map.hasLayer(regionjson) && mapviewer_status == 1) {
                map.removeLayer(regionjson);
            }

            if (!map.hasLayer(areajson) && mapviewer_status == 1) {
                map.addLayer(areajson);
                if (showCameraIcons) map.addLayer(camera_markers);
                if (showJamsIcons) map.addLayer(jams_markers);
                if (showWazerIcons) map.addLayer(wazer_markers);
            }
            break;
        default:
            break;
    }
}

map.on('moveend', function (event) {
    ControlLayers();
});

// var camera1 = L.circle([31.301549847100296, 120.03533076358959], {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5,
//     radius: 50
// }).addTo(map);

// var camera2 = L.circle([31.305970975138788, 120.03858490589059], {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5,
//     radius: 50
// }).addTo(map);

// var camera3 = L.circle([31.29591777911836, 120.03908113218328], {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5,
//     radius: 50
// }).addTo(map);

var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

var myStyle = {
    "color": "#000000",
    "weight": 5,
    "opacity": 0.65
};

L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);

/**
 * show camera type
 */
function checkcamera(n) {
    var cctv_cam = document.getElementById('cctv-cam');
    var res_cam = document.getElementById('res-cam');
    var cameras = document.getElementsByClassName('leaflet-marker-pane');
    console.log(cameras.length);
    if (n === 0) {
        cctv_cam.checked = true;
        showCameraIcons = true;
        if (map.getZoom() > 13) {
            // cameras[0].style.display = "block";
            map.addLayer(camera_markers);
        }
        res_cam.checked = false;

    }
    else {
        cctv_cam.checked = false;
        showCameraIcons = false;
        map.removeLayer(camera_markers);
        res_cam.checked = true;
    }
}

/**
 * show jams and traffic events
 */
$('[type="checkbox"]').click(function (e) {
    var isChecked = $(this).is(":checked");
    if (isChecked) {
        if ($(this)[0].id == "jams_toggle") {
            // show jams
            showJamsIcons = true;
            if (map.getZoom() > 13) {
                map.addLayer(jams_markers);
            }
        }
        if ($(this)[0].id == "accident_toggle") {
            // show accident
            showWazerIcons = true;
            if (map.getZoom() > 13) {
                map.addLayer(wazer_markers);
            }
        }
    } else {
        if ($(this)[0].id == "jams_toggle") {
            // hide jams
            showJamsIcons = false;
            map.removeLayer(jams_markers);
        }
        if ($(this)[0].id == "accident_toggle") {
            // hide accident
            showWazerIcons = false;
            map.removeLayer(wazer_markers);
        }
    }

});

/**
 * show path from start pos to end pos
 */
function showPath() {
    var startPos = document.getElementById("start-pos").value;
    var endPos = document.getElementById("end-pos").value;
    console.log("start pos: " + startPos, "end pos: " + endPos);
}