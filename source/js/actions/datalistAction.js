/**
 *  
 * Action: datalistAction.js
 *
 * @version 1.0
 * @author Sunitha.S
 *
 */

import axios from 'axios';
import React, { Component } from 'react';
import UamHelper from "../helpers/uam/UamHelper";
import style from '../../styles/dataGrid.css';
//Action Creators
//API call
export const traversalAction = (data) => {
    var objRowdata = [];
    var outputObject = [];
    console.log("//setting a global variable to indicate traversal is happening:");
    sessionStorage.setItem("dataGridAction","traversal");
    sessionStorage.setItem("dataGridActionTraversalPayload",JSON.stringify(data.payload));
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

            if (data.columnResponse && data.columnResponse.length > 0 && data.payload.response.entity[0] == data.payload.response.responseFilter[0].for) {
                columnDataFormat(dispatch, data.columnResponse, data, 'GET_COLUMN_TRAVERSAL_DATA_SUCCESS');
            }
            else {
                columnDataFormat(dispatch, columnTraversalResponse, data, 'GET_COLUMN_TRAVERSAL_DATA_SUCCESS');
            }

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
                }
                else {
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

export const unmountGridData = () => {
    return function (dispatch) {
        dispatch(
            {
                type: 'RESET'
            });
    }
}

export const gridViewData = (data) => {
    var reqHeaders = UamHelper.headerWithoutTransform(data);

    return function (dispatch) {
        if (data.selectedEntity != "users") {
            RowDataAxios(data, reqHeaders, dispatch);
        } else {
            userDispatch(data, dispatch);
        }
        ColumnDataAxios(data, dispatch);
    }


    //  RowDataAxios(data);

    /* 
     function RowDataAxios(data){
         return function (dispatch) {
              return axios({
                 method: data.method,
                 url: data.rowurl,
                 headers: reqHeaders
             }).then(function (rowResponse) {
                  rowDataformat(rowResponse);
              });
         }    
         
         
           function rowDataformat(response) {
                 var dataRow = response.data.entities ? response.data.entities :response.data.element;
                 var objRowdata = [];
 
                 var iconUrl = "";
                 var rowDetail = "";
                 var editRow = "";
                 var traversalEntity = "";
                 if(dataRow)
                     {
                 dataRow.map(function (value, key) {
                     var item = value["properties"];
                     this.push(item);
                 }, objRowdata);
             }
             else{
                 objRowdata=[];
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
                  }*/

    // ColumnDataAxios(data);

    /* function ColumnDataAxios(data){
         return function (dispatch) {
              return axios({
                 method: "GET",
                 url: data.columnurl,
                 headers: data.requestHeaders
             }).then(function (columnResponse) {
                 if(data.columnResponse && data.columnResponse.length>0)
                 {
                     columnDataFormat(dispatch, data.columnResponse, data, "GET_COLUMN_DATA_SUCCESS");
                 }
                 else{
                     columnDataFormat(dispatch, columnResponse, data, "GET_COLUMN_DATA_SUCCESS");
                 }
              });
         }    
                  }*/

    /*  return function (dispatch) {
          
  
          return axios.all([
              axios({
                  method: data.method,
                  url: data.rowurl,
                  headers: reqHeaders
              }),
              axios({
                  method: "GET",
                  url: data.columnurl,
                  headers: data.requestHeaders
              })
  
  
          ]).then(axios.spread(function (rowResponse, columnResponse) {
  
              rowDataformat(rowResponse);
              if(data.columnResponse && data.columnResponse.length>0)
                  {
                      columnDataFormat(dispatch, data.columnResponse, data, "GET_COLUMN_DATA_SUCCESS");
                  }
                  else{
                      columnDataFormat(dispatch, columnResponse, data, "GET_COLUMN_DATA_SUCCESS");
                  }
      
  
             
  
              function rowDataformat(response) {
                  var dataRow = response.data.entities ? response.data.entities :response.data.element;
                  var objRowdata = [];
  
                  var iconUrl = "";
                  var rowDetail = "";
                  var editRow = "";
                  var traversalEntity = "";
                  if(dataRow)
                      {
                  dataRow.map(function (value, key) {
                      var item = value["properties"];
                      this.push(item);
                  }, objRowdata);
              }
              else{
                  objRowdata=[];
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
  
  
          }));
  
      }*/

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
        url: data.columnUrl,
        headers: data.requestHeaders
    }).then(function (columnResponse) {
        if (data.columnResponse && data.columnResponse.length > 0) {
            columnDataFormat(dispatch, data.columnResponse, data, "GET_COLUMN_DATA_SUCCESS");
        }
        else {
            columnDataFormat(dispatch, columnResponse, data, "GET_COLUMN_DATA_SUCCESS");
        }
    }).catch(function (error) {
        console.log(error);
    });
    //   }    
}

