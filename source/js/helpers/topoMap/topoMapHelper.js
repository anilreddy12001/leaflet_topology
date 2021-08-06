/**
 *  
 * Helper: topoMapHelper.js
 * @Initiation of Topology Map
 * @version 1.0
 * @author Anil
 *
 */

import {
    getTopologyMapViewData,
    notify,
    callbackToggle
} from '../../actions/topologyMapAction.js';
import {
    pathBundleOccuredInit
} from '../../containers/topologyMapContainer.js';

import L from 'leaflet';

var maxLevel = -1;
let geoMapPathData = [];
var mapDetails;
var tile;
var mapLayers;
var stateDetails;
var savedlayerdata = [{
    'startLoc': '',
    'endLoc': ''
}];
var mapObjForCollapse={};
var savedIsolatedLayerData = [{
    'startLoc': '',
    'endLoc': ''
}];
var isolatedFlag = false;
var lastLayerRetrieved = false;
var lastLayerRetrievedNo = '';
var drawnItems = [];
var mapId = 'topologyMap';
var expanding = false;
var layerDrawn = -1;
var errorOccured = false;
var pathBundleOccured = pathBundleOccuredInit;
var layerNo = 0;
var isolatedLayerNo = 1;
var disabledPathColor = '#eaeaea';
var maxWidth = window.innerWidth * 0.55; //document.getElementById(mapId).offsetWidth;
var maxHeight = window.innerHeight * 0.7; //document.getElementById(mapId).offsetHeight;
var mapObj = '';
var tmap;
var currentSingleRowSelectedSureName = '';
//var stateAttribute=topologyOptions.stateAttribute;
var yx = L.latLng;
var xy = function (x, y) {
    if (L.Util.isArray(x)) { // When doing xy([x, y]);
        return yx(x[1], x[0]);
    }
    return yx(y, x); // When doing xy(x, y);
};
//
export const collapseIsolated= () =>{

    console.log("collapse triggered..");
    collapse();
    function collapse(){
        console.log("inside isolated collapse layerNo: "+layerNo+" isolatedLayerNo:"+isolatedLayerNo+" layerDrawn: " + layerDrawn);
        if (layerDrawn > 0) {
            console.log("mapObjForCollapse: mapObjForCollapse:: ");
            console.log(mapObjForCollapse);
            mapObjForCollapse.layers.splice(mapObjForCollapse.layers.length-1,1);
            console.log("mapObjForCollapse after splice: "+mapObjForCollapse.layers.length);
            console.log(mapObjForCollapse);
            hideLayer(layerNo);
            layerNo--;
            pathBundleOccured = false;
            isolatedFlag=false;
        } else {
            notify("Further collapse not possible");

            return;
        }
    }
    
}

