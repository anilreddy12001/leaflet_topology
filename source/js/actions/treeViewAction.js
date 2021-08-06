import axios from 'axios';
import React, { Component } from 'react';
import { UAM_LABELS } from "../helpers/uam/uamConstants";
import { Snackbar } from '@nokia-csf-uxr/csfWidgets';





export const fetchRootLocations = (data)=>{
   var iconUrlImage=data.IconUrl;
    return function (dispatch) {
          return axios({
                  method: data.method,
                  url: data.url,
                  headers: data.requestHeaders.headers,
                
              }).then(function (response) {
                     
            //  console.log(response.data);
              var mainarr = new Array();
              var rootLocationData = fetchRootLoc(response.data,iconUrlImage);
            
            
            dispatch({
                type: 'FETCH_ROOTLOC_DATA',
                payload: {
                    response: rootLocationData

                }

            });
        }) ;
}
}

function fetchRootLoc (data,iconUrl){
  //  console.log(data);
    var temparr = {};
    var obj1={};
   var mainarr =[];
   
    for(var i=0;i<data.entities.length;i++){
       temparr.label=data.entities[i].properties.SureName;
       if(data.entities[i].relationships&&data.entities[i].relationships.LOCATED_AT){
       for(var j=0;j<data.entities[i].relationships.LOCATED_AT.relationship.length;j++){
       if(data.entities[i].relationships && data.entities[i].relationships.LOCATED_AT && data.entities[i].relationships.LOCATED_AT.relationship&&data.entities[i].relationships.LOCATED_AT.relationship[j].Source.relationships.HAS_STATE){
     var statusAlarm =data.entities[i].relationships.LOCATED_AT.relationship[j].Source.relationships.HAS_STATE.relationship[0].Target.properties.AORAlarmState
    if(statusAlarm){
     var iconStatus=statusAlarm.toLowerCase();
     temparr.icon = iconUrl+require("../../images/map/"+iconStatus+".svg") ;
    }
       }
       }
    }
    else{
        temparr.icon = iconUrl+require("../../images/map/UNKNOWN.svg") ;
    }
      temparr.collapsed=true;
     temparr.UUID=data.entities[i].properties.UUID;
     temparr.children=[data.entities[i].relationships];
     obj1= Object.assign({}, temparr);
     mainarr.push(obj1);
    
   }
 //  console.log(temparr);
  mainarr.sort(dynamicSort("label"));
   return mainarr;
  
   }

   function dynamicSort(property) {
    var sortOrder = 1;

    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a,b) {
        if(sortOrder == -1){
            return b[property].localeCompare(a[property]);
        }else{
            return a[property].localeCompare(b[property]);
        }        
    }
}





