/**
 *  
 * Action: equipmentViewAction.js
 *
 * @version 1.0
 * @author Anil
 *
 */

import axios from 'axios';
import React, {
    Component
} from 'react';
import UamHelper from "../helpers/uam/UamHelper";
import style from '../../styles/dataGrid.css';
import { ProgressIndicatorCircular,Snackbar } from '@nokia-csf-uxr/csfWidgets';

//Action Creators
//API call
export const traversalAction = (data) => {
    var objRowdata = [];
    var outputObject = [];
    return function (dispatch) {
        return axios.all([
            axios({
                method: "POST",
                url: data.url,
                headers: data.requestHeaders,
                data: data.payload
            }),
            axios({
                method: "GET",
                url: data.columnUrl,
                headers: data.requestHeaders
            })


        ]).then(axios.spread(function (rowTraversalResponse, columnTraversalResponse) {

            rowDataTraversalformat(rowTraversalResponse);


            columnDataFormat(dispatch, columnTraversalResponse, data, 'GET_COLUMN_TRAVERSAL_DATA_SUCCESS');

            function rowDataTraversalformat(response) {
                var dataRow = response.data.entities;
                var iconUrl = "";
                var rowDetail = "";
                var rowActionIcons = "";
                var currentTraversalEntity = "";

                if (dataRow) {
                    dataRow.map(function (value, key) {
                        var item = value["properties"];
                        this.push(item);
                    }, objRowdata);
                } else {
                    objRowdata = [];
                }

                dispatch({
                    type: 'GET_TRAVERSAL_SUCCESS',
                    payload: {
                        objRowdata: objRowdata,
                        currentTraversalEntity: data.selectedEntity,

                    }

                });
            }
        }));
    }
}

export const unmountEVData = () => {
    return function (dispatch) {
        dispatch({
            type: 'RESET'
        });
    }
}


function userDispatch(data, dispatch) {
    dispatch({
        type: 'GET_GRID_DATA_SUCCESS',
        payload: {
            objRowdata: [],
            traversalEntity: data.traversalEntity,
            selectedEntity: data.selectedEntity
        }
    });
}

function ColumnDataAxios(data, dispatch) {
    //  return function (dispatch) {
    return axios({
        method: "GET",
        url: data.columnurl,
        headers: data.requestHeaders
    }).then(function (columnResponse) {
        if (data.columnResponse && data.columnResponse.length > 0) {
            columnDataFormat(dispatch, data.columnResponse, data, "GET_COLUMN_DATA_SUCCESS");
        } else {
            columnDataFormat(dispatch, columnResponse, data, "GET_COLUMN_DATA_SUCCESS");
        }
    });
    //   }    
}

function RowDataAxios(data, reqHeaders, dispatch) {
    var changeHeaders = reqHeaders;
    if (data.selectedEntity == 'usergroups') {
        changeHeaders['TransformationEnabled'] = false;
    } else {
        changeHeaders['TransformationEnabled'] = true;

    }

    // return function (dispatch) {
    return axios({
        method: data.method,
        url: data.rowurl,
        headers: changeHeaders
    }).then(function (rowResponse) {
        if (data.selectedEntity == 'usergroups') {
            responseParseFn(rowResponse);
        } else {
            rowDataformat(rowResponse);
        }
    });
    //  }    
    /* Parsing data for rest response against each entity before appending into data grid,
         To add another data parse, need to add one else if condition
        */
    function responseParseFn(response) {
        var dataRow = response.data.entities ? response.data.entities : response.data.element;
        var objRowdata = [];
        console.log("inside responseParseFn.. ");
        if (dataRow) {
            dataRow.map(function (value, key) {
                // if(dataRow.relationships && dataRow.relationships.UG_USES_PROFILE){
                var x;
                if (value.relationships.UG_USES_PROFILE.relationship) {
                    x = value.relationships.UG_USES_PROFILE.relationship;
                    if (x[0].Target) {
                        x = x[0].Target;
                        if (x.relationships) {
                            x = x.relationships;
                            if (x.FOLLOWS_CATALOG) {
                                x = x.FOLLOWS_CATALOG;
                                if (x.relationship) {
                                    x = x.relationship;
                                    if (x[0].Target) {
                                        x = x[0].Target;

                                        if (x.properties) {
                                            x = x.properties.SureName;


                                        }
                                    }

                                }
                            }
                        }



                    }
                }

                var item = value["properties"];
                if (Object.keys(x).length === 0) {
                    item["Profile"] = '';
                } else {
                    item["Profile"] = x;
                }

                this.push(item);

            }, objRowdata);
        } else {
            objRowdata = [];
        }
        dispatch({
            type: 'GET_GRID_DATA_SUCCESS',
            payload: {
                objRowdata: objRowdata,
                // iconUrl: data.imageIconurl,
                // rowDetail: data.passRowData,
                //editRow: data.editRow,
                // deleteRow: data.deleteRow,
                traversalEntity: data.traversalEntity,
                selectedEntity: data.selectedEntity

            }

        });


    }

    function rowDataformat(response) {

        var dataRow = response.data.entities ? response.data.entities : response.data.element;
        var objRowdata = [];

        var iconUrl = "";
        var rowDetail = "";
        var editRow = "";
        var traversalEntity = "";
        if (dataRow) {
            dataRow.map(function (value, key) {
                var item = value["properties"];
                // var accessRole = value[]
                this.push(item);
            }, objRowdata);
        } else {
            objRowdata = [];
        }


        dispatch({
            type: 'GET_GRID_DATA_SUCCESS',
            payload: {
                objRowdata: objRowdata,
                // iconUrl: data.imageIconurl,
                // rowDetail: data.passRowData,
                //editRow: data.editRow,
                // deleteRow: data.deleteRow,
                traversalEntity: data.traversalEntity,
                selectedEntity: data.selectedEntity

            }

        });

    }
}