export const payloadFunction = (UUID, layerNo, currentEntity) => {

    var pl = {
        "request": {
            "origin": {
                "@class": currentEntity,
                "UUID": UUID
            },
            "inclusion": {
                "gInclude": ["Service", "Path", "Endpoint", "FCP", "Equipment", "Network"],
                "relation": [{
                    "relType": "USES",
                    "direction": "OUTGOING"
                }, {
                    "relType": "CONSUMES",
                    "direction": "OUTGOING"
                }, {
                    "relType": "LINKS_TO",
                    "direction": "OUTGOING"
                }, {
                    "relType": "ASSOCIATES_WITH",
                    "direction": "OUTGOING"
                }, {
                    "relType": "PART_OF",
                    "direction": "OUTGOING"
                }, {
                    "relType": "CONNECTS_TO",
                    "direction": "OUTGOING"
                }, {
                    "relType": "DEPENDS_ON",
                    "direction": "OUTGOING"
                }, {
                    "relType": "ATTACHES_TO",
                    "direction": "OUTGOING"
                }, {
                    "relType": "TERMINATES_ON",
                    "direction": "OUTGOING"
                }, {
                    "relType": "RELIES_ON",
                    "direction": "OUTGOING"
                }, {
                    "relType": "ROUTES_TO",
                    "direction": "OUTGOING"
                }, {
                    "relType": "RESIDES_ON",
                    "direction": "OUTGOING"
                }, {
                    "relType": "FORWARDS_TO",
                    "direction": "OUTGOING"
                }, {
                    "relType": "BELONGS_TO",
                    "direction": "OUTGOING"
                }]
            }
        },
        "response": {
            "responseType": "List",
            "entity": ["Path"],
            "levelData": {
                "level": [layerNo]
            },
            "embedEntity": ["Location"]
        },
        "expand": ["Equipment.Location", "Path.State", "Path.FCP", "Path.Endpoint", "Path.Equipment", "Endpoint.State", "FCP.State"]
    };

    return pl;
}
//The main function to parse response(taken from topologycontroller of angularjs portal):
export const parseData = (data, equipmentFlag, stateAttributeKey, isolatedExpand, isolatedLayerNo, mapObj) => {
    //console.log("tprops inside parsedata: "+JSON.stringify(tprops));
    //export const getgeoMapformattedData = (resolve) => { 
    console.log("inside parsData: layer:: " + layerNo + "equipmentflag: " + equipmentFlag + "stateAttributeKey:" + stateAttributeKey + "isolatedExpand"+isolatedExpand+" :isolatedLayerNo: "+isolatedLayerNo+" mapObj:: " + mapObj);

    if (isolatedExpand) {
        isolatedFlag = true;
       }
    else{
        isolatedFlag = false;
    }

    if (!isolatedExpand && isolatedLayerNo==0) {
        savedlayerdata = [{
            startLoc: '',
            endLoc: ''
        }];
        pathBundleOccured=false;
     //   savedlayerdata[0] = savedlayerdata[0];
    }
    console.log("savedlayerdata follows:");
    console.log(savedlayerdata);
    if(!isolatedExpand){
       //layerNo=isolatedLayerNo;
    }
    if (isolatedExpand && isolatedLayerNo == 0) {
        savedIsolatedLayerData = [{
            startLoc: '',
            endLoc: ''
        }];
    }

    if (equipmentFlag) {
        var parsedData = {
            SureName: '',
            layers: [{
                equipments: [

                ],
                pathBundles: []
            }]
        };
    } else {
        var parsedData = {
            SureName: '',
            layers: [{
                locations: [

                ],
                pathBundles: []
            }]
        };
    }
    if (!data || !data.data || !data.data.element) {
        console.log("Error in REST response, so exiting.." + JSON.stringify(data));
        errorOccured = true;
        return null;
    }else{
        errorOccured = false;

    }
    var arr = [];
    //var locState =[];
    var pathBundles = [];
    pathBundles.length = 0;
    var uniqueArray = [];
    var alarmstateField = "";
    var equipmentArray = [];
    var data = data.data;
    var concatObj;
    parsedData.SureName = data.element[0].properties.SureName;
    for (var prop in data.element[0].properties) {
        parsedData[prop] = data.element[0].properties[prop];
    }
    for (var a1 = 0; a1 < data.element.length; a1++) {
        if (data.element[a1].relationships.LOCATED_AT.relationship.length != 2) {
            notify('Invalid REST Response'); //The relationship object should exactly have 2 locations to draw a path.

            return;
        }
        var ATTACHES_TO_INDEX = 0;
        var TERMINATES_ON_INDEX = 0;
        var LINKS_TO_INDEX = 0;
        alarmstateField = "";

        if (data.element[a1].relationships.HAS_STATE) {
            for (var stindex = 0; stindex < data.element[a1].relationships.HAS_STATE.relationship.length; stindex++) {
                if (data.element[a1].relationships.HAS_STATE && data.element[a1].relationships.HAS_STATE.relationship[stindex] && data.element[a1].relationships.HAS_STATE.relationship[stindex].Target) {
                    if (data.element[a1].relationships.HAS_STATE.relationship[stindex].Target.properties[stateAttributeKey]) {
                        alarmstateField = data.element[a1].relationships.HAS_STATE.relationship[stindex].Target.properties[stateAttributeKey];
                    }
                } else {
                    alarmstateField = "";
                }
            }
        }
        data.element[a1].properties[stateAttributeKey] = alarmstateField;
        for (var j1 = 0; j1 < data.element[a1].relationships.LOCATED_AT.relationship.length; j1++) {
            concatObj = data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties;

            //Adding state attribute to locations: 
            if (data.element[a1].relationships.LINKS_TO && data.element[a1].relationships.LINKS_TO.relationship[j1] && data.element[a1].relationships.LINKS_TO.relationship[j1].Target.relationships.HAS_STATE && data.element[a1].relationships.LINKS_TO.relationship[j1].Target.relationships.HAS_STATE.relationship[0].Target.properties) {
                if (data.element[a1].relationships.LINKS_TO.relationship[j1].Target.relationships.HAS_STATE.relationship[0].Target.properties) {
                    //locState.push({'SureName': data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties.SureName, stateAttributeKey: data.element[a1].relationships.HAS_STATE.relationship[j1].Target.properties[stateAttributeKey]});   
                    //delete data.element[a1].relationships.HAS_STATE.relationship[j1].Target.properties.SureName;
                    data.element[a1].relationships.LINKS_TO.relationship[j1].Target.relationships.HAS_STATE.relationship[0].Target.properties.SureName = data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties.SureName;
                    concatObj = Object.assign(data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties, data.element[a1].relationships.LINKS_TO.relationship[j1].Target.relationships.HAS_STATE.relationship[0].Target.properties);
                    //concatObj.SureName=concatObj.DisplayName;
                }

                //console.log("locState::: "+JSON.stringify(locState));
            }
            arr.push(concatObj);
            console.log("initial arr: " + JSON.stringify(arr) + "concatobj: " + JSON.stringify(concatObj));

            //arr.push(data.element[a1].relationships.HAS_STATE.relationship[j1].Target.properties[stateAttributeKey]);
            //Checking for equipment flag and pushing data into it:
            //console.log("location array" + arr);
            if (data.element[a1].relationships.PART_OF && equipmentFlag) {
                equipmentArray.push({
                    equip: data.element[a1].relationships.PART_OF.relationship[j1].Target.properties.SureName,
                    equipProperties: data.element[a1].relationships.PART_OF.relationship[j1].Target.properties,
                    loc: data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties.SureName,
                    locProperties: data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties
                });
                if (data.element[a1].relationships.PART_OF.relationship[j1].Target.relationships.HAS_STATE && data.element[a1].relationships.PART_OF.relationship[j1].Target.relationships.HAS_STATE.relationship) {
                    delete(data.element[a1].relationships.PART_OF.relationship[LINKS_TO_INDEX].Target.relationships.HAS_STATE.relationship[0].Target.properties.SureName);
                    Object.assign(equipmentArray[j1].equipProperties, data.element[a1].relationships.PART_OF.relationship[LINKS_TO_INDEX].Target.relationships.HAS_STATE.relationship[0].Target.properties);

                }

            } else if (data.element[a1].relationships.RESIDES_ON && equipmentFlag) {
                equipmentArray.push({
                    equip: data.element[a1].relationships.RESIDES_ON.relationship[j1].Target.properties.SureName,
                    equipProperties: data.element[a1].relationships.RESIDES_ON.relationship[j1].Target.properties,
                    loc: data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties.SureName,
                    locProperties: data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties
                });

                if (data.element[a1].relationships.RESIDES_ON.relationship[j1].Target.relationships.HAS_STATE && data.element[a1].relationships.RESIDES_ON.relationship[j1].Target.relationships.HAS_STATE.relationship) {
                    delete(data.element[a1].relationships.RESIDES_ON.relationship[j1].Target.relationships.HAS_STATE.relationship[0].Target.properties.SureName);
                    Object.assign(equipmentArray[j1].equipProperties, data.element[a1].relationships.RESIDES_ON.relationship[j1].Target.relationships.HAS_STATE.relationship[0].Target.properties);
                }

            } else if (data.element[a1].relationships.ROUTES_TO && equipmentFlag) {
                equipmentArray.push({
                    equip: data.element[a1].relationships.ROUTES_TO.relationship[j1].Target.properties.SureName,
                    equipProperties: data.element[a1].relationships.ROUTES_TO.relationship[j1].Target.properties,
                    loc: data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties.SureName,
                    locProperties: data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties
                });
                if (data.element[a1].relationships.ROUTES_TO.relationship[j1].Target.relationships.HAS_STATE && data.element[a1].relationships.ROUTES_TO.relationship[j1].Target.relationships.HAS_STATE.relationship) {
                    delete(data.element[a1].relationships.ROUTES_TO.relationship[j1].Target.relationships.HAS_STATE.relationship[0].Target.properties.SureName);
                    Object.assign(equipmentArray[j1].equipProperties, data.element[a1].relationships.ROUTES_TO.relationship[j1].Target.relationships.HAS_STATE.relationship[0].Target.properties);
                }

            } else if (data.element[a1].relationships.ATTACHES_TO && data.element[a1].relationships.ATTACHES_TO.relationship[ATTACHES_TO_INDEX]) {
                equipmentArray.push({
                    equip: data.element[a1].relationships.ATTACHES_TO.relationship[ATTACHES_TO_INDEX].Target.properties.SureName,
                    equipProperties: data.element[a1].relationships.ATTACHES_TO.relationship[ATTACHES_TO_INDEX].Target.properties,
                    loc: data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties.SureName,
                    locProperties: data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties
                });

                if (data.element[a1].relationships.ATTACHES_TO.relationship[ATTACHES_TO_INDEX].Target.relationships.HAS_STATE && data.element[a1].relationships.ATTACHES_TO.relationship[ATTACHES_TO_INDEX].Target.relationships.HAS_STATE.relationship) {
                    delete(data.element[a1].relationships.ATTACHES_TO.relationship[ATTACHES_TO_INDEX].Target.relationships.HAS_STATE.relationship[0].Target.properties.SureName);
                    Object.assign(equipmentArray[j1].equipProperties, data.element[a1].relationships.ATTACHES_TO.relationship[ATTACHES_TO_INDEX].Target.relationships.HAS_STATE.relationship[0].Target.properties);
                }

                ATTACHES_TO_INDEX++;
            } else if (data.element[a1].relationships.TERMINATES_ON && data.element[a1].relationships.TERMINATES_ON.relationship[TERMINATES_ON_INDEX]) {
                equipmentArray.push({
                    equip: data.element[a1].relationships.TERMINATES_ON.relationship[TERMINATES_ON_INDEX].Target.properties.SureName,
                    equipProperties: data.element[a1].relationships.TERMINATES_ON.relationship[TERMINATES_ON_INDEX].Target.properties,
                    loc: data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties.SureName,
                    locProperties: data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties
                });
                if (data.element[a1].relationships.TERMINATES_ON.relationship[TERMINATES_ON_INDEX].Target.relationships.HAS_STATE && data.element[a1].relationships.TERMINATES_ON.relationship[TERMINATES_ON_INDEX].Target.relationships.HAS_STATE.relationship) {
                    delete(data.element[a1].relationships.TERMINATES_ON.relationship[TERMINATES_ON_INDEX].Target.relationships.HAS_STATE.relationship[0].Target.properties.SureName);
                    Object.assign(equipmentArray[j1].equipProperties, data.element[a1].relationships.TERMINATES_ON.relationship[TERMINATES_ON_INDEX].Target.relationships.HAS_STATE.relationship[0].Target.properties);
                }

                TERMINATES_ON_INDEX++;
            } else if (data.element[a1].relationships.LINKS_TO && data.element[a1].relationships.LINKS_TO.relationship[LINKS_TO_INDEX]) {
                equipmentArray.push({
                    equip: data.element[a1].relationships.LINKS_TO.relationship[LINKS_TO_INDEX].Target.properties.SureName,
                    equipProperties: data.element[a1].relationships.LINKS_TO.relationship[LINKS_TO_INDEX].Target.properties,
                    loc: data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties.SureName,
                    locProperties: data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties
                });
                if (data.element[a1].relationships.LINKS_TO.relationship[LINKS_TO_INDEX].Target.relationships.HAS_STATE && data.element[a1].relationships.LINKS_TO.relationship[LINKS_TO_INDEX].Target.relationships.HAS_STATE.relationship) {
                    delete(data.element[a1].relationships.LINKS_TO.relationship[LINKS_TO_INDEX].Target.relationships.HAS_STATE.relationship[0].Target.properties.SureName);
                    Object.assign(equipmentArray[j1].equipProperties, data.element[a1].relationships.LINKS_TO.relationship[LINKS_TO_INDEX].Target.relationships.HAS_STATE.relationship[0].Target.properties);
                }
                LINKS_TO_INDEX++;
            }



            if (data.element[a1].relationships.LOCATED_AT.relationship[j1 + 1] && data.element[a1].relationships.LOCATED_AT.relationship[j1 + 1].Target.properties.SureName) {
                var paths = {};
                for (var key in data.element[a1].properties) {
                    var value = data.element[a1].properties[key];
                    paths[key] = value;
                }
                pathBundles.push({
                    startLocation: data.element[a1].relationships.LOCATED_AT.relationship[j1].Target.properties.SureName,
                    endLocation: data.element[a1].relationships.LOCATED_AT.relationship[j1 + 1].Target.properties.SureName,
                    paths: [data.element[a1].properties]
                });
            }
        }
    }
    //console.log("equipmentArray:: " + JSON.stringify(equipmentArray));
    //Checking for multiple similar paths in a pathbundle and adding those path names in the paths array:
    for (var pbIndex = 0; pbIndex < pathBundles.length; pbIndex++) {
        for (var pbInnerIndex = 0; pbInnerIndex < pathBundles.length; pbInnerIndex++) {
            if (pbIndex != pbInnerIndex) {
                if ((pathBundles[pbIndex].startLocation == pathBundles[pbInnerIndex].startLocation || pathBundles[pbIndex].startLocation == pathBundles[pbInnerIndex].endLocation) && (pathBundles[pbIndex].endLocation == pathBundles[pbInnerIndex].startLocation || pathBundles[pbIndex].endLocation == pathBundles[pbInnerIndex].endLocation)) {
                    pathBundles[pbIndex].paths.push(pathBundles[pbInnerIndex].paths[0]);
                }
            }
        }
    }
    var newArr = [];
    //console.log("pathBundles: " + JSON.stringify(pathBundles));
    for (var a = 0; a < pathBundles.length; a++) {
        var exists = false;
        for (var b = 0; b < newArr.length; b++) {
            if (((pathBundles[a].startLocation == newArr[b].startLocation) || (pathBundles[a].startLocation == newArr[b].endLocation)) && ((pathBundles[a].endLocation == newArr[b].endLocation) || (pathBundles[a].endLocation == newArr[b].startLocation))) {
                //console.log("pathBundles[a].startLocation:: " + pathBundles[a].startLocation + " exists true");
                exists = true;
            };
        }
        if (exists == false && pathBundles[a].id != "") {
            newArr.push(pathBundles[a]);
        }
    }
    //check if the new start and end locations got shuffled:
    //console.log("savedlayerdata[0].endLoc::: " + JSON.stringify(savedlayerdata[0]) + "arr[0]: " + arr[0]);
    if (!isolatedExpand) {
        if (arr.length == 2 && savedlayerdata[0].endLoc == arr[0].SureName && savedlayerdata[0].startLoc == arr[arr.length - 1].SureName) {
            console.log("shuffling loc arr: ");
            var temploc = arr[0];
            arr[0] = arr[1]; //savedlayerdata[0].startLoc;
            arr[1] = temploc; //savedlayerdata[0].endLoc;
        }
    } else {
        if (arr.length == 2 && savedIsolatedLayerData[0].endLoc == arr[0].SureName && savedIsolatedLayerData[0].startLoc == arr[arr.length - 1].SureName) {
            console.log("shuffling loc arr: ");
            var temploc = arr[0];
            arr[0] = arr[1]; //savedlayerdata[0].startLoc;
            arr[1] = temploc; //savedlayerdata[0].endLoc;


        }
    }


    //console.log("pathbundles(newArr): " + newArr + " locations arr: " + arr);
    pathBundles = newArr;
    console.log("inside parse data function::: savedlayerdata[0]: " + JSON.stringify(savedlayerdata)+" :layerNo: "+layerNo);
    //End of pathBundle logic...
    if (!isolatedExpand) {
        console.log("inside parse data fnction: savedlayerdata[0]: " + savedlayerdata[0]);
        var tempFirstItem = '';
        var tempLastItem = '';
        /*for (var arrayIndex = 0; arrayIndex < arr.length; arrayIndex++) {
            if (arr[0].SureName != savedlayerdata[0].startLoc) {
                tempFirstItem = arr[0];
                arr[0].SureName = savedlayerdata[0].startLoc;
            }
            if (arrayIndex != 0 && arr[arrayIndex].SureName == savedlayerdata[0].startLoc) {
                arr[arrayIndex] = tempFirstItem;
            }
            if (arr[arr.length - 1].SureName != savedlayerdata[0].endLoc) {
                tempLastItem = arr[arr.length - 1];
                arr[arr.length - 1].SureName = savedlayerdata[0].endLoc;
            }
            if (arrayIndex != arr.length - 1 && arr[arrayIndex].SureName == savedlayerdata[0].endLoc) {
                arr[arrayIndex] = tempLastItem;
            }
            
        }*/
        var matchedStartIndex = '-1';
        var matchedEndIndex = '-1';
        console.log("savedlayerdata[0] :: "+savedlayerdata[0]);
if(savedlayerdata[0].startLoc=='' || savedlayerdata[0].endLoc==''){
    console.log("inside savedlayerdata..");
    let searchItemStartEndLoc='';
    let startloc='';
    let endloc='';
for(let j=0;j<pathBundles.length;j++){
    searchItemStartEndLoc=pathBundles[j].startLocation;
var searchcountStartLoc=pathBundles.filter(function(item){
    return (item.startLocation == searchItemStartEndLoc || item.endLocation == searchItemStartEndLoc);
}).length;
    if(searchcountStartLoc==1){
        startloc=searchItemStartEndLoc;
   }
    searchItemStartEndLoc=pathBundles[j].endLocation;
    var searchcountEndLoc=pathBundles.filter(function(item){
    return (item.startLocation == searchItemStartEndLoc || item.endLocation == searchItemStartEndLoc);
}).length;
//    else if(searchItemStartEndLoc=pathBundles[j].endLocation){
  //          searchItemStartEndLoc=pathBundles[j].startLocation;
    //        }
console.log("searchcountStartLoc:: "+searchcountStartLoc+" searchcountEndLoc:: "+searchcountEndLoc);
 //setting start location and end location: 
    if(searchcountEndLoc==1){
    endloc=searchItemStartEndLoc;
    }
/*     if(searchcountStartLoc==1 || searchcountEndLoc==1){
        break;
        }*/
}
   savedlayerdata=[{startLoc: startloc,endLoc: endloc}];
      console.log("inside setting start and end loc of layer.. savedlayerdata::"+JSON.stringify(savedlayerdata));       
   }
        //savedlayerdata=[{startLoc: startloc,endLoc: endloc}];
        for (var arrayIndex = 0; arrayIndex < arr.length; arrayIndex++) {
            if (arr[arrayIndex].SureName == savedlayerdata[0].startLoc) {
                matchedStartIndex = arrayIndex;

            } else if (arr[arrayIndex].SureName == savedlayerdata[0].endLoc) {
                matchedEndIndex = arrayIndex;
            }

            if (matchedStartIndex != '-1' && matchedEndIndex != '-1') {
                break;
            }
        }

        if(matchedStartIndex!='-1' || matchedEndIndex!='-1'){
            tempFirstItem = arr[0];
            arr[0] = arr[matchedStartIndex];
        
        
            tempLastItem = arr[arr.length - 1];
            arr[arr.length - 1] = arr[matchedEndIndex];
        

        arr[matchedStartIndex] = tempFirstItem;
        arr[matchedEndIndex] = tempLastItem;

    }


        //After setting start and end location, finding the correct order of locations and reordering the pathbundles accordingly:
        console.log("arr after setting correct order of locations: " + savedlayerdata[0].startLoc + " to: " + savedlayerdata[0].endLoc+" matchedEndIndex:  "+matchedEndIndex);
        console.log(JSON.stringify(arr));
        var tempvar;/*
        for (var locindex2 = 1; locindex2 < arr.length - 1; locindex2++) {
            for (var pbindex2 = 0; pbindex2 < pathBundles.length; pbindex2++) {
                if (arr[locindex2].SureName == pathBundles[pbindex2].startLocation) {
                    if (arr[locindex2 + 1].SureName == pathBundles[pbindex2].endLocation) {
                        arr[locindex2 + 1]= pathBundles[pbindex2].endLocation;
                    }
                } else if (arr[locindex2].SureName == pathBundles[pbindex2].endLocation) {
                    if (arr[locindex2 + 1].SureName == pathBundles[pbindex2].startLocation) {
                        arr[locindex2 + 1]= pathBundles[pbindex2].startLocation;
                    }
                }
            }
        }*/
        
        var check=new Array;var searchItem=savedlayerdata[0].startLoc;console.log(searchItem);
  
var seqarr=new Array; seqarr[0]=savedlayerdata[0].startLoc;
//searchItem=savedLocations.startLoc;
for(var j=0;j<pathBundles.length;j++){ 

console.log("searchItem: "+searchItem);
var pbcheckSlocnEloc3 = pathBundles.filter(function(item){
    return ((item.startLocation == searchItem || item.endLocation == searchItem)&&(!item.checked));
});
if(pbcheckSlocnEloc3[0] && pbcheckSlocnEloc3[0].startLocation==searchItem){
seqarr.push(pbcheckSlocnEloc3[0].endLocation);
searchItem=pbcheckSlocnEloc3[0].endLocation;
pbcheckSlocnEloc3[0].checked=true;
}else if(pbcheckSlocnEloc3[0] && pbcheckSlocnEloc3[0].endLocation==searchItem){
seqarr.push(pbcheckSlocnEloc3[0].startLocation);
searchItem=pbcheckSlocnEloc3[0].startLocation;
pbcheckSlocnEloc3[0].checked=true;
}

console.log(pbcheckSlocnEloc3[0]);

}
        
        for(var i=0;i<seqarr.length;i++){
for(var k=0;k<arr.length; k++){
if(arr[k].SureName==seqarr[i]){
    arraymove(arr,k,i);
//console.log(origArr.length+" :: "+arr.length);
}
}
}

function arraymove(array, from, to) {
  array.splice(to, 0, array.splice(from, 1)[0]);
    return array;
};
        
    }

    //Logic to set correct order of locations:
    function countInArray(array, what, what2) {
        //console.log("inside countinarray: array:" + JSON.stringify(array));
        var count = 0;
        for (var i = 0; i < array.length; i++) {
            if ((array[i].startLocation == what || array[i].endLocation == what) && (array[i].startLocation == what2 || array[i].endLocation == what2)) {
                count++;
            }
        }
        console.log("countinarray: " + count);
        return count;
    }
    var sequence = '';
    for (var i = 0; i < arr.length; i++) {

        for (var j = 0; j < arr.length; j++) {
            /*if(arr.length==2){
                 
                sequence = sequence + arr[i].SureName + ':' + arr[j].SureName;
                }*/

            //else
            if ((arr[i].SureName != arr[j].SureName) && sequence.indexOf(arr[i].SureName) == -1) {

                //console.log("countInArray(pathBundles, arr[i], arr[j]):: " + countInArray(pathBundles, arr[i], arr[j]));
                if (countInArray(pathBundles, arr[i].SureName, arr[j].SureName) > 0) {
                    if (sequence == '') {
                        sequence = sequence + arr[i].SureName + ':' + arr[j].SureName;
                    } else {
                        sequence = sequence + ':' + arr[i].SureName + ':' + arr[j].SureName;
                    }
                }
            }
        }
    };

    var sequenceArray = sequence.split(':');
    
    var v = {};
    var eqn2 = [];
    for (var eqindex = 0; eqindex < equipmentArray.length; eqindex++) {
        if (!v.hasOwnProperty(equipmentArray[eqindex].equip)) {
            v[equipmentArray[eqindex].equip] = 1;
            eqn2.push(equipmentArray[eqindex]);
        }
    }
    var u = {};
    var loc2 = [];
    for (var i = 0, l = sequenceArray.length; i < l; ++i) {
        if (!u.hasOwnProperty(sequenceArray[i])) {
            if (equipmentFlag) {} else {}
            loc2.push({
                'SureName': sequenceArray[i],
                'locProperties': arr[i],
                'loc': arr[i].SureName
            });
            u[sequenceArray[i]] = 1;
        }
    }

    //Adding equipment data to parseddata(for the sake of right click>toggle):
    if (equipmentFlag) {
        var equipObj = {};
        for (var locindex3 = 0; locindex3 < loc2.length; locindex3++) {
            for (var eqindex3 = 0; eqindex3 < eqn2.length; eqindex3++) {
                equipObj = {};
                if (eqn2[eqindex3].loc == loc2[locindex3].SureName) {
                    equipObj.SureName = eqn2[eqindex3].equip;
                    if (eqn2[eqindex3].equipProperties[stateAttributeKey]) {
                        equipObj[stateAttributeKey] = eqn2[eqindex3].equipProperties[stateAttributeKey];
                    }
                    equipObj.location = {
                        SureName: eqn2[eqindex3].loc
                    };
                    parsedData.layers[0].equipments.push(equipObj);
                }
            }
        }
    } else {
        var uniqueLoc = [];
        for (var locindex3 = 0; locindex3 < loc2.length; locindex3++) {


            for (var eqindex3 = 0; eqindex3 < eqn2.length; eqindex3++) {

                var locObj = {};

                //console.log("locObj: " + JSON.stringify(locObj) + " ///////eqn2:" + JSON.stringify(eqn2));
                if (eqn2[eqindex3].loc == loc2[locindex3].SureName) {
                    if (uniqueLoc.indexOf(loc2[locindex3].SureName) == -1) {
                        //console.log("unique loc:"+loc2[locindex3].SureName+":locindex3:"+locindex3);
                        uniqueLoc.push(loc2[locindex3].SureName);
                        //locObj = eqn2[eqindex3];
                        locObj.SureName = loc2[locindex3].SureName;
                        //console.log("loc2[locindex3].locProperties: " + JSON.stringify(loc2[locindex3].locProperties));

                        loc2[locindex3].locProperties.SureName = loc2[locindex3].SureName;
                        /*for(let v=0;v<loc2.length;v++){
                        if(){}
                        }*/
                        Object.assign(locObj, loc2[locindex3].locProperties);
                        if (loc2[locindex3].locProperties[stateAttributeKey]) {
                            locObj[stateAttributeKey] = loc2[locindex3].locProperties[stateAttributeKey];
                            //Object.assign(locObj, loc2[locindex3].locProperties);
                        }



                        locObj.equipment = {
                            SureName: eqn2[eqindex3].equip
                        };
                        //Adding alarm state to equipment inside location object:
                        if (eqn2[eqindex3].equipProperties) {
                            locObj.equipment = eqn2[eqindex3].equipProperties;
                        }
                        
locObj.equipment[stateAttributeKey]=loc2[locindex3].locProperties[stateAttributeKey];
                        parsedData.layers[0].locations.push(locObj);
                        //console.log("parsedData.layers[0].locations::"+JSON.stringify(parsedData.layers[0].locations));
                    }
                    //console.log("loc obj: " + JSON.stringify(locObj) + " u: " + JSON.stringify(u) + " v: " + JSON.stringify(v) + " unique Loc: " + uniqueLoc);
                }
            }
        }
        console.log("unique locations: uniqueLoc:");
        console.log(uniqueLoc);
    }
    //                
    if (layerNo == 0) {
        //console.log("inside layer");
        savedlayerdata[0].startLoc = arr[0].SureName;
        savedlayerdata[0].endLoc = arr[arr.length - 1].SureName;
    } else if (isolatedLayerNo == 0) {
        //console.log("inside layer");
        savedIsolatedLayerData[0].startLoc = arr[0].SureName;
        savedIsolatedLayerData[0].endLoc = arr[arr.length - 1].SureName;
    }
    parsedData.layers[0].pathBundles = pathBundles;
    //var parsedDataFinal=parsedData;
    console.log("isolatedExpand flag: " + isolatedExpand + ", final parsed data:" + JSON.stringify(parsedData) + ", \n savedlayerdata[0]:" + JSON.stringify(savedlayerdata[0]));
    console.log("parsed data follows: ");
    console.log(parsedData);

    if (isolatedExpand) {
        console.log("layerNo:" + layerNo + " : isolatedLayerNo:: " + isolatedLayerNo);
        console.log(mapObj.topoMapObj.layers);
        var previousLayerData1 = {};
		if(mapObj.topoMapObj.layers && mapObj.topoMapObj.layers[layerNo]){
			Object.assign(previousLayerData1, mapObj.topoMapObj.layers[layerNo]);
		}else
		{
        notify("No isolated layer data found");
        return;
        }
         //.slice(); //JSON.parse(JSON.stringify(parsedData));
var prevUUID=mapObj.payload.request.origin.UUID;
        //var parsedDataIsolated=parsedData;
        var isolatedLayerData = parsedData;


        var finloc = [];
console.log(previousLayerData1);
        for (var pathBundleIndex = 0; pathBundleIndex < previousLayerData1.pathBundles.length; pathBundleIndex++) {
            console.log("pathBundleIndex" + pathBundleIndex);
            console.log(previousLayerData1.pathBundles[pathBundleIndex]);
          

            var layerPathdata =[];
            if(Array.isArray(previousLayerData1.pathBundles[pathBundleIndex].paths)==true){
            layerPathdata = previousLayerData1.pathBundles[pathBundleIndex].paths; //In actual implementation, this should be previous layer data.
            }
            else{
            layerPathdata[0] = previousLayerData1.pathBundles[pathBundleIndex].paths[0]; //In actual implementation, this should be previous layer data.
            }
            console.log("layerPathdata:" + JSON.stringify(layerPathdata));
            var pos = layerPathdata.map(function (e) {
                return e.UUID;
            }).indexOf(parsedData.SureName);

            
            //            if(pos==-1){pos=0;}
            if (pos != -1) {


                var part1 = layerPathdata.slice(0, pos-1);
                for (var pathlength = 0; pathlength < part1.length; pathlength++) {
                    part1[pathlength].disabledPath = true;

                }

                var part2 = layerPathdata.slice(pos + 1, layerPathdata.length);

                for (var pathlength = 0; pathlength < part2.length; pathlength++) {
                    part2[pathlength].disabledPath = true;

                }
                console.log("pos: " + pos + ", layerPathdata inside isolatedpath expansion: " + layerPathdata + "\n part1: " + JSON.stringify(part1) + '\n part2: ' + JSON.stringify(part2));
                if (isolatedLayerData.layers[0].pathBundles[pathBundleIndex]) {
                    var part1and2 = part1.concat(isolatedLayerData.layers[0].pathBundles[pathBundleIndex].paths.concat(part2));
                    isolatedLayerData.layers[0].pathBundles[pathBundleIndex].paths = Object.assign({}, part1and2);
                }



                if (part1.length == 0 && part2.length == 0) {
                    console.log(JSON.stringify(isolatedLayerData.layers[0].pathBundles));

                }
                //isolatedLayerData.layers[0].locations[pathBundleIndex].paths=part1and2;

            } else {
                for (let i = 0; i < layerPathdata.length; i++) {
                    //if(  layerPathdata[i].SureName == parsedData.SureName){
                      //if(previousLayerData1.pathBundles[pathBundleIndex].startLocation==parsedData.layers[0].locations[].SureName){  
                        if((parsedData.layers[0].locations.filter(e => e.SureName === previousLayerData1.pathBundles[pathBundleIndex].startLocation).length > 0) && (parsedData.layers[0].locations.filter(e => e.SureName === previousLayerData1.pathBundles[pathBundleIndex].endLocation).length > 0) && prevUUID==layerPathdata[i].SureName){
                        layerPathdata[i].disabledPath = false;
                            
                    }
                    else{
                    layerPathdata[i].disabledPath = 'true';
                    }

                }
                console.log("when isolated path isnt part of original path: pathbundles:");
                console.log(isolatedLayerData.layers[0].pathBundles[pathBundleIndex]);
                console.log(layerPathdata);

            }
            //loc1 is the previous layer location data:
            //var loc1 = previousLayerData1.locations.slice(0);



            //loc1=previousLayerData1.locations.slice(0);
            //loc1=JSON.parse( JSON.stringify( previousLayerData1.locations ) );

            var loc1 = new Array(previousLayerData1.locations.length);
            for (let origarrind = 0; origarrind < previousLayerData1.locations.length; origarrind++) {
                loc1[origarrind] = {};
                Object.assign(loc1[origarrind], previousLayerData1.locations[origarrind]);

            };


            //loc2 is the isolated path layer location data:
            var loc2 = new Array(isolatedLayerData.layers[0].locations.length);
            loc2 = isolatedLayerData.layers[0].locations.slice(0);
                    
                    //
            for (var locIndex = 0; locIndex < previousLayerData1.locations.length; locIndex++) {
                if (previousLayerData1.locations[locIndex].SureName == previousLayerData1.pathBundles[pathBundleIndex].startLocation || previousLayerData1.locations[locIndex].SureName == previousLayerData1.pathBundles[pathBundleIndex].endLocation) {
                    previousLayerData1.locations[locIndex].disabledLoc = true;
                    if(previousLayerData1.locations[locIndex].SureName==loc2[0].SureName || previousLayerData1.locations[locIndex].SureName==loc2[loc2.length-1].SureName){
                        
                            previousLayerData1.locations[locIndex].disabledLoc = false;
                        }

                }

            }
                    //
            //loc2=JSON.parse( JSON.stringify( isolatedLayerData.layers[0].locations ) );

            for (var loc1index = 0; loc1index < loc1.length; loc1index++) {
                loc1[loc1index].disabledLoc = true;
            }

            for (var loc2index = 0; loc2index < loc2.length; loc2index++) {
                loc2[loc2index].disabledLoc = false;
            }

            var locIndexStart = loc1.map(function (e) {
                return e.SureName;
            }).indexOf(loc2[0].SureName);

            var locIndexEnd = loc1.map(function (e) {
                return e.SureName;
            }).indexOf(loc2[loc2.length - 1].SureName);


            //var part1loc1=loc1.slice(0, locIndexStart);
            console.log("locIndexStart:: " + locIndexStart + " :locIndexEnd: " + locIndexEnd);
            var part1loc1= new Array(); for(let origarrind=0;origarrind<locIndexStart;origarrind++){
                part1loc1[origarrind] = {};
                Object.assign(part1loc1[origarrind], loc1[origarrind]);



            };
            
            
            console.log("loc1 follows:");
            console.log(loc1);

            

            var endlocloc1 = locIndexEnd + 1;
            var part2loc1 = new Array();

            for (let origarrind2 = 0; origarrind2 < (loc1.length - locIndexEnd)-1; origarrind2++) {
                if (locIndexEnd == loc1.length - 1) {
                    break;
                    //part2loc1[origarrind2]={};
                } else {
                    part2loc1[origarrind2] = {};
                }
                
                    Object.assign(part2loc1[origarrind2], loc1[endlocloc1]);
                endlocloc1++;
                
                


            };
            //part2loc1=loc1.slice(locIndexEnd + 1);

            
            //console.log(JSON.stringify(part2loc1));

var index1 = loc1.findIndex(x => x.SureName==loc2[0].SureName);
var index2= loc1.findIndex(x => x.SureName==loc2[loc2.length-1].SureName);
            
            if(index1>index2){
            var temploc2item=loc2[0];
                loc2[0]=loc2[loc2.length-1];
loc2[loc2.length-1]=temploc2item;        
            }
            var loc11='';
if(index1==0){
   loc11=loc1.slice(0,index1); 
   }
            else if(index1>0 && index1<loc1.length-1 && index1!=loc1.length-1){
                    loc11=loc1.slice(0,index1);//works for 0 and 1 location
                if(loc2.findIndex(x => x.SureName==loc11[loc11.length-1].SureName)!=-1){
                    loc11=loc11.slice(0, index1-1);
                }
                    console.log("index1>0 && index1<loc1.length-1");
                    }
            else if(index1==loc1.length-1){
                    
                     loc11=loc1.slice(0,index1+1);//works for end location
                    }
            
var loc12=loc1.slice(index2+1,loc2[loc1.length-1] );
            if(loc12.findIndex(x => x.SureName==loc2[0].SureName) != -1 ||loc12.findIndex(x => x.SureName==loc2[loc2.length-1].SureName) != -1){
                loc12=loc1.slice(index2+2,loc2[loc1.length-1] );
            }
          else{
              
       }

            
//var loc11=loc1.splice(0,index1);
//var loc12=loc1.splice(index2+1,loc1.length);
//loc1.splice(index,loc2.length-1,loc2); 
console.log("loc2: "); 
console.log(loc2); 
console.log("index1:"+index1+"loc1.length"+loc1.length+"loc11: "); console.log(loc11); console.log(" JSON.stringify(loc12):: "); console.log(loc12);
//console.log(" index1: "+index1+" index2: "+index2+" loc1: "+JSON.stringify(loc1));
if(loc11.length==0 && loc12.length==0)
{
notify("No isolated layer data found");
//return;
}
else if(loc11.length==0)
{
var locfinal=loc2.concat(loc12);
console.log('locfinal: ');console.log(locfinal);
} 
else if(loc12.length==0)
{
for(let i=0;i<loc2.length; i++){ 

    if(loc11[loc11.length-1].SureName==loc2[i].SureName){
    loc11.splice(loc11.length-1, 1);
    }
    else if(loc11[loc11.length-2].SureName==loc2[i].SureName){
    loc11.splice(loc11.length-2, 1);
    }
}
    
var locfinal=loc11.concat(loc2);
console.log('locfinal else if:: ');
console.log(locfinal);
} 

else
{
var locfinal=loc11.concat(loc2.concat(loc12));
console.log('locfinal else:: ');
console.log(locfinal);
}

//

            finloc = locfinal;


            //Object.assign(finloc, part1loc1.concat(loc2).concat(part2loc1));
            //isolatedLayerData.layers[0].locations[];  
            console.log("finloc follows:: loc11, loc2, finloc");
            console.log(loc11);
            console.log(loc2);
            //console.log(part2loc1);
            console.log(finloc);
        }//end of pathbundle 'for' loop...

        isolatedLayerData.layers[0].pathBundles.push.apply(isolatedLayerData.layers[0].pathBundles, previousLayerData1.pathBundles);
                  //Checking for the path from which isolated expand was performed and removing the same from the next layer:
        for(let pathBundleIndex=0;pathBundleIndex<isolatedLayerData.layers[0].pathBundles.length;pathBundleIndex++){
                for(let pathIndex=0; pathIndex<isolatedLayerData.layers[0].pathBundles[pathBundleIndex].paths.length; pathIndex++){
                if(isolatedLayerData.layers[0].pathBundles[pathBundleIndex].paths[pathIndex].UUID==prevUUID){
                   isolatedLayerData.layers[0].pathBundles.splice(pathBundleIndex, 1);
                    break;
                   }
                    else{
                    
                        
                        
                        
                    }
                    
                }
        }
        
        //
        var finalIsolatedData = {
            layers: [{
                locations: finloc,
                pathBundles: isolatedLayerData.layers[0].pathBundles
                }]
        };
        //isolatedLayerData//isolatedLayerData.layers[0].pathBundles
        console.log("new array for isolated path follows::");
        console.log(finalIsolatedData);
        //isolatedLayerData.layers[0].pathBundles

        //end of pathbundle creation for isolated path expansion:
        //start of location object creation for isolated path expansion:
        parsedData = finalIsolatedData;
    }

console.log("errorOcurred:"+errorOccured);
    //
    if(parsedData){errorOccured=false;}
    return parsedData;
};