export const locationData = (data) => {
    var iconImageUrl=data.IconUrl;
    var statesData=data.locStates;
    var alarmAttr=data.locStateAttribute;
    return function (dispatch) {


        return axios.all([
            axios({
                method: 'POST',
                url: data.url,
                headers: data.requestHeaders.headers,
                data: data.expandPayload
            }),
            axios({
                method: 'POST',
                url: data.url,
                headers: data.requestHeaders.headers,
                data: data.locPayload
            })


        ]).then(axios.spread(function (expandResponse, locListResponse) {
            var locEquiparr = new Array();
           // console.log(locListResponse);
            var listOfLocationsEquip = fetchLocEquip(locListResponse.data, locEquiparr,iconImageUrl);
          //  console.log(locEquiparr);
            var mainarr = new Array();
            var treeLocationData = fetchLocationData2(expandResponse.data.element[0], 0, mainarr);
         //   console.log(mainarr);
          //  var OutputArray = [];
            var InputArray = JSON.parse(JSON.stringify(mainarr));
            //  InputArray.reverse();

            for (var i = 0; i < InputArray.length; i++) {
                var tempOutputItem = InputArray[i];
                if(InputArray[i+1]){
                var newChildObj= InputArray[i+1];
               for(var q=0;q<tempOutputItem.length;q++){
                tempOutputItem.label = tempOutputItem[q].label;
               
               
                var parentLabel= tempOutputItem.label;
              //  var childnotfound=false;
                for (var p=0;p<newChildObj.length;p++){
                    if(newChildObj[p].parent){
                        if(tempOutputItem.label==newChildObj[p].parent.SureName){
                            var  newChildArr=newChildObj[p];
                            var treeArrObject=  appendChild(tempOutputItem,  parentLabel, newChildArr);
                        }
                    }else{
                         var newChildArr=newChildObj[p];
                         var treeArrObject=  appendChild(tempOutputItem,  parentLabel, newChildArr);
                        }
                
                  
                 
                }
            }
        }
                // if (InputArray[i + 1]) {

                //     tempOutputItem.children = [InputArray[i + 1]];
                //     OutputArray.push(tempOutputItem)
                // };
              //  console.log(tempOutputItem);
            }
          //  console.log(JSON.parse(JSON.stringify(OutputArray[0])));
          //  console.log(InputArray);
            treeLocationData=InputArray[0];

         

            // var alarmStateToDisplay = {};
            // statusAlarmsData.status.forEach(function (status) {
            //     let filteredobj = status.items.filter(function (item) {
            //         return item.text == status.value
            //     })[0];
            //     if (filteredobj.text)
            //     alarmStateToDisplay[filteredobj.text] = filteredobj.values.filter(function (value) {
            //             return value.enabled
            //         }).map(function (value) {
            //             let statusName = value.text.toUpperCase()
            //             let result = { text: statusName, color: value.color }
            //             if (value.badge)
            //                 result.badge = value.badge
            //             return result
            //         })
            // })

            var alarmStateToDisplay=[];
            for(var i=0;i<statesData.length;i++){
                if(alarmAttr==statesData[i].stateType){
                    alarmStateToDisplay=statesData[i].properties;
                }
            }

           propogateAlarm(treeLocationData[0],treeLocationData[0].label,alarmStateToDisplay,iconImageUrl);

           for (var i = 0; i < data.locationsList.length; i++) {
            if (treeLocationData[0].label == data.locationsList[i].label) {
                // treeLocationData.push(data.locationsList[i]);

                var expandedData = Object.assign({}, treeLocationData);
                var finalExpandData = Object.assign({}, expandedData[0]);
                data.locationsList[i] = finalExpandData;
            }

        }

            dispatch({
                type: 'FETCH_TREEVIEW_DATA',
                payload: {
                    response: data.locationsList,
                    locationResponse: listOfLocationsEquip

                }

            });
        }));

  }
  }

 function  appendChild(tempOutputItem1,  parentLabel1, newChildObj1) {
    for (var i=0; i<tempOutputItem1.length; i++) {
     var  obj = tempOutputItem1[i];
        if (obj.label==parentLabel1) {
            if (obj.children == null)
                   obj.children = [];
              obj.children.push(newChildObj1);
              return "success";
        }
    }
    for (var i=0; i<tempOutputItem1.length; i++) {
        if (tempOutputItem1[i].chlidren ){
        var childObjs = tempOutputItem1[i].chlidren;
            for (var j=0; i<childObjs.length; j++) {
            var subTreeObj = childObjs[j];
                if (appendChild(subTreeObj,  parentLabel1, newChildObj1) == "success")
                       return "success";
            }
        }
     }
     return "fail";
}

