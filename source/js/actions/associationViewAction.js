/**
 *  
 * Action: associationViewAction.js
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
export const associationData = (data) => {
    //EVSearchData
    var component1 = React.createElement(ProgressIndicatorCircular, progressOptions);
    ReactDOM.render(component1, document.getElementById("progressIndicatorCircularID"));
    console.log("hierarchical equipment data: " + data);
    console.log(data);
var selectedEntityTypeVar=data.selectedEntityType;
    //var searchOutgoing=Object.assign({}, data.searchPayload);
        return function (dispatch) {


        return axios.all([

            axios({
                method: 'GET',
                url: data.searchUrl,
                headers: data.requestHeaders

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

            columnDataFormat(dispatch, columnResponse, data, "GET_IN_ASSOCIATION_COLUMN_SUCCESS", 'InComingAssocation');
            columnDataFormat(dispatch, columnResponse, data, "GET_OUT_ASSOCIATION_COLUMN_SUCCESS", 'OutGoingAssocation');



var selectedUUIDData;
            var datagridsdata;

            function rowDataformat(rowResponseOut, rootEquipmentPropertiesFromSecondCall, selectedUUID, hierarchyArray) {
                var mainarr = new Array(); // array that holds an array of names for each sublevel

                console.log(mainarr);
                
                var mainarr2 = new Array(); // array that holds an array of names for each sublevel
                if(rowResponseOut && rowResponseOut.data && rowResponseOut.data.entities && rowResponseOut.data.entities[0]){
                    
                datagridsdata=traverseForAssociations(rowResponseOut.data.entities[0], 0, mainarr2); //To get all outgoing nodes(OUTGOING)   
                   
                   }
                   else if(rowResponseOut && rowResponseOut.data && rowResponseOut.data.element && rowResponseOut.data.element[0]){
                    
                    datagridsdata=traverseForAssociations(rowResponseOut.data.element[0], 0, mainarr2); //To get all outgoing nodes(OUTGOING)   
                       
                       }
                var selectedUUIDData={}
                if(rowResponseOut.data.entities && rowResponseOut.data.entities[0]){
                    selectedUUIDData= rowResponseOut.data.entities[0].properties;
                }
                else if(rowResponseOut.data.element && rowResponseOut.data.element[0]){
                    selectedUUIDData= rowResponseOut.data.element[0].properties;
                };
                console.log(datagridsdata);
                    //resides_on >> resides_on >> resides_on >> resides_on >> resides_on >> part_of >> routes_to
                    dispatch({
                        type: 'GET_ASSOCIATION_SUCCESS',
                        payload: {
                            objRowdata: datagridsdata,
                            
                            selectedUUIDData: selectedUUIDData,
                       
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
                
                


            
                             


            function traverseForAssociations(data, level, mainarr, parentobj, parentEquipment) {
                
                console.log(data.relationships);
                var listOfAssociations = Object.getOwnPropertyNames(data.relationships);
                console.log(listOfAssociations);
                var datagrids = [];
                var incomingDatagrid=[];
                var outgoingDatagrid=[];
                for(var i=0; i<listOfAssociations.length; i++){
                    for(var j=0; j<data.relationships[listOfAssociations[i]].relationship.length; j++){
                if(data.relationships[listOfAssociations[i]].relationship[j].NeoDirection=='TARGET_TO_SOURCE'){
                //INCOMING DATAGRID: 
                    var incomingDatagridItems=data.relationships[listOfAssociations[i]].relationship[j].properties;
                    incomingDatagridItems.AssociationType=listOfAssociations[i];
                    if(data.relationships[listOfAssociations[i]].relationship[j].Source.DisplayName){
                    incomingDatagridItems.SourceName=data.relationships[listOfAssociations[i]].relationship[j].Source.properties.DisplayName;    
                    }
                    else{
                    incomingDatagridItems.SourceName=data.relationships[listOfAssociations[i]].relationship[j].Source.properties.SureName;
                    
                    }
                     incomingDatagridItems.SourceType=data.relationships[listOfAssociations[i]].relationship[j].Source.properties.Type;
                     incomingDatagridItems.SubType=data.relationships[listOfAssociations[i]].relationship[j].Source.properties.SubType;
                     incomingDatagridItems.DiscoveredName=data.relationships[listOfAssociations[i]].relationship[j].Source.properties.DiscoveredName;
                  incomingDatagridItems.DisplayName=data.relationships[listOfAssociations[i]].relationship[j].Source.properties.DisplayName;
                    incomingDatagrid.push(incomingDatagridItems);
                    
                }
                    else if(data.relationships[listOfAssociations[i]].relationship[j].NeoDirection=='SOURCE_TO_TARGET'){
                            //OUTGOING DATAGRID:
                         //outgoingDatagrid.push(data.relationships[listOfAssociations[i]].relationship[j].Target.properties);
                        
                        var outgoingDatagridItems=data.relationships[listOfAssociations[i]].relationship[j].properties;
                    outgoingDatagridItems.AssociationType=listOfAssociations[i];
                        if(data.relationships[listOfAssociations[i]].relationship[j].Target.DisplayName){
                    outgoingDatagridItems.TargetName=data.relationships[listOfAssociations[i]].relationship[j].Target.properties.DisplayName;
                           }
                           else{
                           outgoingDatagridItems.TargetName=data.relationships[listOfAssociations[i]].relationship[j].Target.properties.SureName;
                           }
                        outgoingDatagridItems.TargetType=data.relationships[listOfAssociations[i]].relationship[j].Target.properties.Type;
                        outgoingDatagridItems.SubType=data.relationships[listOfAssociations[i]].relationship[j].Target.properties.SubType;
                        outgoingDatagridItems.DisplayName=data.relationships[listOfAssociations[i]].relationship[j].Target.properties.DisplayName;
                        outgoingDatagridItems.DiscoveredName=data.relationships[listOfAssociations[i]].relationship[j].Target.properties.DiscoveredName;
                        outgoingDatagrid.push(outgoingDatagridItems);
                        
                            }
                
                        }
                        }
                    datagrids[0]=incomingDatagrid;
                datagrids[1]=outgoingDatagrid;
                console.log(datagrids);
            return datagrids;


        
            
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


function columnDataFormat(dispatch, response, data, actionType, typeOfAssociation) {
    //var currentEntity = data.selectedEntity;
    console.log("column response: ");
    console.log(response);
    var currentEntity = typeOfAssociation;
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
    if(outputObject==[]){
        outputObject = [{visibleColumn: "Policy Name", entityAttribute: "SureName"}, {visibleColumn: "Display Name", entityAttribute: "DisplayName"},
        {visibleColumn: "Type", entityAttribute: "Type"},
        {visibleColumn: "Sub Type", entityAttribute: "SubType"}];
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
