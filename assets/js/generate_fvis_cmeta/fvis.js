const MAX_SPEED = 30;
const MIDDLE_SPEED = 20;
const MIN_SPEED = 10;

var arrCars = [];


var crossways10 = [
                {stopIndex: 380, stoplane:0, change: [{ sIndex: 385 , sLane: 0, laneFlow: 1, laneDirection: false  }, {sIndex: 265, sLane: 10, laneFlow: 16, laneDirection: false}] }, 
                {stopIndex: 380, stoplane:1, change: [{ sIndex: 385, sLane: 1, laneFlow: 1, laneDirection: false  }, {sIndex: 270, sLane: 11, laneFlow: 16, laneDirection: false}] }, 
                {stopIndex: 85, stoplane:3, change: [{ sIndex: 85, sLane: 3, laneFlow: 1, laneDirection: true }, {sIndex: 260, sLane: 7, laneFlow: 16, laneDirection: true }] }, 
                {stopIndex: 85, stoplane:4, change: [{ sIndex: 85, sLane: 4, laneFlow: 1, laneDirection: true }, {sIndex: 265, sLane: 6, laneFlow: 16, laneDirection: true}] }, 
                {stopIndex: 235, stoplane:6, change: [{ sIndex: 235, sLane: 6, laneFlow: 16, laneDirection: true }, {sIndex: 415, sLane: 0, laneFlow: 1, laneDirection: false}] }, 
                {stopIndex: 235, stoplane:7, change: [{ sIndex: 235, sLane: 7, laneFlow: 16, laneDirection: true }, {sIndex: 410 , sLane: 1, laneFlow: 1, laneDirection: false}] }, 
                {stopIndex: 235, stoplane:9, change: [{ sIndex: 235, sLane: 9, laneFlow: 16, laneDirection: false }, {sIndex: 110, sLane:4, laneFlow: 1, laneDirection: true}] }, 
                {stopIndex: 235, stoplane:10, change: [{ sIndex: 235, sLane: 10,laneFlow: 16, laneDirection: false }, {sIndex: 115 , sLane:5, laneFlow: 1, laneDirection: true}] }, 
                {stopIndex: 65, stoplane:0, change: [{ sIndex: 65, sLane: 0, laneFlow: 1, laneDirection: false }, {sIndex: 265, sLane: 17, laneFlow: 32, laneDirection: false}] }, 
                {stopIndex: 65, stoplane:1, change: [{ sIndex: 65, sLane: 1, laneFlow: 1, laneDirection: false }, {sIndex: 260, sLane: 16, laneFlow: 32, laneDirection: false}] }, 
                {stopIndex: 405, stoplane:3, change: [{ sIndex: 405, sLane: 3, laneFlow: 1, laneDirection: true }, {sIndex: 260, sLane: 13, laneFlow: 16, laneDirection: true}] }, 
                {stopIndex: 405, stoplane:4, change: [{ sIndex: 405, sLane: 4, laneFlow: 1, laneDirection: true }, {sIndex: 265 , sLane: 12, laneFlow: 16, laneDirection: true}] }, 
                {stopIndex: 235, stoplane:12, change: [{ sIndex: 235, sLane: 12, laneFlow: 16, laneDirection: true }, {sIndex: 95, sLane: 0, laneFlow: 1, laneDirection: false}] }, 
                {stopIndex: 235, stoplane:13, change: [{ sIndex: 235, sLane: 13, laneFlow: 16, laneDirection: true }, {sIndex: 90, sLane: 1, laneFlow: 1, laneDirection: false}] }, 
               // {stopIndex: 235, stoplane:15, change: [{ sIndex: 235, sLane: 15, laneFlow: 16, laneDirection: false }, {sIndex: 420, sLane: 3, laneFlow: 1, laneDirection: true}] }, 
               // {stopIndex: 235, stoplane:16, change: [{ sIndex: 235, sLane: 16, laneFlow: 16, laneDirection: false }, {sIndex: 425, sLane: 4, laneFlow: 1, laneDirection: true}] } 
            ];