function propogateAlarm(rootObj,rootLabel, stateStatusList,iconUrl ) {
    console.log("Traversing " + rootObj.label);
    if (rootObj.children)
    {
    var childObjs = rootObj.children;
      for ( var j=0; j<childObjs.length; j++) {
        var childObj = childObjs[j];
         propogateAlarm(childObj,rootObj.label,stateStatusList,iconUrl);                                               //propogate_callback(subTreeObj, stateStatusList);
      }
    }
    if (rootObj.children){

               console.log("Propogating Alarm for "  + rootObj.label );
               for (var s=0;s<stateStatusList.length;s++) {
                   if(rootObj.aorAlarmStatus==stateStatusList[s].state){
                    rootObj.priority==stateStatusList[s].priority;     
                   }
               }                   // Write propogation code here
                var childObjects =   rootObj.children ;
                for(var p=0;p<childObjects.length;p++){
                   var childObject = childObjects[p];
                   console.log("Propogating Alarm from  " +  childObject.label +  "to"   + rootObj.label );
                    for (var s=0;s<stateStatusList.length;s++) {
                        if(rootObj.priority  && childObject.aorAlarmStatus && childObject.aorAlarmStatus==stateStatusList[s].state){
                           
                            childObject.priority=stateStatusList[s].priority;
                            if ( childObject.priority < rootObj.priority)  {
                                rootObj.priority = childObject.priority;
                                rootObj.aorAlarmStatus = childObject.aorAlarmStatus;
                            }
                           
                        }
                        else if ( childObject.aorAlarmStatus && childObject.aorAlarmStatus==stateStatusList[s].state) {
                            childObject.priority=stateStatusList[s].priority;
                            rootObj.priority = childObject.priority;
                            rootObj.aorAlarmStatus = childObject.aorAlarmStatus;

                        }
                    } 
                 
                }
                if(rootObj.aorAlarmStatus){
                    var alarmStateValue =rootObj.aorAlarmStatus;
                    rootObj.icon=iconUrl+require("../../images/map/"+alarmStateValue.toLowerCase()+".svg") ;    
                }
                else{
                    rootObj.icon=iconUrl+require("../../images/map/UNKNOWN.svg") ;  
                }

    }
    else if(rootObj.aorAlarmStatus){
       var alarmStateValue =rootObj.aorAlarmStatus;
        rootObj.icon=iconUrl+require("../../images/map/"+alarmStateValue.toLowerCase()+".svg") ;
    }
    else{
        rootObj.icon=iconUrl+require("../../images/map/UNKNOWN.svg") ;
    }

}





