import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { AlertDialogInfo } from '@nokia-csf-uxr/csfWidgets';
import { Snackbar } from '@nokia-csf-uxr/csfWidgets';
import { ToastContainer, toast } from 'react-toastify';
import {getgeoMapformattedData, drawMap} from '../helpers/geoMap/geoMapHelper.js';

export const getGeoMapViewData = (data,mapLevel,props) => {
    var self = this ? this : {};
    if (data.requestHeaders["Response-Type"] || data.requestHeaders["response-type"]) {
        delete data.requestHeaders["Response-Type"];
        delete data.requestHeaders["response-type"];
    }
    var geoUnmountcall= data.geoDataUnmount;
    var p2p;
    var props = data.props;
    data.requestHeaders["Response-Type"] = "flat"
    data.requestHeaders["TransformationEnabled"] = true;
 var props1 = data.props1;
   var mapLevel = mapLevel;
    self.GeoMapData = (data,alarmData) => {
        var geoData = {};
        var data = getgeoMapformattedData(data);
         if (data && data.length > 0) {
                 var mapGeoObj  = drawMap(data,mapLevel==0?true:false,p2p,mapLevel,alarmData,props,props1);
                }
                else {
                     ReactDOM.unmountComponentAtNode(document.getElementById("geoMapView"));
                   self.renderInfoDialog('Location not Known','','Location coordinates are not known.');
                }
         if(mapGeoObj){
           geoData.mapObj= mapGeoObj;
        }
        geoData.response = data;
        return geoData;
      
    }
    
    self.renderInfoDialog = function(title, successParameter, detailedMsg) {
        var aboutOptions = {
            title: title,
            message: 'Status: '+successParameter+' '+detailedMsg,
            buttonText: 'OK',
            onClose: function () {
               
                ReactDOM.unmountComponentAtNode(document.getElementById("infoDialog"));
                 geoUnmountcall(true);
                
            }
        };

            var component = React.createElement(csfWidgets.components.AlertDialogInfo, aboutOptions);

            ReactDOM.render(component, document.getElementById("infoDialog"));
        }
    
     self.parseStateProperties =(responseObject, state) => {
        return responseObject.element.filter(function (x) {
            if (state) {
                return x["specName"] == state
            } else
                return true
        }).map(function (state) {
            var result = {
                stateType: state.specName,
                properties: []
            }
            if (state.specificationFeature && state.specificationFeature.length > 0) {
                result.properties = state.specificationFeature.map(function (item) {
                    var result = {
                        state: item.value
                    };
                    if (item.property && item.property.length > 0)
                        return item.property.reduce(function (accumulator, current) {
                            accumulator[current.name] = current.value;
                            return accumulator
                        }, result);
                    else
                        return result;

                })
            }
            return result
        })
    }
   
     return function(dispatch){
        
       
        return axios.all ([
            axios ({
                method: data.methodGeo,
                url: data.topourl,
                headers: data.requestHeaders,
                data: data.payload
            }),
            axios ({
                method: data.methodAlarms,
                url: data.Alarmurl,
                headers: data.AalrmrequestHeaders
            })
            

        ]).then(axios.spread(function(topoData,alarmData){
            
        var alarmresponse = alarmData;
         var toporesponse =  topoData;
             var alarmData = alarmStatus(alarmresponse);
            let result = self.GeoMapData(toporesponse.data,alarmData);
             dispatch({ 
                type: "GET_GEOMAP_DATA", 
                payload: result
            });
            dispatch({
            type: "GET_ALARMSTATUS_DATA",
            payload: alarmData
        });
            function alarmStatus(response){
                var status =self.parseStateProperties(response.data);
                return status;
                
            }
                        
                    
        }))
         .catch((error) => {
            console.log('Error', error.message);
            console.log(error.config);
        });
       
    }
    

   
}

export const MarkerClick = (data) => {
    return function (dispatch) {
        dispatch({
                    type: "SET_MARKER_CLICK_DETAILS",
                    payload: data
                });
    }
}

export const getGeoMapLayerViewData = (data,mapLevel) => {
    var self = this ? this : {};
    if (data.requestHeaders["Response-Type"] || data.requestHeaders["response-type"]) {
        delete data.requestHeaders["Response-Type"];
        delete data.requestHeaders["response-type"]
    }
var props =data.props;
    var props1 = data.props1;
   var p2p;
    data.requestHeaders["Response-Type"] = "flat"
    data.requestHeaders["TransformationEnabled"] = true;
 var geoLayerData= {};
   var mapLevel = mapLevel;
    self.GeoMapData = (data,GeoMapData) => {
        var data = getgeoMapformattedData(data);
         if (data && data.length > 0) {
                    var mapGeoObj = drawMap(data,mapLevel==0?true:false,p2p,mapLevel,undefined,props);
                }
                else {
                    self.notify("no layers to expand");
                }
        if(mapGeoObj){
           geoLayerData.mapObj= mapGeoObj;
        }
        geoLayerData.response = data;
        return geoLayerData;
    }
    self.notify=function(msg) {
        toast(msg, {
            className: 'darker-toast',
            progressClassName: 'transparent-progress'
        });
    }
   
      return function (dispatch) {
        return axios({
            method: data.methodGeo,
                url: data.topourl,
                headers: data.requestHeaders,
                data: data.payload
        }).then(function (response) {
            let result = self.GeoMapData(response.data)
            dispatch({ 
                type: "GET_GEOMAP_DATA", 
                payload: geoLayerData
            });
        })
        .catch((error) => {
            console.log('Error', error.message);
            console.log(error.config);
        });
    }
    

   
}

export const updateStatusPanel = (data) => {
    //Processing
    let stateToDisplay = {};
    data.status.forEach(function (status) {
        let filteredobj = status.items.filter(function (item) {
            return item.text == status.value
        })[0];
        if (filteredobj.text)
            stateToDisplay[filteredobj.text] = filteredobj.values.filter(function (value) {
                return value.enabled
            }).map(function (value) {
                let statusName = value.text.toUpperCase()
                let result = { text: statusName, color: value.color }
                if(value.badge)
                    result.badge = value.badge
                return result
            })
    })
    return function (dispatch) {
        dispatch({
            type: "UPDATE_STATUS_PANEL",
            payload: data
        });

        dispatch({
            type: "SET_STATE_TO_DISPLAY",
            payload: stateToDisplay
        });
    }

}


export const updateGeoMarkers = (data) => {
    return function (dispatch) {
        dispatch({
            type: "UPDATE_GEO_MARKERS",
            payload : data
        });
    }

}

export const resetGeoStore = () => {
    return function (dispatch) {
        dispatch({
            type: "RESET_GEO_STORE"
        });
    }

}