export const drawLayer = (layerNoMax, mapObj, tprops, tmap1, isolatedCallBackFn, stateComp) => {
    var popupContent;
    if(mapObj){mapObjForCollapse=mapObj;}
    var TopoMapLayersData = {};
    var Markers = [];

    if (tmap1) {
        tmap = tmap1;

    }
    var stateAttribute = tprops.topologyOptions.stateAttribute;
     var drawIcons = tprops.topologyOptions.drawIcons;
    var baseUrl = tprops.topologyOptions.baseUrl;

    var markers = L.markerClusterGroup();
    markers.clearLayers();

    /*tmap.eachLayer(function (layer) {
    //tmap.removeLayer(drawnItems[layerNo])
}); */

    var removedlayers=[];
    for (let layer = 0; layer <= layerNoMax; layer++) {
        if (drawnItems[layer]) {
            for (let i = 0; i < drawnItems[layer].length; i++) {
                tmap.removeLayer(drawnItems[layer][i]);
            }
            removedlayers.push(layer);
                console.log("removed layer:"+layer+" removedlayers:  "+removedlayers);
        }

    }

    //redraw();

    for (var layerNo = 0; layerNo <= layerNoMax; layerNo++) {
        //if (layerNo == 0 && layerNoMax != 0) {
        console.log("indexof layerNo: "+removedlayers.indexOf(layerNo));
        if(layerNo==removedlayers[layerNo]){
        //layerNo=removedlayers[layerNo];
           }
        else{
        }
    console.log( drawnItems[layerNo]);
            /*if(drawnItems[layerNo] ){
                console.log("drawnItems[layerno]:: "+layerNo);
            layerNo = layerNo+1;
            }*/
        //removedlayers[0];
        //}
        if (layerNo != 0) {
            //    tmap.removeLayer(layerNo);
        }

        tmap.doubleClickZoom.disable();

        var lastLayerRetrievedNo = -2;
        layerDrawn = layerNo;
        var expanding = false;
        var AlarmStates = [];
        if (tprops.alarmStateData) {
            var alarm = tprops.alarmStateData;
            alarm.forEach(function (item) {
                AlarmStates.push(item.stateType);
            })
        }
        if (drawnItems.length < (layerNo + 1)) drawnItems.push(new Array());
        
        if (layerNo < mapObj.layers.length) {
            if (mapObj.layers[layerNo].locations != null) {
                for (var i = 0; i < mapObj.layers[layerNo].locations.length; i++) {
                  
                    var location = mapObj.layers[layerNo].locations[i];
                    var loc = xy(mapObj.layers[layerNo].locations[i].x, mapObj.layers[layerNo].locations[i].y);
                    var iconDisabled = '';
                    var normalSureName;
                    // custom icon
              if(mapObj.layers[layerNo].locations[i].disabledLoc && mapObj.layers[layerNo].locations[i].disabledLoc==true){
                  // uncomment later
                  var locVal = mapObj.layers[layerNo].locations[i].disabledLoc;
                  if(tprops.topologyOptions.iconUrl && tprops.topologyOptions.iconUrl.length!=0 && tprops.topologyOptions.iconUrl!=undefined){
                    var  locIconFile = tprops.topologyOptions.iconUrl + "UNKNOWN.svg";
                    
                   }
                  else{
                     locIconFile  = getIcon({
								 baseUrl : baseUrl,
								selected : false,
								badge : false,
                                statusPanelInit : true,
                            disabledLoc :locVal
							}, drawIcons); 
                  } 
                iconDisabled='disabled-loc';
            }else{
                if(tprops.topologyOptions.iconUrl && tprops.topologyOptions.iconUrl.length!=0 && tprops.topologyOptions.iconUrl!=undefined){
                     locIconFile = tprops.topologyOptions.iconUrl + "location_default_default.svg";
                   
                   }
                else {
                     locIconFile  = getIcon({
								 baseUrl : baseUrl,
								selected : false,
								badge : false,
                                statusPanelInit : true
							}, drawIcons);
                }
             iconDisabled='';
            }
                       if(tprops.topologyOptions.iconUrl && tprops.topologyOptions.iconUrl.length!=0 && tprops.topologyOptions.iconUrl!=undefined){
                    var equipIconFile = tprops.topologyOptions.iconUrl + "equipment_default_default.svg";
                            
                   }
                else {
                      var equipIconFile  = getIcon({
								 baseUrl : baseUrl,
								selected : false,
								badge : false,
                                statusPanelInit : true,
                          equipIcon : true
							}, drawIcons);
                }  
             var stateAttribute = tprops.topologyOptions.stateAttribute;
                    var states = {};
                    if (location.equipment[stateAttribute] != null) {
                        var locState = location.equipment[stateAttribute];
                        states[stateAttribute] = locState;
                        var color = 'None';
                        
                    }
                    if (location.equipment[stateAttribute] != null) {
                        var equipState = location.equipment[stateAttribute];
                        states[stateAttribute] = equipState;
                        //   equipIconFile = tprops.topologyOptions.baseUrl + require("../../../images/marker_equipment_" + stateAttribute.toLowerCase() + "_" + equipState.toLowerCase() + ".svg");
                    }
                    if (iconDisabled == 'disabled-loc') {
                        normalSureName = '';
                    } else {
                        normalSureName = mapObj.layers[layerNo].locations[i].SureName;
                    }

                    var states = {};
                    if (location) {
                        AlarmStates.forEach(
                            function (item) {
                                states[item] = location[item];
                            });
                    }
                    var props = tprops;
                    var toggleData = false;
                    var toggleEquip = false;
                    var marker = L.marker(loc, {
                        icon: new L.DivIcon({
                            className: 'p2pmap-icon-img',
                            html: '<img class="map-icon-img ' + iconDisabled + '" src="' + locIconFile + '"/>' + '<span class="icon-text">' + normalSureName + '</span>'
                        }),
                        contextmenu: true,
                        contextmenuItems: [{
                            text: 'Toggle',
                            callback: function (e) {
                                if (toggleData == true) {
                                    toggleData = false;
                                } else {
                                    toggleData = true;
                                }

                                var layerNo = e.relatedTarget.options.layerNo;
                                for (var i = 0; i < mapObj.layers[layerNo].locations.length; i++) {
                                    var sureName;
                                    var marker = mapObj.layers[layerNo].locations[i].marker;
                                    if (!mapObj.layers[layerNo].locations[i].disabledLoc || mapObj.layers[layerNo].locations[i].disabledLoc == false) {
                                        if (marker.options.iconFile == marker.options.locIconFile) {
                                            iconDisabled = '';
                                            var iconFile = marker.options.equipIconFile;
                                            marker.options.iconFile = iconFile;
                                            sureName = mapObj.layers[layerNo].locations[i].equipment.SureName;
                                            toggleEquip = true;
                                        } else {
                                            iconDisabled = '';
                                            var iconFile = marker.options.locIconFile;
                                            marker.options.iconFile = iconFile;
                                            sureName = mapObj.layers[layerNo].locations[i].SureName;
                                            toggleEquip = false;
                                        }

                                        marker.setIcon(new L.DivIcon({
                                            className: 'p2pmap-icon-img',
                                            html: '<img class="map-icon-img ' + iconDisabled + '"  src="' + iconFile + '"/>' + '<span class="icon-text">' + sureName + '</span>'
                                        }));
                                        marker.iconDetails.toggleState = toggleEquip;
                                        marker.iconDetails.locDisabeled = iconDisabled;

                                    }
                                }
                                props.callbackToggle(toggleData);
                            }
                        }]
                    }).addTo(tmap);

                    marker.iconDetails = {
                        baseUrl: tprops.topologyOptions.baseUrl,
                        //iconUrl: "../../../images/",
                        //badgeState : locState.toLowerCase(),
                        selected: false,
                        state: states,
                        locName: mapObj.layers[layerNo].locations[i].SureName,
                        toggleState: toggleEquip,
                        locDisabeled: iconDisabled,
                        stateAttribute : stateAttribute
                    }

                    Markers.push(marker);
                    tmap.setView(xy(maxWidth / 2, maxHeight / 2));
                    marker.options.iconFile = locIconFile;
                    marker.options.locIconFile = locIconFile;
                    marker.options.equipIconFile = equipIconFile;
                    marker.options.layerNo = layerNo;
                    location.marker = marker;
                    drawnItems[layerNo].push(marker);
                    //If same location exists in parent layer then draw dotted lines

                    if (layerNo > 0) {
                        if ((i == 0) || (i == mapObj.layers[layerNo].locations.length - 1)) {
                            var i2 = getArrayIndexByPropertyValue(mapObj.layers[layerNo - 1].locations, 'SureName', location.SureName);
                            if (i2 >= 0) {
                                var location2 = mapObj.layers[layerNo - 1].locations[i2];
                                var loc2 = xy(location2.x, location2.y);
                                var pLine = L.polyline([loc, loc2], {
                                    dashArray: '1,10'
                                }).addTo(tmap);
                                drawnItems[layerNo].push(pLine);
                            }

                    }else if((!mapObj.layers[layerNo].locations[i].disabledLoc)||(mapObj.layers[layerNo].locations[i].disabledLoc&&mapObj.layers[layerNo].locations[i-1].disabledLoc==true&&mapObj.layers[layerNo].locations[i].disabledLoc==false)||(mapObj.layers[layerNo].locations[i].disabledLoc&&mapObj.layers[layerNo].locations[i-1].disabledLoc==false&&mapObj.layers[layerNo].locations[i].disabledLoc==false)){

                            var i2 = getArrayIndexByPropertyValue(mapObj.layers[layerNo - 1].locations, 'SureName', location.SureName);
                            if (i2 >= 0) {
                                var location2 = mapObj.layers[layerNo - 1].locations[i2];
                                var loc2 = xy(location2.x, location2.y);
                                var pLine = L.polyline([loc, loc2], {
                                    dashArray: '1,10'
                                }).addTo(tmap);
                                drawnItems[layerNo].push(pLine);
                            }
                        }

                    }
                   

                
                }
            
            } else if (mapObj.layers[layerNo].equipments != null) {
                for (var i = 0; i < mapObj.layers[layerNo].equipments.length; i++) {
                    var equipment = mapObj.layers[layerNo].equipments[i];
                    var iconFile = tprops.topologyOptions.baseUrl + require("../../../images/map/equipment_default_default.svg");
                    if (equipment[stateAttribute] != null) {
                        var state = equipment[stateAttribute];
                        states[stateAttribute] = state;
                        //  iconFile = tprops.topologyOptions.baseUrl + require("../../../images/marker_equipment_" + stateAttribute.toLowerCase() + "_" + state.toLowerCase() + ".svg");
                    }
                    var loc = xy(mapObj.layers[layerNo].equipments[i].x, mapObj.layers[layerNo].equipments[i].y);
                    var states = {};
                    if (location) {
                        AlarmStates.forEach(
                            function (item) {
                                states[item] = location[item];
                            });
                    }
                    var marker = L.marker(loc, {
                        icon: new L.DivIcon({
                            className: 'p2pmap-icon-img',
                            html: '<img class="map-icon-img"  src="' + iconFile + '"/>' + '<span class="icon-text">' + mapObj.layers[layerNo].equipments[i].SureName + '</span>'
                        })
                    }).addTo(tmap);
                    marker.iconDetails = {
                        baseUrl: tprops.topologyOptions.baseUrl,
                       // iconUrl: "../../../images/",
                        //badgeState : locState.toLowerCase(),
                        selected: false,
                        state: {
                            stateAttribute: equipment[stateAttribute]
                        },
                        locName: mapObj.layers[layerNo].equipments[i].SureName,
                         stateAttribute : stateAttribute
                    }
                    drawnItems[layerNo].push(marker);
                    Markers.push(marker);
                    //If same location exists in parent layer then draw dotted lines
                    if (layerNo > 0) {
                        var location1 = mapObj.layers[layerNo].equipments[i].location;
                        var loc1 = xy(mapObj.layers[layerNo].equipments[i].x, mapObj.layers[layerNo].equipments[i].y);
                        var i2 = getArrayIndexByPropertyValue(mapObj.layers[layerNo - 1].locations, 'SureName', location1.SureName);
                        if (i2 >= 0) {
                            var location2 = mapObj.layers[layerNo - 1].locations[i2];
                            var loc2 = xy(location2.x, location2.y);
                            var pLine = L.polyline([loc1, loc2], {
                                dashArray: '1,10'
                            }).addTo(tmap);
                            drawnItems[layerNo].push(pLine);
                        }
                    }
                }
            }
            for (var i = 0; i < mapObj.layers[layerNo].pathBundles.length; i++) {

                var pathBundleObj = mapObj.layers[layerNo].pathBundles[i];
                if (pathBundleObj.paths.length > 0) {
                    if (pathBundleObj.paths.length > 1) {
                        pathBundleOccured = true;
                    }
                    var startLocName = pathBundleObj.startLocation;
                    var endLocName = pathBundleObj.endLocation;
                    var index;
                    if (mapObj.layers[layerNo].locations != null) {
                        index = getSureNameIndex(mapObj.layers[layerNo].locations, startLocName);
                    } else {
                        index = getSureNameIndex(mapObj.layers[layerNo].equipments, startLocName);
                    }
                    if (mapObj.layers[layerNo].locations != null) {
                        var startLocObj = mapObj.layers[layerNo].locations[index];
                        var startLoc = xy(startLocObj.x, startLocObj.y);
                        index = getSureNameIndex(mapObj.layers[layerNo].locations, endLocName);
                        var endLocObj = mapObj.layers[layerNo].locations[index];
                        if (endLocObj) {
                            var endLoc = xy(endLocObj.x, endLocObj.y);
                        }

                        drawPathbundle(pathBundleObj, startLoc, endLoc, layerNo, isolatedCallBackFn, mapObj, startLocObj, endLocObj);
                        var options = getPathbundleOptions(pathBundleObj);
                    } else if (mapObj.layers[layerNo].equipments != null) {
                        var startEqpObj = mapObj.layers[layerNo].equipments[index];
                        var startEqp = xy(startEqpObj.x, startEqpObj.y);
                        index = getSureNameIndex(mapObj.layers[layerNo].equipments, endLocName);
                        var endEqpObj = mapObj.layers[layerNo].equipments[index];
                        var endEqp = xy(endEqpObj.x, endEqpObj.y);
                        drawPathbundle(pathBundleObj, startEqp, endEqp, layerNo, isolatedCallBackFn, mapObj);
                        var pathOptions = getPathOptions(pathBundleObj.paths[0]);
                        var options = getPathbundleOptions(pathBundleObj);
                    }
                }
            }
        }
        tmap.setView(xy(maxWidth / 2, maxHeight / 2));
        
        function getSureNameIndex(array, SureName) {
            var index = -1;
            for (var i = 0; i < array.length; i++) {
                if (array[i].location != null) {
                    if (array[i].location.SureName == SureName) index = i;
                } else if (array[i].SureName == SureName) {
                    index = i;
                }
            }
            return index;
        }

        function drawPathbundle(pathBundle, startLoc, endLoc, layerNo, isolatedCallBackFn, mapObj, startBundleObj, endBundleObj) {
           // var pathPopupIcon;
            var options = getPathbundleOptions(pathBundle);
            options.contextmenu = true;
            options.contextmenuInheritItems = false;
            if (options.weight != 10 && layerNo != 0 && options.color != disabledPathColor) {
                options.contextmenuItems = [{
                        text: 'Isolated Expand',
                        callback: function (e, layerNo, layerDrawn) {
                            isolatedCallBackFn(e, layerNo, layerDrawn, currentSingleRowSelectedSureName, isolatedLayerNo, true, mapObj);
                        }

        },
                    {
                        text: 'Collapse',
                        callback: function (e, layerNo, layerDrawn) {
                            //isolatedCallBackFn(e, layerNo, layerDrawn, true, mapObj);
                            isolatedCallBackFn(e, layerNo, layerDrawn, currentSingleRowSelectedSureName, isolatedLayerNo, true, mapObj, true);
                        }

        }];
            }
            var chart; // place holder for chart
            //var tmap = tmap;
	      var paths = pathBundle.paths;
            var pLine = L.polyline([startLoc, endLoc], options).addTo(tmap);
	     for(var pop=0; pop<paths.length; pop++){
                if(!paths[pop].disabledPath && options.weight != 10){
                            var popupContent = createToolTip(options.color, "PATH", paths[pop].SureName, tprops.topologyOptions.stateAttribute, iconFile, paths[0].SubType);
                            pLine.bindTooltip(popupContent, {
                             closeButton: false,
                             minWidth: 300,
                             direction: 'auto',
                             className: 'leaflet-tooltip-ed',
                             sticky: 'true'
                            });
                }
            }
	    
            pLine.options.layerNo = layerDrawn;
            drawnItems[layerDrawn].push(pLine);
            var popupLoc = xy(startLoc.lng + (endLoc.lng - startLoc.lng) / 2, startLoc.lat);
            var pieData = [

            ];
          
            if (paths.length == 1) {

                var pathState = paths[0][tprops.topologyOptions.stateAttribute];
                var pathOptions = getPathOptions(paths[0]);
                 var iconColorPath;
                tprops.alarmStateData.forEach(function(elem){
                    if(elem.stateType == tprops.topologyOptions.stateAttribute){
                            elem.properties.forEach(function(status){
                    if(status.state == pathState){
                    iconColorPath = status.color;
                    }
                    })
                    }
                    })
                    var detailObj = {};
                             detailObj.baseUrl = baseUrl;
								detailObj.selected = false;
								detailObj.badge = false;
                                detailObj.statusPanelInit = true;
                                detailObj.pathState = pathState;
                              detailObj.iconColorPath = iconColorPath;
                            
                            var pathDetails = {};
                            pathDetails.tprops = tprops;
                            pathDetails.paths = paths;
                            pathDetails.pathOptions = pathOptions;
                             pathDetails.pLine = pLine;
                if(!pathState){
                    var pathNoState =true;
                    detailObj["pathNoState"]= pathNoState;
                 if(tprops.topologyOptions.iconUrl && tprops.topologyOptions.iconUrl.length!=0 && tprops.topologyOptions.iconUrl!=undefined){
                     var  iconFile = tprops.topologyOptions.iconUrl + "UNKNOWN.svg";
                   }else {
                        var iconFile   = getIcon({
								 baseUrl : baseUrl,
								selected : false,
								badge : false,
                                statusPanelInit : true,
                                pathState : pathState,
                               iconColorPath:iconColorPath,
                                pathNoState : pathNoState
							}, drawIcons);
                   }
            }
                if ((pathState != null) && (pathState != '')) {
                        if(tprops.topologyOptions.iconUrl && tprops.topologyOptions.iconUrl.length!=0 && tprops.topologyOptions.iconUrl!=undefined){
                     iconFile = tprops.topologyOptions.iconUrl + pathState.toLowerCase() + ".svg";
                   }
                else {
                     iconFile  = getIcon({
								 baseUrl : baseUrl,
								selected : false,
								badge : false,
                                statusPanelInit : true,
                                pathState : pathState,
                            iconColorPath:iconColorPath
							}, drawIcons);
                }
             var popupContent = createToolTip(pathOptions.color, "PATH", paths[0].SureName, tprops.topologyOptions.stateAttribute, iconFile, paths[0].SubType);
     
                if(!paths[0].disabledPath){
            pLine.bindTooltip(popupContent, {
                closeButton: false,
                minWidth: 300,
                direction: 'auto',
                className: 'leaflet-tooltip-ed',
                sticky: 'true'
            });
        }      
             //   } 
                }
                pLine.options.pathObj = paths[0];
                pLine.setStyle({
                    color: pathOptions.color
                });
                pLine.on('click', function (e, layerNo) {
                    //e.preventDefault();
                    L.DomEvent.preventDefault(e);
                    //var layerNo = e.relatedTarget.options.layerNo;


                    currentSingleRowSelectedSureName = e.target.options.pathObj.SureName;
                    var pathData = e.target.options.pathObj;

                    isolatedCallBackFn(e, layerNo, layerDrawn, currentSingleRowSelectedSureName, isolatedLayerNo, true, mapObj,undefined,true,pathData);

                })
                pLine.on('mouseover', function (e, layerNo) {
                    //e.preventDefault();
                    L.DomEvent.preventDefault(e);
                    currentSingleRowSelectedSureName = e.target.options.pathObj.SureName;
                    var currentSingleRowSelectedPathDisabled = e.target.options.pathObj.disabledPath;
                })



            }
            if (paths != null) {
                var countForPercent = 0;
                for (var i = 0; i < paths.length; i++) {
                    var pathState = paths[i][tprops.topologyOptions.stateAttribute];
                    if (pathState == null) pathState = 'None';
                    if (i == 0) popupContent = paths[i].SureName;
                    else popupContent = popupContent + "<br />" + paths[i].SureName;
                    var stateListObj = tprops.topologyOptions.stateToDisplay.filter((x) => x.text == tprops.topologyOptions.stateAttribute)
                    var color = tprops.topologyOptions.defaultColor
                    if (stateListObj && stateListObj.length > 0) {
                        var stateObj = stateListObj[0].values.filter((x) => x.text.toUpperCase() == pathState.toUpperCase())
                        if (stateObj && stateObj.length > 0) {
                            color = stateObj[0].color;
                        }
                    }
                    if (paths[i].disabledPath) {
                        color = disabledPathColor;
                    }
                    if (color == options.color) {
                        countForPercent++;
                    }
                    var i2 = getArrayIndexByPropertyValue(pieData, 'name', pathState);
                    if (i2 < 0) pieData.push({
                        name: pathState,
                        value: 1,
                        style: {
                            lineWidth: 5,
                            strokeStyle: options.color,
                            fillStyle: color
                        }
                    });
                    else pieData[i2].value++;
                }
                var percentage = countForPercent * 100 / paths.length;
                if (paths.length > 1 && isolatedFlag==false) {
                  

                        chart = L.piechartMarker(xy(startLoc.lng + (endLoc.lng - startLoc.lng) / 2, startLoc.lat), {
                            radius: 12,
                            data: pieData,
                            contextmenu: true,
                            contextmenuItems: [{
                                text: 'Expand',
                                index: 0,
                                callback: function (e) {
                                    var paths = e.relatedTarget.options.paths;
                                    var startLoc = e.relatedTarget.options.startLoc;
                                    var endLoc = e.relatedTarget.options.endLoc;
                                    //var layerNo = e.relatedTarget.options.layerNo;
   
                                 for (var i = 0; i < paths.length; i++) {
                                      drawPath(paths[i], startLoc, endLoc, i, layerNo, currentSingleRowSelectedSureName, isolatedCallBackFn);
                                 }
                           
                                  tmap.removeLayer(pLine);
                                  tmap.removeLayer(chart);
                               
                        }
                        }]
                        }).addTo(tmap);
                        drawnItems[layerDrawn].push(chart);
                    

                    chart.options.paths = paths;
                    chart.options.startLoc = startLoc;
                    chart.options.endLoc = endLoc;
                    chart.options.layerNo = layerDrawn;
                    var iconFile = tprops.topologyOptions.baseUrl + require("../../../images/UNKNOWN.svg");
                    if ((options.state != null) && (options.state != '')) {
                       // iconFile = tprops.topologyOptions.baseUrl + require("../../../images/" + options.state.toLowerCase() + ".svg");
                    }
                }
                else {
                    chart = L.piechartMarker();
                }
            }
           
        }  
	
	      function expandIsolatedPaths(e, layerNo, isolatedCallBackFn) {
            if (e.relatedTarget.options.layerNo != layerDrawn) {
                return;

            } else {
                isolatedCallBackFn;
            }

        }



        function drawPath(path, startLoc, endLoc, i, layerNo, currentSingleRowSelectedSureName, isolatedCallBackFn) {
            var options = getPathOptions(path);
            var pLine = myArc2(startLoc, endLoc, i, options, layerNo, currentSingleRowSelectedSureName, isolatedCallBackFn);
            if (layerNo) {
                drawnItems[layerNo].push(pLine);
            } else {
                drawnItems[layerDrawn].push(pLine);
            }
            var b = (Math.round((i + 1) / 2) * 20) * ((i % 2 == 0) ? 1 : -1);
            var popupLoc = xy(startLoc.lng + (endLoc.lng - startLoc.lng) / 2, startLoc.lat + b);
            var pathState = path[tprops.topologyOptions.stateAttribute];
            var iconFile = tprops.topologyOptions.baseUrl + require("../../../images/UNKNOWN.svg");
            if (pathState != null && pathState != "") {
                try {
                    var pathStateColor = require("../../../images/" + pathState.toLowerCase() + ".svg");
                    if (pathStateColor) {
                        iconFile = tprops.topologyOptions.baseUrl + require("../../../images/" + pathState.toLowerCase() + ".svg");
                    }
                } catch (ex) {
                    iconFile = tprops.topologyOptions.baseUrl + require("../../../images/marker_location_UNKNOWN.svg");
                }

            }
            //The below popup content defines what will be shown in the paths after expanding pathbundles:
             popupContent = createToolTip(options.color, "path", path.SureName, tprops.topologyOptions.stateAttribute, iconFile, path.SubType);

           if(!path.disabledPath){
        pLine.bindTooltip(popupContent, {
            closeButton: false,
            minWidth: 300,
            direction: 'auto',
            className: 'leaflet-tooltip-ed',
            sticky: 'true'
        });
    }
            pLine.options.pathObj = path;
            pLine.on('click', function (e) {

                    currentSingleRowSelectedSureName = e.target.options.pathObj.SureName;
					 var pathData = e.target.options.pathObj;
                     isolatedCallBackFn(e, layerNo, layerDrawn, currentSingleRowSelectedSureName, isolatedLayerNo, true, mapObj,undefined,true,pathData);
                    var layerNo = e.relatedTarget.options.layerNo;


                    for (var i = 0; i < mapObj.layers[layerNo].locations.length; i++) {
                        var sureName;
                        var marker = mapObj.layers[layerNo].locations[i].marker;
                        if (marker.options.iconFile == locIconFile) {
                            var iconFile = marker.options.equipIconFile;
                            marker.options.iconFile = iconFile;
                            sureName = mapObj.layers[layerNo].locations[i].equipment.SureName;
                        } else {
                            var iconFile = marker.options.locIconFile;
                            marker.options.iconFile = iconFile;
                            sureName = mapObj.layers[layerNo].locations[i].SureName;
                        }
                        marker.setIcon(new L.DivIcon({
                            className: 'p2pmap-icon-img',
                            html: '<img class="map-icon-img"  src="' + iconFile + '"/>' + '<span class="icon-text">' + sureName + '</span>'
                        }));
                    }
                }

            );
            pLine.on('mouseover', function (e) {
            //currentSingleRowSelectedSureName = path.SureName;
                currentSingleRowSelectedSureName = e.target.options.pathObj.SureName;
                
            });
            var popup = new L.popup();
            popup.setLatLng(popupLoc);
            popup.setContent(popupContent);
            pLine.bindPopup(popup);
        }

        function myArc2(loc1, loc2, arcNumber, options, layerNo, currentSingleRowSelectedSureName2, isolatedCallBackFn) {
            //not getting layerNo here..
            var x1 = loc1.lng,
                y1 = loc1.lat,
                x2 = loc2.lng,
                y2 = loc2.lat;
            var h = (x2 + x1) / 2;
            var k = (y2 + y1) / 2;
            var a = Math.abs(x2 - x1) / 2;
            var b = Math.round((arcNumber + 1) / 2) * 20;
            var arcUpDwn = (arcNumber % 2 == 0) ? 1 : -1;
            var incr = 180 / (2 * a);
            var points = [];
            var angle = 0;
            for (var i = 0; i <= 180; i = i + incr) {
                var x = h + a * Math.cos(arcUpDwn * i * Math.PI / 180);
                var y = k + b * Math.sin(arcUpDwn * i * Math.PI / 180);
                //Rotation
                var newX = h + (x - h) * Math.cos(angle) - (y - k) * Math.sin(angle);
                var newY = k + (x - h) * Math.sin(angle) + (y - k) * Math.cos(angle);
                points.push([newY, newX]);
            }
            //Adding context menu for individual paths(arcs) inside a pathbundle:
            options.contextmenu = true;
            options.contextmenuInheritItems = false;
            options.contextmenuItems = [{
                    text: 'Isolated Expand',

                    callback: function (e, layerNo, layerDrawn) {
                currentSingleRowSelectedSureName = e.relatedTarget.options.pathObj.SureName;
                        isolatedCallBackFn(e, layerNo, layerDrawn, currentSingleRowSelectedSureName, isolatedLayerNo, true, mapObj);
                    }
          }, {
                    text: 'Collapse',
                    callback: function (e, layerNo, layerDrawn) {
                        isolatedCallBackFn(e, layerNo, layerDrawn, currentSingleRowSelectedSureName, isolatedLayerNo, true, mapObj, true);
                    }

        }
                                   ];
            return L.polyline(points, options).addTo(tmap);
        }

        function createToolTip(color, entity, name, alarm, icon, subType, percentage) {
            var toolTip = '<div class="menu-bg"><div class="menu-bg-copy" style="background-color:' + color + '">' + '</div><div class="path">' + entity + '</div><div class="toolFont" >' + name + '</div><div class="toolFont" >';
            if (icon) {
                toolTip = toolTip + '<img src="' + icon + '" style="width:12px;height:10px;">' + '<span class="toolFont">' + (alarm) + ' Alarm</span> ';
                if (percentage) {
                    toolTip = toolTip + '<span class="toolFont" style="float:right">' + (percentage) + ' </span> ';
                }
            }
            if (subType) {
                toolTip = toolTip + '<div class="path toolFont">' + 'Subtype' + '</div><div class="toolFont" >' + subType + '</div>';
            }
            toolTip = toolTip + '</div>';
            return toolTip;
        }

        function getPathOptions(pathObj) {
            var tpropsAlarmState = tprops.topologyOptions.stateAttribute;
            var pathState = pathObj[tpropsAlarmState];
            if(!tprops.alarmStateData){
            var stateListObj = tprops.topologyOptions.stateToDisplay.filter((x) => x.text == tprops.topologyOptions.stateAttribute)
        }
        else{
        var stateListObj = tprops.alarmStateData.filter((x) => x.stateType == tprops.topologyOptions.stateAttribute)
        }
            var pathOptions = {
                color: tprops.topologyOptions.defaultColor
            }
            if (stateListObj && stateListObj.length > 0) {
                var stateObj = stateListObj[0].properties.filter((x) => x.state.toUpperCase() == pathState.toUpperCase())
                if (stateObj && stateObj.length > 0) {
                    pathOptions.color = stateObj[0].color;
                }
            }
            //code to set the color of individual disabled paths upon expand of path bundle:
            if (pathObj.disabledPath) {
                pathOptions.color = disabledPathColor;
            }
            return pathOptions;
        }

        function getArrayIndexByPropertyValue(objectsArray, propertyName, propertyValue) {
            for (var i = 0; i < objectsArray.length; i++) {
                if (objectsArray[i][propertyName] == propertyValue) {
                    return i;
                }
            }
            return -1;
        }

        function getPathbundleOptions(pathBundle) {

            var stateListObj = tprops.alarmStateData.filter((x) => x.stateType == tprops.topologyOptions.stateAttribute)
            var pathbundleOptions = {
                color: tprops.topologyOptions.defaultColor
            };
            var paths = pathBundle.paths;
            if ((paths != null) && (paths.length > 1)) {
                pathbundleOptions.weight = 10;
            }


            var priority = -1;
            for (var i = 0; i < paths.length; i++) {

                var pathState = paths[i][tprops.topologyOptions.stateAttribute];
                if (pathState != null) {
                    for (var j = 0; j < stateListObj[0].properties.length; j++) {
                        if (pathState.toUpperCase() == stateListObj[0].properties[j].state.toUpperCase()) {
                            if ((stateListObj[0].properties[j].priority < priority) || (priority == -1)) {
                                priority = stateListObj[0].properties[j].priority;
                                pathbundleOptions.color = stateListObj[0].properties[j].color;
                                pathbundleOptions.state = pathState;
                                pathbundleOptions.priority = stateListObj[0].properties[j].priority;
                                if (priority == -1) {
                                    pathbundleOptions.color = tprops.topologyOptions.defaultColor;
                                }
                            }

                        }

                    }
                }
                 if(isolatedFlag==true){
                         if(!paths[i].disabledPath){
                            pathbundleOptions.color =   pathbundleOptions.color;
                            pathbundleOptions.state = pathState;
                            pathbundleOptions.priority =  pathbundleOptions.priority;
                            pathbundleOptions.weight = 3;
                            break;
                            }else{
                             pathbundleOptions.color = disabledPathColor;
                         }
           

                     }
            }
            return pathbundleOptions;
        }

        
        function getIcon(props, draw) {
		if (draw) {
			return drawIcon(props);
		}
		if (props.badge) {
			var icon = "./" + props.iconUrl + "/" + (props.badgeState ? props.badgeState.toLowerCase() : "marker_default") + ".svg";
		} else if(props.statusPanelInit){
                  props.badgeState = null;
            props.locationState = null;
            	var icon =  props.baseUrl+require("../../../images/map" + "/location_" + (props.badgeState ? props.badgeState.toLowerCase() : "default") + "_" + (props.locationState ? props.locationState.toLowerCase() : "default") + (props.selected ? "_selected" : "") + ".svg");
                  }
        else if(props.siteIcon && props.selected){
            var badgeS = null;
            var locationS = null;
            if(props.badgeEnabled){
                var badgeS = props.badgeState; 
            }
             if(props.locEnabled){
                var locationS = props.locationState;
            }
            
             var icon = props.baseUrl+require("../../../images/map" + "/location_" + (badgeS ? badgeS.toLowerCase() : "default") + "_" + (locationS ? locationS.toLowerCase() : "default") + (props.selected ? "_selected" : "") + ".svg");
        }
        else if(!props.selected){
                if(props.badgeEnabled){
                var badgeS = props.badgeState;
            }
             if(props.locEnabled){
                var locationS = props.locationState;
            }
            var icon = props.baseUrl+require("../../../images/map" + "/location_" + (badgeS ? badgeS.toLowerCase() : "default") + "_" + (locationS ? locationS.toLowerCase() : "default") + (props.selected ? "_selected" : "") + ".svg");
        }
            else {
			var icon =  props.baseUrl+require("../../../images/map" + "/location_" + (props.badgeState ? props.badgeState.toLowerCase() : "default") + "_" + (props.locationState  ? props.locationState.toLowerCase() : "default") + (props.selected ? "_selected" : "") + ".svg");
		}
		return icon;
	}
           
      function drawIcon(locationObj,stateIconColor) {
        var icon = stateIconColor;
         var iconColor;
         if(locationObj && locationObj.iconColor){
             iconColor = locationObj.iconColor.color;
         }
          if(locationObj && locationObj.selected){
             var outline = locationObj.selected ? MAP_constants.OUTLINE_COLOR : null;
             }
		
           var tearDropColor = iconColor ? iconColor : "#BDBDBD";
           
          if(locationObj && locationObj.badgeColor){
             var badgeCol = locationObj.badgeColor ? locationObj.badgeColor : "#BDBDBD";
             }
		
		
		var markerBadge = null;
          if(locationObj.pathState){
              badgeCol = locationObj.iconColorPath;
              var char = locationObj.pathState.toUpperCase().charAt(0);
              var markerIcon = "data:image/svg+xml;charset=utf-8,";
              markerIcon += encodeURIComponent("<svg viewBox='0 0 32 32' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' style='enable-background:new 0 0 32 32;' xml:space='preserve' x='0px' y='0px'>\
		  		<g><circle id='severityBackgrnd' fill='" + badgeCol + "' cx='16' cy='16.1' r='15'/><text x='16' y='16.1' text-anchor='middle' font-family='Arial' style='font-weight: 900;font-size:130%'  fill='#f9fbfd' dy='.3em'>" + char + "</text></g></svg>");
          }
          else if(locationObj.pathNoState){
                var markerIcon = "data:image/svg+xml;charset=utf-8,";
              markerIcon += encodeURIComponent("<svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 32 32' style='enable-background:new 0 0 32 32;' xml:space='preserve'><style type='text/css'>.st0{fill:#9E9E9E;}</style><circle id='severityBackgrnd' class='st0' cx='16' cy='16.1' r='15'/></svg>");
                  }
          else if(locationObj.equipIcon){
                var markerIcon = "data:image/svg+xml;charset=utf-8,";
              markerIcon += encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><title>ic_equipment_ne</title><g id='Icons'><path d='M21,10V21a1.08,1.08,0,0,1-1,1H4a1.08,1.08,0,0,1-1-1V10A1.08,1.08,0,0,1,4,9H20A1.08,1.08,0,0,1,21,10Zm0-7V7a1.08,1.08,0,0,1-1,1H4A1.08,1.08,0,0,1,3,7V3A1.08,1.08,0,0,1,4,2H20A1.08,1.08,0,0,1,21,3ZM19,4H12V6h7Z' fill='#9E9E9E'/></g></svg>");  
          }
          
          else if(locationObj.disabledLoc){
                  var markerIcon = "data:image/svg+xml;charset=utf-8,";
               markerIcon += encodeURIComponent("<svg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 32 32' style='enable-background:new 0 0 32 32;' xml:space='preserve'><style type='text/css'>.st0{fill:#9E9E9E;}</style><circle id='severityBackgrnd' class='st0' cx='16' cy='16.1' r='15'/></svg>");
                  }
             else {
		if (locationObj.badge) {
			if (locationObj.badgeState) {
				var char = locationObj.badgeState.toUpperCase().charAt(0);
				markerBadge = "data:image/svg+xml;charset=utf-8," + encodeURIComponent("<svg viewBox='0 0 32 32' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' style='enable-background:new 0 0 32 32;' xml:space='preserve' x='0px' y='0px'>\
		  		<g><circle id='severityBackgrnd' fill='" + badgeCol + "' cx='16' cy='16.1' r='15'/><text x='16' y='16.1' text-anchor='middle' font-family='Arial' style='font-weight: 900;font-size:130%'  fill='#f9fbfd' dy='.3em'>" + char + "</text></g></svg>");
			}
			return markerBadge;
		}
		var markerIcon = "data:image/svg+xml;charset=utf-8,";
		markerIcon += encodeURIComponent("<svg width='20px' height='24px' viewBox='0 0 20 30' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>\
                      <g id='locationMarker_Id' stroke='null' stroke-width='1' fill='none' fill-rule='evenodd'>\
                          <g fill='" + tearDropColor + "'  stroke='" + outline + "' stroke-width='1.5'>\
                              <path  id='tearDrop' d='M7.9964124,24 C7.9964124,24 16.3051778,17.7981979 15.9913273,12.2953973 C15.7138588,7.43048918 12.411882,4 7.9964124,4 C3.5809428,4 1.0992023405,8.01561877 0.50149746311,12.2953973 C-0.126521704,18.2961154 7.9964124,24 7.9964124,24  Z'></path>\
                          </g> " + (markerBadge ? markerBadge : '') + "</g> </svg>");
             }
		return markerIcon;
	//<path  id='tearDrop' d='M7.9964124,24 C7.9964124,24 16.3051778,17.7981979 15.9913273,12.2953973 C15.7138588,7.43048918 12.411882,4 7.9964124,4 C3.5809428,4 0.0992023405,7.71561877 0.00149746311,12.2953973 C-0.126521704,18.2961154 7.9964124,24 7.9964124,24 Z'></path>\
	//M8.0964124,24 C7.9564124,24 16.3051778,17.7981979 15.9913273,12.2953973 C15.7138588,7.43048918 12.411882,4 7.9964124,4 C3.5809428,4 0.0992023405,7.71561877 0.50149746311,12.2953973 C-0.126521704,18.2961154 7.9964124,24 7.9964124,24 Z   
	}

    }
    tprops.markersUpdate(Markers);
    return TopoMapLayersData["Markers"] = Markers;
}

