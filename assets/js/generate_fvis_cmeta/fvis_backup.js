function fvis_create(idxZone, idxArea, idxCamera, startTime, endTime) {

  var arrCar = [];
  // Get emeta data
  var objEmeta = JSON.parse(emeta_create(idxZone, idxArea, idxCamera));

  // Cab64 and Cab32
  var cab64 = objEmeta.items[0].dck.cab64s;
  var cab32 = objEmeta.items[0].dck.cab32s;

  var objReturn = [];

  // Init Car Array for each lane with start time
  function fvis_init_car(objCamera, startTime) {
    var arrCar = [];

    for (var i = 0; i < objCamera.segs.length; i ++) {
      arrCar[i] = [];

      // Add cars to each lane
      for (var j = 0; j < 300; j++) {
        // Define car type
        var carType = 0;
        if (i == 0) carType = 0; // Left lane only car
        if (i == objCamera.segs.length - 1) carType = 2; // right lane only truck
        if (i == 1) carType = Math.random() > 0.5 ? 0 : 1; // 2nd left lane : car, bus
        if (i > 1 && i < objCamera.segs.length - 1) carType = Math.random() > 0.5 ? 1 : 2; // middle lane : bus, truck

        // Look for the unchecked object
        k = 0;
        while(k < CAR_INFO[carType].length - 1 && CAR_INFO[carType][k].hasOwnProperty('marked')) k ++;

        // mark that object as checked
        CAR_INFO[carType][k].marked = true;

        // Add Object to array
        arrCar[i].push(CAR_INFO[carType][k]);
      }

      // Define the start time, end time as milisecond
      {
        // Get the car speed by cm / s
        var carSpeed = (objCamera.segs[i].smin + (objCamera.segs[i].smax - objCamera.segs[i].smin) / 2) * 1000 * 100 / 3600;

        for (var j = 0; j < arrCar[i].length; j ++) {
          var startTimeCar = startTime * 1000;
          if (j > 0) {
            var carDistance = FVIS_CAR_DISTANCE_MIN + (FVIS_CAR_DISTANCE_MAX - FVIS_CAR_DISTANCE_MIN) * Math.random();
            startTimeCar = arrCar[i][j - 1].startTime + Math.round((arrCar[i][j - 1].bbox[2] + carDistance * 100) * 1000 / carSpeed);
          }

          arrCar[i][j].startTime = startTimeCar;
          arrCar[i][j].endTime = startTimeCar + CAMERA_AREA_LONG * 100 * 1000 / carSpeed;
        }
      }
    }

    return arrCar;
  }
  var arrCar = fvis_init_car(objEmeta.items[0].dcv, startTime);

  for (var time = startTime; time < endTime; time += FVIS_CAPTURE_STEP) {

    // Define JSON obj for one capture
    var objJSONCapture = {
      dcpref : {
        cab64s : CAB64,
        op : DCK_PREF_OP,
        ser : 1
      },
      items : []
    };

    // For each lane
    for (var i = 0; i < arrCar.length; i++) {
      // Car Speed as cm / s
      var carSpeed = (objEmeta.items[0].dcv.segs[i].smin + (objEmeta.items[0].dcv.segs[i].smax - objEmeta.items[0].dcv.segs[i].smin) / 2) * 1000 * 100 / 3600;

      // Get the L/R paint element
      var lpaint, rpaint;
      for (var k = 0; k < objEmeta.items[1].dcv.paint.length; k ++) {
        if (objEmeta.items[0].dcv.segs[i].lpaint == objEmeta.items[1].dcv.paint[k].idx) lpaint = objEmeta.items[1].dcv.paint[k];
        if (objEmeta.items[0].dcv.segs[i].rpaint == objEmeta.items[1].dcv.paint[k].idx) rpaint = objEmeta.items[1].dcv.paint[k];
      }

      // Check the EVT Record
      var itemEVT4Car = {};
      var evtStartTime = 0;
      var evtIdxCar = 0;
      var evtDuration = 0;
      for (var idxCar = 0; idxCar < arrCar[i].length; idxCar++)
      for (var p = 0; p < EVT_INFO.length; p++) {
        if (idxZone == EVT_INFO[p].zone && idxArea == EVT_INFO[p].area && idxCamera == EVT_INFO[p].camera && (i + 1) == EVT_INFO[p].lane && idxCar == (EVT_INFO[p].idxCar - 1)) {
          evtStartTime = Math.round(arrCar[i][idxCar].startTime / 1000 + EVT_INFO[p].startTime);
          evtDuration = EVT_INFO[p].duration;
          evtIdxCar = idxCar;

          // Define EVT Object
          itemEVT4Car = {
            dck : {
              op16 : DCK_OP_EVT,
              cla : DCK_CLA,
              clb : EVT_INFO[p].clb,
              cab64s : cab64,
              cab32s : cab32,
              id64 : arrCar[i][idxCar].id64,
              id32 : 0,
              tick32 : evtStartTime,
              tick16 : EVT_INFO[p].tick16,
              ref64 : (evtStartTime * 65536) + EVT_INFO[p].tick16,
              ref32 : 0
            }
          };
          
          // Mark the evt is not started
          if (typeof arrCar[i][idxCar].evt == 'undefined') arrCar[i][idxCar].evt = 0;

          break;
        }
      }

      // For each car
      for (var j = 0; j < arrCar[i].length; j ++ ) {

        // Skip unvisible cars
        if (arrCar[i][j].startTime > (time + FVIS_CAPTURE_STEP) * 1000) continue; // not arriving
        if (arrCar[i][j].endTime < (time) * 1000) continue; // passed already

        // Get the init position of lane
        var positionX = lpaint.pts[0][0] + Math.abs((rpaint.pts[0][0] - lpaint.pts[0][0]) / 2);
        var positionZ = lpaint.pts[0][2];

        var itemFVIS4Car = {
          dck : {
            op16 : DCK_OP_FVIS,
            cla : DCK_CLA,
            cab64s : cab64,
            cab32s : cab32,
            id64 : arrCar[i][j].id64,
            id32 : 0
          },
          dcv : {
            typ : arrCar[i][j].typ,
            bbox :  [arrCar[i][j].bbox[0], arrCar[i][j].bbox[1], arrCar[i][j].bbox[2]],
            clr : arrCar[i][j].clr,
            logo : arrCar[i][j].logo,
            tick32 : startTime, // default as start time
            etick32 : endTime,
            freq : FVIS_CAPTURE_FREQ,
            apts : []
          }
        };

        // Init the car position
        if (typeof arrCar[i][j].stop == 'undefined') {
          arrCar[i][j].stop = false;
          arrCar[i][j].positionZ = positionZ;
        }

        var tick32 = 0;
        for (var t = 0; t < FVIS_CAPTURE_STEP; t += FVIS_CAPTURE_FREQ / 1000) {

          // If the car is not started yet, skip it
          if (t + time < arrCar[i][j].startTime / 1000) continue;

          // If it is the first occurance, keep tick32
          if (tick32 == 0) tick32 = startTime + t;

          // Movement distance
          var positionZStep = t == 0 ? 0 : Math.round((FVIS_CAPTURE_FREQ / 1000) * carSpeed);

          // Calculation of Z
          var curPositionZ = arrCar[i][j].positionZ;
          if (!arrCar[i][j].stop) curPositionZ += positionZStep; // if car is not stop, move forward

          // if prev Car is stop, and calculated position + next step is overflow, force the car stop and cur position is before next car
          if (j > 0 && arrCar[i][j-1].stop ){
            arrCar[i][j].stop;
          }
          if (j > 0 && arrCar[i][j-1].stop && !arrCar[i][j].stop && (arrCar[i][j-1].positionZ - arrCar[i][j-1].bbox[2] - FVIS_CAR_DISTANCE_MIN * 100) < (curPositionZ + positionZStep)) {
            curPositionZ = arrCar[i][j-1].positionZ - arrCar[i][j-1].bbox[2] - FVIS_CAR_DISTANCE_MIN * 100;
            arrCar[i][j].stop = true;
            console.log('stop' + j);
          }

          // if cur car is stop, prev Car is start, let this car start
          if (j > 0 && !arrCar[i][j-1].stop && arrCar[i][j].stop) {
            console.log('start' + j);
            arrCar[i][j].stop = false;
          }

          // EVT Started
          if (evtStartTime != 0 && j == evtIdxCar && (time + t) >= evtStartTime) {
            if (arrCar[i][j].evt == 0) {  // If it is the start of event
              // Make the EVT dcv
              itemEVT4Car.dcv = {
                typ : arrCar[i][j].typ,
                bbox :  [arrCar[i][j].bbox[0], arrCar[i][j].bbox[1], arrCar[i][j].bbox[2]],
                clr : arrCar[i][j].clr,
                logo : arrCar[i][j].logo,
                tick32 : evtStartTime, // default as start time
                etick32 : evtStartTime + evtDuration,
                freq : evtDuration * 1000,
                stamp64 : 0,
                apts : [
                  {
                    dur : evtDuration * 1000,
                    seg : i + 1,
                    rot : Math.round(Math.PI * 1000 / 3) / 1000, // 0 east
                    pt : [positionX, 0, curPositionZ]
                  }                
                ]
              };

              // Change the car status
              arrCar[i][j].stop = true;
              console.log('evt stop' + j + ' ' + time + ' ' + t + ' ' + (time + t));

              // Mark the evt is started
              arrCar[i][j].evt = 1;
            }

            if (arrCar[i][j].evt == 1 && (time + t) > (evtStartTime + evtDuration)) { // if EVT is not finished let the car start again
              arrCar[i][j].stop = false;
              arrCar[i][j].evt = 2;
              console.log('evt start' + j + ' ' + time + ' ' + t + ' ' + (time + t));
            }
          }

          // Keep the current position
          arrCar[i][j].positionZ = curPositionZ;

          // Push the apt
          itemFVIS4Car.dcv.apts.push({
            dur : FVIS_CAPTURE_FREQ,
            seg : i + 1,
            rot : Math.round(Math.PI * 1000 / 3) / 1000, // 0 east
            pt : [positionX, 0, curPositionZ]
          });

          if (curPositionZ > CAMERA_AREA_LONG * 100) break;
        }

        // Update tickt32
        itemFVIS4Car.dcv.tick32 = tick32;

        if (tick32 != 0) objJSONCapture.items.push(itemFVIS4Car);
        // End of one car
      }

      // Push EVT
      if (typeof itemEVT4Car.dcv != 'undefined') objJSONCapture.items.push(itemEVT4Car);

    } // End of one lane

    objReturn.push(objJSONCapture);
    // End of one capture
  }

  return JSON.stringify(objReturn);
}