function fetchLocEquip(data, locEquiparr,imageUrlIcon, locEquipFinalObj) {
    const imgPath="../../images/";
     var locEquipDraw = [];
     var totalData = {};
     var result={};
     if (data) {
         for (var i = 0; i < data.element.length; i++) {
             if (data.element[i].relationships && data.element[i].relationships.LOCATED_AT && data.element[i].relationships.LOCATED_AT.relationship[0] && data.element[i].relationships.LOCATED_AT.relationship[0].Source.properties) {
                 var equipment = [];
                 result.state={};
                 var locEquipObj = JSON.parse(JSON.stringify(data.element[i].properties));
                 var hasAssociation = data.element[i].relationships && data.element[i].relationships.LOCATED_AT && data.element[i].relationships.LOCATED_AT.relationship
                 if (hasAssociation) {
                     function processAssociation(childNode, type) {
                         childNode.forEach(function (item) {
                             var targetNode = item.Target ? item.Target : item.Source
                             if (type) {
                                 result.state = result.state ? result.state : {};
                                 var filteredProperties = self.filtered_keys(targetNode.properties, /.*State/);
                                 filteredProperties.forEach(function (feature) {
                                     if (result.state[feature] && result.state[feature].indexOf(targetNode.properties[feature]) == -1) {
                                         result.state[feature].push(targetNode.properties[feature]);
                                     }
                                     else if (!result.state[feature]) {
                                         result.state[feature] = [targetNode.properties[feature]];
                                     }
                                 })
                             }
     
                             var childNodeAssociation = targetNode.relationships && targetNode.relationships.HAS_STATE && targetNode.relationships.HAS_STATE.relationship
                             if (childNodeAssociation)
                                 processAssociation(childNodeAssociation, "state")
                         })
                     }
                     processAssociation(hasAssociation);
                 }
 
              
                 for (var j = 0; j < data.element[i].relationships.LOCATED_AT.relationship.length; j++) {
                     equipment.push(data.element[i].relationships.LOCATED_AT.relationship[j].Source.properties);
                   
                 }
                 locEquipObj.state=result.state;
                // locEquipObj.icon=imageUrlIcon+require("../../images/critical.svg");
        //        if(result.state.AORAlarmState){
        //        var statusIconbadge=result.state.AORAlarmState;
        //        var iterator = statusIconbadge.values(); 
        //             for (var elements of iterator) { 
        //        console.log(elements); 
        //        locEquipObj.icon=imageUrlIcon+require("../../images/"+elements.toLowerCase()+".svg") ;
        //      }
            
        //  }
              
                 locEquipObj.equipmentList = equipment;
                 locEquiparr.push(locEquipObj);
             }
         }
     }
 
     for (var le = 0; le < locEquiparr.length; le++) {
         var locUuidVal = locEquiparr[le].UUID;
         var objLoc = locEquiparr[le];
      result = {
             id: locUuidVal
         }
         result.detail = objLoc;
 
 
         if (locEquiparr[le].Latitude && locEquiparr[le].Longitude) {
             result.latitude = locEquiparr[le].Latitude;
             result.longitude = locEquiparr[le].Longitude;
             result.name = locEquiparr[le].SureName;
             result.state=locEquiparr[le].state;
             result.icon=locEquiparr[le].icon;
             locEquipDraw.push(result);
         }
 
 
 
     }
     if (locEquipDraw.length > 0) {
         totalData = locEquipDraw.reduce(function (total, currentValue, i) {
             total[currentValue.id] = currentValue
             return total
         }, {})
     }
     console.log(totalData);
     locEquipFinalObj = totalData;
     return locEquipFinalObj;
 
 }
 
 self.filtered_keys = (obj, filter) => {
     var key, keys = [];
     for (key in obj) {
         if (obj.hasOwnProperty(key) && filter.test(key)) {
             keys.push(key);
         }
     }
     return keys;
 }
 
                 
             
         
 
     
 
 
 
 
 function fetchLocationData2(data, level, mainarr, parentobj, parentEquipment) {
   //  console.log(data);
     if (!parentobj) {
 
     }
     var parentFound;
 
     //if(mainarr==undefined || mainarr[level]==undefined){ var mainarr=new Array(0);} // if its the first time reaching this sub-level, create array
     if (mainarr[level] == undefined) mainarr[level] = []; // if its the first time reaching this sub-level, create array
     for (var dataindex = 0; dataindex < data.length; dataindex++) {
         if ((data[dataindex].Source && mainarr[level]) || (data[dataindex].Target && mainarr[level])) {
           //  console.log('if data');
 
             var temparr = {};
 
             //Adding state info the a temporary object and assigning it to the main array:
             if (data[dataindex].Source) {
                 if (data[dataindex].Source.relationships.HAS_STATE && data[dataindex].Source.relationships.HAS_STATE.relationship[0].Target.properties) {
                   //  var stateobj = data[dataindex].Source.relationships.HAS_STATE.relationship[0].Target.properties;
                     var mainobj = data[dataindex].Source.properties;
                     temparr = Object.assign({}, mainobj);
                     var statusAlarm= data[dataindex].Source.relationships.HAS_STATE.relationship[0].Target.properties.AORAlarmState;
                    if(statusAlarm){
                       // var iconStatus=statusAlarm.toLowerCase();
                        temparr.aorAlarmStatus=statusAlarm;
                      //  temparr.icon = iconUrl+require("../../images/map/"+iconStatus+".svg") ;
                       }
                    
                 } else {
                     //var stateobj ;
                     var mainobj = data[dataindex].Source.properties;
                    
                     temparr = Object.assign({}, mainobj);
                   //  temparr.aorAlarmStatus="unknown";

 // temparr.icon = iconUrl+require("../../images/map/UNKNOWN.svg") ;
                  //   console.log(data);
 
 
                 }
                 if (data[dataindex].parent) {
                   //  console.log(data[dataindex].parent);
                     temparr.parent = JSON.parse(JSON.stringify(data[dataindex].parent));
 }

                if(data[dataindex].Source.relationships&&data[dataindex].Source.relationships.LOCATED_AT){
                    for(var j=0;j<data[dataindex].Source.relationships.LOCATED_AT.relationship.length;j++){
                    if(data[dataindex].Source.relationships && data[dataindex].Source.relationships.LOCATED_AT && data[dataindex].Source.relationships.LOCATED_AT.relationship && data[dataindex].Source.relationships.LOCATED_AT.relationship[j].Source.relationships.HAS_STATE){
                  var statusAlarm =data[dataindex].Source.relationships.LOCATED_AT.relationship[j].Source.relationships.HAS_STATE.relationship[0].Target.properties.AORAlarmState
                 if(statusAlarm){
                 // var iconStatus=statusAlarm.toLowerCase();
                  temparr.aorAlarmStatus=statusAlarm;
                //  temparr.icon = iconUrl+require("../../images/map/"+iconStatus+".svg") ;
                 }
                    }
                    }
                 }
                 else{
                  //  temparr.aorAlarmStatus="unknown";
                   //  temparr.icon = iconUrl+require("../../images/map/UNKNOWN.svg") ;
                 }

                temparr.label = data[dataindex].Source.properties.SureName;
                temparr.collapsed = true;
                temparr.UUID = data[dataindex].Source.properties.UUID;
            } else if (data[dataindex].Target) {
                if (data[dataindex].Target.relationships.HAS_STATE && data[dataindex].Target.relationships.HAS_STATE.relationship[0].Target.properties) {
                    let stateobj = data[dataindex].Target.relationships.HAS_STATE.relationship[0].Target.properties;
                    let mainobj = data[dataindex].Target.properties;
                    temparr = Object.assign({}, stateobj, mainobj);
                  //  temparr.aorAlarmStatus=
                } else {
                    //let stateobj ;
                    let mainobj = {};
                    mainobj.children = [data[dataindex].Target.properties];
                    temparr = Object.assign({}, mainobj);
                }
                //let stateobj = data[dataindex].Target.relationships.HAS_STATE.relationship[0].Target.properties;
                // let mainobj = data[dataindex].Target.properties;
                //temparr = Object.assign({}, stateobj, mainobj);
                if (data[dataindex].NeoDirection == 'SOURCE_TO_TARGET') {
                    temparr.parentNode = true;
                } else if (data[dataindex].NeoDirection == 'TARGET_TO_SOURCE') {
                    temparr.parentNode = false;
                }
                temparr.label = data[dataindex].Target.properties.SureName;
                temparr.collapsed = true;
                temparr.UUID = data[dataindex].Target.properties.UUID;
               

                if (parentobj) {
                   // console.log(parentobj);
                    temparr.parent = parentobj;
                }
                //temparr.children=

            }

            // push the name in the sub-level array
            if (mainarr[level].children) {
                mainarr[level].children = temparr;
            } else {

            }
            mainarr[level].push(temparr);
            //arr[level].push(data.Source.properties);
        }
    }
    if (!data[dataindex] && data && level == 0) {
        var temparr;

        if (data.relationships.HAS_STATE && data.relationships.HAS_STATE.relationship[0].Target.properties) {
            let stateobj = data.relationships.HAS_STATE.relationship[0].Target.properties;
            let mainobj = data.properties;
            temparr = Object.assign({}, stateobj, mainobj);
        } else {
            //let stateobj = data.Target.relationships.HAS_STATE.relationship[0].Target.properties;
            let mainobj = data.properties;
            temparr = Object.assign({}, mainobj);
          //  temparr.aorAlarmStatus="unknown";
        }

        if(data.relationships&&data.relationships.LOCATED_AT){
//            var temparr={};
            for(var j=0;j<data.relationships.LOCATED_AT.relationship.length;j++){
            if(data.relationships && data.relationships.LOCATED_AT && data.relationships.LOCATED_AT.relationship&&data.relationships.LOCATED_AT.relationship[j].Source.relationships.HAS_STATE){
                var stateobj=Object.assign({}, data.relationships.LOCATED_AT.relationship[j].Source.relationships.HAS_STATE.relationship[0].Target.properties);
                temparr=Object.assign({}, stateobj);
          var statusAlarm =data.relationships.LOCATED_AT.relationship[j].Source.relationships.HAS_STATE.relationship[0].Target.properties.AORAlarmState;
         if(statusAlarm){
        //  var iconStatus=statusAlarm.toLowerCase();
        temparr.aorAlarmStatus=statusAlarm;
        //  temparr.aorAlarmStatus = iconUrl+require("../../images/map/"+iconStatus+".svg") ;
         }
   }
            }
         }
         else{
          //  temparr.aorAlarmStatus="unknown";
           //  temparr.icon = iconUrl+require("../../images/map/UNKNOWN.svg") ;
         }
 
         //var rowData=data.properties;
         temparr.collapsed = true;
         temparr.label = data.properties.SureName;
         if (data.NeoDirection == 'SOURCE_TO_TARGET') {
             temparr.parentNode = true;
         } else if (data.NeoDirection == 'TARGET_TO_SOURCE') {
             temparr.parentNode = false;
         }
 
         mainarr[0].push(temparr); // push the name in the sub-level array
     }
     var dataForTraverse = [];
     if (!data.length) {
       //  console.log('comes here for the first time when data length is 0');
         var data2 = JSON.parse(JSON.stringify(data));
         var data = [];
         data.push(data2);
 
     } else {
       //  console.log(data[0]);
       
         if (!data[0].Source.relationships.ASSOCIATES_WITH || !data[0].Source.relationships.ASSOCIATES_WITH.relationship) {
 
             //data=JSON.parse(JSON.stringify(origData));
          //   console.log("data:::");
          //   console.log(data);
         }
         // var data=JSON.parse(JSON.stringify(origData));
     }
 
     for (var dataind = 0; dataind < data.length; dataind++) {
      //   console.log("for loop ..the beginning.." + dataind);
      //   console.log(data);
         //var data2=data[dataind];
         //    data=data2;
 
      //   console.log(data);
 
         //LOCATED_AT: //if(selectedEntityTypeVar=='Equipment' ||selectedEntityTypeVar=='Endpoint'){
        //  if (data[dataind].Source && data[dataind].properties && data[dataind].Source.relationships.LOCATED_AT && data[dataind].Source.relationships.LOCATED_AT.relationship) {
 
        //      for (var index = 0; index < data[dataind].Source.relationships.LOCATED_AT.relationship.length; index++) { // for each node in children
        //          //console.log(data.Source.relationships.LOCATED_AT.relationship[index]);
        //          var parentobj = JSON.parse(JSON.stringify(data[dataind].Source.properties));
 
        //          parentFound = true;
        //          dataForTraverse.push(data[dataind].Source.relationships.LOCATED_AT.relationship[index]);
 
        //      }
        //  }
        //  else if (data[dataind].Target && data[dataind].properties && data[dataind].Target.relationships.LOCATED_AT && data[dataind].Target.relationships.LOCATED_AT.relationship) {
 
        //      for (var index = 0; index < data[dataind].Target.relationships.LOCATED_AT.relationship.length; index++) { // for each node in children
        //          //console.log(data.Target.relationships.RESIDES_ON.relationship[index]);
        //          var parentobj = JSON.parse(JSON.stringify(data[dataind].Target.properties));
 
        //          parentFound = false;
        //          dataForTraverse.push(data[dataind].Target.relationships.LOCATED_AT.relationship[index]);
 
        //      }
        //  } else if (data[dataind].relationships && data[dataind].relationships.LOCATED_AT && data[dataind].relationships.LOCATED_AT.relationship) {
 
        //      for (var index = 0; index < data[dataind].relationships.LOCATED_AT.relationship.length; index++) { // for each node in children
        //          //console.log(data.relationships.RESIDES_ON.relationship[index]);
        //          var parentobj = JSON.parse(JSON.stringify(data[dataind].properties));
        //          if (data[dataind].relationships.LOCATED_AT.relationship[index].NeoDirection == 'SOURCE_TO_TARGET') {
        //              //console.log("parent node found..");
 
        //              parentFound = true;
        //              dataForTraverse.push(data[dataind].relationships.LOCATED_AT.relationship[index]);
 
        //          } else if (data[dataind].relationships.LOCATED_AT.relationship[index].NeoDirection == 'TARGET_TO_SOURCE') {
 
        //              parentFound = true;
        //              dataForTraverse.push(data[dataind].relationships.LOCATED_AT.relationship[index]);
 
        //          }
 
 
 
 
 
 
        //              }
 
        //  }
         //ASSOCIATES_WITH
         if (data[dataind].Source && data[dataind].properties && data[dataind].Source.relationships.ASSOCIATES_WITH && data[dataind].Source.relationships.ASSOCIATES_WITH.relationship) {
          //   console.log("length of relationship array: " + data[dataind].Source.relationships.ASSOCIATES_WITH.relationship.length);
             for (var index = 0; index < data[dataind].Source.relationships.ASSOCIATES_WITH.relationship.length; index++) { // for each node in children
              //   console.log("inside data.source of associates with.." + index);
              //   console.log(data[dataind].Source.relationships.ASSOCIATES_WITH.relationship[index].Source.properties.SureName);
 
 
 
                 var parentobj = JSON.parse(JSON.stringify(data[dataind].Source.properties));
 
                 parentFound = true;
                 var tmpObj = data[dataind].Source.relationships.ASSOCIATES_WITH.relationship[index];
                 tmpObj.parent = data[dataind].Source.properties;
                 dataForTraverse.push(tmpObj);
               //  console.log(dataForTraverse);
             }
         } else if (data[dataind].Target && data[dataind].properties && data[dataind].Target.relationships.ASSOCIATES_WITH && data[dataind].Target.relationships.ASSOCIATES_WITH.relationship) {
 
             for (var index = 0; index < data[dataind].Target.relationships.ASSOCIATES_WITH.relationship.length; index++) { // for each node in children
               //  console.log("inside data.Target..: " + data[dataind].Target.relationships.ASSOCIATES_WITH.relationship[index]);
                 var parentobj = JSON.parse(JSON.stringify(data[dataind].Target.properties));
 
                 parentFound = false;
                 dataForTraverse.push(data[dataind].Target.relationships.ASSOCIATES_WITH.relationship[index]);
 
             }
         } else if (data[dataind].relationships && data[dataind].relationships.ASSOCIATES_WITH && data[dataind].relationships.ASSOCIATES_WITH.relationship) {
 
             for (var index = 0; index < data[dataind].relationships.ASSOCIATES_WITH.relationship.length; index++) { // for each node in children
                 //console.log(data.relationships.ASSOCIATES_WITH.relationship[index]);
                 var parentobj = JSON.parse(JSON.stringify(data[dataind].properties));
                 if (data[dataind].relationships.ASSOCIATES_WITH.relationship[index].NeoDirection == 'TARGET_TO_SOURCE') {
                     //console.log("parent node found..");
 
                     parentFound = true;
                     dataForTraverse.push(data[dataind].relationships.ASSOCIATES_WITH.relationship[index]);
                  //   console.log(data[dataind].relationships.ASSOCIATES_WITH.relationship[index].Source.properties.SureName);
                  //   console.log(parentobj);
 
                 } else if (data[dataind].relationships.ASSOCIATES_WITH.relationship[index].NeoDirection == 'TARGET_TO_SOURCE') {
 
                     parentFound = true;
                     dataForTraverse.push(data[dataind].relationships.ASSOCIATES_WITH.relationship[index]);
 
                 }
 
 
 
 
 
 
             }
 
         }
         //End of associates_with relationship condition..
         else {
 
           //  console.log("inside main else condition..loop through the next item in the main array.");
             /* dataForTraverse=JSON.parse(JSON.stringify(origData)).element[0].relationships.ASSOCIATES_WITH.relationship[0].Source.relationships.ASSOCIATES_WITH.relationship[1];
              parentFound=true;*/
         }
 
     }
 
 
     if (parentFound == true) {
         fetchLocationData2(dataForTraverse, level + 1, mainarr, parentobj);
 
     } else if (parentFound == false) {
      
         fetchLocationData2(dataForTraverse, level, mainarr, parentobj);
     }
 
 
 
     //   }
 
 
 
 
 
 }
 