function RowDataAxios(data, reqHeaders, dispatch) {
    console.log("//setting a global variable in rowdataaxios to indicate get is happening:");
    sessionStorage.setItem("dataGridAction","get");
 
    var changeHeaders = reqHeaders;
    if (data.selectedEntity == 'usergroups') {
        changeHeaders['TransformationEnabled'] = false;
    }
    else {
        changeHeaders['TransformationEnabled'] = true;

    }
    var url='';
if(data.rowurl.indexOf('?')!=-1){
    url=data.rowurl+"&limit=100&page=1"
}
else{
    url=data.rowurl+"?limit=100&page=1"
}
    // return function (dispatch) {
    return axios({
        method: data.method,
        url: url,
        headers: changeHeaders
    }).then(function (rowResponse) {
        if (data.selectedEntity == 'usergroups') {
            responseParseFn(rowResponse);
        }
        else if(data.selectedEntity == 'customhook'){
            rowDataforCustomhook(rowResponse);
        }
        else {
            rowDataformat(rowResponse);
        }
    }).catch(function (error) {
        console.log(error);
    });
    //  }    
    /* Parsing data for rest response against each entity before appending into data grid,
         To add another data parse, need to add one else if condition
        */
    function responseParseFn(response) {
        var dataRow = response.data.entities ? response.data.entities : response.data.element;
        var objRowdata = [];

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
                }
                else {
                    item["Profile"] = x;
                }

                this.push(item);

            }, objRowdata);
        }
        else {
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
    function rowDataforCustomhook(response) {
        var dataRow = response.data.entities ? response.data.entities : response.data.element;
        var objRowdata = [];

        var iconUrl = "";
        var rowDetail = "";
        var editRow = "";
        var traversalEntity = "";
        if (dataRow) {
            dataRow.map(function (value, key) {
                var item = value["properties"];
                if(item.GlobalCustomHook && item.GlobalCustomHook=="yes"){
                    this.push(item);
                }               
            }, objRowdata);
        }
        else {
            objRowdata = [];
        }
        dispatch({
            type: 'GET_GRID_DATA_SUCCESS',
            payload: {
                objRowdata: objRowdata,
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
        }
        else {
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
export const gridSearchData = (data) => {
    console.log("//setting a global variable to indicate search is happening:");
    sessionStorage.setItem("dataGridAction","search");
    //it could be coming from history too, which is only a traversal.
    if(data.searchPayload.response && data.searchPayload.response.entity && data.searchPayload.response.entity[0] && data.historyFlag && data.historyFlag=='historyPost'){
        sessionStorage.setItem("dataGridAction","traversal");
        sessionStorage.setItem("dataGridActionTraversalPayload",JSON.stringify(data.searchPayload));
    }
    return function (dispatch) {


        return axios.all([
            axios({
                method: 'POST',
                url: data.searchUrl,
                headers: data.requestHeaders,
                data: data.searchPayload
            }),
            axios({
                method: 'GET',
                url: data.columnUrl,
                headers: data.requestHeaders
            })


        ]).then(axios.spread(function (rowResponse, columnResponse) {

            if (data.selectedEntity == 'usergroups') {
                responseParseFn(rowResponse);
            }
            else {
                rowDataformat(rowResponse);
            }
            ColumnDataAxios(data, dispatch);
            // columnDataFormat(dispatch, columnResponse, data, "GET_SEARCH_COLUMN_SUCCESS");

            function rowDataformat(response) {
                var dataRow = response.data.entities;
                var objRowdata = [];

                var iconUrl = "";
                var rowDetail = "";
                var editRow = "";
                var traversalEntity = "";
                if (dataRow) {
                    dataRow.map(function (value, key) {
                        var item = value["properties"];
                        this.push(item);
                    }, objRowdata);
                }
                else {
                    objRowdata = [];
                }


                dispatch({
                    type: 'GET_SEARCH_SUCCESS',
                    payload: {
                        objRowdata: objRowdata,
                        //iconUrl: data.imageIconurl,
                        //rowDetail: data.passRowData,
                        //editRow: data.editRow,
                        //deleteRow: data.deleteRow,
                        traversalEntity: data.traversalEntity,
                        selectedEntity: data.selectedEntity

                    }

                });

            }


        }));

    }

}


function columnDataFormat(dispatch, response, data, actionType) {
    var currentEntity = data.selectedEntity;
    var outputObject = [];
    if (response.data != undefined) {
    if(response.data.entityAttributes[currentEntity]){
        var columnDataNew = response.data.entityAttributes[currentEntity].defaultAttribute;
        var columnAvailData = response.data.entityAttributes[currentEntity].specificAttribute;
    }
    else{
        var columnDataNew = [{visibleColumn: "Customer Name", entityAttribute: "SureName"}, {visibleColumn: "Display Name", entityAttribute: "DisplayName"},
        {visibleColumn: "Type", entityAttribute: "Type"},
        {visibleColumn: "Sub Type", entityAttribute: "SubType"}];
        var columnAvailData = [{visibleColumn: "Customer Name", entityAttribute: "SureName"}, {visibleColumn: "Display Name", entityAttribute: "DisplayName"},
        {visibleColumn: "Type", entityAttribute: "Type"},
        {visibleColumn: "Sub Type", entityAttribute: "SubType"}];

    }    
        
    }
    else {
        var columnUpdate = response;
        if (columnUpdate) {
            columnUpdate.map(function (value, key) {
                var item = {};
                if (value["entityAttribute"]) {

                    if (value['visibleColumn']) {
                        item['displayName'] = value['visibleColumn'];
                        item['hide'] = false;
                        outputObject.push(item);
                    }
                    else if (value['availableColumn']) {
                        item['displayName'] = value['availableColumn'];
                        item['hide'] = true;
                        outputObject.push(item);
                    }
                    else {
                        var oldColumnArray = [];
                        value.map(function (val, key) {
                            var item_old = {}
                            item_old['displayName'] = val;
                            item_old['hide'] = false;
                            outputObject.push(item_old);
                        })

                    }

                }
                else {
                    var newColumnArray = [];
                    value.map(function (val, key) {
                        var item_new = {};
                        item_new['displayName'] = val['displayName'];
                        item_new['hide'] = val['hide'];
                        item_new['field'] = val['field'];

                        if (val.field.indexOf("STATE_") != -1) {
                            Object.assign(item_new, {
                                width: 130,
                                cellRendererFramework: CustomCellRenderer.bind(data),
                                pinned: "right"
                            });
                        }

                        if (val.field === "URL" || val.field === "CustomHookURL") {
                            Object.assign(item_new, {
                                cellRendererFramework: CustomLinkCellRenderer.bind(data)
                            });
                        }
                        if (val.field === "URL" ){
                            Object.assign(item_new, {
                              sortable:false
                            });
                        }

                        outputObject.push(item_new);
                    });
                }
            });
        }
    }
    // var  columnDataNew =  columnDataNew1 + columnDataNew;
    if (columnDataNew) {
        columnDataNew.map(function (value, key) {
            var item = {};

            item['field'] = value["entityAttribute"];
            item['displayName'] = value["visibleColumn"];
            item['hide'] = false;

            if (value["entityAttribute"].toLowerCase().indexOf("state_aoralarmstate") != -1) {
                item['cellClass'] = function (params) {
                    return params.value === 'Active' ? '' : 'locked-status';
                }
            }

            //Added by Gowtham.S for Status icon
            if (value["entityAttribute"].indexOf("STATE_") != -1) {
                Object.assign(item, {
                    width: 130,
                    cellRendererFramework: CustomCellRenderer.bind(data),
                    pinned: "right"
                });
            }

            if (value["entityAttribute"] === "URL" || value["entityAttribute"] === "CustomHookURL") {
                Object.assign(item, {
                    cellRendererFramework: CustomLinkCellRenderer.bind(data)
                });
            }
            if (value["entityAttribute"] === "URL"){
                Object.assign(item, {
                  sortable:false
                });
            }
            if (data.nameIcon && (((value["entityAttribute"].toLowerCase()).indexOf("surename") == 0) || ((value["entityAttribute"].toLowerCase()).indexOf("username") == 0))) {
                Object.assign(item, {
                    cellRendererFramework: tenantNameIcon.bind(data),
                    pinned: "left"
                });
            }
            this.push(item);

        }, outputObject);
    }
    if (columnAvailData) {
        columnAvailData.map(function (value, key) {
            var item = {};

            item['field'] = value["entityAttribute"];
            item['displayName'] = value["availableColumn"];
            item['hide'] = true;

            //Added by Gowtham.S for Status icon
            if (value["entityAttribute"].indexOf("STATE_") != -1) {
                Object.assign(item, {
                    width: 130,
                    cellRendererFramework: CustomCellRenderer.bind(data),
                    pinned: "right"
                });
            }

            if (value["entityAttribute"] === "URL" || value["entityAttribute"] === "CustomHookURL") {
                Object.assign(item, {
                    cellRendererFramework: CustomLinkCellRenderer.bind(data)
                });
            }

            if (value["entityAttribute"] === "URL"){
                Object.assign(item, {
                  sortable:false
                });
            }

            if (data.nameIcon && (((value["entityAttribute"].toLowerCase()).indexOf("surename") == 0) || ((value["entityAttribute"].toLowerCase()).indexOf("username") == 0))) {
                Object.assign(item, {
                    cellRendererFramework: tenantNameIcon.bind(data),
                    pinned: "left"
                });
            }
            this.push(item);

        }, outputObject);
    }

    dispatch(
        {
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
        }
        else if (params.colDef.field.toUpperCase() == "USERNAME" && params.data) {
            let firstChar = params.data.Firstname ? params.data.Firstname.charAt(0) : valueObj.charAt(0);
            let lastChar = params.data.Lastname ? params.data.Lastname.charAt(0) : (valueObj.length > 1 ? valueObj.charAt(1) : '');
            text = firstChar + lastChar;
            rectangle = false;
        }
        text = text.toUpperCase();
        return (
            <div style={{ width: "8px", height: "40px" }}>
                <img id="tenantIconImgId" style={{ width: "37px", height: "37px", marginLeft: "0px", verticalAlign: "middle" }} src={"data:image/svg+xml;charset=utf-8," + encodeURIComponent(rectangle ? drawRect(color, text) : drawCircle(color, text))}></img> {params.value}
            </div>
        )
    }
    return null;
}

//Added By Gowtham.S for status icon
function CustomCellRenderer(params) {
    if ("state_aoralarmstate" === params.colDef.field.toLowerCase()) {
        let stateConfig = this.stateConfig
        let color = "#acacac",
            badge = "";
        if (params && params.value && Array.isArray(stateConfig)) {
            let stateType = params.colDef.field.replace("STATE_", "")
            let filteredObj = stateConfig.filter((x) => { return x.stateType == stateType })

            if (Array.isArray(filteredObj) && filteredObj.length > 0) {
                var stateInfo = filteredObj[0].properties.filter((x) => { return x.state.toLowerCase() == params.value.toLowerCase() })
                color = Array.isArray(stateInfo) && stateInfo[0] && stateInfo[0].color ? stateInfo[0].color : color;
                badge = Array.isArray(stateInfo) && stateInfo[0] && stateInfo[0].badgeText ? stateInfo[0].badgeText : badge
                var imageSrc = (this.externalIconURL && this.externalIconURL != "") ? (this.externalIconURL + "ic_" + params.value.toLowerCase() + "_kpi.svg") : this.imageIconurl + require("../../images/dataGrid/ic_" + params.value.toLowerCase() + "_kpi.svg");
            }
        }

        if (!Array.isArray(stateConfig) || stateConfig.length == 0) {
            return <div style={{ marginLeft: "20px" }}>{params && params.value ? params.value : ""}</div>
        }

        return (
            <div style={{ width: "8px", height: "40px", backgroundColor: color }}>
                <img style={{ width: "37px", height: "37px", marginLeft: "28px" }} src={imageSrc ? imageSrc : "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG(color, badge))}></img>
            </div>
        )
    }
    return params.value || "";
}

function CustomLinkCellRenderer(params) {
    var tenantID = getQueryStringValue("tenantId");    
    let link= params.value ? params.value.trim():'';
    if(params.colDef.field == "CustomHookURL"){
       link= link !='' && link+"?tenantId="+tenantID;
    }
     
    if (link !== '')
        return <a href={link}  title={link} target="_blank" className='ex_link_w'>{/* External link  */}</a>
    else
        return <span>{/* NO LINK  */}</span>
}
function drawSVG(color, badge) {
    var svg = '<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="mapviewsettingssvg" viewBox="0 0 6 6" width="6" height="6">\
             <circle cx="3" cy="3" r="2.5" fill="'+ color + '"/><text x="3" y="3.25" text-anchor="middle" font-family="Arial" style="font-weight: bold; font-size:20%"  fill="#f9fbfd" dy=".3em">' + badge + '</text>\
            </svg>';
    return svg
}
function drawRect(color, text) {
    var svg = '<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="tenantIcon" viewBox="0 0 6 6" width="6" height="6">\
             <rect  x=".75" y=".75"  height="4.5" width="5" fill="'+ color + '"/><text x="3" y="3" text-anchor="middle" font-family="Arial" style="font-weight: bold; font-size:20%"  fill="#f9fbfd" dy=".3em">' + text + '</text>\
            </svg>';
    return svg
}
function drawCircle(color, badge) {
    var svg = '<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="mapviewsettingssvg" viewBox="0 0 6 6" width="6" height="6">\
             <circle cx="3" cy="3" r="2.5" fill="'+ color + '"/><text x="3" y="3.25" text-anchor="middle" font-family="Arial" style="font-weight: normal; font-size:17%"  fill="#f9fbfd" dy=".3em">' + badge + '</text>\
            </svg>';
    return svg
}