export const mapCordinateIsolated = (tprops, mapObj, isolatedPathFlag) => {

    if (isolatedPathFlag) {
        isolatedFlag = true;
    } else {
        isolatedFlag = false;
    }
    var layerGap = Math.floor(maxHeight / (tprops.topologyOptions.MAX_VISIBLE_LAYERS + 1));
    if (layerGap < tprops.topologyOptions.LAYERGAP_MIN) {
        layerGap = tprops.topologyOptions.LAYERGAP_MIN;
    }
    var width = maxWidth;
    var height = maxHeight;
    var h_offset = ((maxWidth / 10) > 10) ? maxWidth / 10 : 10;
    var y = 0;
    var totalLayers = mapObj.layers.length;
    for (var ln = 0; ln < totalLayers; ln++) {
        var layerObj = mapObj.layers[ln];
        if (ln == 0) {
            y = height - layerGap;
            var totalNodes = layerObj.locations.length;
            for (var nodeNo = 0; nodeNo < totalNodes; nodeNo++) {
                layerObj.locations[nodeNo].x = h_offset + ((width - 2 * h_offset) / (totalNodes - 1)) * nodeNo;
                layerObj.locations[nodeNo].y = y;
            }
        }
        if (ln > 0) {
            y = height - layerGap * (ln + 1);
            if (mapObj.layers[ln - 1] && mapObj.layers[ln].locations && (mapObj.layers[ln].locations.length == mapObj.layers[ln - 1].locations.length) && (mapObj.layers[ln].pathBundles.length == mapObj.layers[ln - 1].pathBundles.length)) {
               mapObj.layers.splice(ln, 1);
			   notify("Duplicate layer data found");
                break;
            }
if(!mapObj.layers[ln].locations){
    return;
}
            var locations = mapObj.layers[ln].locations;
            var totalNodes = locations.length;
            var parentLayerObj = mapObj.layers[ln - 1];
            var startParentLocation = {};
            Object.assign(startParentLocation, parentLayerObj.locations[0]);
            var endParentLocation = {};
            Object.assign(endParentLocation, parentLayerObj.locations[parentLayerObj.locations.length - 1]);
            var startX = startParentLocation.x;
            var width = endParentLocation.x - startParentLocation.x;
            var isolatedPathFlag1 = false;
            for (var isolatedPathIndex = 0; isolatedPathIndex < mapObj.layers[ln].locations.length; isolatedPathIndex++) {

                if (mapObj.layers[ln].locations[isolatedPathIndex].disabledLoc == false) {
                    isolatedPathFlag1 = true;

                }
            }


            if (isolatedPathFlag1 == true && ln == mapObj.layers.length - 1) {

                var arr3 = mapObj.layers[ln].locations;
                var disabledCount = arr3.filter(function (item) {
                    return item.disabledLoc == true;
                }).length;
                var enabledCount = arr3.length - disabledCount;
                var disabledWidth = 0.2 * width * (disabledCount - 1) / (arr3.length - 1);
                var enabledWidth = width - disabledWidth;
                var disabledCounter = 0;
                var enabledCounter = 0;
                var isolatedNodeno = 0;

                for (var isolatedNodeno = 0; isolatedNodeno < arr3.length; isolatedNodeno++) {
                    if (isolatedNodeno == 0) {
                        arr3[isolatedNodeno].x = startX;


                    } else if (arr3[isolatedNodeno - 1] && (arr3[isolatedNodeno].disabledLoc == false && arr3[isolatedNodeno - 1].disabledLoc == false)) {
                        arr3[isolatedNodeno].x = arr3[isolatedNodeno - 1].x + enabledWidth / (enabledCount - 1);

                    } else {
                        arr3[isolatedNodeno].x = arr3[isolatedNodeno - 1].x + disabledWidth / (disabledCount);
                    }
                    arr3[isolatedNodeno].y = y;

                }



            }

        }


    }
    var mapObj2 = Object.assign({}, mapObj);
    for (var layno2 = 0; layno2 < mapObj2.layers.length; layno2++) {
        var newy = mapObj2.layers[layno2].locations[0].y;
        for (var im = 0; im < mapObj2.layers[layno2].locations.length; im++) {
            if (im > 0) {
                delete mapObj2.layers[layno2].locations[im].y;
                mapObj2.layers[layno2].locations[im].y = newy;
            }
        }

    }
    mapObj = Object.assign({}, mapObj2);
    return mapObj2;
}