var progressOptions = {
    spinner: "right"
     ,overlay:true
     ,css : {small: false, medium: false, large: false, xlarge: true, xxlarge: false}
     
  };
export const EVSearchData = (data) => {
    var component1 = React.createElement(ProgressIndicatorCircular, progressOptions);
    ReactDOM.render(component1, document.getElementById("progressIndicatorCircularID"));
    console.log("hierarchical equipment data: " + data);
    console.log(data);
var selectedEntityTypeVar=data.selectedEntityType;
    //var searchOutgoing=Object.assign({}, data.searchPayload);
    var searchOutgoing = JSON.parse(JSON.stringify(data.searchPayload));
    searchOutgoing.request.gDirection = 'OUTGOING';
    console.log(searchOutgoing); //We get the outgoing nodes first(all the parent equipments at first..). Once we find the root equipment from the response, we then make a second rest call with direction: "BOTH", which gives the complete hierarchy in a proper format.
    return function (dispatch) {


        return axios.all([

            axios({
                method: 'POST',
                url: data.searchUrl,
                headers: data.requestHeaders,
                data: searchOutgoing

            }),
            axios({
                method: 'GET',
                url: data.columnurl,
                headers: data.requestHeaders
            })


        ]).then(axios.spread(function (rowResponseOut, columnResponse)
         {
           console.log("response is working");
            ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularID"));
            if (data.selectedEntity == 'usergroups') {
                responseParseFn(rowResponse);
            } else {
                //First time response being sent to format:
                rowDataformat(rowResponseOut, null, data.selectedUUID);

            }

            columnDataFormat(dispatch, columnResponse, data, "GET_EQSEARCH_COLUMN_SUCCESS");


var selectedUUIDData;

            function rowDataformat(rowResponseOut, rootEquipmentPropertiesFromSecondCall, selectedUUID, hierarchyArray) {
                var mainarr = new Array(); // array that holds an array of names for each sublevel

                console.log(mainarr);
                // traverse(rowResponseIn.data.element[0], 0, mainarr); //To get all child nodes(BOTH).

                var mainarr2 = new Array(); // array that holds an array of names for each sublevel
                if(rowResponseOut && rowResponseOut.data && rowResponseOut.data.element[0]){
                    if(selectedEntityTypeVar=='Endpoint' || selectedEntityTypeVar=='FCP'){
                traverseForEndpoint(rowResponseOut.data.element[0], 0, mainarr2); //To get all outgoing nodes(OUTGOING)   
                    }
                    else if(selectedEntityTypeVar=='Equipment'){
                            
                                            traverseForEndpoint(rowResponseOut.data.element[0], 0, mainarr2); //To get all outgoing nodes(OUTGOING)   
                            }
                   }
                

                var rootEquipmentProperties;
                if(!hierarchyArray){var hierarchyArray=[];}
                
                //Object.assign

                var objRowdata = mainarr2;
                console.log(JSON.stringify(objRowdata));
                if (!rootEquipmentPropertiesFromSecondCall) {
console.log("objRowdata: ");console.log(objRowdata);

                    if (objRowdata.length == 1) {
                        if (objRowdata[0].length == 1) {
                            rootEquipmentProperties = objRowdata[0][0];
                            selectedUUIDData = objRowdata[0][0];
                        } else {
                            rootEquipmentProperties = objRowdata[0];
                            selectedUUIDData = objRowdata[0];
                        }
                        hierarchyArray.push(objRowdata[0][0]);

                    } else {
                        for (let i = 0; i < objRowdata.length; i++) {

                            for (let j = 0; j < objRowdata[i].length; j++) {
                                if (objRowdata[i][j].parentNode == true) {
                                    rootEquipmentProperties = objRowdata[i][j];

                                }
                                if (objRowdata[i][j].UUID == selectedUUID) {
                                    selectedUUIDData = objRowdata[i][j];
                                }
                                
                            }


                        }
                        
                        
                        //To create hierarchy array:
                        for(let k=0; k<objRowdata.length;k++){
                            hierarchyArray.push(objRowdata[k][0]);
                        
                        }
                        hierarchyArray.reverse();
                        objRowdata.reverse();
                        //hierarchyArray.push(selectedUUIDData);
                        //hierarchyArray.reverse();
                        console.log(hierarchyArray);
                    }
                
                
                     //Only after the first call was successful and the rootequipment was found out..
                    //Making the second REST call using the root equipment found above.
                    var searchBoth = JSON.parse(JSON.stringify(data.searchPayload));
                     console.log(data);
                    if(data.selectedEntityType=='Equipment'){
                        console.log(data);
                    searchBoth.request.gDirection = 'INCOMING';
                        
                        searchBoth={"request":{"origin":{"@class":"Equipment","UUID":"1cbc5e53-3dde-4ad3-bf9e-73c453c90327"},"inclusion":{"gInclude":["Endpoint","Equipment","FCP"]},"gDirection":"INCOMING"},"response":{"responseType":"SubTree","entity":["Equipment","Location"]},"expand":["Equipment.State"]}
                       }
                    else if(data.selectedEntityType=='Endpoint'){
                    searchBoth={"request":{"origin":{"@class":"Equipment","UUID":"1cbc5e53-3dde-4ad3-bf9e-73c453c90327"},"inclusion":{"gInclude":["Endpoint","Equipment","FCP"]},"gDirection":"INCOMING"},"response":{"responseType":"SubTree","entity":["Equipment","FCP","Endpoint"]},"expand":["Equipment.State"]}
                    //searchBoth. = 'BOTH';  
                    }
                    else if(data.selectedEntityType=='FCP'){
                       searchBoth={"request":{"origin":{"@class":"Equipment","UUID":"1cbc5e53-3dde-4ad3-bf9e-73c453c90327"},"inclusion":{"gInclude":["Endpoint","Equipment","FCP"]},"gDirection":"INCOMING"},"response":{"responseType":"SubTree","entity":["Equipment","FCP","Endpoint"]},"expand":["Equipment.State"]}     
                            }
                    console.log(rootEquipmentProperties);
                    if (rootEquipmentProperties.UUID) {
                        searchBoth.request.origin.UUID = rootEquipmentProperties.UUID;
                    } else {
                        searchBoth.request.origin.UUID = rootEquipmentProperties[0].UUID;
                    }

                    //resides_on >> resides_on >> resides_on >> resides_on >> resides_on >> part_of >> routes_to
                    dispatch({
                        type: 'GET_EQSEARCH_SUCCESS',
                        payload: {
                            objRowdata: objRowdata,
                            rootEquipment: rootEquipmentProperties,
                            selectedUUIDData: selectedUUID,
                            hierarchyArray:hierarchyArray,
                            //iconUrl: data.imageIconurl,
                            //rowDetail: data.passRowData,
                            //editRow: data.editRow,
                            //deleteRow: data.deleteRow,
                            traversalEntity: data.traversalEntity,
                            selectedEntity: data.selectedEntity

                        }

                    });
                    //The second call to get the hierarchy data starting from the root equipment:
                    /*axios({
                        method: 'POST',
                        url: data.searchUrl,
                        headers: data.requestHeaders,
                        data: searchBoth

                    }).then(response => {
                        //Second time response being sent to format:
                        console.log(data.selectedUUID);
                        rowDataformat(response, rootEquipmentProperties, selectedUUIDData, hierarchyArray);

                    })*/
                
                } 
                
                
                else {
                    
                    rootEquipmentProperties = rootEquipmentPropertiesFromSecondCall;

                     if (!rootEquipmentPropertiesFromSecondCall.UUID) {
                        rootEquipmentProperties = rootEquipmentPropertiesFromSecondCall[0];
                    }
if(hierarchyArray.length==0){
    console.log(hierarchyArray);
    
   hierarchyArray[0]=rootEquipmentProperties;
   }
                    /*dispatch({
                        type: 'GET_EQSEARCH_SUCCESS',
                        payload: {
                            objRowdata: objRowdata,
                            rootEquipment: rootEquipmentProperties,
                            selectedUUIDData: selectedUUID,
                            hierarchyArray:hierarchyArray,
                            //iconUrl: data.imageIconurl,
                            //rowDetail: data.passRowData,
                            //editRow: data.editRow,
                            //deleteRow: data.deleteRow,
                            traversalEntity: data.traversalEntity,
                            selectedEntity: data.selectedEntity

                        }

                    });*/
                }

            }


            function traverseForEndpoint(data, level, mainarr, parentobj, parentEquipment) {
                var parentFound;
                
                //if(mainarr==undefined || mainarr[level]==undefined){ var mainarr=new Array(0);} // if its the first time reaching this sub-level, create array
                if (mainarr[level] == undefined) mainarr[level] = []; // if its the first time reaching this sub-level, create array
                for(var dataindex=0;dataindex<data.length;dataindex++){
                    if ((data[dataindex].Source && mainarr[level]) || (data[dataindex].Target && mainarr[level])) {
                    console.log('if data');
                    
                    let temparr = {};

                    //Adding state info the a temporary object and assigning it to the main array:
                    if (data[dataindex].Source){
                        if(data[dataindex].Source.relationships.HAS_STATE && data[dataindex].Source.relationships.HAS_STATE.relationship[0].Target.properties){
                        let stateobj = data[dataindex].Source.relationships.HAS_STATE.relationship[0].Target.properties;
                            let mainobj = data[dataindex].Source.properties;
                        temparr = Object.assign({}, stateobj, mainobj);
                        }
                           else{
                           //let stateobj ;
                               let mainobj = data[dataindex].Source.properties;
                        
                               temparr = Object.assign({}, mainobj);
                               
                           }
                    } 
                        else if (data[dataindex].Target) {
                        if(data[dataindex].Target.relationships.HAS_STATE && data[dataindex].Target.relationships.HAS_STATE.relationship[0].Target.properties){
                        let stateobj = data[dataindex].Target.relationships.HAS_STATE.relationship[0].Target.properties;
                            let mainobj = data[dataindex].Target.properties;
                        temparr = Object.assign({}, stateobj, mainobj);
                        }
                           else{
                           //let stateobj ;
                               let mainobj = data[dataindex].Target.properties;
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
                        if (parentobj) {
                            temparr.parent = parentobj;
                        }

                    }

                    mainarr[level].push(temparr); // push the name in the sub-level array
                    //arr[level].push(data.Source.properties);
                }} if (!data[dataindex] && data && level == 0) {
                    let temparr;
                   
                    if (data.relationships.HAS_STATE && data.relationships.HAS_STATE.relationship[0].Target.properties) {
                        let stateobj = data.relationships.HAS_STATE.relationship[0].Target.properties;
                        let mainobj = data.properties;
                        temparr = Object.assign({}, stateobj, mainobj);
                    } else {
                        //let stateobj = data.Target.relationships.HAS_STATE.relationship[0].Target.properties;
                        let mainobj = data.properties;
                        temparr = Object.assign({}, mainobj);
                    }


                    //var rowData=data.properties;
                    temparr.defaultOpen = true;
                    if (data.NeoDirection == 'SOURCE_TO_TARGET') {
                        temparr.parentNode = true;
                    } else if (data.NeoDirection == 'TARGET_TO_SOURCE') {
                        temparr.parentNode = false;
                    }

                    mainarr[0].push(temparr); // push the name in the sub-level array
                }
                var dataForTraverse=[];
                if(!data.length){var data2=JSON.parse(JSON.stringify(data)); var data=[]; data.push(data2);}
                for(let dataind=0;dataind<data.length;dataind++){
                var data2=data[dataind];
                    data=data2;
                
                
                
//if(selectedEntityTypeVar=='Equipment' ||selectedEntityTypeVar=='Endpoint'){
                if (data.Source && data.properties && data.Source.relationships.RESIDES_ON && data.Source.relationships.RESIDES_ON.relationship) {
                    
                    for (var index = 0; index < data.Source.relationships.RESIDES_ON.relationship.length; index++) { // for each node in children
                        //console.log(data.Source.relationships.RESIDES_ON.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.Source.properties));
                        
                        parentFound=true;
                        dataForTraverse.push(data.Source.relationships.RESIDES_ON.relationship[index]);
                        
                    }
                }
                               
                
                else if (data.Target && data.properties && data.Target.relationships.RESIDES_ON && data.Target.relationships.RESIDES_ON.relationship) {
                    
                    for (var index = 0; index < data.Target.relationships.RESIDES_ON.relationship.length; index++) { // for each node in children
                        //console.log(data.Target.relationships.RESIDES_ON.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.Target.properties));
                        
                        parentFound=false;
                        dataForTraverse.push(data.Target.relationships.RESIDES_ON.relationship[index]);
                        
                    }
                } else if (data.relationships && data.relationships.RESIDES_ON && data.relationships.RESIDES_ON.relationship) {
                   
                    for (var index = 0; index < data.relationships.RESIDES_ON.relationship.length; index++) { // for each node in children
                        //console.log(data.relationships.RESIDES_ON.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.properties));
                        if (data.relationships.RESIDES_ON.relationship[index].NeoDirection == 'SOURCE_TO_TARGET') {
                            //console.log("parent node found..");

                            parentFound=true;
                            dataForTraverse.push(data.relationships.RESIDES_ON.relationship[index]);
                           
                        } else if (data.relationships.RESIDES_ON.relationship[index].NeoDirection == 'TARGET_TO_SOURCE') {

                            parentFound=true;
                            dataForTraverse.push(data.relationships.RESIDES_ON.relationship[index]);
                           
                        }






                    }

                }
//ASSOCIATES_WITH
                if (data.Source && data.properties && data.Source.relationships.ASSOCIATES_WITH && data.Source.relationships.ASSOCIATES_WITH.relationship) {
                    
                    for (var index = 0; index < data.Source.relationships.ASSOCIATES_WITH.relationship.length; index++) { // for each node in children
                        //console.log(data.Source.relationships.ASSOCIATES_WITH.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.Source.properties));
                        
                        parentFound=true;
                        dataForTraverse.push(data.Source.relationships.ASSOCIATES_WITH.relationship[index]);
                        
                    }
                }

                else if (data.Target && data.properties && data.Target.relationships.ASSOCIATES_WITH && data.Target.relationships.ASSOCIATES_WITH.relationship) {
                    
                    for (var index = 0; index < data.Target.relationships.ASSOCIATES_WITH.relationship.length; index++) { // for each node in children
                        //console.log(data.Target.relationships.ASSOCIATES_WITH.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.Target.properties));
                        
                        parentFound=false;
                        dataForTraverse.push(data.Target.relationships.ASSOCIATES_WITH.relationship[index]);
                        
                    }
                }
                else if (data.relationships && data.relationships.ASSOCIATES_WITH && data.relationships.ASSOCIATES_WITH.relationship) {
                   
                    for (var index = 0; index < data.relationships.ASSOCIATES_WITH.relationship.length; index++) { // for each node in children
                        //console.log(data.relationships.ASSOCIATES_WITH.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.properties));
                        if (data.relationships.ASSOCIATES_WITH.relationship[index].NeoDirection == 'SOURCE_TO_TARGET') {
                            //console.log("parent node found..");

                            parentFound=true;
                            dataForTraverse.push(data.relationships.ASSOCIATES_WITH.relationship[index]);
                           
                        } else if (data.relationships.ASSOCIATES_WITH.relationship[index].NeoDirection == 'TARGET_TO_SOURCE') {

                            parentFound=true;
                            dataForTraverse.push(data.relationships.ASSOCIATES_WITH.relationship[index]);
                           
                        }






                    }

                }
                    //End of associates_with relationship condition..

//}
    //To get FCP from endpoints(ROUTES_TO):
  //  else if(selectedEntityTypeVar=='FCP'){
    if(data.Source && data.properties && data.Source.relationships.ROUTES_TO && data.Source.relationships.ROUTES_TO.relationship) {
                    
                    for (var index = 0; index < data.Source.relationships.ROUTES_TO.relationship.length; index++) { // for each node in children
                        //console.log(data.Source.relationships.ROUTES_TO.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.Source.properties));
                        
                        parentFound=true;
                        dataForTraverse.push(data.Source.relationships.ROUTES_TO.relationship[index]);
                        
                    }
                } else if (data.Target && data.properties && data.Target.relationships.ROUTES_TO && data.Target.relationships.ROUTES_TO.relationship) {
                    
                    for (var index = 0; index < data.Target.relationships.ROUTES_TO.relationship.length; index++) { // for each node in children
                        //console.log(data.Target.relationships.ROUTES_TO.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.Target.properties));
                        
                        parentFound=false;
                        dataForTraverse.push(data.Target.relationships.ROUTES_TO.relationship[index]);
                        
                    }
                } else if (data.relationships && data.relationships.ROUTES_TO && data.relationships.ROUTES_TO.relationship) {
                   
                    for (var index = 0; index < data.relationships.ROUTES_TO.relationship.length; index++) { // for each node in children
                        
                        var parentobj = JSON.parse(JSON.stringify(data.properties));
                        if (data.relationships.ROUTES_TO.relationship[index].NeoDirection == 'SOURCE_TO_TARGET') {
                            //console.log("parent node found..");

                            dataForTraverse.push(data.relationships.ROUTES_TO.relationship[index]);
                            parentFound=true;
                            
                        } else if (data.relationships.ROUTES_TO.relationship[index].NeoDirection == 'TARGET_TO_SOURCE') {

                            parentFound=true;
                            dataForTraverse.push(data.relationships.ROUTES_TO.relationship[index]);
                            
                            
                        }






                    }

                }
   // }
    //To get Equipments from endpoints(PART_OF):
 //   else if(selectedEntityTypeVar=='Endpoint'){
            if(data.Source && data.properties && data.Source.relationships.PART_OF && data.Source.relationships.PART_OF.relationship) {
                    
                    for (var index = 0; index < data.Source.relationships.PART_OF.relationship.length; index++) { // for each node in children
                        //console.log(data.Source.relationships.PART_OF.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.Source.properties));
                        
                        parentFound=true;
                        dataForTraverse.push(data.Source.relationships.PART_OF.relationship[index]);
                        
                    }
                } else if (data.Target && data.properties && data.Target.relationships.PART_OF && data.Target.relationships.PART_OF.relationship) {
                    
                    for (var index = 0; index < data.Target.relationships.PART_OF.relationship.length; index++) { // for each node in children
                        //console.log(data.Target.relationships.PART_OF.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.Target.properties));
                       
                        parentFound=false;
                        
                        dataForTraverse.push(data.Target.relationships.PART_OF.relationship[index]);
                        
                    }
                } else if (data.relationships && data.relationships.PART_OF && data.relationships.PART_OF.relationship) {
                   
                    for (var index = 0; index < data.relationships.PART_OF.relationship.length; index++) { // for each node in children
                        //console.log(data.relationships.PART_OF.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.properties));
                        if (data.relationships.PART_OF.relationship[index].NeoDirection == 'SOURCE_TO_TARGET') {
                            //console.log("parent node found..");
                            parentFound=true;
dataForTraverse.push(data.relationships.PART_OF.relationship[index]);
                            
                            
                        } else if (data.relationships.PART_OF.relationship[index].NeoDirection == 'TARGET_TO_SOURCE') {
                            parentFound=false;
dataForTraverse.push(data.relationships.PART_OF.relationship[index]);
                          
                        }






                    }

                }
            }
                
                
                if(parentFound==true){
                   traverseForEndpoint(dataForTraverse, level+1, mainarr, parentobj);
                   
                   }
                    else if(parentFound==false){
                    traverseForEndpoint(dataForTraverse, level+1, mainarr, parentobj);
                    }
                
                
                
 //   }
                    
            


        }
            
                        function traverse(data, level, mainarr, parentobj, parentEquipment) {
var parentFound;
                
                //if(mainarr==undefined || mainarr[level]==undefined){ var mainarr=new Array(0);} // if its the first time reaching this sub-level, create array
                if (mainarr[level] == undefined) mainarr[level] = []; // if its the first time reaching this sub-level, create array
                if ((data.Source && mainarr[level]) || (data.Target && mainarr[level])) {
                    console.log('if data');
                    
                    let temparr = {};

                    //Adding state info the a temporary object and assigning it to the main array:
                    if (data.Source && data.Source.relationships.HAS_STATE && data.Source.relationships.HAS_STATE.relationship[0].Target.properties) {
                        let stateobj = data.Source.relationships.HAS_STATE.relationship[0].Target.properties;
                        let mainobj = data.Source.properties;
                        temparr = Object.assign({}, stateobj, mainobj);
                        if (data.NeoDirection == 'SOURCE_TO_TARGET') {
                            temparr.parentNode = true;
                        } else if (data.NeoDirection == 'TARGET_TO_SOURCE') {
                            temparr.parentNode = false;
                        }
                        if (parentobj) {
                            temparr.parent = parentobj;
                        }


                    } else if (data.Target && data.Target.relationships.HAS_STATE && data.Target.relationships.HAS_STATE.relationship[0].Target.properties) {
                        let stateobj = data.Target.relationships.HAS_STATE.relationship[0].Target.properties;
                        let mainobj = data.Target.properties;
                        temparr = Object.assign({}, stateobj, mainobj);
                        if (data.NeoDirection == 'SOURCE_TO_TARGET') {
                            temparr.parentNode = true;
                        } else if (data.NeoDirection == 'TARGET_TO_SOURCE') {
                            temparr.parentNode = false;
                        }
                        if (parentobj) {
                            temparr.parent = parentobj;
                        }

                    }
                    else if(data.Target && (Object.keys(data.properties).length === 0 && data.properties.constructor === Object)){
                            
                        let mainobj = data.Target.properties;
                        temparr = Object.assign({},mainobj);
                        if (parentobj) {
                            temparr.parent = parentobj;
                        }
                        if (data.NeoDirection == 'SOURCE_TO_TARGET') {
                            temparr.parentNode = true;
                        } else if (data.NeoDirection == 'TARGET_TO_SOURCE') {
                            temparr.parentNode = false;
                        }
                            }

                    mainarr[level].push(temparr); // push the name in the sub-level array
                    //arr[level].push(data.Source.properties);
                } else if (data && level == 0) {
                    let temparr;
                   
                    if (data.relationships.HAS_STATE && data.relationships.HAS_STATE.relationship[0].Target.properties) {
                        let stateobj = data.relationships.HAS_STATE.relationship[0].Target.properties;
                        let mainobj = data.properties;
                        temparr = Object.assign({}, stateobj, mainobj);
                    } else {
                        //let stateobj = data.Target.relationships.HAS_STATE.relationship[0].Target.properties;
                        if(data.Target && data.Target.properties){
                           let mainobj = data.properties;
                        temparr = Object.assign({}, mainobj);
                           }
                           else{
                        let mainobj = data.properties;
                        temparr = Object.assign({}, mainobj);
                    }
                    }


                    //var rowData=data.properties;
                    temparr.defaultOpen = true;
                    if (data.NeoDirection == 'SOURCE_TO_TARGET') {
                        temparr.parentNode = true;
                    } else if (data.NeoDirection == 'TARGET_TO_SOURCE') {
                        temparr.parentNode = false;
                    }

                    mainarr[0].push(temparr); // push the name in the sub-level array
                }
                            
var dataForTraverse=[];
                if (data.Source && data.properties && data.Source.relationships.RESIDES_ON && data.Source.relationships.RESIDES_ON.relationship) {
                    
                    for (var index = 0; index < data.Source.relationships.RESIDES_ON.relationship.length; index++) { // for each node in children
                        //console.log(data.Source.relationships.RESIDES_ON.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.Source.properties));
                        //traverse(data.Source.relationships.RESIDES_ON.relationship[index], level + 1, mainarr, parentobj); // travel the node, increasing the current sub-level
                        parentFound=true;
                        dataForTraverse.push(data.Source.relationships.RESIDES_ON.relationship[index]);
                    }
                } else if (data.Target && data.properties && data.Target.relationships.RESIDES_ON && data.Target.relationships.RESIDES_ON.relationship) {
                    
                    for (var index = 0; index < data.Target.relationships.RESIDES_ON.relationship.length; index++) { // for each node in children
                        //console.log(data.Target.relationships.RESIDES_ON.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.Target.properties));
                        
                        //traverse(data.Target.relationships.RESIDES_ON.relationship[index], level+1, mainarr, parentobj); // travel the node, increasing the current sub-level
                        parentFound=false;
                        dataForTraverse.push(data.Target.relationships.RESIDES_ON.relationship[index]);
                    }
                } else if (data.relationships && data.relationships.RESIDES_ON && data.relationships.RESIDES_ON.relationship) {
                   
                    for (var index = 0; index < data.relationships.RESIDES_ON.relationship.length; index++) { // for each node in children
                        //console.log(data.relationships.RESIDES_ON.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.properties));
                        if (data.relationships.RESIDES_ON.relationship[index].NeoDirection == 'SOURCE_TO_TARGET') {
                            //console.log("parent node found..");

                            //traverse(data.relationships.RESIDES_ON.relationship[index], level + 1, mainarr, parentobj);
                            parentFound=true;
                             dataForTraverse.push(data.relationships.RESIDES_ON.relationship[index]);
                        } else if (data.relationships.RESIDES_ON.relationship[index].NeoDirection == 'TARGET_TO_SOURCE') {

                           // traverse(data.relationships.RESIDES_ON.relationship[index], level + 1, mainarr, parentobj); // travel the node, increasing the current sub-level
                            
                            parentFound=true;
                             dataForTraverse.push(data.relationships.RESIDES_ON.relationship[index]);
                        }






                    }

                }
                            
                            //ASSOCIATES_WITH
                if (data.Source && data.properties && data.Source.relationships.ASSOCIATES_WITH && data.Source.relationships.ASSOCIATES_WITH.relationship) {
                    
                    for (var index = 0; index < data.Source.relationships.ASSOCIATES_WITH.relationship.length; index++) { // for each node in children
                        //console.log(data.Source.relationships.ASSOCIATES_WITH.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.Source.properties));
                        
                        parentFound=true;
                        dataForTraverse.push(data.Source.relationships.ASSOCIATES_WITH.relationship[index]);
                        
                    }
                }

                else if (data.Target && data.properties && data.Target.relationships.ASSOCIATES_WITH && data.Target.relationships.ASSOCIATES_WITH.relationship) {
                    
                    for (var index = 0; index < data.Target.relationships.ASSOCIATES_WITH.relationship.length; index++) { // for each node in children
                        //console.log(data.Target.relationships.ASSOCIATES_WITH.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.Target.properties));
                        
                        parentFound=false;
                        dataForTraverse.push(data.Target.relationships.ASSOCIATES_WITH.relationship[index]);
                        
                    }
                }
                else if (data.relationships && data.relationships.ASSOCIATES_WITH && data.relationships.ASSOCIATES_WITH.relationship) {
                   
                    for (var index = 0; index < data.relationships.ASSOCIATES_WITH.relationship.length; index++) { // for each node in children
                        //console.log(data.relationships.ASSOCIATES_WITH.relationship[index]);
                        var parentobj = JSON.parse(JSON.stringify(data.properties));
                        if (data.relationships.ASSOCIATES_WITH.relationship[index].NeoDirection == 'SOURCE_TO_TARGET') {
                            //console.log("parent node found..");

                            parentFound=true;
                            dataForTraverse.push(data.relationships.ASSOCIATES_WITH.relationship[index]);
                           
                        } else if (data.relationships.ASSOCIATES_WITH.relationship[index].NeoDirection == 'TARGET_TO_SOURCE') {

                            parentFound=true;
                            dataForTraverse.push(data.relationships.ASSOCIATES_WITH.relationship[index]);
                           
                        }






                    }

                }
                    //End of associates_with relationship condition for equipments..
                            
                             if(parentFound==true){
                   traverse(dataForTraverse, level+1, mainarr, parentobj);
                   
                   }
                    else if(parentFound==false){
                    traverse(dataForTraverse, level+1, mainarr, parentobj);
                        //traverseForEndpoint(dataForTraverse, level+1, mainarr, parentobj);
                    }
                            
            }
        })).catch(error => {
            console.log(error);
                    let errorMsg='';
                    if(error.message){
                    errorMsg = error.message;
                    }
                       else if(error){
                    errorMsg = error;
                       }
                    else{
                    errorMsg = 'Network Error';
                    }
                    ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularID"));
                    var dataList = {dataList:[{message: errorMsg,
            duration: 2000, autoIncreaseDuration: false}]};
                    
                    var snack = React.createElement(Snackbar, dataList);
            ReactDOM.render(snack, document.getElementById("snackbarID"));
                    
        });

    }

}


function columnDataFormat(dispatch, response, data, actionType) {
    var currentEntity = data.selectedEntity;
    var outputObject = [];
    if (response.data != undefined) {
        if(!response.data.entityAttributes[currentEntity]){
            currentEntity='Equipment';
        var columnDataNew = response.data.entityAttributes[currentEntity].defaultAttribute;
        var columnAvailData = response.data.entityAttributes[currentEntity].specificAttribute;
        }
        else {var columnDataNew = response.data.entityAttributes[currentEntity].defaultAttribute;
        //var columnDataNew = response.data.entityAttributes[currentEntity].defaultAttribute;
        var columnAvailData = response.data.entityAttributes[currentEntity].specificAttribute;
             }

    } else {
        var columnUpdate = response;
        if (columnUpdate) {
            columnUpdate.map(function (value, key) {
                var item = {};
                item['field'] = value["entityAttribute"];

                if (value['visibleColumn']) {
                    item['headerName'] = value['visibleColumn'];
                    item['hide'] = false;
                } else {
                    item['headerName'] = value['availableColumn'];
                    item['hide'] = true;
                }

                this.push(item);
            }, outputObject);
        }

    }
    // var  columnDataNew =  columnDataNew1 + columnDataNew;
    if (columnDataNew) {
        columnDataNew.map(function (value, key) {
            var item = {};

            item['field'] = value["entityAttribute"];

            item['headerName'] = value["visibleColumn"];
            item['hide'] = false;
            if (value["entityAttribute"].indexOf("Status") != -1) {
                item['cellClass'] = function (params) {
                    return params.value === 'Active' ? '' : 'locked-status';
                }
            }


            //Added by Gowtham.S for Status icon
            if (value["entityAttribute"].indexOf("STATE_") != -1) {
                Object.assign(item, {
                    width: 25,
                    cellRendererFramework: CustomCellRenderer.bind(data),
                    pinned: "left"
                })
            }
            if (data.nameIcon && (((value["entityAttribute"].toLowerCase()).indexOf("surename") == 0) || ((value["entityAttribute"].toLowerCase()).indexOf("username") == 0))) {
                Object.assign(item, {
                    cellRendererFramework: tenantNameIcon.bind(data),
                    pinned: "left"
                })
            }
            this.push(item);

        }, outputObject);
    }
    if (columnAvailData) {
        columnAvailData.map(function (value, key) {
            var item = {};
            item['field'] = value["entityAttribute"];

            item['headerName'] = value["availableColumn"];
            item['hide'] = true;

            //Added by Gowtham.S for Status icon
            if (value["entityAttribute"].indexOf("STATE_") != -1) {
                Object.assign(item, {
                    width: 25,
                    cellRendererFramework: CustomCellRenderer.bind(data),
                    pinned: "left"
                })
            }
            if (data.nameIcon && (((value["entityAttribute"].toLowerCase()).indexOf("surename") == 0) || ((value["entityAttribute"].toLowerCase()).indexOf("username") == 0))) {
                Object.assign(item, {
                    cellRendererFramework: tenantNameIcon.bind(data),
                    pinned: "left"
                })
            }
            this.push(item);

        }, outputObject);
    }

    /* outputObject=[{headerName: "Severity", field: "STATE.AdministrativeState", hide:false},
{headerName: "Slot number", field: "slotId", hide:false},
{headerName: "ports in use", field: "portName", hide:false},
{headerName: "ports available", field: "daughterCardSlotId", hide:false},
{headerName: "Location", field: "location", hide:false},
{headerName: "Technology", field: "technology", hide:false}, 
{headerName: "Name", field: "SureName", hide:false}, 
{headerName: "Technology", field: "technology", hide:false}];*/
    dispatch({
        type: actionType,
        payload: outputObject
    });
}


/**
 * @author Dileep Hariharan
 */
var pickAColor = function () {
    const colorsList = ['#012345', '#239DF9', '#05A18F', '#62AC00', '#FFBF02', '#FF7900', '#8E0022', '#D9070A', '#FF1654', '#9906EF', '#5E05C6'];
    return colorsList[Math.floor(Math.random() * 11)];;
};

function tenantNameIcon(params) {
    //let color = "#"+((1<<24)*Math.random()|0).toString(16);
    let color = pickAColor();
    if (params && params.value) {
        let valueObj = params.value;
        var text = '';
        let rectangle = true;
        if (params.colDef.field.toUpperCase() == "SURENAME")
        //let matches = params.value.toUpperCase().match(/\b(\w)/g);              // ['J','S','O','N']
        {
            text = valueObj.charAt(0);
        } else if (params.colDef.field.toUpperCase() == "USERNAME" && params.data) {
            let firstChar = params.data.Firstname ? params.data.Firstname.charAt(0) : valueObj.charAt(0);
            let lastChar = params.data.Lastname ? params.data.Lastname.charAt(0) : (valueObj.length > 1 ? valueObj.charAt(1) : '');
            text = firstChar + lastChar;
            rectangle = false;
        }
        text = text.toUpperCase();
        return ( <
            div style = {
                {
                    width: "8px",
                    height: "40px",
                    marginTop: "-14px"
                }
            } >
            <
            img id = "tenantIconImgId"
            style = {
                {
                    width: "37px",
                    height: "37px",
                    marginLeft: "0px",
                    verticalAlign: "middle"
                }
            }
            src = {
                "data:image/svg+xml;charset=utf-8," + encodeURIComponent(rectangle ? drawRect(color, text) : drawCircle(color, text))
            } > < /img> {params.value} < /
            div >
        )
    }
    return null;
}

//Added By Gowtham.S for status icon
function CustomCellRenderer(params) {
    let stateConfig = this.stateConfig
    let color = "#acacac",
        badge = "";
    if (params && params.value && Array.isArray(stateConfig)) {
        let stateType = params.colDef.field.replace("STATE_", "")
        let filteredObj = stateConfig.filter((x) => {
            return x.stateType == stateType
        })

        if (Array.isArray(filteredObj) && filteredObj.length > 0) {

            var stateInfo = filteredObj[0].properties.filter((x) => {
                return x.state.toLowerCase() == params.value.toLowerCase()
            })
            color = Array.isArray(stateInfo) && stateInfo[0] && stateInfo[0].color ? stateInfo[0].color : color;
            badge = Array.isArray(stateInfo) && stateInfo[0] && stateInfo[0].badgeText ? stateInfo[0].badgeText : badge
            var imageSrc = (this.externalIconURL && this.externalIconURL != "") ? (this.externalIconURL + "ic_" + params.value.toLowerCase() + "_kpi.svg") : this.imageIconurl + require("../../images/dataGrid/ic_" + params.value.toLowerCase() + "_kpi.svg");

        }
    }

    if (!Array.isArray(stateConfig) || stateConfig.length == 0) {
        return <div style = {
            {
                marginLeft: "20px"
            }
        } > {
            params && params.value ? params.value : ""
        } < /div>
    }

    return ( <
        div style = {
            {
                width: "8px",
                height: "40px",
                marginTop: "-14px",
                backgroundColor: color
            }
        } >
        <
        img style = {
            {
                width: "37px",
                height: "37px",
                marginLeft: "28px"
            }
        }
        src = {
            imageSrc ? imageSrc : "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG(color, badge))
        } > < /img> < /
        div >
    )
}

function drawSVG(color, badge) {
    var svg = '<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="mapviewsettingssvg" viewBox="0 0 6 6" width="6" height="6">\
             <circle cx="3" cy="3" r="2.5" fill="' + color + '"/><text x="3" y="3.25" text-anchor="middle" font-family="Arial" style="font-weight: bold; font-size:20%"  fill="#f9fbfd" dy=".3em">' + badge + '</text>\
            </svg>';
    return svg
}

function drawRect(color, text) {
    var svg = '<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="tenantIcon" viewBox="0 0 6 6" width="6" height="6">\
             <rect  x=".75" y=".75"  height="4.5" width="5" fill="' + color + '"/><text x="3" y="3" text-anchor="middle" font-family="Arial" style="font-weight: bold; font-size:20%"  fill="#f9fbfd" dy=".3em">' + text + '</text>\
            </svg>';
    return svg
}

function drawCircle(color, badge) {
    var svg = '<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="mapviewsettingssvg" viewBox="0 0 6 6" width="6" height="6">\
             <circle cx="3" cy="3" r="2.5" fill="' + color + '"/><text x="3" y="3.25" text-anchor="middle" font-family="Arial" style="font-weight: normal; font-size:17%"  fill="#f9fbfd" dy=".3em">' + badge + '</text>\
            </svg>';
    return svg
}
