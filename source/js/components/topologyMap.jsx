/**
 *  
 * Component : topologyMap.js
 *
 * @version 18.10
 * @author Gowtham.S
 * @ignore
 */

/**
* @class TopologyMap
* @memberof SUREUI.components
*
* @property {array}   [data=[ ]]       Predefined data for a component. It should be an array of object.
* @property {string}  data.id          Unique ID for a marker/path.
* @property {string}  data.name        Name of the location where marker need to display. 
* @property {string}  data.type        Entity type(e.g. "Path"). 
* @property {object}  [data.state]     Status object. It can contain multiple state. Pass in each state as a property of an object. <pre><code>{"AlarmState" : ["MAJOR", "MINOR", "WARNING", "CRITICAL"]}</code></pre>
* @property {object}  [data.detail]    Reserved object to store additional information. * 
* @property {object}  [dataSource]      Configuartion for SURE UI data model.
* @property {string}  [dataSource.method = POST] Http method for SURE REST API.
* @property {string}  dataSource.url  URL for SURE REST API.
* @property {object}  [dataSource.headers] Additional headers which usually includes metadata and authorization info.
* @property {object}  [rootPathID] Root pathID from where the path has to drill down.
* @property {object}  [style]         To override default styles. It should be an object. Pass in any styles you'd like and they will be applied inline on the input.
* @property {object}  statusPanelConfig Properties of {@link SUREUI.components.StatusPanel|StatusPanel} component
* 
*
* @example <caption>Access component as a Library</caption>
*
* HTML
*  <div id="equipmentMapView"></div>
*
* JS
* 
* 
* var TopologyMap = SUREUI.components.TopologyMap;

* var dataSource = {
* method: "POST",
* payload: {
* 	"request": { "origin": { "@class": "Service", "UUID": "4f102405-02f3-4ad4-a995-608655e900e3"}, "inclusion": { "gInclude": ["Service", "Path", "Endpoint", "FCP", "Equipment"] }, "gDirection": "OUTGOING" }, "response": {
* 		"responseType": "SubTree", "columnFilter": [{
* 			"for": "Entity",
* 			"filter": ["SureName", "UUID", "SubType"]
* 		}
* 		]
* 	}, "expand": ["State"]
* },
* url: "https://135.250.193.236:28443/oss/sure/topology?limit=999999&traverse=BFS",
* headers: {
* 	"Accept": "application/json",
* 	"tenantId": "T0",
* 	"ugId": "Admin_UserGroup",
* 	"appId": "SURE_APP",
* 	"Authorization": "Basic YWRtaW46YWRtaW5AMTIz",
* 	"Content-Type": "application/json",
* }
* }

* var props = {
* rootPathID: "UUID-P1",
* dataSource: dataSource,
* pathClick: function(items){
* 	debugger;
* },
* markerClick: function(items){
* 	debugger;
* },
* onError: function(items){
* 	console.log(items);
* },

* //data: data,
* stateToDisplay: {},
* statusPanel: {
* 	displayLabel: true,
* 	size: "M",
* 	style: {
* 		width: "240px",
* 		zIndex: 401,
* 	},
* 	groupToShow: "Badge Status Indication",
* 	status: [
* 		{
* 			group: "marker",
* 			text: "Badge Status Indication",
* 			value: "None",
* 			items: [
* 				{
* 					text: "None",
* 					label: "None",
* 					values: []
* 				},
* 				{
* 					text: "AORAlarmState",
* 					label: "Alarms",
* 					values: [{
* 						text: "Critical",
* 						badge: "C",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#be0006", "C")),
* 						color: "#be0006",
* 						enabled: true
* 					},
* 					{
* 						text: "Major",
* 						badge: "M",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#ff7900", "M")),
* 						color: "#ff7900",
* 						enabled: true
* 					},
* 					{
* 						text: "Minor",
* 						badge: "m",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#ffcc00", "m")),
* 						color: "#ffcc00",
* 						enabled: true
* 					},
* 					{
* 						text: "Warning",
* 						badge: "w",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#42a5f5", "w")),
* 						color: "#42a5f5",
* 						enabled: true
* 					},
* 					{
* 						text: "Cleared",
* 						badge: "cl",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#06bfa9", "cl")),
* 						color: "#06bfa9",
* 						enabled: true
* 					}
* 					]
* 				}
* 			]
* 		},
* 		{
* 			group: "marker",
* 			text: "Marker Status Indication",
* 			value: "None",
* 			items: [
* 				{
* 					text: "None",
* 					label: "None",
* 					values: [],
* 					type: "radioButton"
* 				},
* 				{
* 					text: "OperationalState",
* 					label: "Operational State",
* 					values: [{
* 						text: "Down",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#be0006", "")),
* 						color: "#be0006",
* 						enabled: true
* 					}, {
* 						text: "Up",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#8cc640", "")),
* 						color: "#8cc640",
* 						enabled: true
* 					}
* 					]
* 				},
* 				{
* 					text: "AdministrativeState",
* 					label: "Administrative State",
* 					values: []
* 				},
* 			]
* 		},
* 		{
* 			group: "path",
* 			text: "Path Status Indication",
* 			value: "None",
* 			items: [
* 				{
* 					text: "None",
* 					label: "None",
* 					values: []
* 				},
* 				{
* 					text: "AORAlarmState",
* 					label: "Alarms",
* 					values: [{
* 						text: "Critical",
* 						badge: "C",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#be0006", "C")),
* 						color: "#be0006",
* 						enabled: true
* 					},
* 					{
* 						text: "Major",
* 						badge: "M",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#ff7900", "M")),
* 						color: "#ff7900",
* 						enabled: true
* 					},
* 					{
* 						text: "Minor",
* 						badge: "m",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#ffcc00", "m")),
* 						color: "#ffcc00",
* 						enabled: true
* 					},
* 					{
* 						text: "Warning",
* 						badge: "w",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#42a5f5", "w")),
* 						color: "#42a5f5",
* 						enabled: true
* 					},
* 					{
* 						text: "Cleared",
* 						badge: "cl",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#06bfa9", "cl")),
* 						color: "#06bfa9",
* 						enabled: true
* 					}]
* 				},
* 				{
* 					text: "OperationalState",
* 					label: "Operational State",
* 					values: [{
* 						text: "Down",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#be0006", "")),
* 						color: "#be0006",
* 						enabled: true
* 					}, {
* 						text: "Up",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#8cc640", "")),
* 						color: "#8cc640",
* 						enabled: true
* 					}
* 					]
* 				},
* 			]
* 		}]
* }

* }

* var topologymapComponent = React.createElement(topologyMap, props);

* ReactDOM.render(topologymapComponent, document.getElementById("topologyMap"));

* function drawSVG(color, badge) {
* var svg = '<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="mapviewsettingssvg" viewBox="0 0 6 6" width="6" height="6">\
* 		 <circle cx="3" cy="3" r="3" fill="'+ color + '"/><text x="3" y="3" text-anchor="middle" font-family="Arial" style="font-weight: bold; font-size:20%"  fill="#f9fbfd" dy=".3em">' + badge + '</text>\
* 		</svg>';
* return svg
* }

* 
*  @example <caption>Access component through iframe</caption>
* 
* HTML
* <iframe id="equipmentMap" src="http://135.250.139.99:8092/" ></iframe>

* JS
* var iframe = document.getElementById('topologyMap');

* var props = {
* rootPathID: "UUID-P1",
* dataSource: dataSource,
* pathClick: function(items){
* 	debugger;
* },
* markerClick: function(items){
* 	debugger;
* },
* onError: function(items){
* 	console.log(items);
* },

* //data: data,
* stateToDisplay: {},
* statusPanel: {
* 	displayLabel: true,
* 	size: "M",
* 	style: {
* 		width: "240px",
* 		zIndex: 401,
* 	},
* 	groupToShow: "Badge Status Indication",
* 	status: [
* 		{
* 			group: "marker",
* 			text: "Badge Status Indication",
* 			value: "None",
* 			items: [
* 				{
* 					text: "None",
* 					label: "None",
* 					values: []
* 				},
* 				{
* 					text: "AORAlarmState",
* 					label: "Alarms",
* 					values: [{
* 						text: "Critical",
* 						badge: "C",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#be0006", "C")),
* 						color: "#be0006",
* 						enabled: true
* 					},
* 					{
* 						text: "Major",
* 						badge: "M",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#ff7900", "M")),
* 						color: "#ff7900",
* 						enabled: true
* 					},
* 					{
* 						text: "Minor",
* 						badge: "m",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#ffcc00", "m")),
* 						color: "#ffcc00",
* 						enabled: true
* 					},
* 					{
* 						text: "Warning",
* 						badge: "w",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#42a5f5", "w")),
* 						color: "#42a5f5",
* 						enabled: true
* 					},
* 					{
* 						text: "Cleared",
* 						badge: "cl",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#06bfa9", "cl")),
* 						color: "#06bfa9",
* 						enabled: true
* 					}
* 					]
* 				}
* 			]
* 		},
* 		{
* 			group: "marker",
* 			text: "Marker Status Indication",
* 			value: "None",
* 			items: [
* 				{
* 					text: "None",
* 					label: "None",
* 					values: [],
* 					type: "radioButton"
* 				},
* 				{
* 					text: "OperationalState",
* 					label: "Operational State",
* 					values: [{
* 						text: "Down",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#be0006", "")),
* 						color: "#be0006",
* 						enabled: true
* 					}, {
* 						text: "Up",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#8cc640", "")),
* 						color: "#8cc640",
* 						enabled: true
* 					}
* 					]
* 				},
* 				{
* 					text: "AdministrativeState",
* 					label: "Administrative State",
* 					values: []
* 				},
* 			]
* 		},
* 		{
* 			group: "path",
* 			text: "Path Status Indication",
* 			value: "None",
* 			items: [
* 				{
* 					text: "None",
* 					label: "None",
* 					values: []
* 				},
* 				{
* 					text: "AORAlarmState",
* 					label: "Alarms",
* 					values: [{
* 						text: "Critical",
* 						badge: "C",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#be0006", "C")),
* 						color: "#be0006",
* 						enabled: true
* 					},
* 					{
* 						text: "Major",
* 						badge: "M",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#ff7900", "M")),
* 						color: "#ff7900",
* 						enabled: true
* 					},
* 					{
* 						text: "Minor",
* 						badge: "m",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#ffcc00", "m")),
* 						color: "#ffcc00",
* 						enabled: true
* 					},
* 					{
* 						text: "Warning",
* 						badge: "w",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#42a5f5", "w")),
* 						color: "#42a5f5",
* 						enabled: true
* 					},
* 					{
* 						text: "Cleared",
* 						badge: "cl",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#06bfa9", "cl")),
* 						color: "#06bfa9",
* 						enabled: true
* 					}]
* 				},
* 				{
* 					text: "OperationalState",
* 					label: "Operational State",
* 					values: [{
* 						text: "Down",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#be0006", "")),
* 						color: "#be0006",
* 						enabled: true
* 					}, {
* 						text: "Up",
* 						icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG("#8cc640", "")),
* 						color: "#8cc640",
* 						enabled: true
* 					}
* 					]
* 				},
* 			]
* 		}]
* }

* }

* var ifarmeObj = {
* 	  type: "ACCESS_SURE_UI_COMPONENT",
* 	   payload: {
* 		   componentKey: "EquipmentMap",
* 		   properties: props
* 	 }
* }

* iframe.contentWindow.postMessage(ifarmeObj, 'http://135.250.139.99:8092/'); 
*/