export const mapCordinate = (tprops, mapObj) => {

    var layerGap = Math.floor(maxHeight / (tprops.topologyOptions.MAX_VISIBLE_LAYERS + 1));
    if (layerGap < tprops.topologyOptions.LAYERGAP_MIN) {
        layerGap = tprops.topologyOptions.LAYERGAP_MIN;
    }
    var width = maxWidth;
    var height = maxHeight;
    var h_offset = ((maxWidth / 10) > 10) ? maxWidth / 10 : 10;
    var totalLayers = mapObj.layers.length;
    for (var ln = 0; ln < totalLayers; ln++) {

        var layerObj = mapObj.layers[ln];
        if (ln == 0) {
            var y = height - layerGap;
            var totalNodes = layerObj.locations.length;
            for (var nodeNo = 0; nodeNo < totalNodes; nodeNo++) {
                layerObj.locations[nodeNo].x = h_offset + ((width - 2 * h_offset) / (totalNodes - 1)) * nodeNo;
                layerObj.locations[nodeNo].y = y;
            }
        } else {
            var y = height - layerGap * (ln + 1);
		 if (mapObj.layers[ln - 1] && mapObj.layers[ln].locations && (mapObj.layers[ln].locations.length == mapObj.layers[ln - 1].locations.length) && (mapObj.layers[ln].pathBundles.length == mapObj.layers[ln - 1].pathBundles.length)) {
               mapObj.layers.splice(ln, 1);
			    notify("Duplicate layer data found");
                break;
            }
            console.log("y:: " + y);

            var parentLayerObj = mapObj.layers[ln - 1];
            //console.log("ln: " + ln + " :parentLayerObj: " + JSON.stringify(parentLayerObj));
            for (var i = 1; i < parentLayerObj.locations.length; i++) {
                var startParentLocation = parentLayerObj.locations[0];
                var endParentLocation = parentLayerObj.locations[parentLayerObj.locations.length - 1];
                // find all locations within start and end location in current layer
                if (layerObj && layerObj.locations != null) {
                    var locations = [];
                    var skipLocation = true;
                    for (var j = 0; j < layerObj.locations.length; j++) {
                        if (layerObj.locations[j].SureName === startParentLocation.SureName) {
                            skipLocation = false;
                            locations.push(layerObj.locations[j]);
                        } else if (layerObj.locations[j].SureName === endParentLocation.SureName) {
                            skipLocation = true;
                            locations.push(layerObj.locations[j]);
                        } else if (skipLocation == false) {
                            locations.push(layerObj.locations[j]);
                        }
                    }
                    // Set x,y co-ordinate for locations
                    var totalNodes = locations.length;
                    var startX = startParentLocation.x;
                    var endX = endParentLocation.x
                    var width = endParentLocation.x - startParentLocation.x;


                    for (var nodeNo = 0; nodeNo < totalNodes; nodeNo++) {
                        locations[nodeNo].x = startX + width / (totalNodes - 1) * nodeNo;
                        locations[nodeNo].y = y;
                    }

                    //}


                } else if (layerObj.equipments != null) {
                    var equipments = [];
                    var skipEquipment = true;
                    for (var j = 0; j < layerObj.equipments.length; j++) {
                        if (layerObj.equipments[j].location.SureName === startParentLocation.SureName) {
                            skipEquipment = false;
                            equipments.push(layerObj.equipments[j]);
                        } else if (layerObj.equipments[j].location.SureName === endParentLocation.SureName) {
                            skipEquipment = true;
                            equipments.push(layerObj.equipments[j]);
                        } else if (skipEquipment == false) {
                            equipments.push(layerObj.equipments[j]);
                        }
                    }
                    // Set x,y co-ordinate for equipmets
                    var totalNodes = equipments.length;
                    var startX = startParentLocation.x;
                    var endX = endParentLocation.x
                    var width = endParentLocation.x - startParentLocation.x;

                    for (var nodeNo = 0; nodeNo < totalNodes; nodeNo++) {
                        equipments[nodeNo].x = startX + width / (totalNodes - 1) * nodeNo;
                        equipments[nodeNo].y = y;
                    }
                }
            }
        }
    }
    return mapObj;
}




