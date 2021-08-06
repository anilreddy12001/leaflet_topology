/**
 *  
 * Container: toplogyMapContainer.js
 *
 * @version 18.10
 * @author Gowtham.S
 *
 */

 'use strict';

 import React from 'react';
 import {
     bindActionCreators
 } from 'redux';
 import {
     connect
 } from 'react-redux';
 import {
     _loadExternalComponent,
     getTopologyData,
     getRootPathID,
     updateStatusPanel,
     updateModalInfo,
     getPathName,
     clearPathName,
     resetStore,
     updateTypeID,
     getMultiEntityTopologyData,
     customError
 } from "../actions/topologyMapAction.js"
 import axios from 'axios';
 import {
     Snackbar,
     ProgressIndicatorCircular
 } from '@nokia-csf-uxr/csfWidgets';
 import StatusPanel from '../components/statusPanel.jsx'
 import TopologyModal from "../components/topologyModal.jsx"
 import Map from './mapCore.js';
 import "leaflet-contextmenu"
 import topologyMapHelper from '../helpers/topologyHelper';
 
 //Style
 import '../../styles/topologyMap.css';
 
 //Third party Dependencies
 import L from 'leaflet';
 import 'leaflet.markercluster';
 
 
 /**
  * 
  * @class TopologyMapRoot
  * @extends {Map}
  * @description Container Class
  * @memberof sureUI.components
  */
 
 class TopologyMapRoot extends Map {
     constructor(props) {
         super(props);
         //Component initialization
         this.state = {
             showStatusPanel: false,
         }
         this.topologyMap = {
             layers: [],
             paths: [],
         }
         this.selectedLayers = [];
         this.geoMap = {
             tileLayer: {},
             layers: []
         }
 
         this.tMHelperObj = new topologyMapHelper(props);
         this.handleCustomError = this.handleCustomError.bind(this);
     }
 
     static get defaultProps() {
         return {
             customGUI_combinations: "Label__Type",
             customGUI_iconPath: "/opt/CustomIcons/",
             zoom: 18,
             maxZoom: 20,
             data: [],
             style: {
                 height: window.innerHeight,
                 width: window.innerWidth
             },
             entityClick: function (details) {
                 var payload = {
                     type: "SURE_UI_COMPONENTS_POST_DATA",
                     payload: {
                         componentKey: "TopologyMap",
                         method: "entityClick",
                         properties: details
                     }
                 }
                 if (window.parent)
                     window.parent.postMessage(payload, "*")
             },
             pathClick: function (items) {
                 var payload = {
                     type: "SURE_UI_COMPONENTS_POST_DATA",
                     payload: {
                         componentKey: "TopologyMap",
                         method: "pathClick",
                         properties: items
                     }
                 }
                 if (window.parent)
                     window.parent.postMessage(payload, "*")
             },
             markerClick: function (items) {
                 var payload = {
                     type: "SURE_UI_COMPONENTS_POST_DATA",
                     payload: {
                         componentKey: "TopologyMap",
                         method: "markerClick",
                         properties: items
                     }
                 }
                 if (window.parent)
                     window.parent.postMessage(payload, "*")
             },
             onError: function (items) {
                 var payload = {
                     type: "SURE_UI_COMPONENTS_POST_DATA",
                     payload: {
                         componentKey: "TopologyMap",
                         method: "onError",
                         properties: items
                     }
                 }
                 if (window.parent)
                     window.parent.postMessage(payload, "*")
             },
             stateToDisplay: {}
         }
     }
     handleCustomError(errObject) {
         this.props.customError(errObject);
     }
     markerEvents() {
         const {
             markerClick
         } = this.props;
         var props = this.props;
         return {
             click: (event) => {
                 console.log(event);
                 this.clearSelection({});
                 var path = event.target._icon.querySelector("path")
                 var rect = event.target._icon.querySelector(".customIconClass")
                
                 path.classList.add("selected");
                 if(rect){rect.classList.add("selected");}
                 var entity = topologyMapHelper.directory[event.target.options.id].detail;
                 for (var i = 0; i < props.customHookData.length; i++) {
                     if (props.customHookData[i] && props.customHookData[i].DisplayName) {
                         entity[props.customHookData[i].DisplayName] = {
                             type: 'iframe',
                             URL: props.customHookData[i].CustomHookURL
                         };
                     } else {
                         entity[props.customHookData[i].SureName] = {
                             type: 'iframe',
                             URL: props.customHookData[i].CustomHookURL
                         }
                     }
                 }
                 markerClick(entity);
             },
             hover: (event) => {
 
             },
             enter: (event) => {
                 clearInterval(this.showToolTipTimeout)
                 if (!this.state.modalClicked) {
                     this.showToolTipTimeout = setTimeout(() => {
                         this.openPopOver(event);
                     }, 200);
                 }
                 event.target.bindContextMenu([]);
             },
             leave: (event) => {
                 if (!this.state.modalClicked) {
                     clearInterval(this.showToolTipTimeout)
                     //hide popover
                     this.hideToolTipTimeout = setTimeout(() => {
                         this.clearPopOver();
                     }, 100);
                 }
             },
             contextmenu: (event) => {
                 //To remove existing context menu items from DOM and replace them with new elements received from rest call:
                 document.querySelectorAll(".leaflet-contextmenu-item").forEach(function (item) {
                     item.remove()
                 });
 
                 //removeChild();
                 // this.props.refreshToken(keycloakAuth);
                 // this.props.dataSource.headers.Authorization = "Bearer " + keycloakAuth.token;
 
                 var domain = this.props.dataSource.url.split('/oss')[0];
                 return axios({
                     method: "GET",
                     url: domain + "/oss/sure/items?q=Type;EQUALS;CUSTOM_HOOK&q=SubType;NOT%20EQUAL;COMPONENT",
                     // url: domain + "/oss/sure/customhooks",
                     headers: this.props.dataSource.headers
                 }).then(
                     function (response) {
                         var customHookObject = response.data.element.map(function (item) {
 
 
                             var obj = item.properties ? item.properties : parseCustomHookObject(item)
                             //customHookObject.push(obj);
                             // customHookObject=customhooks;
                             return obj;
                         })
                         // this.props.customHookData=customHookObject;
 
 
                         function parseCustomHookObject(customHookObject) {
 
                             if (customHookObject.Features && customHookObject.Features.Feature) {
                                 customHookObject.Features.Feature.reduce(function (obj, item) {
                                     obj[item.Name] = item.Value;
                                     return obj;
                                 }, customHookObject)
                             }
 
                             return customHookObject
                         }
                         console.log(event);
 
                         var customHookData1 = JSON.parse(JSON.stringify(customHookObject));
                         if (!event.target.options.contextmenuitems || (event.target.options.contextmenuitems && event.target.options.contextmenuitems.length != customHookData1)) {
                             event.target.bindContextMenu(
                                 constructContextMenuForMarkers(
                                     event.target.options.id, event.target.options.type, props, customHookData1
 
                                 ))
 
                         }
 
                         //beginning of custom hook function:
                         function constructContextMenuForMarkers(itemID, type, props, customHookData) {
                             var contextmenuitems = [];
 
                             var entityType = topologyMapHelper.directory[itemID].type;
                             console.log("entitytype:: " + entityType + "itemID:: " + itemID);
                             if (customHookData) {
                                 for (var i = 0; i < customHookData.length; i++) {
                                     customHookData[i].entityType = entityType;
                                     if (customHookData[i].EntitiesKeys && customHookData[i].EntitiesKeys.indexOf(itemID) != -1 && customHookData[i].EntityType == entityType) {
                                         if (customHookData[i].DisplayName) {
                                             contextmenuitems.push({
                                                 text: customHookData[i].DisplayName,
                                                 callback: showCustomHook.bind(event, customHookData[i])
                                             });
                                         } else {
                                             contextmenuitems.push({
                                                 text: customHookData[i].SureName,
                                                 callback: showCustomHook.bind(event, customHookData[i])
                                             });
                                         }
                                     } else if (!customHookData[i].EntitiesKeys && (entityType == customHookData[i].EntityType)) {
                                         if (customHookData[i].DisplayName) {
                                             contextmenuitems.push({
                                                 text: customHookData[i].DisplayName,
                                                 callback: showCustomHook.bind(event, customHookData[i])
                                             });
                                         } else {
                                             contextmenuitems.push({
                                                 text: customHookData[i].SureName,
                                                 callback: showCustomHook.bind(event, customHookData[i])
                                             });
                                         }
 
 
                                     }
                                 }
                             }
                             console.log("constructContextMenuForMarkers for geomap/p2p..");
                             /*  var promise = showCustomHookLabels();
                
             promise.then(function(result) { 
         return ({
                 contextmenu: true,
                 contextmenuItems: result
             });
     });*/
                             return ({
                                 contextmenu: true,
                                 contextmenuItems: contextmenuitems
                             });
                             /*return {
                                    contextmenu: true,
                                    contextmenuItems: contextmenuItems
                                }*/
 
 
                             //show custom hooks:
                             function showCustomHook(e, params) {
                                 //for geomap/p2pmap
                                 //e.relatedTarget.options.contextmenuItems[0].customHookUR
                                 //console.log(props.customHookData.CustomHook_URL); 
                                 //var urlWithSort=props.dataSource.domain+'/oss/sure/items?q=Type;EQUALS;CUSTOM_HOOK&q=EntityType;EQUALS;'+props.dataSource.payload[0].request.origin["@class"]+'&q=SubType;EQUALS;COMPONENT';
                                 // this.props.refreshToken(keycloakAuth);
                                 // this.props.dataSource.headers.Authorization = "Bearer " + keycloakAuth.token;
                                 if (!props.dataSource.domain) {
                                     props.dataSource.domain = props.dataSource.url.split('/oss')[0];
 
                                 }
                                 var selectedEntityUUID = params.relatedTarget.options.id;
                                 var entityType = e.entityType;
                                 // var urlForCustomHooks=props.dataSource.domain+'/oss/sure/items?q=Type;EQUALS;CUSTOM_HOOK&q=EntityType;EQUALS;Equipment&q=SubType;EQUALS;COMPONENT';
                                 var urlForCustomHooks = props.dataSource.domain + '/oss/sure/graphSearch?limit=100&page=1';
                                 var payloadForCustomHook = {
                                     "request": {},
                                     "response": {
                                         "responseType": "List",
                                         "entity": ["FCP", "Endpoint"],
                                         "selfJoin": "true",
                                         "responseFilter": [{
                                             "for": "Equipment",
                                             "filter": ["UUID;NOT EQUAL;47ffef93-779f-476d-a229-6473cc89f842"]
                                         }]
                                     },
                                     "expand": ["Capacity", "State"],
                                     "searchFilter": [{
                                         "for": "Equipment",
                                         "filter": ["UUID;EQUALS;47ffef93-779f-476d-a229-6473cc89f842"]
                                     }]
                                 };
 
                                 payloadForCustomHook.response.responseFilter[0].for = entityType;
                                 payloadForCustomHook.response.responseFilter[0].filter[0] = "UUID;NOT EQUAL;" + selectedEntityUUID;
                                 payloadForCustomHook.searchFilter[0].for = entityType;
                                 payloadForCustomHook.searchFilter[0].filter[0] = "UUID;EQUALS;" + selectedEntityUUID;
 
                                 //https://135.250.139.91:28443/oss/sure/graphSearch?limit=100&page=1
                                 //get data to be fed to customhook:
                                 return axios({
                                     method: "POST",
                                     url: urlForCustomHooks,
                                     headers: props.dataSource.headers,
                                     data: payloadForCustomHook
                                 }).then(
                                     (function (response) {
                                         var lastRow = -1;
                                         var dataRow = response.data.element;
                                         var objRowdataNew = [];
 
                                         if (dataRow) {
                                             dataRow.map(function (value, key) {
                                                 var item = value;
 
 
                                                 if (value.Associations && value.Associations.Association[0] && value.Associations.Association[0].Type == 'HAS_STATE') {
                                                     if (value.Associations.Association[0].Target.Features.Feature.length > 0) {
 
                                                         for (var i = 0; i < value.Associations.Association[0].Target.Features.Feature.length; i++) {
 
                                                             //var stateItem={};
                                                             item[value.Associations.Association[0].Target.Features.Feature[i].Name] = value.Associations.Association[0].Target.Features.Feature[i].Value;
                                                             // this.push(stateItem); 
                                                         }
 
                                                     }
 
 
                                                 } else if (value.Features && value.Features.Feature) {
 
                                                     if (value.Features.Feature.length > 0) {
 
                                                         for (var i = 0; i < value.Features.Feature.length; i++) {
 
                                                             //var stateItem={};
                                                             item[value.Features.Feature[i].Name] = value.Features.Feature[i].Value;
                                                             // this.push(stateItem); 
                                                         }
 
                                                     }
 
 
 
 
 
                                                 }
                                                 this.push(item);
                                             }, objRowdataNew);
 
 
                                         } else {
                                             objRowdataNew = [];
                                         }
 
 
                                         if (objRowdataNew.length < 100) {
                                             lastRow = params.startRow + objRowdataNew.length;
                                         }
 
                                         //params.successCallback(objRowdataNew, lastRow);
                                         //reloadCount && gridData.dataCount(params.startRow + objRowdata.length);
                                         /* if (objRowdata.length < 100) {
                                            lastRow = params.startRow + objRowdata.length;
                                          }
                                          params.successCallback(objRowdata, lastRow);*/
                                         //
                                         //to show in a new window:
 
 
                                         if (e.DisplayAs.toLowerCase() == 'window') {
                                             //window.open(props.customHookData.CustomHook_URL+'/?UUID='+e.relatedTarget.options.UUID);
 
 
                                             var strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
                                             var contentWindow = window.open(e.CustomHookURL); //+ "?launchedBy=SURE"
                                             /*var self = this;
                                             var dataToPost = {
                                                 type: "ACCESS_CUSTOM_HOOK",
                                                 payload: {
                                                     userName: this.userName,
                                                     product: this.DisplayName.replace("CH:",""),
                                                     dataSource: this.dataSource,
                                                     data: rowData
                                                 }
                                             };*/
 
 
                                             //async function to provied delay for postmessage
                                             /*setTimeout(function() {
                                                     contentWindow.postMessage(dataToPost,self.CustomHookURL)
                                                 }, 10); */
 
                                         } else if (e.DisplayAs.toLowerCase() == 'popup') {
                                             var rowData, columnData = [];
                                             console.log('for custom hook for markers: ' + e.CustomHookURL);
                                             var columnData = [{
                                                 field: 'AdministrativeState',
                                                 displayName: 'AdministrativeState'
                                             }, {
                                                 field: 'OperationalState',
                                                 displayName: 'OperationalState'
                                             }, {
                                                 field: 'DisplayName',
                                                 displayName: 'Display Name'
                                             }, {
                                                 field: 'SureName',
                                                 displayName: 'Name'
                                             }, {
                                                 field: '@class',
                                                 displayName: 'Type'
                                             }];
                                             if (!rowData || rowData == '') {
 
                                                 /* var rowData=[{test: 'test1',test1: 'test1'}, {test: 'test1',test1: 'test1'},{test: 'test1',test1: 'test1'}];
                                                  columnData=[{field: 'test',displayName: 'test'},{field: 'test1',displayName: 'test1'}];
                                                  var DisplayName='test user1';*/
                                             }
                                             var iframeData = {
                                                 rowData: objRowdataNew,
                                                 columnData: columnData
                                             };
                                             var modalWindow = SUREUI.components.ModalWindow;
                                             if (e.titleBgColor) {
                                                 var titleBgColor = e.titleBgColor;
                                             } else {
                                                 var titleBgColor = '#3f51b5';
                                             } //Setting default bg color for custom hook's header.
                                             var prop = {
                                                 customHookObject: e,
                                                 height: 1000,
                                                 width: 1000,
                                                 headerColor: titleBgColor,
                                                 id: "modalWindowContainer",
                                                 header: true,
                                                 title: e.DisplayName,
                                                 iconBaseURL: "SURE_UI_Components/",
                                                 iframeSource: e.CustomHookURL,
                                                 iframeDataSource: props.dataSource,
                                                 userName: e.CreatedBy,
                                                 data: iframeData,
                                                 rowData: objRowdataNew,
                                                 columnData: columnData,
                                                 onClose: function () {
                                                     ReactDOM.unmountComponentAtNode(document.getElementById("modalWindow"));
                                                 }
                                             }
 
                                             var modalWindowComponent = React.createElement(modalWindow, prop);
                                             ReactDOM.render(modalWindowComponent, document.getElementById("modalWindow"));
 
                                         }
                                         //axios to get fcp/endpoints of selected entity:
 
 
                                     })
 
                                 );
 
 
                             }
 
 
                         }
 
                         //End of customhook function
 
                     })
 
 
             }
         }
     }
 
     pathEvents() {
         var self = this;
         const {
             pathClick
         } = this.props;
         var props = this.props;
         return {
             click: (event) => {
 
                 const {
                     getPathName
                 } = this.props
 
                 let tempOptions = event.target.options;
                 topologyMapHelper.directory.selectedPathID = event.target.options.id;
                 if (this.selectedLayers && this.selectedLayers.length > 0)
                     this.clearSelection();
 
                 //Highlight Path only if opacity is 1
                 if (tempOptions.opacity == 1) {
                     var selectedLayer = new L.Polyline(event.target.getLatLngs(), {
                         weight: tempOptions.weight + 2,
                         color: "#42A5F6",
                         id: tempOptions.id
                     });
                     selectedLayer.addTo(this.map);
                     selectedLayer.bringToBack();
 
                     this.selectedLayers.push(selectedLayer);
                 }
 
                 //if pathBundle is clicked keep popover open else clear popover
                 var entity = topologyMapHelper.directory[event.target.options.id];
 
                 if (entity.siblings && entity.siblings.length > 0) {
                     this.openPopOver(event);
                     this.setState({
                         modalClicked: true
                     })
                 } else
                     this.clearPopOver();
 
                 if (!entity.selectedPathID){
                     topologyMapHelper.directory[entity.id].selectedPathID = event.target.options.id;
                 }
 
 
                 if (tempOptions.pathWithSibling && tempOptions.pathWithSibling.length > 0) {
                     pathClick({})
                 }
                 else {
                     pathClick(entity.detail);
                     getPathName(entity.name);
                 }
 
 
                 for (var i = 0; i < props.customHookData.length; i++) {
                     if (props.customHookData[i] && props.customHookData[i].DisplayName) {
 
                         entity.detail[props.customHookData[i].DisplayName] = {
                             type: 'iframe',
                             URL: props.customHookData[i].CustomHookURL
                         };
                     } else {
                         entity.detail[props.customHookData[i].SureName] = {
                             type: 'iframe',
                             URL: props.customHookData[i].CustomHookURL
                         }
                     }
 
 
                 }
                 L.DomEvent.stopPropagation(event);
             },
 
             enter: (event) => {
 
                 if (event.target.options.opacity == 1 || event.target.options.type == "gPath") {
 
                     if (event.target.options.type == "path" || event.target.options.type == "gPath") {
                         this.selectedPathOnHover = event;
 
 
                     }
 
                     event.target.setStyle({
                         weight: event.target.options.weight + 1
                     });
 
                     if (!this.state.modalClicked) {
                         this.showToolTipTimeout = setTimeout(() => {
                             this.openPopOver(event);
                         }, 200);
                     }
                 }
 
                 L.DomEvent.stopPropagation(event);
 
             },
 
             leave: (event) => {
 
                 if (event.target.options.opacity == 1 || event.target.options.type == "gPath") {
                     event.target.setStyle({
                         weight: event.target.options.weight - 1
                     });
                 }
 
                 clearInterval(this.showToolTipTimeout);
 
                 //hide popover
                 if (!this.state.modalClicked)
                     this.hideToolTipTimeout = setTimeout(() => {
                         this.clearPopOver();
                     }, 100);
 
 
             },
             contextmenu: (event) => {
                 document.querySelectorAll(".leaflet-contextmenu-item").forEach(function (item) {
                     item.remove()
                 });
                 var domain = this.props.dataSource.url.split('/oss')[0];
                 let _self = this;
                 return axios({
                     method: "GET",
                     url: domain + "/oss/sure/items?q=Type;EQUALS;CUSTOM_HOOK&q=SubType;NOT%20EQUAL;COMPONENT",
                     headers: this.props.dataSource.headers
                 }).then(
                     function (response) {
                         var customHookObject = response.data.element.map(function (item) {
                             var obj = item.properties ? item.properties : parseCustomHookObject(item)
                             return obj;
                         })
 
                         function parseCustomHookObject(customHookObject) {
                             if (customHookObject.Features && customHookObject.Features.Feature) {
                                 customHookObject.Features.Feature.reduce(function (obj, item) {
                                     obj[item.Name] = item.Value;
                                     return obj;
                                 }, customHookObject)
                             }
 
                             return customHookObject
                         }
                         console.log(event);
 
                         var customHookData2 = JSON.parse(JSON.stringify(customHookObject));
 
                         event.target.bindContextMenu(
                             _self.constructContextMenu(
                                 _self.topologyMap,
                                 topologyMapHelper.maxLayer,
                                 topologyMapHelper.directory,
                                 event.target.options.id,
                                 _self.expandPath.bind(_self),
                                 _self.collapsePath.bind(_self),
                                 props,
                                 customHookData2
                             )
                         )
                         _self.clearPopOver({})
 
 
 
 
                     })
 
 
 
 
             }
         }
 
     }
 
     toolTipEvents() {
         var self = this;
         var {
             pathClick
         } = this.props;
         return {
             enter: (x) => {
                 clearTimeout(this.hideToolTipTimeout);
             },
             leave: (x) => {
                 if (!this.state.modalClicked) {
                     this.hideToolTipTimeout = setTimeout(() => {
                         this.clearPopOver();
                     }, 100);
                 }
             },
             close: (x) => {
                 this.clearSelection({})
             },
             pathclick: (selectedPath) => {
 
                 var {
                     typeId
                 } = self.props;
 
                 self.clearSelection({});
 
                 //re draw path bundle to selected Path
                 var rootPathID = self.selectedPathOnHover.target.options.id
                 var rootPath = topologyMapHelper.directory[rootPathID];
                 var selectedPathID = selectedPath.id;
 
                 // if (selectedPathID && rootPath.siblings && rootPath.siblings.length > 0) {//old code againg checking
                 if (selectedPathID) {// new changes remove for testing
                     if (rootPath.selectedPathID) { //if selectdPathID already exists, it might had expanded hence collapse first
                         self.collapsePath(rootPath.selectedPathID)
                     }
 
                     rootPath.selectedPathID = selectedPathID;
                     var entity = topologyMapHelper.directory[selectedPathID]
                     self.props.getPathName(entity.name) //Display selected path name in path name placeholder
                     var layerGroups = [self.topologyMap.layers[rootPath.layer - 1], self.geoMap.layers[rootPath.layer - 1]]
                     // var layerGroups = [self.topologyMap.layers[rootPath.layer], self.geoMap.layers[rootPath.layer]]
                     var layerToRemove = {} // to remove bundle icon
 
                     layerGroups && layerGroups.forEach((layerGroup) => {
                         let isBundlePathClicked = false;
                         layerGroup && layerGroup.eachLayer((layer) => {
                             if (layer.options.id == rootPathID) {
                                 if (layer.options.type == "path" && !(layer.options.pathWithSibling && layer.options.pathWithSibling.length > 0)) {
                                     layer.setStyle({
                                         weight: 2,
                                         color: selectedPath.color || selectedPath.statusColor || "#acacac"
                                     })
 
                                     //Highlight Path only if opacity is 1
                                     if (layer.options.opacity == 1) {
                                         var selectedLayer = new L.Polyline(layer.getLatLngs(), {
                                             weight: 4,
                                             color: "#42A5F6",
                                             id: layer.options.id
                                         });
                                         selectedLayer.addTo(self.map);
                                         selectedLayer.bringToBack();
 
                                         this.selectedLayers.push(selectedLayer);
                                     }
                                 } else if (layer.options.type == "bundleIcon") {
                                     layerToRemove = layer
                                 }
                                 else {
                                     isBundlePathClicked = true;
                                 }
                             }
                         })
                         !isBundlePathClicked && layerGroup && layerGroup.removeLayer(layerToRemove);
                     })
 
                     pathClick(entity.detail);// Adds details to detais panel i.e rigth side panel
 
                     //seekBar
                     var lPathIDsIncludingSibNodes = []
                     self.topologyMap.paths.filter((x) => {
                         return x.type == "path"
                     }).forEach(pathID => {
                         //                        topologyMapHelper.directory[pathID.id].selectedPathID && delete topologyMapHelper.directory[pathID.id].selectedPathID;                        
                         //                        if(pathID.id === rootPathID){
                         //                            topologyMapHelper.directory[pathID.id].selectedPathID = pathID.id;
                         //                        }
                         var path = topologyMapHelper.directory[pathID.id];
                         if (path.selectedPathID) {
                             lPathIDsIncludingSibNodes.push(path.selectedPathID)
                         } else {
                             lPathIDsIncludingSibNodes.push(pathID.id)
                             lPathIDsIncludingSibNodes = lPathIDsIncludingSibNodes.concat(path.siblings && path.siblings.length > 0 ? path.siblings : [])
                         }
 
                     });
 
                     var lLayerDepth = lPathIDsIncludingSibNodes.filter((pathID) => {
                         return pathID != "link_unknown"
                     }).map((pathID) => {
                         var id = topologyMapHelper.directory[pathID].selectedPathID || pathID
                         return topologyMapHelper.directory[id].layerDepth + self.topologyMap.layers.length
                     })
 
                     topologyMapHelper.maxLayer = Math.max(...lLayerDepth)
                     self.changeSeekBar(self.topologyMap.layers.length, topologyMapHelper.maxLayer + 1)
                 }
             }
         }
     }
   
     openPopOver(event) {
 
         //display popover
         clearTimeout(this.hideToolTipTimeout);
 
         var entity = topologyMapHelper.directory[event.target.options.id];
 
         var paddingLeft = 20;
         var paddingRight = 10;
 
         //GLOBAL DIRECTORY -- is just information about the node & path -- all decision for CC/BUndle/... is passed or stored along with the respective layer of elements
         entity.siblings = event.target.options.pathWithSibling;
         if (entity.siblings && entity.siblings.length > 0) {
             if (event.originalEvent.clientY - 80 > 0) {
                 paddingLeft = paddingRight = -80;
             }
 
         }
 
         var containerElement = document.getElementById("topologyMapContainer")
 
         if (event.originalEvent.clientX / window.innerWidth * 100 < 50)
             var toolTipPosition = {
                 top: (event.originalEvent.clientY + paddingLeft - containerElement.getBoundingClientRect().top),
                 left: event.originalEvent.clientX + 20
             };
         else
             var toolTipPosition = {
                 top: (event.originalEvent.clientY + paddingRight - containerElement.getBoundingClientRect().top),
                 right: window.innerWidth - event.originalEvent.clientX + 10
             }
 
         this.setState({
             modalPosition: toolTipPosition
         });
 
         this.updatePopOverProp(event);
     }
 
     getPopOverEntity(entity, stateToDisplay, type) {
 
         var statesObj = topologyMapHelper.filteredState(entity, stateToDisplay);
 
         var result = {
             name: entity.name,
             id: entity.id,
             type: entity.type,
             priority: 999
         }
 
         var statusName = []
 
         //popover header
         if (statesObj && statesObj.length > 0) {
             statesObj.forEach((stateObj) => {
                 result.badgeText = result.badgeText || stateObj.badge || "";
                 result.statusName = result.statusName || stateObj.text;
                 result.priority = stateObj.priority;
 
                 if (stateObj.badge)
                     result.statusColor = stateObj.color
                 else
                     result.color = stateObj.color
             })
 
         }
 
         return result
     }
 
     updatePopOverProp(event) {
         const {
             updateModalInfo,
             stateToDisplay,
             typeId
         } = this.props
         let { id, type, ring, xPaths, ccPaths } = event.target.options;
         var entityID = /*topologyMapHelper.directory[id].selectedPathID ||*/ id;
         var entity = topologyMapHelper.directory[entityID];
 
         var propData = this.getPopOverEntity(entity, stateToDisplay[type]);
 
         // if (type == "marker" || type == "gMarker" || type == "crossConnectMarker")
         //     entity = topologyMapHelper.directory["link_" + id + "#" + id]
 
         // entity = (entity == undefined && type == "crossConnectMarker" && xPaths) ? topologyMapHelper.directory[xPaths[xPaths.length - 1]] : entity;
         if (type == "crossConnectMarker") {
             entity.siblings = ccPaths
         }
         if (entity) {
             //popover equipmentinfo
             if (entity.terminations && entity.terminations.length == 2) {
                 propData.equipmentInfo = {
                     origin: this.getPopOverEntity(topologyMapHelper.directory[entity.terminations[0]], stateToDisplay.marker),
                     path: this.getPopOverEntity(entity, stateToDisplay[type]),
                     destination: this.getPopOverEntity(topologyMapHelper.directory[entity.terminations[1]], stateToDisplay.marker)
                 };
             }
 
             //popover endpointInfo
             // if (ring == true) {
             //     var lPathIDs = [entity.id];
             // }
             // else {
             var lPathIDs = []
             if (entity.siblings && entity.siblings.length > 0) {
                 lPathIDs = type == "crossConnectMarker" ? entity.siblings : [entity.id].concat(entity.siblings);
             } else {
                 lPathIDs = [entity.id]
             }
             // }
             // console.log(entity);
             // console.log(topologyMapHelper.directory[entity.id]);
             //Below code is to differentiate between an Equipment, Path and a crossConnectMarker and show popup accordingly("Display name is not shown on hover of the NE")..
             if (entity.type.toLowerCase() == 'path' || type == "crossConnectMarker") {
 
                 propData.endpointInfo = lPathIDs.map((pathID) => {
                     var path = topologyMapHelper.directory[pathID]
                     return {
                         isSelected: entity.selectedPathID == pathID ? true : false,
                         origin: this.getPopOverEntity(topologyMapHelper.directory[path.ePoints[0]], stateToDisplay.marker),
                         path: this.getPopOverEntity(path, stateToDisplay[type]),
                         destination: this.getPopOverEntity(topologyMapHelper.directory[path.ePoints[1]], stateToDisplay.marker)
                     }
                 })
 
                 //sort path based on priority
                 propData.endpointInfo.sort((a, b) => {
                     return a.path.priority - b.path.priority
                 })
             }
             else {
                 // propData.endpointInfo = lPathIDs.map((pathID) => {
                 //    // var path = topologyMapHelper.directory[pathID]
                 //     return {
                 //         isSelected: entity.selectedPathID == pathID ? true : false,
                 //         origin: this.getPopOverEntity(entity, stateToDisplay.marker),
                 //         //path: this.getPopOverEntity(path, stateToDisplay[type]),
                 //         destination: this.getPopOverEntity(entity, stateToDisplay.marker)
                 //     }
                 // })
 
                 // //sort path based on priority
                 // propData.endpointInfo.sort((a, b) => {
                 //     return a.path.priority - b.path.priority
                 // })
             }
 
         }
 
         // associations: [{
         //     name: "Test Test",
         //     type: "Equipment",
         //     markerColor: "#acacac",
         //     statusColor: "#be0006",
         //     badgeText: "C",
         //     statusName: "CRITICAL"
         // }]
 
         updateModalInfo(propData);
     }
 
     clearPopOver() {
         const {
             updateModalInfo
         } = this.props;
         var data;
         updateModalInfo(data)
     }
 
 
 
     constructContextMenu(layerObj, maxLayerLength, directory, itemID, expandCallback, collapseCallback, props, customHookData) {
         var contextmenuItems = [];
 
         itemID = directory[itemID].selectedPathID || itemID
         console.log("itemID:: " + directory[itemID].detail.UUID + "type:: " + directory[itemID].type);
         var item = directory[itemID];
         if (item.layer != maxLayerLength && !(item.siblings && item.siblings.length > 0 && !item.selectedPathID) && item.cNodes.length > 0) {
 
             if (item.layer == layerObj.layers.length) {
                 contextmenuItems.push({
                     text: 'Expand',
                     index: 0,
                     callback: () => {
                         expandCallback(itemID)
                     }
                 })
             }
 
             if (item.layer < layerObj.layers.length)
                 contextmenuItems.push({
                     text: 'Collapse',
                     index: 1,
                     callback: () => {
                         collapseCallback(itemID)
                     }
                 })
 
 
         }
         if (customHookData) {
             var entityType = directory[itemID].type;
             var entityID = directory[itemID].detail.UUID;
             for (var i = 0; i < customHookData.length; i++) {
                 customHookData[i].entityType = entityType;
                 customHookData[i].entityID = entityID;
                 if (customHookData[i].EntitiesKeys && customHookData[i].EntitiesKeys.indexOf(item.detail.UUID) != -1 && customHookData[i].EntityType == entityType) {
                     if (customHookData[i].DisplayName) {
                         contextmenuItems.push({
                             text: customHookData[i].DisplayName,
                             callback: showCustomHookPath.bind(event, customHookData[i])
                         });
                     } else {
                         contextmenuItems.push({
                             text: customHookData[i].SureName,
                             callback: showCustomHookPath.bind(event, customHookData[i])
                         });
                     }
 
                 } else if (!customHookData[i].EntitiesKeys && (entityType == customHookData[i].EntityType)) {
 
                     if (customHookData[i].DisplayName) {
                         contextmenuItems.push({
                             text: customHookData[i].DisplayName,
                             callback: showCustomHookPath.bind(event, customHookData[i])
                         });
                     } else {
                         contextmenuItems.push({
                             text: customHookData[i].SureName,
                             callback: showCustomHookPath.bind(event, customHookData[i])
                         });
                     }
 
                 }
 
             }
         }
 
 
         return {
             contextmenu: true,
             contextmenuItems: contextmenuItems
         }
 
         //CustomHooks for path:
         function showCustomHookPath(e, params) {
             //for geomap/p2pmap
             console.log('params inside showcustomhook(geomap/p2p): ');
             //e.relatedTarget.options.contextmenuItems[0].customHookUR
 
             //console.log(props.customHookData.CustomHook_URL); 
             //var urlWithSort=props.dataSource.domain+'/oss/sure/items?q=Type;EQUALS;CUSTOM_HOOK&q=EntityType;EQUALS;'+props.dataSource.payload[0].request.origin["@class"]+'&q=SubType;EQUALS;COMPONENT';
 
             if (!props.dataSource.domain) {
                 props.dataSource.domain = props.dataSource.url.split('/oss')[0];
 
             }
             var selectedEntityUUID = e.entityID;
             var entityType = e.entityType;
             // var urlForCustomHooks=props.dataSource.domain+'/oss/sure/items?q=Type;EQUALS;CUSTOM_HOOK&q=EntityType;EQUALS;Equipment&q=SubType;EQUALS;COMPONENT';
             var urlForCustomHooks = props.dataSource.domain + '/oss/sure/graphSearch?limit=100&page=1';
             var payloadForCustomHook = {
                 "request": {},
                 "response": {
                     "responseType": "List",
                     "entity": ["FCP", "Endpoint"],
                     "selfJoin": "true",
                     "responseFilter": [{
                         "for": "Equipment",
                         "filter": ["UUID;NOT EQUAL;47ffef93-779f-476d-a229-6473cc89f842"]
                     }]
                 },
                 "expand": ["Capacity", "State"],
                 "searchFilter": [{
                     "for": "Equipment",
                     "filter": ["UUID;EQUALS;47ffef93-779f-476d-a229-6473cc89f842"]
                 }]
             };
 
             payloadForCustomHook.response.responseFilter[0].for = entityType;
             payloadForCustomHook.response.responseFilter[0].filter[0] = "UUID;NOT EQUAL;" + selectedEntityUUID;
             payloadForCustomHook.searchFilter[0].for = entityType;
             payloadForCustomHook.searchFilter[0].filter[0] = "UUID;EQUALS;" + selectedEntityUUID;
 
             //https://135.250.139.91:28443/oss/sure/graphSearch?limit=100&page=1
             //get data to be fed to customhook:
             return axios({
                 method: "POST",
                 url: urlForCustomHooks,
                 headers: props.dataSource.headers,
                 data: payloadForCustomHook
             }).then(
                 (function (response) {
                     var lastRow = -1;
                     var dataRow = response.data.element;
                     var objRowdataNew = [];
 
                     if (dataRow) {
                         dataRow.map(function (value, key) {
                             var item = value;
                             if (value.Associations && value.Associations.Association[0] && value.Associations.Association[0].Type == 'HAS_STATE') {
                                 if (value.Associations.Association[0].Target.Features.Feature.length > 0) {
 
                                     for (var i = 0; i < value.Associations.Association[0].Target.Features.Feature.length; i++) {
 
                                         //var stateItem={};
                                         item[value.Associations.Association[0].Target.Features.Feature[i].Name] = value.Associations.Association[0].Target.Features.Feature[i].Value;
                                         // this.push(stateItem); 
                                     }
 
                                 }
 
 
                             }
 
 
 
 
 
                             this.push(item);
                         }, objRowdataNew);
                     } else {
                         objRowdataNew = [];
                     }
 
 
                     if (objRowdataNew.length < 100) {
                         lastRow = params.startRow + objRowdataNew.length;
                     }
 
                     //params.successCallback(objRowdataNew, lastRow);
                     //reloadCount && gridData.dataCount(params.startRow + objRowdata.length);
                     /* if (objRowdata.length < 100) {
                        lastRow = params.startRow + objRowdata.length;
                      }
                      params.successCallback(objRowdata, lastRow);*/
                     //
                     //to show in a new window:
 
 
                     if (e.DisplayAs.toLowerCase() == 'window') {
                         //window.open(props.customHookData.CustomHook_URL+'/?UUID='+e.relatedTarget.options.UUID);
 
 
                         var strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
                         var contentWindow = window.open(e.CustomHookURL); //+ "?launchedBy=SURE"
                         /*var self = this;
                         var dataToPost = {
                             type: "ACCESS_CUSTOM_HOOK",
                             payload: {
                                 userName: this.userName,
                                 product: this.DisplayName.replace("CH:",""),
                                 dataSource: this.dataSource,
                                 data: rowData
                             }
                         };*/
 
 
                         //async function to provied delay for postmessage
                         /*setTimeout(function() {
                                 contentWindow.postMessage(dataToPost,self.CustomHookURL)
                             }, 10); */
 
                     } else if (e.DisplayAs.toLowerCase() == 'popup') {
                         var rowData, columnData = [];
                         var columnData = [{
                             field: 'AdministrativeState',
                             displayName: 'AdministrativeState'
                         }, {
                             field: 'OperationalState',
                             displayName: 'OperationalState'
                         }, {
                             field: 'DisplayName',
                             displayName: 'Display Name'
                         }, {
                             field: 'SureName',
                             displayName: 'Name'
                         }, {
                             field: '@class',
                             displayName: 'Type'
                         }];
                         if (!rowData || rowData == '') {
 
                             /* var rowData=[{test: 'test1',test1: 'test1'}, {test: 'test1',test1: 'test1'},{test: 'test1',test1: 'test1'}];
                              columnData=[{field: 'test',displayName: 'test'},{field: 'test1',displayName: 'test1'}];
                              var DisplayName='test user1';*/
                         }
                         var iframeData = {
                             rowData: objRowdataNew,
                             columnData: columnData
                         };
                         var modalWindow = SUREUI.components.ModalWindow;
                         if (e.titleBgColor) {
                             var titleBgColor = e.titleBgColor;
                         } else {
                             var titleBgColor = '#3f51b5';
                         } //Setting default bg color for custom hook's header.
                         var prop = {
                             customHookObject: e,
                             height: 1000,
                             width: 1000,
                             headerColor: titleBgColor,
                             id: "modalWindowContainer",
                             header: true,
                             title: e.DisplayName,
                             iconBaseURL: "SURE_UI_Components/",
                             iframeSource: e.CustomHookURL,
                             iframeDataSource: props.dataSource,
                             userName: e.CreatedBy,
                             data: iframeData,
                             rowData: objRowdataNew,
                             columnData: columnData,
                             onClose: function () {
                                 ReactDOM.unmountComponentAtNode(document.getElementById("modalWindow"));
                             }
                         }
 
                         var modalWindowComponent = React.createElement(modalWindow, prop);
                         ReactDOM.render(modalWindowComponent, document.getElementById("modalWindow"));
 
                     }
                     //axios to get fcp/endpoints of selected entity:
 
 
                 })
 
             );
 
 
 
             //to show in a modal window:
 
 
 
         }
 
 
 
     }
 
     calculateLayerDepth(directory, id, layer) {
         var lCNodes = []; // Child path array
         var lIDs = [];  //sibling path array - as now not required
 
         if (directory[id])
             lIDs = [id].concat(directory[id].siblings || [])
 
         var lLayerDepth = lIDs.map(id => {
             var layerDepth;
             directory[id].layer = layer
 
             if (directory[id])
                 lCNodes = directory[id].cNodes.filter((cNode) => {
                     if (directory[cNode].isCrossLink) {
                         return false;
                     }
                     else {
                         // return cNode.indexOf("_CLONE_") == -1;
                         return false;
                     }
                 });
             if (lCNodes.length == 0) {
                 layerDepth = 0
             } else {
                 var lLayerDepth = lCNodes.map((cNode) => {
                     return this.calculateLayerDepth(directory, cNode, layer + 1)
                 })
                 var layerDepth = Math.max(...lLayerDepth) + 1
             }
             directory[id].layerDepth = layerDepth;
             return layerDepth
         }, this);
 
         return Math.max(...lLayerDepth);
     }
 
     //Creating an object with the IDs of terminations and cloning it if it exists already
     shrinkDirectory(topologyMapHelper, pathIDs, parent) {
         var directory = topologyMapHelper.directory;
         for (var i = 0; i < pathIDs.length; i++) {
             var pathID = pathIDs[i];
             var currentValue = directory[pathID];
 
             if (currentValue) {
                 var cloneID = undefined;
 
                 var linkID = "link_" + currentValue.terminations.join("#")
 
                 var isCrossLink = currentValue.terminations.every((val, i, arr) => val === arr[0])
 
                 if (!directory[linkID]) {
                     directory[linkID] = Object.assign({}, currentValue, {
                         siblings: [],
                         id: linkID,
                         parent: parent,
                         isCrossLink: isCrossLink
                     })
                 } else {
                     var siblingsCount = directory[linkID].siblings.length;
                     cloneID = linkID + "_CLONE_" + (siblingsCount + 1);
                     var bundleID;
                     if (directory[linkID].cNodes.length > 0 && directory[linkID].siblings.length > 0 && directory[linkID].siblings.includes(cloneID) && directory[linkID].cNodes.includes(cloneID)) {
 
                         bundleID = linkID;
 
                     }
 
 
                     if (linkID == bundleID) {
                         //Logic to avoid siblings..
 
                     }
                     else {
                         directory[linkID].siblings.push(cloneID)
 
                     }//Should be based on hierarchy too and not just terminations.
                     directory[cloneID] = Object.assign({}, currentValue, {
                         siblings: [],
                         id: cloneID,
                         parent: parent,
                         isCrossLink: isCrossLink
                     })
 
                     //Rename ID to cloneID from parent cNodes
                     // directory[directory[cloneID].parent].cNodes[i] = cloneID; //FIX MISSING PATH ISSUE 
                     // directory[directory[cloneID].parent].cNodes.splice(i, 1);
                 }
 
                 var lCNodes = directory[pathID].cNodes.slice();
                 var id = cloneID || linkID;
 
                 directory[id].cNodes = currentValue.cNodes.map((cNode) => {
                     // unknown will be added as cLinkID if it is not in directory
                     var cLinkID = directory[cNode] ? "link_" + directory[cNode].terminations.join("#") : cNode
                     return directory[cLinkID] ? undefined : cLinkID
                 }).filter((cNode) => cNode ? true : false)
 
                 this.shrinkDirectory(topologyMapHelper, lCNodes, id)
 
                 delete directory[pathID]
             }
 
         }
     }
 
     openSettings(event) {
         if (this.props.statusPanel) {
             let elemetBounds = event.target.getBoundingClientRect();
             if (document.getElementById("clusterDist")) { document.getElementById("clusterDist").style.display = "none"; }
             let style = Object.assign({}, this.props.statusPanel.style, {
                 left: elemetBounds.left + elemetBounds.width + 3 + "px",
                 bottom: "0px",
                 marginBottom: "10px"
             });
             this.setState({
                 showStatusPanel: !this.state.showStatusPanel,
                 style: style
             });
         }
     };
 
     changeSeekBar(level, maxLevel) {
         document.querySelector("a.seekBar").style.top = 73 * level / maxLevel + "px";
         document.querySelector("a.seekBar").title = level + "/" + maxLevel;
     }
 
     toggleMapView() { }
 
     clearSelection(e) {
         if (this.state.showStatusPanel)
             this.setState({
                 showStatusPanel: false
             })
         this.setState({
             modalClicked: false
         })
         if (e) //clear popover only if clearSelection triggererd from map click event
             this.clearPopOver();
         if (this.selectedLayers && this.selectedLayers.length > 0) {
             this.selectedLayers.forEach((selectedLayer) => {
                 this.map.removeLayer(selectedLayer)
             }, this)
             this.selectedLayers = []
         }
 
         this.topologyMap && this.topologyMap.layers && this.topologyMap.layers.length > 0 && this.topologyMap.layers[this.topologyMap.layers.length - 1].eachLayer((layer) => {
             if (layer.options.type == "path")
                 layer.setStyle({
                     opacity: 1
                 })
         });
         //clear pathName
         this.props.clearPathName();
         //clear marker selection if any
         var selectedElement = document.getElementById("topologyMap").querySelectorAll(".selected");
         if (selectedElement[0]) {
             selectedElement[0].classList.remove("selected");
         }
     }
 
     retainPathState(layer, directory, stateToDisplay, drawMarkerV1) {
         //Changing layer.path state to previous layer
         var path = [];
         layer.layers[layer.layers.length - 1].eachLayer((layer) => {
 
             //Change path State
             if (layer.options.id && layer.options.id.indexOf("link_") != -1) {
 
                 if (layer.options.type == "path")
                     layer.setStyle({
                         opacity: 1
                     })
 
                 path.push(Object.assign({}, {
                     id: layer.options.id,
                     type: layer.options.type
                 }))
             }
 
             //Update marker to display label
             if (layer.options.type && layer.options.type == "marker") {
                 layer.options.isShowLabel = true;
                 layer.setIcon(drawMarkerV1(directory[layer.options.id], "marker", stateToDisplay))
             }
         })
 
         return path
     }
 
    
     collapseLayer() {
         const { stateToDisplay } = this.props;
         this.clearSelection();
         if (this.topologyMap.layers.length > 1) {
 
             let topologyLayerToCollapse = this.topologyMap.layers.pop();
 
             this.topologyMap.paths = this.retainPathState(this.topologyMap, topologyMapHelper.directory, stateToDisplay, this.tMHelperObj.drawMarkerV1.bind(this))
 
             //Clearing current layer
             topologyLayerToCollapse.clearLayers();
         
             this.removeExistingLayersFromMap(this.geoMap.layers, this.map);
 
             let geoLayerToCollapse = this.geoMap.layers.pop();
 
             var layers = this.geoMap.layers[this.geoMap.layers.length - 1];
 
             layers.addTo(this.map);
 
         }
 
         //seekBar
         var lPathsID = this.topologyMap.paths.filter((path) => {
             return path.type == "path"
         })
 
         var lLayerDepth = lPathsID
             .filter((pathID) => {
                 return pathID.id != "link_unknown"
             })
             .map((pathID) => {
                 var id = topologyMapHelper.directory[pathID.id].selectedPathID || pathID.id
                 return topologyMapHelper.directory[id].layerDepth + this.topologyMap.layers.length
             })
 
         if (lLayerDepth.length > 0)
             this.changeSeekBar(this.topologyMap.layers.length, Math.max(...lLayerDepth))
     }
 
     expandPath(selectedPathID) {
         if (selectedPathID && selectedPathID != "") {
             const { stateToDisplay, typeId } = this.props;
 
             var paths = []
             var selectedPath = topologyMapHelper.directory[selectedPathID]
             var parentPath = topologyMapHelper.directory[selectedPath.parent];
 
             if (selectedPath.layer < this.topologyMap.layers.length) {
                 //errorMessage: collapse expanded layer to expand
                 return;
             }
 
             this.topologyMap.layers[selectedPath.layer - 1].eachLayer((layer) => {
                 //Only selected path cNodes will be added as Path rest all gPath
 
                 var layerID = layer.options.id
                 if (topologyMapHelper.directory[layer.options.id] && topologyMapHelper.directory[layer.options.id].selectedPathID)
                     layerID = topologyMapHelper.directory[layer.options.id].selectedPathID
 
                 if (layer.options.type == "path" && layerID == selectedPathID) {
                     var cNodes = selectedPath.cNodes.filter((cNode) => {
                         if (cNode == "unknown")
                             return true
                         else
                             return !topologyMapHelper.directory[cNode].isCrossLink && cNode.indexOf("_CLONE_") == -1
                     })
                         .map((cNode) => {
                             if (cNode == "unknown")
                                 return {
                                     id: "link_unknown",
                                     type: "uPath"
                                 }
                             else
                                 return {
                                     id: cNode,
                                     type: "path"
                                 }
                         })
                     paths = paths.concat(cNodes)
                 } else if (layer.options.type == "path" || layer.options.type == "gPath") {
                     layer.setStyle({
                         opacity: 0.5
                     })
                     paths.push({
                         id: layer.options.id,
                         type: "gPath"
                     })
                 } else if (layer.options.type == "uPath") {
                     paths.push({
                         id: "link_unknown",
                         type: "uPath"
                     })
                 }
             })
             this.topologyMap.paths = paths;
 
             //Atleast one sub path/cNode should be present to exapnd layer
             var lPathsID = paths.filter((path) => {
                 return path.type == "path"
             })
 
             //detecting the ring and return:
             var lPathsID = paths.filter((path) => {
                 return path.type == "rPath"
             })
 
 
             //
             if (lPathsID.length > 0)
                 this.tMHelperObj.getLayers(this.map, this.topologyMap, this.geoMap, topologyMapHelper.directory, typeId, stateToDisplay, this.markerEvents.call(this), this.pathEvents.call(this));
             else {
                 //errorMessage:no layers to expand
             }
 
             //seekBar
             var lPathIDsIncludingSibNodes = []
             lPathsID.forEach(pathID => {
                 var path = topologyMapHelper.directory[pathID.id];
                 lPathIDsIncludingSibNodes.push(pathID.id)
                 lPathIDsIncludingSibNodes = lPathIDsIncludingSibNodes.concat(path.siblings && path.siblings.length > 0 ? path.siblings : [])
 
 
             });
 
             var lLayerDepth = lPathIDsIncludingSibNodes
                 .filter((pathID) => {
                     return pathID.id != "link_unknown"
                 })
                 .map((pathID) => {
                     return topologyMapHelper.directory[pathID].layerDepth + this.topologyMap.layers.length
                 })
 
             if (lLayerDepth.length > 0)
                 this.changeSeekBar(this.topologyMap.layers.length, Math.max(...lLayerDepth))
 
         }
     }
 
     collapsePath(selectedPathID) {
 
         if (selectedPathID && selectedPathID != "") {
 
             const {
                 stateToDisplay
             } = this.props;
 
             var selectedPath = topologyMapHelper.directory[selectedPathID]
 
             var layersToCollapse = this.topologyMap.layers.splice(selectedPath.layer, this.topologyMap.layers.length)
 
             if (this.topologyMap.layers.length > 0) {
 
                 this.topologyMap.paths = this.retainPathStateV1(this.topologyMap, topologyMapHelper.directory, stateToDisplay, this.tMHelperObj.drawMarkerV1.bind(this))
 
                 //Clearing current layer
                 layersToCollapse.forEach((layerToCollapse) => {
                     layerToCollapse.clearLayers();
                 })
             }
         }
 
         //seekBar
         var lPathsID = this.topologyMap.paths.filter((path) => {
             return path.type == "path"
         })
 
         var lLayerDepth = lPathsID
             .filter((pathID) => {
                 return pathID.id != "link_unknown"
             })
             .map((pathID) => {
                 var id = topologyMapHelper.directory[pathID.id].selectedPathID || pathID.id
                 return topologyMapHelper.directory[id].layerDepth + this.topologyMap.layers.length
             })
 
         // if (lLayerDepth.length > 0)
         //     this.changeSeekBar(this.topologyMap.layers.length, Math.max(...lLayerDepth))
 
     }
 
     switchMap() {
         const {
             typeId,
             updateTypeID
         } = this.props;
         var switchIcon = document.querySelector("a.switchIcon");
 
         this.clearSelection({});
         updateTypeID(typeId?0:1);
         if (typeId == 0) {
             switchIcon.classList.remove("geo");
             switchIcon.title = "Point To Point View";
             switchIcon.classList.add("topology");
             this.switchToGeo();
             
         } else {
             switchIcon.classList.remove("topology");
             switchIcon.title = "Geographical View";
             switchIcon.classList.add("geo");
             this.switchToP2P();
         }
     }
 
     switchToGeo() {
 
         //Remove Existing Layer if any        
         this.removeExistingLayersFromMap([].concat(this.topologyMap.layers, this.geoMap.layers), this.map)
 
         this.map.doubleClickZoom.enable();
         this.map.scrollWheelZoom.enable();
 
         var layers = this.geoMap.layers[this.geoMap.layers.length - 1];
         let invalidEquipementLocation=[];
         
         var lMarkers = (layers && layers.getLayers() && layers.getLayers().filter((layer) => {
             if(layer.options.invalidLocation){
                 // invalidEquipementLocation.concat(invalidEquipementLocation,layer.options.invalidLocation)
                 invalidEquipementLocation.push(layer.options.invalidLocation);
             }
             return layer.options.type == "marker" || layer.options.type == "gMarker" || layer.options.type == "crossConnectMarker";
         })) || [];
 
         if(invalidEquipementLocation.length>0){
             this.handleCustomError({
                 custom_error: {
                     name: 'Equipment is associated with invalid location',
                     details: invalidEquipementLocation.join(`,  `)
                 }
             });
             return false;
         }
         var group = new L.featureGroup(lMarkers);
         this.map.fitBounds(group.getBounds());
         layers.addTo(this.map);
         this.geoMap.tileLayer.addTo(this.map)
     }
 
     switchToP2P() {
         this.removeExistingLayersFromMap([].concat(this.topologyMap.layers, this.geoMap.layers, [this.geoMap.tileLayer]), this.map)
         this.map.setView([51.505, -0.09], 13);
         this.map.doubleClickZoom.disable();
         this.map.scrollWheelZoom.disable();
 
         this.topologyMap && this.topologyMap.layers && this.topologyMap.layers.forEach((layer) => {
             this.map.addLayer(layer);
         }, this)
     }
 
     removeExistingLayersFromMap(layers, map) {
         layers.forEach((layer) => {
             map.removeLayer(layer);
         }, this)
     }
 
     createMultiEquipmentPayload(inputArray, payloadin) {
         var payloadArray = [];
         console.log(payloadin);
         inputArray.forEach((arr) => {
             //Object.assign({}, orig)
             var payload = Object.assign({}, JSON.parse(JSON.stringify(payloadin)));
             payload.request.origin['@class'] = arr.type;
             payload.request.origin['UUID'] = arr.UUID;
 
             payload.response.entity = ['Location', arr.type];
             payload.response.responseFilter[0].for = arr.type;
             payload.response.responseFilter[0].filter = ["UUID;EQUALS;" + arr.UUID];
             /*              payload: {
     "request": {
         "origin": {
             "@class": "Endpoint",
             "UUID": "672e7f00-1a35-11e9-89db-0242c0a80103"
         },
         "graphSearch": false,
         "inclusion": {
             "gInclude": [
                 "Path",
                 "Endpoint",
                 "FCP",
                 "Equipment",
                 "Location"
             ]
         },
         "exclusion": {
             "excludeFrom": [{
                     "from": "Location",
                     "exclusion": ["Location"]
                 }
             ],
               "relation" : [{
                     "relType" : "ASSOCIATES_WITH",
                     "direction" : "OUTGOING"
                 }
             ]
         },
         "multiOriginRequest": false,
         "gDirection": "OUTGOING"
     },
     "response": {
         "responseType": "List",
         "entity": [
             "Location",
             "Endpoint"
         ],"responseFilter": [{
                             "for": "Endpoint",
                             "filter": ["UUID;EQUALS;672e7f00-1a35-11e9-89db-0242c0a80103"]
                         }
                         ]
     },	"expand": [
             "Location.State",
             "Endpoint.State"
         ]
 }*/
 
             payloadArray.push(payload)
         }, this)
         console.log(payloadArray);
         return payloadArray;
     }
     componentWillMount() {
         const {
             getMultiEntityTopologyData,
             getTopologyData,
             dataSource,
             data,
             typeId,
             inputMultiEquipments
         } = this.props;
         //Action Creator to retrive mapData
         console.log(this.props);
         
         var domain = dataSource.url.split('/oss')[0];
         var specheaders=dataSource.headers;
         specheaders.TransformationEnabled=true;
         //make a call to get file list:
         var fileNameList=[];
         //console.log(tMHelperObj);
         axios({
             method: "GET",
             //url: 'https://135.250.139.91:28443/osscm/commons/catalog/specifications?q=specName;EQUALS;EntityAttribute&q=subType;EQUALS;English',
             url: domain+'/osscm/commons/catalog/specifications?q=specName;EQUALS;EntityAttribute&q=subType;EQUALS;English',
             headers: specheaders
 
         }).then((res)=> {
 
 if(res.data.entityAttributes && res.data.entityAttributes.customGUI_Icons && res.data.entityAttributes.customGUI_Icons.defaultAttribute){
    
     res.data.entityAttributes.customGUI_Icons.defaultAttribute.forEach(function(item){
 
         fileNameList.push({combo:item.entityAttribute, fileName: item.visibleColumn});
     
     })
 }
 else{
 console.log("No custom Icons mapping found..");
 }
 
 
  //get svg file contents of each file:
  var iconsFromDocker={};
  var customGUI_combinations=this.props.customGUI_combinations.split('__');
  var customGUI_iconPath=this.props.customGUI_iconPath;
  
  iconsFromDocker.customGUI_combinations= customGUI_combinations //['Label','Type','SubType','Vendor'];
  //iconsFromDocker.customGUI_combinations= ['Label','Type','SubType','CreatedBy', 'Vendor']; //['Label','Type','SubType','Vendor'];
  var promises=[];
  fileNameList.forEach(function (singleElement) {
 
    let myUrl = domain+'/sure-ui/properties?fileName=fetchSVGFile&subName='+customGUI_iconPath+''+singleElement.fileName;
   promises.push(axios.get(myUrl))
  })
 
 
  axios.all(promises).then(results => {
     results.forEach((res, index) =>{
         //mainObject[response.identifier] = response.value;
         if(res.data==''){
             console.log("blank response..");
             
         }
         else{
             //console.log(res);
             iconsFromDocker[fileNameList[index].combo]=res.data.replace("<svg","<svg ").replace(" width=","").replace(" height=","");
             
         }
     })
     
     //console.log(iconsFromDocker);
     if(JSON.stringify(iconsFromDocker)!='{}'){
         this.tMHelperObj.setEqIcon(iconsFromDocker);
     }
     
     if (typeId && typeId == 2 && data.length == 0) {
         dataSource.payload = this.createMultiEquipmentPayload(inputMultiEquipments, dataSource.payloadEP);
         getMultiEntityTopologyData(dataSource, typeId);
     } else if (data.length == 0) {
         getTopologyData(dataSource, typeId, this.props);
     }
 }).catch(error =>{
     console.log(error);
     //this.tMHelperObj.setEqIcon(iconList);
     if (typeId && typeId == 2 && data.length == 0) {
         dataSource.payload = this.createMultiEquipmentPayload(inputMultiEquipments, dataSource.payloadEP);
         getMultiEntityTopologyData(dataSource, typeId);
     } else if (data.length == 0) {
         getTopologyData(dataSource, typeId, this.props);
     }
     });
         })
         
 
         
     }
     fitMapMarker() {
         let currentMap = document.querySelector("a.switchIcon").classList;
         if (currentMap.contains("topology")) {
             console.log("Map resized please fit the marker accordingly");
             var layers = this.geoMap.layers[this.geoMap.layers.length - 1];
             var bounds = L.latLngBounds()  // Instantiate LatLngBounds
 
             var lMarkers = (layers && layers.getLayers() && layers.getLayers().filter((layer) => {
                 return layer.options.type == "marker" || layer.options.type == "gMarker" || layer.options.type == "crossConnectMarker"
             })) || [];
 
             lMarkers.map(function (val, i) {
                 bounds.extend(val.getLatLng());
             });
 
             this.map.fitBounds(bounds);
         }
     }
     componentDidMount() {
         window.addEventListener("resize", this.fitMapMarker.bind(this));
         var progressOptions = {
             spinner: "right",
             overlay: true,
             css: {
                 small: false,
                 medium: false,
                 large: false,
                 xlarge: true,
                 xxlarge: false
             }
 
         };
         var component1 = React.createElement(ProgressIndicatorCircular, progressOptions);
         ReactDOM.render(component1, document.getElementById("progressIndicatorCircularIDComp"));
 
         const {
             rootPathID,
             data,
             stateToDisplay,
             typeId,
             tileServer,
             inputMultiEquipments
         } = this.props;
 
         this.geoMap.tileLayer = L.tileLayer(tileServer, {
             attribution: '',
             maxZoom: 20,
             zIndex: 15
         })
 
         let map = this.createMap(this.refs.topologyMap, "", this.props.maxZoom, this.clearSelection.bind(this));
 
         if (typeId == 1 || typeId == 2) {
             this.geoMap.tileLayer.addTo(map)
         } else if (typeId == 0) {
             map.doubleClickZoom.disable();
             map.scrollWheelZoom.disable();
         }
 
         map.on("load", (e) => {
             this.tMHelperObj.onLoad(document.querySelector("#topologyMap .leaflet-customOverlay-pane"))
         })
 
         map.on('moveend', (e) => {
             this.tMHelperObj.onMoveEnd(document.querySelector("#topologyMap"))
         })
 
         map = this.customControl(map, 'bottomleft', 'mapviewsettings', this.openSettings.bind(this), "Settings");
 
         if (typeId !== 2) { //Below options are not available for displaying locations alone on map for Equipment/FCP/Endpoint
 
             map = this.customControl(map, 'bottomleft', 'layerExpand', this.expandLayerV1.bind(this), "Expand Layer");
 
             map = this.customControl(map, 'bottomleft', 'seekBar', this.openSettings.bind(this), "SeekBar");
 
             map = this.customControl(map, 'bottomleft', 'layerCollapse', this.collapseLayerV1.bind(this), "Collapse Layer");
 
             /*
             if (typeId == 1) // typeId ==1 if it is GeoMap show P2P View
                 map = this.customControl(map, 'bottomleft', 'switchIcon topology', this.switchMap.bind(this), "Point To Point View");
             else
                 map = this.customControl(map, 'bottomleft', 'switchIcon geo ', this.switchMap.bind(this), "Geographical View");
                 */
         }
 
         map.createPane("customOverlay");
 
         map.zoomControl.setPosition('bottomleft');
 
         map.setView([51.505, -0.09], 13);
 
         this.map = map;
 
         if (data.length > 0 && !topologyMapHelper.directory && rootPathID) {
 
             //object to directory
             topologyMapHelper.directory = data.reduce(function (total, currentValue, i) {
                 total[currentValue.id] = currentValue
                 return total
             }, {})
 
                 let rootPathLinkID = "link_" + topologyMapHelper.directory[rootPathID].terminations.join("#");
                 this.shrinkDirectory(topologyMapHelper, [rootPathID], 1)
                 topologyMapHelper.maxLayer = this.calculateLayerDepth(topologyMapHelper.directory, rootPathLinkID, 1)
                 this.changeSeekBar(1, topologyMapHelper.directory[rootPathLinkID].layerDepth + 1);
                 this.topologyMap.paths = [{
                     id: rootPathLinkID,
                     type: "path"
                 }]
                 this.tMHelperObj.getLayers(this.map, this.topologyMap, this.geoMap, topologyMapHelper.directory, typeId, stateToDisplay, this.markerEvents.call(this), this.pathEvents.call(this));
             
 
 
             //getRootPathID(rootPathLinkID); //changing the rootPathID            
         }
         if (typeId == 2) {
             if (data.length > 0 && !topologyMapHelper.directory) {
                 topologyMapHelper.directory = data.reduce(function (total, currentValue, i) {
                     total[currentValue.id] = currentValue
                     return total
                 }, {})
 
                 // topologyMapHelper.directory = data;
 
                 let firstEleemnt = data[0];
                 const {
                     stateToDisplay
                 } = this.props;
                 const {
                     onMarkerClick
                 } = this.props;
 
                 topologyMapHelper.directory = data.reduce(function (total, currentValue, i) {
                     total[currentValue.id] = currentValue
                     return total
                 }, {})
 
                 this.tMHelperObj.getLayers(this.map, this.topologyMap, this.geoMap, topologyMapHelper.directory, typeId, stateToDisplay, this.markerEvents.call(this), this.pathEvents.call(this));
                 this.markerClusters = this.tMHelperObj.getMarkers(topologyMapHelper.directory, stateToDisplay, onMarkerClick, this.props);
                 this.map.addLayer(this.markerClusters);
                 this.map.setView([firstEleemnt.latitude, firstEleemnt.longitude], 10);
             } else {
                 if (typeId == '2') {
                     topologyMapHelper.directory = data.reduce(function (total, currentValue, i) {
                         total[currentValue.id] = currentValue
                         return total
                     }, {})
 
 
                     this.tMHelperObj.getLayers(this.map, this.topologyMap, this.geoMap, topologyMapHelper.directory, typeId, stateToDisplay, this.markerEvents.call(this), this.pathEvents.call(this));
 
 
                     if (data[0] && data[0].latitude && data[0].longitude) {
                         var firstEleemnt = data[0];
                         const {
                             stateToDisplay
                         } = this.props;
                         const {
                             onMarkerClick
                         } = this.props;
                         //this.tMHelperObj.getLayers(this.map, this.topologyMap, this.geoMap, topologyMapHelper.directory, typeId, stateToDisplay, this.markerEvents.call(this), this.pathEvents.call(this));
                         this.markerClusters = this.tMHelperObj.getMarkers(topologyMapHelper.directory, stateToDisplay, onMarkerClick, this.props);
                         this.map.addLayer(this.markerClusters);
                         this.map.setView([firstEleemnt.latitude, firstEleemnt.longitude], 10);
                     }
                 }
 
 
             }
         }
     }
 
     componentWillReceiveProps(nextProp) {
 
         const {
             statusUpdateTimeStamp
         } = nextProp.statusPanel;
         const {
             rootPathID,
             data,
             stateToDisplay,
             errorMessage,
             onError
         } = nextProp;
         var typeId = nextProp.typeId ? nextProp.typeId : this.props.typeId;
         /* if (statusUpdateTimeStamp && statusUpdateTimeStamp != this.props.statusPanel.statusUpdateTimeStamp) {
              let markers = this.tMHelperObj.updateMarkers(topologyMapHelper.directory, nextProp.stateToDisplay, this.markerClusters)
          }*/
          var expandpath;
 
         document.getElementById("progressIndicatorCircularIDComp") && ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularIDComp"));
         if (errorMessage && errorMessage.custom_error) {
             onError("custom_error", errorMessage.custom_error);
             return false;
         }
 
         if (errorMessage instanceof Error) {
             console.log(errorMessage);
             console.log(errorMessage.message);
             document.getElementById("progressIndicatorCircularIDComp") && ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularIDComp"));
             // var errorMsg = 'latitude/longitude not found';
             console.log(nextProp);
             if (nextProp.typeId == 2) {
                 var dataList = {
                     dataList: [
                         {
                             "message": "Equipment not found",
                             "action": "Action",
                             "duration": 7000,
                             "autoIncreaseDuration": false
                         }
                     ]
                 };
 
             }
             else {
                 if(errorMessage.response && errorMessage.response.data ){
                     console.log(errorMessage.response.data);
 var customerrorMessage;
 
                     if(typeof errorMessage.response.data =='string'){
                         if( errorMessage.response.data.indexOf('UNEC')!=-1){
                             customerrorMessage='Action requested is exceeding the available memory limit';
                         }
                         else{
                             customerrorMessage= errorMessage.response.data;
                         }
 
                         
                     }
                     else if(typeof errorMessage.response.data =='string' ){
                         customerrorMessage=errorMessage.response.data.message;
                     }
                     else if(errorMessage.response.data.message && typeof errorMessage.response.data.message =='string' ){
                         customerrorMessage=errorMessage.response.data.message;
                     }
                     else{
 
                     }
                     
                    
                     var dataList = {
                         dataList: [
                             {
                                 "message": customerrorMessage,
                                 "action": "Action",
                                 "duration": 7000,
                                 "autoIncreaseDuration": false
                             }
                         ]
                     }
                 }
                 else if(errorMessage.message){
                     var dataList = {
                         dataList: [
                             {
                                 "message": errorMessage.message,
                                 "action": "Action",
                                 "duration": 7000,
                                 "autoIncreaseDuration": false
                             }
                         ]
                     }
                 }
                 
 
             }
             // var dataList = {
             //     dataList: [{
             //         message: 'Path not found',
             //         duration: 10000,
             //         autoIncreaseDuration: false
 
             //     }]
             // };
 
             _loadExternalComponent(Snackbar, dataList, "snackbarID");
             //throw errorMessage
         }
 
 
         if (statusUpdateTimeStamp && statusUpdateTimeStamp != this.props.statusPanel.statusUpdateTimeStamp) {
 
             if (nextProp.typeId == 2) {
 
                 this.tMHelperObj.updateLayers(this.map._layers, topologyMapHelper.directory, nextProp.stateToDisplay, this.tMHelperObj.drawMarkerV1.bind(this), nextProp.typeId)
             } else {
                 this.tMHelperObj.updateLayers(this.topologyMap.layers, topologyMapHelper.directory, nextProp.stateToDisplay, this.tMHelperObj.drawMarkerV1.bind(this), nextProp.typeId)
             }
             //layers, directory, stateToDisplay, drawMarker, typeid
         }
 
         if (!topologyMapHelper.directory && !Array.isArray(data)) {
 
             topologyMapHelper.directory = data
 
                 // let rootPathLinkID = "link_" + topologyMapHelper.directory[rootPathID].terminations.join("#");
                 // this.shrinkDirectory(topologyMapHelper, [rootPathID], 1)
                 let rootPathLinkID = topologyMapHelper.directory[rootPathID].id;
                 topologyMapHelper.maxLayer = this.calculateLayerDepthV1(topologyMapHelper.directory, rootPathLinkID, 1)
                 this.changeSeekBar(1, topologyMapHelper.directory[rootPathLinkID].layerDepth + 1);
 
                 this.topologyMap.paths = [{
                     id: rootPathLinkID,
                     type: "path"
 
                 }]
                 // this.tMHelperObj.getLayers(this.map, this.topologyMap, this.geoMap, topologyMapHelper.directory, typeId, stateToDisplay, this.markerEvents.call(this), this.pathEvents.call(this));
                 // 
                 this.tMHelperObj.getLayersV1(this.map, this.topologyMap, this.geoMap, topologyMapHelper.directory, typeId, stateToDisplay, this.markerEvents.call(this), this.pathEvents.call(this), rootPathLinkID, this.handleCustomError, expandpath);
 
             
 
 
         } else {
 

         }
     }
 
     componentWillUnmount() {
         //   this.props.unGeoMapAuthInterval();
         topologyMapHelper.directory = undefined;
 
 
         this.topologyMap = {
             layers: [],
             paths: [],
         }
 
         this.selectedLayers = [];
 
         this.geoMap = {
             tileLayer: {},
             layers: []
         }
 
         this.props.resetStore();
     }
 
     expandLayerV1() {
         const {
             stateToDisplay,
             typeId
         } = this.props;
         this.clearSelection({});
         var pathExpanded = true
         var paths = [];
         var _selectedP = undefined;
         if(topologyMapHelper.directory && topologyMapHelper.directory.selectedPathID){
             if(topologyMapHelper.directory[topologyMapHelper.directory.selectedPathID].type.toLowerCase() == "path") {
                 _selectedP =topologyMapHelper.directory.selectedPathID;
                 topologyMapHelper.directory.selectedPathID = undefined;
             }
         }
         _selectedP= _selectedP && this.topologyMap.paths.filter((val,i)=>{
             
             return val.type == "path" && topologyMapHelper.directory[val.id].selectedPathID == _selectedP;
         })
         let pathsToDraw=[]
         if(_selectedP && _selectedP.length>0){
             pathsToDraw =_selectedP
         }
         else{
             pathsToDraw = this.topologyMap.paths;
         }
         pathsToDraw.forEach((pathFromLayerObj) => {
             var path = topologyMapHelper.directory[pathFromLayerObj.id];
 
             if (path) { //path may be unknown node
 
                 //skip layer expansion if pathBunle is not expanded
                 if (path.siblings && path.siblings.length > 0 && !path.selectedPathID && pathFromLayerObj.type == "path") {
                     console.log("pathBundleNotExpanded")
                     pathExpanded = false;
                     return;
                 }
                 
                 if (path.selectedPathID)// if any path selected then expand based on that path id
                 {
 
                     path = topologyMapHelper.directory[path.selectedPathID]
                     if (path.cNodes.length <= 0) {
 
                         pathExpanded = false;
                         return;
                     }
                 }
                 if (pathFromLayerObj.type == "path" || pathFromLayerObj.type == "gPath") {
                     let cNodes = path.cNodes
                         .filter((cNode) => {
                             if (cNode == "unknown")
                                 return true
                             else
                                 return /*!topologyMapHelper.directory[cNode].isCrossLink &&*/ cNode.indexOf("_CLONE_") == -1
                         })
                         .map((cNode) => {
                             if (cNode == "unknown")
                                 return {
                                     id: "link_unknown",
                                     type: "uPath"
                                 }
                             else
                                 return {
                                     id: cNode,
                                     type: "path"
                                 }
                         })
                     if (cNodes.length) {
                         _selectedP = path.id;// if no path selected but picked by some calculation of bundle path 
                     }
                     paths = paths.concat(cNodes.length > 0 ? cNodes : [{
                         id: path.id,
                         type: "gPath"
                     }])
                     //ring code:
                     var dir = JSON.parse(JSON.stringify(topologyMapHelper.directory));
                   
 
 
                     var parentRing;
                     var selectedPathID = path.selectedPathID ? path.selectedPathID : path.id;
                     
                     if (selectedPathID) {
                         //detecting ring:
                         var ccc = 0;
                         var ringPathCount = 0;
                         var ringFound;
                         var ringParentID=[];
                         var ringStartID=[];
                         var ringBody = [];
                         var ringEndID =[];
                         //var sequence = [];
             var ccterminations=[];
                         for (var i = 0; i < dir[selectedPathID].cNodes.length; i++) {
 
                             if (!dir[dir[selectedPathID].cNodes[i]]) { break; }
                             if ((dir[dir[selectedPathID].cNodes[i]].terminations[0] == dir[dir[selectedPathID].cNodes[i]].terminations[1])) {
                             
                             ccterminations.push(dir[dir[selectedPathID].cNodes[i]].terminations[0]);
                                 ccc = ccc + 1
                             } else {
                                 //sequence.push(dir[dir[selectedPathID].cNodes[i]].terminations)
 
                                 if ((dir[selectedPathID].terminations[0] == dir[dir[selectedPathID].cNodes[i]].terminations[0] && dir[selectedPathID].terminations[1] == dir[dir[selectedPathID].cNodes[i]].terminations[1])) {
                                 //not a cross connect and it is possibly a main ring branch(ring parent):
                                     ringFound = true;
                                     ringParentID.push(dir[dir[selectedPathID].cNodes[i]].id);
 
 
                                 }
                                 else if ((dir[selectedPathID].terminations[1] == dir[dir[selectedPathID].cNodes[i]].terminations[0] && dir[selectedPathID].terminations[0] == dir[dir[selectedPathID].cNodes[i]].terminations[1])) {
                                     //not a cross connect and it is possibly a main ring branch(ring parent):
                                     console.log("ringFound with reverse");
                                         ringFound = true;
                                         ringParentID.push(dir[dir[selectedPathID].cNodes[i]].id);
     
     
                                     }
                                 if (dir[selectedPathID].terminations[0] == dir[dir[selectedPathID].cNodes[i]].terminations[0] && dir[selectedPathID].terminations[1] != dir[dir[selectedPathID].cNodes[i]].terminations[1] && dir[dir[selectedPathID].cNodes[i]].terminations[0] != dir[dir[selectedPathID].cNodes[i]].terminations[1]) {
                                 //not a cross connect and it is a start of a possible ring start:
 
                                     ringPathCount = ringPathCount + 1;
                                     ringStartID.push(dir[dir[selectedPathID].cNodes[i]].id);
                                 }
                                 if (dir[selectedPathID].terminations[0] != dir[dir[selectedPathID].cNodes[i]].terminations[0] && dir[selectedPathID].terminations[1] == dir[dir[selectedPathID].cNodes[i]].terminations[1] && dir[dir[selectedPathID].cNodes[i]].terminations[0] != dir[dir[selectedPathID].cNodes[i]].terminations[1]) {
                                    // console.log("ring end found "+i);
                                     ringPathCount = ringPathCount + 1;
                                      ringEndID.push(dir[dir[selectedPathID].cNodes[i]].id);
                                 }
                                 else if(dir[selectedPathID].terminations[0] != dir[dir[selectedPathID].cNodes[i]].terminations[1] && dir[selectedPathID].terminations[1] == dir[dir[selectedPathID].cNodes[i]].terminations[0] && dir[dir[selectedPathID].cNodes[i]].terminations[0] != dir[dir[selectedPathID].cNodes[i]].terminations[1]){
                                     //console.log("ring end found after comparing with reversed order.."+i);
                                     ringPathCount = ringPathCount + 1;
                                     ringEndID.push(dir[dir[selectedPathID].cNodes[i]].id);
 
                                 }
                                 if (dir[selectedPathID].terminations[0] != dir[dir[selectedPathID].cNodes[i]].terminations[0] && dir[selectedPathID].terminations[0] != dir[dir[selectedPathID].cNodes[i]].terminations[1] && dir[selectedPathID].terminations[1] != dir[dir[selectedPathID].cNodes[i]].terminations[0] && dir[selectedPathID].terminations[1] != dir[dir[selectedPathID].cNodes[i]].terminations[1]) {
                                     
                                     //console.log('ringBody:: '+i);
                                     ringBody.push(dir[dir[selectedPathID].cNodes[i]].id);
 
                                 }
                             }
                         }
 
                         if (ringFound == true && ringPathCount > 1) {
 
                             if (!Array.isArray(dir)) { dir = Object.values(dir) }
 
                             var selectedTerminations = dir.filter((item) => {
                                 if (item.id == selectedPathID) {
                                     return item.terminations
                                 }
 
                             });
                             var selectedcnodes = selectedTerminations[0].cNodes;
                             var selectedSiblings = selectedTerminations[0].siblings;
                             selectedTerminations = selectedTerminations[0].terminations;
 
 
                             var ringMatchIndex = 0
                             var iterator;
                             var sequence = [];
                             dir.forEach(function (item, index) {
 
 
                                 if (item.type == 'Path') {
                                     //console.log(item.terminations[0] +" ::: "+item.terminations[1]+" ::::: "+selectedTerminations[0]+" ::: "+selectedTerminations[1]);
                                     if ((item.terminations[0] == selectedTerminations[0]) && (item.terminations[1] != selectedTerminations[1])) {
                                         //first item of ring
 
                                         if (item.terminations[0] != item.terminations[1]) {
                                             ringMatchIndex = 1;
                                             iterator = item.terminations[1];
                                             item.ringPath = true;
                                             item.ringPathStart = true;
                                             sequence.push(item);
                                             //console.log('possible ring start found ::: '+JSON.stringify(item.name)+" id: "+item.id);
                                         }
 
                                     }
                                     else if (ringMatchIndex == 1 && iterator && item.terminations[0] != selectedTerminations[0] && item.terminations[1] != selectedTerminations[1] && iterator == item.terminations[0] && iterator != selectedTerminations[1]) {
                                         //itermediate paths of ring:  
                                         if (item.terminations[0] != item.terminations[1]) {
                                             ringMatchIndex = 2;
                                             item.ringPath = true;
                                             sequence.push(item);
                                             iterator = item.terminations[1];
                                             //console.log('inner ring..');
                                             //console.log(sequence);
                                         }
                                     }
                                     else if ((item.terminations[0] != selectedTerminations[0]) && (item.terminations[1] == selectedTerminations[1])) {
                                         //last item of ring:
                                         if (item.terminations[0] != item.terminations[1]) {
 
                                             item.ringPath = true;
                                             item.ringPathEnd = true;
                                             sequence.push(item);
                                             //console.log("last item of ring : "+item.name+" id: "+item.id);
 
 
                                         }
                                     }
 
 
                                 }
                                 return item;
                             }
                             )
 
                             var selectedPath = dir.filter((item) => {
                                 if (selectedPathID && item.id == selectedPathID) {
                                     return item
                                 }
 
                             });
                             var ringparentItem = '';
                             dir.forEach(function (item, index) {
                                 if (item.type.toLowerCase() == 'path') {
 
 
 
                                     if (selectedPath[0].siblings && selectedPath[0].siblings.length && selectedPath[0].siblings.length > 0 && selectedPath[0].siblings[0] == item.id) {//&& selectedPath[0].cNodes.includes(item.id.replace("_CLONE_1", ""), 0)){
                                         ringparentItem = item;
 
                                     }
 
                                 }
 
 
 
                             })
 
 
                             if (ringparentItem != '') {
                                 ringparentItem.ringPath = true;
                                 ringparentItem.ringParent = true;
                                 sequence.push(ringparentItem);
                             }
 
                             if (sequence.length > 0) {
 
                                 var startIndexOfRing = paths.findIndex(x => x.id === sequence[0].id);
                                 var endIndexOfRing = paths.findIndex(x => x.id === sequence[sequence.length - 1].id);
                             }
 
                         }
                         else {
                             ringFound = false;
                         }
 
                     }
 
 
 
 
 
 
                     //Inserting the ring paths from directory based on condition://
                     //Checking if ring is found by checking the endindex of the ring. If the ring exists, create the ring data by ordering the paths accordingly.
                     // 
                     if (selectedPathID && ringFound == true) {
                         //Checking if there is a path bundle:
                         //Checking if there is a path bundle:
                         var indexOfRingStart = startIndexOfRing;
                         var indexOfRingEnd = endIndexOfRing;
                         var indexOfParentRing = endIndexOfRing + 1;
                         if (topologyMapHelper.directory[selectedPathID + '_CLONE_1']) {
                             var parentRingPath = topologyMapHelper.directory[selectedPathID + '_CLONE_1'];
                             parentRingPath = sequence[sequence.length - 1];
                         }
                         else {
                             var parentRingPath = topologyMapHelper.directory[selectedPathID];
                         }
                         var parentRingPath = topologyMapHelper.directory[ringParentID];
 
                         if (paths.filter((item) => {
                             if (item.id == sequence[0].id) {
                                 return item
                             }
 
                         }).length == 0) {
                             paths.splice(indexOfRingStart, 0, topologyMapHelper.directory[sequence[1].id]);//the first path of ring.
                         }
                         paths.forEach(function (item, index) {
                             if (ringParentID.toString().indexOf(item.id)!=-1) { item.ringParent = true; item.ringPath = true; }
                             else if (ringStartID.toString().indexOf(item.id)!=-1 ) { item.ringPathStart = true; item.ringPath = true; }
                             else if (ringEndID.toString().indexOf(item.id)!=-1) { item.ringPathEnd = true; item.ringPath = true; }
                             else if (ringBody.toString().indexOf(item.id) != -1) { item.ringPath = true; }
                         });
                        
                         //remove upaths since they break the rendering logic of rings:
                         paths = paths.filter(item => item.type !== 'uPath');
                         
                         //}
 
                         //                        paths.splice(endIndexOfRing + 1, 0, parentRingPath);
                         //                        paths.forEach(function (item, index) {
                         //                            if (index == indexOfRingStart) {
                         //                                item.ringPathStart = true;
                         //                            }
                         //                            if (index >= indexOfRingStart && index <= indexOfParentRing) {
 
                         //                                item.ringPath = true;
                         //                                if (index == indexOfParentRing) {
                         //                                    item.ringParent = true;
 
                         //                                }
                         //                                if (index == indexOfRingEnd) {
                         //                                    item.ringPathEnd = true;
 
                         //                                }
 
                         //                            }
                         //                            return item;
 
                         // })
 
 
                     }
                     else {
                         // console.log("no ring found");
                     }
                 }
             } else {
                 paths = paths.concat([{
                     id: "link_unknown",
                     type: "uPath"
                 }])
             }
 
         }, this)
 
 
         if (pathExpanded) {
             this.topologyMap.paths = paths;
             var pathError = [];
             var lPathsID = paths.filter((path) => {
                 if (path.type == "path" && topologyMapHelper.directory[path.id].noRootEquipment) {
                     pathError.push(topologyMapHelper.directory[path.id].name);
                 }
                 return path.type == "path"
             });
             if (pathError.length > 0) {
                 this.props.customError({
                     custom_error: {
                         name: 'Path is not terminated on root equipment',
                         details: pathError.join("\n\n")
                     }
                 });
                 return false;
             }
 
             //Atleast one sub path/cNode should be present to expand layer
             if (lPathsID.length > 0) {
                 this.removeExistingLayersFromMap(this.geoMap.layers, this.map);
               
                 this.tMHelperObj.getLayersV1(this.map, this.topologyMap, this.geoMap, topologyMapHelper.directory, typeId, stateToDisplay, this.markerEvents.call(this), this.pathEvents.call(this), _selectedP,this.handleCustomError,pathExpanded);
             } else {
                 //errorMessage:no layers to expand
             }
 
             //seekBar
             var lPathIDsIncludingSibNodes = []
             lPathsID.forEach(pathID => {
                 var path = topologyMapHelper.directory[pathID.id];
                 lPathIDsIncludingSibNodes.push(pathID.id)
                 lPathIDsIncludingSibNodes = lPathIDsIncludingSibNodes.concat(path.siblings && path.siblings.length > 0 ? path.siblings : [])
 
             });
 
             var lLayerDepth = lPathIDsIncludingSibNodes
                 .filter((pathID) => {
                     return pathID.id != "link_unknown"
                 })
                 .map((pathID) => {
                     return topologyMapHelper.directory[pathID].layerDepth + this.topologyMap.layers.length
                 })
 
             if (lLayerDepth.length > 0)
                 this.changeSeekBar(this.topologyMap.layers.length, Math.max(...lLayerDepth))
         }
 
     }
     //end of expand layerv1
 
     // collapseLayerV1
     collapseLayerV1() {
         const { stateToDisplay } = this.props;
         this.clearSelection();
         if (this.topologyMap.layers.length > 1) {
             let topologyLayerToCollapse = this.topologyMap.layers.pop();
             this.topologyMap.paths = this.retainPathStateV1(this.topologyMap, topologyMapHelper.directory, stateToDisplay, this.tMHelperObj.drawMarkerV1.bind(this))
             //Clearing current layer
             topologyLayerToCollapse.clearLayers();
               var layNo = this.topologyMap.layers.length;
                         var elements=document.getElementsByClassName("showLabel "+ layNo);
                        if(elements.length>0){
                            [].forEach.call(elements, function(ele){
                        ele.style.display='block';
                        
                        })
                        
                        }
                        
                        
             // this.removeExistingLayersFromMap(this.geoMap.layers, this.map);
             // let geoLayerToCollapse = this.geoMap.layers.pop();
             // var layers = this.geoMap.layers[this.geoMap.layers.length - 1];
             // layers.addTo(this.map);
         }
         //seekBar
         var lPathsID = this.topologyMap.paths.filter((path) => {
             return path.type == "path"
         })
         var lLayerDepth = lPathsID
             .filter((pathID) => {
                 return pathID.id != "link_unknown"
             })
             .map((pathID) => {
                 var id = topologyMapHelper.directory[pathID.id].selectedPathID || pathID.id
                 return topologyMapHelper.directory[id].layerDepth + this.topologyMap.layers.length
             })
 
         // if (lLayerDepth.length > 0)
         this.changeSeekBar(this.topologyMap.layers.length, Math.max(...lLayerDepth))
     }
 
     calculateLayerDepthV1(directory, id, layer) {
         
         //NOTE: Layer calculation will work now without any bundle path/multiple path within same layer
         var lLayerDepth = 0;
         directory[id].layer = layer;
         if (directory[id].cNodes.length > 0) {
             var lLayerDepth = directory[id].cNodes.filter((val, i) => {
                 return val != "unknown";
             }).map((cNode) => {
                 return this.calculateLayerDepthV1(directory, cNode, layer + 1)
             });
 
             var lLayerDepth = Math.max(...lLayerDepth) + 1;
             directory[id].layerDepth = lLayerDepth;
             return lLayerDepth;
         }
         else {
             directory[id].layerDepth = lLayerDepth;
             return lLayerDepth;
         }
     }
     retainPathStateV1(layer, directory, stateToDisplay, drawMarkerV1) {
         //Changing layer.path state to previous layer
         var path = [];
         var layNo = layer.layers.length;
         layer.layers[layer.layers.length - 1].eachLayer((layer) => {
 
             //Change path State
             if (layer.options.id) {
                 if (layer.options.type == "path")
                     layer.setStyle({
                         opacity: 1
                     })
 
                 path.push(Object.assign({}, {
                     id: layer.options.id,
                     type: layer.options.type
                 }))
             }
 
             //Update marker to display label
            
             if (layer.options.type && layer.options.type == "marker") {
                 layer.options.isShowLabel = true;
                 layer.setIcon(drawMarkerV1(directory[layer.options.id], "marker", stateToDisplay, true, undefined, layNo))
             }
         })
 
         return path
     }
 
     render() {
         //className="expanded"
 
         return (
             <div key="2"
                 id="topologyMapContainer"
                 className={
                     "topologyMapContainer size_" + this.props.statusPanel.size.toLowerCase() + (this.props.statusPanel.displayLabel ? " showText" : "")
                 } >
                 <div className="statusPanelWrapper"
                     style={
                         {
                             height: this.props.style.height,
                             position: "absolute",
                             bottom: "0px"
                         }
                     } >
                     <StatusPanel {...this.props.statusPanel}
                         show={this.state.showStatusPanel}
                         onChange={this.props.updateStatusPanel.bind(this)}
                         style={this.state.style}
                     />
                 </div>
                 {this.props.modalData && <TopologyModal
                     data={this.props.modalData}
                     entityClick={this.props.entityClick.bind(this)}
                     onMouseEnter={this.toolTipEvents().enter}
                     onMouseLeave={this.toolTipEvents().leave}
                     onPathClick={this.toolTipEvents().pathclick}
                     isClicked={this.state.modalClicked}
                     style={this.state.modalPosition}
                     onClose={this.toolTipEvents().close}
                 />
                 }
                 <div ref="topologyMap" id="topologyMap"></div>
                 <span id="snackbarID" ></span>
                 <span id="progressIndicatorCircularIDComp" ></span>
                 <span id="modalWindow" ></span>
 
                 <div ref="hiddenMap" id="hiddenMap" > </div>
                 {this.props.pathName && <strong id="toplogyMapLabel" >
                     {this.props.pathName} 
                 </strong>}
             </div>
         )
     }
 }
 
 function mapStateToProps(state) {
     return state.topologyMap
 }
 
 function mapDispatchToProps(dispatch) {
     return bindActionCreators({
         getPathName: getPathName,
         clearPathName: clearPathName,
         getRootPathID: getRootPathID,
         getTopologyData: getTopologyData,
         updateStatusPanel,
         updateStatusPanel,
         updateModalInfo: updateModalInfo,
         updateTypeID: updateTypeID,
         resetStore: resetStore,
         customError: customError,
         getMultiEntityTopologyData: getMultiEntityTopologyData
     }, dispatch);
 }
 
 export default connect(mapStateToProps, mapDispatchToProps)(TopologyMapRoot);
 
 
 