import React, { Component } from 'react';
import { Provider } from 'react-redux';
import TopologyMapRoot from '../containers/topologyMapContainer'
import store from '../store/store';
import {
    Snackbar, ProgressIndicatorCircular, AlertDialogError
} from '@nokia-csf-uxr/csfWidgets';
//Add Provider to the root
class TopologyMap extends Component {
    onError(err, info) {
        //calling Error Boundries 
        var errorOptions = {
            id: "errorDialog",
            onClose: function () {
                ReactDOM.unmountComponentAtNode(document.getElementById("errorDialog"));
            }
        };

        if (err && err.response && err.response.status && err.response.status == 400) {
            errorOptions['title'] = "Network Error",
            errorOptions['errorText'] = "Network Error",
            errorOptions['detailsText'] = "Failed to retrieve Data."
        }
        else {
            errorOptions['title'] = "Error",
            errorOptions['errorText'] = "Data Parsing Error",
            errorOptions['detailsText'] = "An unknown error occured."
        }
        var component = React.createElement(AlertDialogError, errorOptions);
        ReactDOM.render(component, document.getElementById("errorDialog"));

    }
    componentDidCatch(err, info) {
        this.onError(err, info);
    }
    render() {
        this.state = { progressBarVisibility: this.props.progressBarVisibility }
        return (
            <Provider store={store}>
                <TopologyMapRoot {...this.props} />
            </Provider>
        )
    }
}

export default TopologyMap