export const redraw = ( layerIn) => {
    // remove all contents
    for (var layer = 0; layer <= layerDrawn; layer++) {
        for (i = 0; i < drawnItems[layer].length; i++) tmap.removeLayer(drawnItems[layer][i]);
    }
    drawnItems.splice(0);
    maxWidth = document.getElementById(mapId).offsetWidth;
    maxHeight = document.getElementById(mapId).offsetHeight;
    mapCordinate(tprops, mapObj);
    var layerDrawn = layerDrawn;
    for (var layer = 0; layer <= layerIn; layer++) {
        var markersDrawn = drawLayer(layer);
    }
}

export const appendLayer = (tprops, obj, layerObj, isolatedPathFlag) => {
    if (obj == undefined) {
        obj = {
            layers: []
        };
    }
    var seen = [];
    var result = {};
    var x = layerObj.layers;
    for (var i = 0; i < x.length; i++) {
        obj.layers.push(x[i]);
    }

    if (isolatedPathFlag) {
        isolatedFlag = true;
        obj = mapCordinateIsolated(tprops, obj, isolatedFlag);
        if (obj) {
            layerNo = obj.layers.length - 1;
        }
        else{
            var nodataFlag=true;
        }
    } else {
        obj = mapCordinate(tprops, obj);
     if(!obj){
          var nodataFlag=true;
        }   
        layerNo=obj.layers.length - 1;
    }
    console.log("output of appendlayer: ");
    console.log(obj);
    return {
        previousLayer: obj,
        layerNo: layerNo,
        nodataFlag: nodataFlag
    }
}