function fvis_create(idxZone, idxArea, idxCamera, startTime, endTime)
{
    var objReturn = [];
    var objEmeta = JSON.parse(emeta_create(idxZone, idxArea, idxCamera));
    var cab64 = objEmeta.items[0].dck.cab64s;
    var cab32 = objEmeta.items[0].dck.cab32s;
    
    for ( var i = 0 ; i < objEmeta.items[0].dcv.segs.length; i ++ )
    {
        arrCars[i] = [];
    }

   for( var time = startTime; time < endTime; time += FVIS_CAPTURE_STEP)
   {           
       var objCapture = uniteplay(objEmeta, time, endTime, cab64, cab32, idxZone, idxArea, idxCamera);
       if (objCapture.items.length > 0)
        {
            objReturn.push(objCapture);
        }
   }

   return JSON.stringify(objReturn);
}

 function uniteplay(objEmeta, time, endTime, cab64, cab32, idxZone, idxArea, idxCamera)
{
    var itemEVT4Car = {};
    var evtStartTime = 0;
    var evtIdxCar = -1;
    var evtDuration = 0;
    var evtTyp = 0;

    var objJsonCapture = {
        dcpref: {
            cab64s: CAB64,
            op: DCK_PREF_OP,
            ser: 1
        },
        items: []
    };

    var arrCarItemSeg = [];
    for ( var i = 0 ; i < objEmeta.items[0].dcv.segs.length; i ++ )
    {
        arrCarItemSeg[i] = [];
        
        for ( var j = 0;  j < arrCars[i].length; j ++)
        {
            arrCarItemSeg[i].push({
                dck: { op16 : DCK_OP_FVIS,
                        cla : DCK_CLA,
                        cab64s : cab64,
                        cab32s : cab32,
                        id64 : arrCars[i][j].id64,
                        id32 : 0}, 
                dcv: {
                    typ : arrCars[i][j].typ,
                    bbox :  [arrCars[i][j].bbox[0], arrCars[i][j].bbox[1], arrCars[i][j].bbox[2]],
                    clr : arrCars[i][j].clr,
                    logo : arrCars[i][j].logo,
                    tick32 : time, // current time
                    etick32 : endTime,
                    freq : FVIS_CAPTURE_FREQ,
                    apts : []
                }, 
                init: true});
        }
    }

    
    for(var t = 0; t < FVIS_CAPTURE_STEP; t += FVIS_CAPTURE_FREQ / 1000)
    {
        for ( var i = 0 ; i < objEmeta.items[0].dcv.segs.length; i ++ )
        {               
            if (Math.random() > 0.9)
            {
                 var carType = 0;
                 var carSpeed = MAX_SPEED;
                 if (objEmeta.items[0].dcv.segs[i].restrict == 1)
                 {
                     carType = 0;    carSpeed = MAX_SPEED;
                 }
                 else if (objEmeta.items[0].dcv.segs[i].restrict == 4)
                 {
                     carType = 2;    carSpeed = MIN_SPEED;
                 }
                 else
                 {
                     carType = Math.random() > 0.5? 1: 2;    carSpeed = MIDDLE_SPEED;
                 }

                 // Look for the unchecked object
                 k = Math.round( Math.random() * (CAR_INFO[carType].length - 1));
                 arrCars[i].push(CAR_INFO[carType][k]);
                 arrCarItemSeg[i].push({dck: {}, dcv: {}, init: false});  
                 var lindex = arrCars[i].length - 1;
                 for (var k = 0; k < objEmeta.items[1].dcv.paint.length; k ++) 
                 {
                     if (objEmeta.items[0].dcv.segs[i].lpaint == objEmeta.items[1].dcv.paint[k].idx)
                     {
                         var lpaint = objEmeta.items[1].dcv.paint[k];
                         
                         arrCars[i][lindex].positionX = lpaint.pts[0][0];
                         arrCars[i][lindex].positionY = lpaint.pts[0][1];
                         arrCars[i][lindex].positionZ = lpaint.pts[0][2];
                         arrCars[i][lindex].status = 0; // 0 no start, 1 moving, 2 end
                         arrCars[i][lindex].stop = 'stop'; // stop, start, moving

                         arrCars[i][lindex].speed = carSpeed;
                         arrCars[i][lindex].path_Index = k;
                         arrCars[i][lindex].current_Index = 0;
                         arrCars[i][lindex].laneFlow = objEmeta.items[0].dcv.segs[i].flow;

                         if ( arrCars[i][lindex].laneFlow == 1)
                         {
                             if (arrCars[i][lindex].positionZ < CAMERA_AREA_LONG / 2)
                             {
                                 arrCars[i][lindex].laneDirection = true;                                    
                             }   
                             else
                             {
                                 arrCars[i][lindex].laneDirection = false;
                             }                                    
                         }
                         else if (arrCars[i][lindex].laneFlow == 16)
                         {
                             if (arrCars[i][lindex].positionX < 0)
                             {
                                 arrCars[i][lindex].laneDirection = true;                                    
                             }   
                             else
                             {
                                 arrCars[i][lindex].laneDirection = false;
                             }
                         }
                         
                         break;
                     }
                 }
            }

            for (var idxCar = 0; idxCar < arrCars[i].length; idxCar++)
                for (var p = 0; p < EVT_INFO.length; p++) {
                    if (idxZone == EVT_INFO[p].zone && idxArea == EVT_INFO[p].area && idxCamera == EVT_INFO[p].camera && (i + 1) == EVT_INFO[p].lane && idxCar == (EVT_INFO[p].idxCar - 1)) {
                        if (typeof arrCars[i][idxCar].evt == 'undefined') {
                            evtStartTime = EVT_INFO[p].startTime;
                            evtDuration = EVT_INFO[p].duration;
                            evtTyp = EVT_INFO[p].typ;
                            evtIdxCar = idxCar;
        
                            // Define EVT dck
                            itemEVT4Car.dck = {
                                op16 : DCK_OP_EVT,
                                cla : DCK_CLA,
                                clb : EVT_INFO[p].clb,
                                cab64s : cab64,
                                cab32s : cab32,
                                id64 : arrCars[i][idxCar].id64,
                                id32 : 0,
                                tick32 : time,
                                tick16 : EVT_INFO[p].tick16,
                                ref64 : ((time) * 65536) + EVT_INFO[p].tick16,
                                ref32 : 0
                            };
        
                            // Mark the evt is not started
                            arrCars[i][idxCar].evt = 0;
                        }
                        break;
                    }
                }
            for( var j = 0; j < arrCars[i].length; j ++)
            {
                if (arrCars[i][j].status == 2)   continue;

                var lpaint = objEmeta.items[1].dcv.paint[arrCars[i][j].path_Index];
                 if (j == 0 && arrCars[i][j].stop == 'stop' && arrCars[i][j].status == 0)
                 {                        
                     arrCars[i][j].stop = 'moving';
                     arrCars[i][j].status = 1;
                 }
                 else if (j > 0 && arrCars[i][j - 1].stop == 'moving' && arrCars[i][j].stop == 'stop' && arrCars[i][j].status == 0)  // If pre car is moving and cur car is not started yet, let the car start by minus value
                 {
                     arrCars[i][j].stop = 'moving';
                     arrCars[i][j].status = 1;
                 }
                 else if (arrCars[i][j].status == 1)
                 {
                    if (arrCars[i][j].stop != "stop") arrCars[i][j].current_Index += arrCars[i][j].speed;
                    if (arrCars[i][j].current_Index > lpaint.pts.length)                
                        arrCars[i][j].current_Index = lpaint.pts.length - 1;

                        // if prev Car is stop, and calculated position + next step is overflow, force the car stop and cur position is before next car
                     if (j > 0 && arrCars[i][j - 1].stop == "stop" && arrCars[i][j].stop == "moving" &&  arrCars[i][j-1].path_Index == arrCars[i][j].path_Index) 
                     {
                        arrCars[i][j].current_Index = arrCars[i][j].current_Index - 1;
                        // If it is crash, remove the car distance
                        arrCars[i][j].stop = "stop";
                    }

                    // if cur car is stop, prev Car is moving, let this car start
                    if (j > 0 && arrCars[i][j-1].stop == "moving" && arrCars[i][j].stop == "stop" && j != evtIdxCar) {
                        arrCars[i][j].stop = "start";
                    } else if (arrCars[i][j].stop == "start") { // If car is start, let it moving (1 second warning)
                        arrCars[i][j].stop = "moving";
                    }
                 }
                

                 if (arrCars[i][j].status == 1)
                 {             
                    var carRot = Math.round(Math.PI * 1000 / 2) / 1000;
                    var cindex = arrCars[i][j].current_Index;       
                    
                     if (!arrCarItemSeg[i][j].init) {
                         arrCarItemSeg[i][j].dck = {
                             op16 : DCK_OP_FVIS,
                             cla : DCK_CLA,
                             cab64s : cab64,
                             cab32s : cab32,
                             id64 : arrCars[i][j].id64,
                             id32 : 0
                         };
                         arrCarItemSeg[i][j].dcv = {
                             typ : arrCars[i][j].typ,
                             bbox :  [arrCars[i][j].bbox[0], arrCars[i][j].bbox[1], arrCars[i][j].bbox[2]],
                             clr : arrCars[i][j].clr,
                             logo : arrCars[i][j].logo,
                             tick32 : time + t, // current time
                             etick32 : endTime,
                             freq : FVIS_CAPTURE_FREQ,
                             apts : []
                         };
                         arrCarItemSeg[i][j].init = true;
                        }
                        
                        arrCars[i][j].positionX = lpaint.pts[cindex][0];
                        arrCars[i][j].positionY = lpaint.pts[cindex][1];
                        arrCars[i][j].positionZ = lpaint.pts[cindex][2];

                        // EVT processing (only 1 time for each lane)
                if (evtIdxCar == j && arrCars[i][j].status == 1 && arrCarItemSeg[i][j].init) {
                    if (arrCars[i][j].stop == "moving" && arrCarItemSeg[i][j].dcv.apts.length == evtStartTime && arrCars[i][j].evt == 0) {
                        // Let the car stop
                        arrCars[i][j].stop = "stop";

                        // fill the evt value
                        itemEVT4Car.dck.tick32 = time + t;
                        itemEVT4Car.dck.ref64 = ((time + t) * 65536) + itemEVT4Car.dck.tick16,
                            itemEVT4Car.dcv = {
                                typ : evtTyp,
                                bbox :  [arrCars[i][j].bbox[0], arrCars[i][j].bbox[1], arrCars[i][j].bbox[2]],
                                clr : arrCars[i][j].clr,
                                logo : arrCars[i][j].logo,
                                tick32 : time + t,
                                etick32 : time + t + evtDuration,
                                freq : evtDuration * 1000,
                                stamp64 : 0,
                                apts : [
                                    {
                                        dur : evtDuration * 1000,
                                        seg : i + 1,
                                        rot : (evtTyp == 4 || evtTyp == 5) ? (Math.round(Math.PI * 1000 / 3) / 1000) : carRot,
                                        pt : [arrCars[i][j].positionX, arrCars[i][j].positionY, arrCars[i][j].positionZ]
                                    }
                                ]
                            };

                        // Update the event is processed
                        arrCars[i][j].evt = 1;
                    }

                    if (arrCars[i][j].stop == "stop" && arrCarItemSeg[i][j].dcv.apts.length == evtStartTime + evtDuration) {
                        arrCars[i][j].stop = "start";
                    }
                }

                    if ( cindex - 1 > 0)
                    {
                        var dx = lpaint.pts[cindex][0] - lpaint.pts[cindex-1][0];
                        var dz = lpaint.pts[cindex][2] - lpaint.pts[cindex-1][2];

                        if ((dx > 0 && dz == 0) || (dx < 0 && dz == 0))
                        {
                        
                            if (dx > 0)                            
                            {
                                arrCars[i][j].positionZ += LANE_WIDE * 100 / 2;
                                carRot = Math.round(Math.PI * 1000 / 2 * 0) / 1000;
                            }
                            else
                            {
                                arrCars[i][j].positionZ -= LANE_WIDE * 100 / 2;
                                carRot = Math.round(Math.PI * 1000 / 2 * 2) / 1000;
                            }
    
                        } 
                        else if ((dx == 0 && dz > 0) || (dx == 0 && dz < 0)) {
                            arrCars[i][j].positionX += LANE_WIDE* 100 / 2;
                            if (dz > 0)
                                carRot = Math.round(Math.PI * 1000 / 2 * 1) / 1000;
                            else
                                carRot = Math.round(Math.PI * 1000 / 2 * 3) / 1000;
                        }
                        else if (dx > 0) {              
                            arrCars[i][j].positionX += LANE_WIDE* 100 / 2;
                                if (dz > 0)
                                {
                                arrCars[i][j].positionZ += LANE_WIDE* 100 / 2;
                                carRot = Math.round(Math.PI *  1000 / 4 * 5) / 1000;
                                }
                                else 
                                {
                                arrCars[i][j].positionZ -= LANE_WIDE* 100 / 2;
                                carRot = Math.round(Math.PI *  1000 / 4 * 3) / 1000;
                                }
                        }
                        else if (dx < 0 ) {
                            arrCars[i][j].positionX -= LANE_WIDE* 100 / 2;
                            if (dz > 0)
                            {
                                arrCars[i][j].positionZ += LANE_WIDE* 100 / 2;
                                carRot = Math.round(Math.PI *  1000 / 4 * 7) / 1000;
                            }
                            else 
                            {
                                arrCars[i][j].positionZ -= LANE_WIDE* 100 / 2;
                                carRot = Math.round(Math.PI *  1000 / 4) / 1000;
                            }
                        }
                    }
                     
                     // check to reach the end.
                     if (cindex > 0) // If the car is started already
                     {                        
                         if (arrCars[i][j].laneFlow == 1)
                         {                           
                             if (arrCars[i][j].laneDirection)
                             {
                                 if (arrCars[i][j].positionZ >= CAMERA_AREA_LONG * 100)
                                    arrCars[i][j].status = 2;
                             } 
                             else 
                             {
                                if (arrCars[i][j].positionZ <= 0)
                                    arrCars[i][j].status = 2;                                
                             }
                         }                            
                         else if (arrCars[i][j].laneFlow == 16)
                         {
                           
                             if (arrCars[i][j].laneDirection)
                             {
                                if(arrCars[i][j].positionX >= MAX_X * 100)
                                    arrCars[i][j].status = 2;
                                
                             } 
                             else
                             {
                                if (arrCars[i][j].positionX <= MIN_X * 100)
                                    arrCars[i][j].status = 2;
                             }
                         }
                         else if (arrCars[i][j].laneFlow == 32)
                         {
                           
                             if (arrCars[i][j].positionX <= MIN_X * 100)
                                 arrCars[i][j].status = 2;                             
                         }
                     }
                                         
                     arrCarItemSeg[i][j].dcv.apts.push({
                        dur : FVIS_CAPTURE_FREQ,
                        seg : i + 1,
                        rot : carRot,
                        pt : [arrCars[i][j].positionX, arrCars[i][j].positionY, arrCars[i][j].positionZ]
                    });

                     // check crossway
                     if (idxCamera == 10)
                     {
                        for (var st = 0;  st <  crossways10.length; st ++)
                        {
                            if (arrCars[i][j].path_Index === crossways10[st].stoplane &&
                                arrCars[i][j].current_Index > crossways10[st].stopIndex &&  
                                arrCars[i][j].current_Index < (crossways10[st].stopIndex + MAX_SPEED))
                            {                             
                                if (Math.random() > 0.7)
                                {
                                    arrCars[i][j].path_Index = crossways10[st].change[0].sLane;
                                    arrCars[i][j].current_Index = (crossways10[st].change[0].sIndex - arrCars[i][j].speed);
                                   arrCars[i][j].laneFlow = crossways10[st].change[0].laneFlow;
                                    arrCars[i][j].laneDirection = crossways10[st].change[0].laneDirection;
                                }   
                                else
                                {
                                    arrCars[i][j].path_Index = crossways10[st].change[1].sLane;
                                    arrCars[i][j].current_Index = (crossways10[st].change[1].sIndex - arrCars[i][j].speed);
                                    arrCars[i][j].laneFlow = crossways10[st].change[1].laneFlow;
                                    arrCars[i][j].laneDirection = crossways10[st].change[1].laneDirection;  
                                }
                            }
                        }
                     }
                 }
            }
        }
    }

    for ( var i = 0; i <  objEmeta.items[0].dcv.segs.length; i ++)
    {
        for (var j = 0; j < arrCarItemSeg[i].length; j ++)
        {   
            arrCarItemSeg[i][j].dcv.etick32 = arrCarItemSeg[i][j].dcv.tick32 + arrCarItemSeg[i][j].dcv.apts.length;            
            objJsonCapture.items.push({
                 dck : arrCarItemSeg[i][j].dck,
                 dcv : arrCarItemSeg[i][j].dcv
            });
        }           
    }
     
     return objJsonCapture;
} 