export const hideLayer = (layerNo) => {
    // remove all contents
    for (var i = 0; i < drawnItems[layerNo].length; i++) {
        //console.log("this.topologyMap.drawnItems[layerNo][i]:: "+JSON.stringify(this.topologyMap.drawnItems[layerNo][i]));
        tmap.removeLayer(drawnItems[layerNo][i]);
    }
    drawnItems.splice(layerNo, 1);
    layerDrawn--;
}

export {
    layerNo
};

export const parseStateDetails = (lStates,stateAttribute) => {
     var stateAttribute = stateAttribute;
            return {
                displayLabel: true,
                size: "M",                    
                style: {
                    width: "240px",
                    zIndex: 401,
                },
                groupToShow: "Badge Status Indication",
                status: [{
                    text: "Badge Status Indication",
                    value: "None",
                    items: [
                        {
                            text: "None",
                            label: "None",
                            values: []
                        },
                        {
                            text: stateAttribute,
                            label: "Alarms",
                            values:  getStateValues(stateAttribute, lStates)
                        }
                    ]
                },
                {
                    text: "Marker Status Indication",
                    value: "None",
                    items: [
                        {
                            text: "None",
                            label: "None",
                            values: [],
                            type: "radioButton"
                        },
                        {
                            text: "OperationalState",
                            label: "Operational State",
                            values:  getStateValues("OperationalState", lStates)
                        },
                        {
                            text: "AdministrativeState",
                            label: "Administrative State",
                            values:  getStateValues("AdministrativeState", lStates)
                        },
                    ]
                }]
            }
    
    
        function getStateValues(state, lStates){
            var filteredObj = lStates.filter(function(x){ return x.stateType == state})            
            if(filteredObj && filteredObj.length && filteredObj.length > 0){
               return filteredObj[0].properties.map(function(item){
                    var result = {
                        text: item.state,
                        icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG(item.color, item.badgeText ? item.badgeText : "" )),
                        color: item.color,
                        enabled: true
                    }
                    if(item.badgeText){
                        result.badge = item.badgeText
                    }
                    return result
                })
            }
            else {
                var x =[];
                return x;
            }
            
            

        }
    
  function drawSVG(color, badge) {
            var svg = '<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="mapviewsettingssvg" viewBox="0 0 6 6" width="6" height="6">\
                     <circle cx="3" cy="3" r="3" fill="'+ color + '"/><text x="3" y="3" text-anchor="middle" font-family="Arial" style="font-weight: bold; font-size:20%"  fill="#f9fbfd" dy=".3em">' + badge + '</text>\
                    </svg>';
            return svg
        }  
        
}

class topologyMapHelper {

    collapse() {
        
        if (isolatedFlag == true) {
            notify("Further collapse is not supported after isolated path expansion");
            return;
        }
        if (layerDrawn > 0) {
            hideLayer(layerDrawn);
            layerNo--;
            console.log("inside collapse layerNo: "+layerNo+" isolatedLayerNo:"+isolatedLayerNo+" layerDrawn: " + layerDrawn);
            pathBundleOccured = false;
            isolatedFlag = false;
            errorOccured=false;
        } else {
            notify("Further collapse not possible");

            return;
        }
    }

    expand(tprops, mapObj, isolatedCallBackFn) {
        if (isolatedFlag == true) {
            notify("Further expansion is not supported after isolated path expansion");
            return;
        }
        console.log("inside expand: " + expanding);
        if (expanding == true) {
            return;
        }
        console.log("inside expand:(2) ");
        if (pathBundleOccured) {
            console.log("Further expansion of pathBundle not supported");
            notify("Further expansion of pathBundle not supported");
            expanding = false;
            return;
        }
        if (errorOccured) {
            notify("Error in response data");
            expanding = false;
            return;
        }
        if (!lastLayerRetrieved && lastLayerRetrievedNo !== layerNo) {
            if (layerNo == -1) {
                layerNo = 1;
            } else {
                layerNo++;
            }
            //  layerNo++;
            console.log("incrementing layer no:" + layerNo);
            expanding = false;


            if (mapObj.layers.length > layerNo) {
                //var mapObjNew = mapCordinate(tprops, mapObj);
                var markersDrawn =drawLayer(layerNo, mapObj, tprops, tmap, isolatedCallBackFn);
                // drawLayer(layerNo, tprops.topologyOptions.mapObj);
                return false;
            }

        } else if (lastLayerRetrieved == true) {
            if (layerNo == lastLayerRetrievedNo) {
                notify("Further expansion not possible");
            } else if (layerNo < lastLayerRetrievedNo) {
                //layerNo++;
                var markersDrawn =drawLayer(layerNoNew);
            }
            expanding = false;
            return false;
        }

        //expanding = true;
        console.log("inside expand: expanding: " + expanding);
        var payload = payloadFunction(tprops.topologyOptions.selectedEntityRow.UUID, layerNo, tprops.topologyOptions.currentEntity);
        payload.response.embedEntity[0] = 'Location';
        payload.response.embedEntity[1] = 'FCP';
        payload.response.embedEntity[2] = 'Endpoint';
        payload.response.embedEntity[3] = 'Equipment';
        console.log("payload:: " + JSON.stringify(payload));
        var restUrl = tprops.topologyOptions.domain + tprops.topologyOptions.topourl;
        if (payload) {

            /* payloadData(payload);*/

            /* var payloadForEquip = payloadFunction(tprops.topologyOptions.selectedEntityRow.UUID, layerNo);
        payloadForEquip.response.embedEntity[0] = 'RootEquipment';
        payloadForEquip.response.embedEntity[1] = 'Location';
        payloadForEquip.expand = ["Equipment.Location"];
        console.log("inside expand tprops:" + tprops);
        console.log("inside expand: " + tprops + "payload: " + payload);
        const { getTopologyMapViewData } = this;
        
        getTopologyMapViewData({
          topourl: this.props.topologyOptions.domain + this.props.topologyOptions.topourl,
            Alarmurl: this.props.topologyOptions.metadataUrl +  this.props.topologyOptions.Alarmurl,
            requestHeaders: this.props.topologyOptions.requestHeaders,
            AalrmrequestHeaders : this.props.topologyOptions.AalrmrequestHeaders ? this.props.topologyOptions.AalrmrequestHeaders : {},
            topoMapObj:this.props.topologyOptions.mapObj,
            methodTopo: this.props.topologyOptions.methodTopo,
            methodAlarms: this.props.topologyOptions.methodAlarms,
            , payload: payload
        }, payload);*/
        }
        return payload;
    };

    createMap(element, zoom, zIndex = 15, callbackFn) {
        let map = L.map(element, {
            crs: L.CRS.Simple,
            center: [39.300299, -95.727541],
            attributionControl: false,
            zoom: zoom,
            zoomControl: false

        })

        return map
    }

    customControl(map, position, className1, className2, className3,className4, clickCallback1, clickCallback2, clickCallback3, clickCallback4, title1 , title2 , title3 , title4 ) {
        let control = L.Control.extend({
            options: {
                position: position
            },
            onAdd: function (map) {
                var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom settingsContainer');
                var icon4 = L.DomUtil.create('a', className4, container);
                L.DomEvent.on(icon4, 'click', L.DomEvent.stopPropagation)
                    .on(icon4, 'click', L.DomEvent.preventDefault)
                    .on(icon4, 'click', clickCallback4);
                icon4.title = title4;

                var icon3 = L.DomUtil.create('a', className3, container);
                L.DomEvent.on(icon3, 'click', L.DomEvent.stopPropagation)
                    .on(icon3, 'click', L.DomEvent.preventDefault)
                    .on(icon3, 'click', clickCallback3);
                icon3.title = title3;

                var icon2 = L.DomUtil.create('a', className2, container);
                L.DomEvent.on(icon2, 'click', L.DomEvent.stopPropagation)
                    .on(icon2, 'click', L.DomEvent.preventDefault)
                    .on(icon2, 'click', clickCallback2);
                icon2.title = title2;

                var icon1 = L.DomUtil.create('a', className1, container);
                L.DomEvent.on(icon1, 'click', L.DomEvent.stopPropagation)
                    .on(icon1, 'click', L.DomEvent.preventDefault)
                    .on(icon1, 'click', clickCallback1);
                icon1.title = title1;

                return container;
            }
        });
        map.addControl(new control());
        return map
    }
}


export const updateTopologyStatusMarker = (stateToDisplay, markerCluster, topoProps) => {
    console.log("inside update markers..");
    let lMarkers = markerCluster;
    lMarkers.forEach(function (item) {
        var siteIconNew = getIcon(item.iconDetails, topoProps, stateToDisplay);

        var x = item.getElement(item);
        var text = x.innerText;
        var iconClass = item.iconDetails.locDisabeled;
        x.innerHTML = '<img class="map-icon-img ' + iconClass + '"  src="' + siteIconNew + '"/>' + '<span class="icon-text">' + text + '</span>'
    })
    // markerCluster.refreshClusters();

  function drawIcon(locationObj,stateMarkerColor,badgeState,badge,statebadgeColor,badgeEnabeled) {
      //  var icon = stateMarkerColor;
        var iconColor = stateMarkerColor;
        var MAP_constants = {
		'LOCATION' : 'LOCATION',
		'NORMAL' : 'Normal',
		'DEFAULT_COLOR' : '#BDBDBD',
		'OUTLINE_COLOR' : '#42A5F5'
	}
		var outline = null;
/*        if(badgeEnabeled){
             var tearDropColor = "#BDBDBD";
        }
      else{
           var tearDropColor = iconColor ? iconColor : "#BDBDBD";
      }*/
        
		var tearDropColor = iconColor ? iconColor : "#BDBDBD";
        var markerBadge = null;
      var equipBadge = null;
        if(badge || badgeEnabeled){
                var char = badgeState.toUpperCase().charAt(0);
                var badgeCol = statebadgeColor ? statebadgeColor : "#BDBDBD";
				markerBadge = "<circle cx='15' cy='5' r='4.5' fill='" + badgeCol + "' style='stroke:white ;stroke-width:1.5;'/><text x='15' y='5' text-anchor='middle' font-family='Arial' style='font-weight: 700; font-size:34%'  fill='#f9fbfd' dy='.3em'>" + char + "</text>";
            if(locationObj.toggleState){
                 equipBadge = "<circle cx='20' cy='4' r='4.5' fill='" + badgeCol + "' style='stroke:white ;stroke-width:1.5;'/><text cx='20' cy='4' text-anchor='middle' font-family='Arial' style='font-weight: 700; font-size:34%'  fill='#f9fbfd' dy='1em' dx='3.7em'>" + char + "</text>";
            }
            	//return markerBadge;
            
           }
		
		var markerIcon = "data:image/svg+xml;charset=utf-8,";
      if(locationObj.toggleState){
          /* var char = badgeState.toUpperCase().charAt(0);
            var badgeCol = statebadgeColor ? statebadgeColor : "#BDBDBD";
          var equipBadge = "<circle cx='20' cy='4' r='4.5' fill='" + badgeCol + "' style='stroke:white ;stroke-width:1.5;'/><text cx='20' cy='4' text-anchor='middle' font-family='Arial' style='font-weight: 700; font-size:34%'  fill='#f9fbfd' dy='1em' dx='3.7em'>" + char + "</text>";*/
          markerIcon += encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><title>ic_equipment_ne</title><g id='Icons'><path d='M21,10V21a1.08,1.08,0,0,1-1,1H4a1.08,1.08,0,0,1-1-1V10A1.08,1.08,0,0,1,4,9H20A1.08,1.08,0,0,1,21,10Zm0-7V7a1.08,1.08,0,0,1-1,1H4A1.08,1.08,0,0,1,3,7V3A1.08,1.08,0,0,1,4,2H20A1.08,1.08,0,0,1,21,3ZM19,4H12V6h7Z' fill='" + tearDropColor + "'/></g>" + (equipBadge ? equipBadge : '') + "  </svg>");
      }else{
         markerIcon += encodeURIComponent("<svg width='20px' height='24px' viewBox='0 0 20 30' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>\
                      <g id='locationMarker_Id' stroke='null' stroke-width='1' fill='none' fill-rule='evenodd'>\
                          <g fill='" + tearDropColor + "'  stroke='" + outline + "' stroke-width='1.5'>\
                              <path  id='tearDrop' d='M7.9964124,24 C7.9964124,24 16.3051778,17.7981979 15.9913273,12.2953973 C15.7138588,7.43048918 12.411882,4 7.9964124,4 C3.5809428,4 0.0992023405,7.71561877 0.00149746311,12.2953973 C-0.126521704,18.2961154 7.9964124,24 7.9964124,24  Z'></path>\
                          </g> " + (markerBadge ? markerBadge : '') + "</g> </svg>");
      }
		return markerIcon;  
	}
    
   
    function getIcon(props, topoProps, stateToDisplay) {
        
        var draw = topoProps.drawIcons;
        var iconUrl= topoProps.iconUrl;
        var baseUrl =topoProps.baseUrl;
        
       /* if(iconUrl){
            var urlIcons = iconUrl;
        } else if (draw) {
            return drawIcon(props,stateMarkerColor,badgeState,badge,statebadgeColor,badgeEnabeled);
        }*/
        
        if (stateToDisplay) {
            var stateToDisplayKeys = Object.keys(stateToDisplay);
            let alarmSubState = {};
            for (var i = 0; i < stateToDisplayKeys.length; i++) {
                var state = stateToDisplayKeys[i];
                alarmSubState = alarmSubState ? alarmSubState : {};
                alarmSubState[state] = stateToDisplay[state].map(function (value) {
                    return value.text;
                })
            }
            let stateFromMarker = props.state;
            var badgeEnabeled = false;
            for (var i = 0; i < stateToDisplayKeys.length; i++) {
                var statebadgeColor;
                var state = stateToDisplayKeys[i];
                if (stateFromMarker && stateFromMarker[state]) {
                    var filteredSubState = alarmSubState[state].filter(function (x) {
                        return stateFromMarker[state].indexOf(x) != -1
                    })[0];
                    if (filteredSubState) {
                        var stateIconColor = stateToDisplay[state][alarmSubState[state].indexOf(filteredSubState)]
                       // if (stateIconColor.badge) {
                            if (stateIconColor.badge || state == props.stateAttribute) {
                            statebadgeColor = stateIconColor.color;
                            var badgeState = stateIconColor.text;
                            var badge = stateIconColor.badge;
                            badgeEnabeled = true;
                        } else {
                            var stateMarkerColor = stateIconColor.color;
                            var locationState = stateIconColor.text;
                        }
                    }
                }
            }
        }
        
          if(iconUrl && iconUrl.length!=0 && iconUrl!=undefined){
            var urlIcons = iconUrl;
        } 
       /* else if (baseUrl){ 
             var urlSureIcons = baseUrl;
        }*/
        else if (draw) {
            return drawIcon(props,stateMarkerColor,badgeState,badge,statebadgeColor,badgeEnabeled);
        }
      
        if (props.badge) {
            if(urlIcons){
               var icon = urlIcons + (badgeState ? badgeState.toLowerCase() : "marker_default") + ".svg";
               }
            
        } else if (props.toggleState) {
              if(urlIcons){
               var icon = urlIcons +"equipment_" + (badgeState ? badgeState.toLowerCase() : "default") + "_" + (locationState ? locationState.toLowerCase() : "default") + (props.selected ? "_selected" : "") + ".svg";
               
               }
        } else if (props.locDisabeled) {
             if(urlIcons){
               var icon =  props.baseUrl + "/UNKNOWN.svg";
               }
           
        } else {
             if(urlIcons){
              var icon = urlIcons + "location_" + (badgeState ? badgeState.toLowerCase() : "default") + "_" + (locationState ? locationState.toLowerCase() : "default") + (props.selected ? "_selected" : "") + ".svg";
                
               }
        }
        return icon;
    }
}

export default topologyMapHelper
// WEBPACK FOOTER //

