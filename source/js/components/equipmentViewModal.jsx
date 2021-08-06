/**
 *  
 * Component : equipmentViewContainer.js
 *
 * @version 1.0
 * @author Anil
 * @ignore
 */

 /**
 * @class EquipmentView
 * @memberof SUREUI.components
 *
 * @property {array}   [data=[ ]]       Predefined data for a component. It should be an array of object.
 * @property {string}  data.id          Unique ID for a marker.
 * @property {string}  data.latitude    Latitude of the location where marker need to display. 
 * @property {string}  data.longitude   Longitude of the location where marker need to display. 
 * @property {string}  data.name        Name of the location where marker need to display. 
 * @property {object}  [data.state]     Status object. It can contain multiple state. Pass in each state as a property of an object. <pre><code>{"AlarmState" : ["MAJOR", "MINOR", "WARNING", "CRITICAL"]}</code></pre>
 * @property {object}  [data.detail]    Reserved object to store additional information. * 
 * @property {string}  tileServer    Tile Server url for map tiles.
 * @property {object}  [dataSource]      Configuartion for SURE UI data model.
 * @property {string}  [dataSource.method = GET] Http method for SURE REST API.
 * @property {string}  dataSource.url  URL for SURE REST API.
 * @property {object}  [dataSource.headers] Additional headers which usually includes metadata and authorization info.
 * @property {object}  [markers]        Marker icon configuration
 * @property {boolean} [markers.displayLabel = true ] Enable/Disable marker text.
 * @property {object}  [markers.stateToDisplay] Status to display in a marker. It can contain multiple state. Pass in each state as a property of an object. <pre><code>{"AlarmState" : ["MAJOR", "MINOR", "WARNING", "CRITICAL"]}</code></pre>
 * @property {object}  [style]         To override default styles. It should be an object. Pass in any styles you'd like and they will be applied inline on the input.
 * @property {object}  statusPanelConfig Properties of {@link SUREUI.components.StatusPanel|StatusPanel} component
 * 
 *
 * @example <caption>Access component as a Library</caption>
 *
 * HTML
 *  <div id="equipmentView"></div>
 *
 * JS
 *  
 *  
 *  var EuipmentMap = SUREUI.components.EuipmentMap;
 *
 *  let dataSource = {
 *  method: "POST",
 *  url: "http://135.250.139.104:8081/oss/sure/locations?limit=100&expand=Equipment.State&q=SELECT;[SureName,Longitude,Latitude,UUID,Equipment]"
 *  headers : {
 *      Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
 *      tenantId: 'GlobalTenant',
 *      ugId: 'Admin_UserGroup',
 *      appId: 'SURE_APP',
 *      Accept: 'application/json',
 *      TransformationEnabled: true,
 *      'Content-Type': 'application/json',
 *      'Response-Type': 'flat'
 *      }
 *  };
 * 
 *  var props = {
 *      dataSource : dataSource,
 *      tileServer : "http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png"
 *  }
 * 
 *  var equipmentViewComponent = React.createElement(EuipmentView, props);
 *  ReactDOM.render(equipmentViewComponent, document.getElementById("equipmentView"));
 * 
 * 
 *  @example <caption>Access component through iframe</caption>
 * 
 *  HTML
 *      <iframe id="equipmentView" src="http://135.250.139.99:8092/" ></iframe>
 * 
 *  JS
*	window.onload = function onloadFn(params) {
*	
*	
*	var EquipmentView = SUREUI.components.EquipmentView;
*	var DetailsPanel = SUREUI.components.DetailsPanel;
*	var passRowDataDetail = function passRowData(selectedRowData) {
*	return (selectedRowData);
*	}
*	var editEntity = function editRow(params) {
*	return (params);
*	}
*	var deleteEntityRow = function deleteRow(params) {
*	return (params);
*	}
*	// to pass the current entity selected from taversal to SURE UI
*	var getTraversalEntity = function traversalEntity(traversalEntity) {
*	return (traversalEntity);
*	}
*	var getParentTraversal = function parentTraversal(parentTraversal){
*	// console.log(parentTraversal);
*	return (parentTraversal);
*	}
*	var dataRowCount = function dataCount(count) {
*	return (count);
*	}
*	var columnPreferenceState = function columnPreference(columnState)
*	{
*	// return(columnState);
*	console.log('columns');
*	console.log(columnState);
*	}
*	let EVData = {
*	//http://135.250.139.92:8183/osscm/commons/catalog/
*	method: "POST",
*	//metadataUrl: "http://135.250.139.92:8183/osscm/commons/catalog/",
*	// metadataUrl: "http://135.250.139.92:8183/osscm/commons/catalog/",
*	metadataUrl: "https://135.250.139.137:28443/osscm/commons/catalog/",
*	//https://135.250.193.232
*	//metadataUrl: "https://135.250.139.92:28443/osscm/commons/catalog/",
*	//domain: "http://135.250.139.91:8080/oss/sure/",//
*	//http://135.250.139.91:8080/oss/sure/topology
*	//domain: "http://135.250.139.92:8080/oss/sure/topology",//https://135.250.139.92:28443
*	domain: "https://135.250.139.106:28443/oss/sure/topology",
*	rowurl: "equipments?criteria=onlyRoot&limit=100&page=1&expand=Capacity,State",
*	selectedEntity: "EquipmentHierarchy",
*	selectedEntityType: "Equipment",
*	selectedUUID:"accdbe44-75d1-4a9b-979b-c11b98baa27b",
*	//selectedUUID : "7e2bed02-c702-11e8-8e89-0242ac110004",
*	//selectedUUID: "94c7f45c-f8dd-4072-b23d-a0ab2861db4b",
*	//selectedUUID: "e4d8c7b5-43c7-418c-b201-0ddc5190c744",//This is an example of root 
*	equipment.
*	selectedSureName:"Selected Equip123",
*	onClose:onClose,
*	//e4d8c7b5-43c7-418c-b201-0ddc5190c744
*	//                 columnResponse:[

*	//  {visibleColumn: "Severity", entityAttribute: "STATE_AlarmState"},

*	// {visibleColumn: "Type", entityAttribute: "Type"},

*	// {visibleColumn: "Sub Type", entityAttribute: "SubType"},

*	//  {visibleColumn: "Last Update Date", entityAttribute: "LastUpdateDate"},

*	//  {visibleColumn: "Port Name", entityAttribute: "portName"}],


*	// enable for tenant
*	// metadataUrl: "http://135.250.139.119:8080/osscm/commons/catalog/",
*	// domain: "http://135.250.139.119:8080/oss-uam/sure/",
*	// rowurl: "tenants",
*	// selectedEntity: "tenants",
*	// enable for groups
*	//  metadataUrl: "http://135.250.139.97:8080/osscm/commons/catalog/",
*	// domain: "http://135.250.139.119:8080/oss-uam/sure/",
*	// rowurl: "realms/SURE/groups",
*	// selectedEntity: "groups",
*	// enable for users
*	// metadataUrl: "http://135.250.139.119:8080/osscm/commons/catalog/",
*	// domain: "http://135.250.139.119:8080/oss-uam/sure/",
*	// rowurl: "public/tenants/GlobalTenant/users",
*	//  selectedEntity: "users",
*	// rowurl: "userGroups?expand=Tenant,Profile&q=Tenant.SureName;EQUALS;T0",
*	// selectedEntity: "usergroups",
*	//  metadataUrl: "http://135.250.139.119:8080/osscm/commons/catalog/",
*	//  domain: "http://135.250.139.97:8080/oss-uam/sure/",
*	// rowurl: "equipments?criteria=onlyRoot&limit=100&page=1&expand=Capacity,State",
*	// selectedEntity: "Equipment",
*	Columnurl:
*	"specifications?q=specName;EQUALS;EntityAttribute&q=subType;EQUALS;English",
*	imageIconurl: "",
*	passRowData: passRowDataDetail,
*	editRow: editEntity,
*	deleteRow: deleteEntityRow,
*	traversalEntity: getTraversalEntity,
*	parentTraversal:getParentTraversal,
*	dataCount: dataRowCount,
*	columnPreference:columnPreferenceState,
*	//             traversalClick: {
*	//     "request": {
*	//       "level": 1
*	//     }
*	//     , "response": {
*	//       "responseType": "List"
*	//       , "entity": ["Path"]
*	//       , "selfJoin": "true"
*	//       , "responseFilter": [{
*	//         "for": "Equipment"
*	//         , "filter": ["UUID;NOT EQUAL;68d86be9-2991-11e7-bd5c-005056a8590e" ]
*	//       }
*	//       ]
*	//     }
*	//     , "expand": ["Capacity", "State"]
*	//     , "searchFilter": [{
*	//       "for": "Equipment"
*	//       , "filter": ["UUID;EQUALS;68d86be9-2991-11e7-bd5c-005056a8590e"]
*	//     }
*	//     ]
*	//   },
*	//
*	searchPayload:{"response":{"responseType":"List","entity":["Equipment"]},"expand":["Capa
*	city"],"searchFilter":[{"for":"Equipment","filter":["DiscoveredName;CONTAINS;Test"]}]},
*	stateConfig: [{
*	stateType: "AlarmState",
*	properties: [
*	{ state: "WARNING", priority: "4", color: "#42A5F5", badgeText: "w" },
*	{ state: "CRITICAL", priority: "1", color: "#BE0006", badgeText: "C" },
*	{ state: "MAJOR", priority: "2", color: "#FF7900", badgeText: "M" },
*	{ state: "MINOR", badgeText: "m", priority: "3", color: "#FFCC00" }
*	]
*	}],
*	rowMenu: ["Edit","Delete","Add","","Graph"],
*	nameIcon:false,
*	clientSideEnabled : false,
*	searchChips:undefined
*	//,searchChips:[{"text":"Group : NT","value":[{"id":"first
*	field","value":"Group","dbName":"SureName"},{"id":"condition","value":":"},{"id":"query
*	170","value":"NT"}],"itemId":"173"},{"text":"Profile = Profile","value":[{"id":"first
*	field","value":"Profile","dbName":"Profile"},{"id":"condition","value":"="},{"id":"query
*	178","value":"Profile"}],"itemId":"180"}]  

*	};
*	if(params.UUID){
o	console.log(params);
*	EVData.selectedUUID=params.UUID;
*	}
*	if(params.selectedEntityType){
*	EVData.selectedEntityType=params.selectedEntityType;
*	}
*	//b41a7354-6007-11e8-a02e-02427178b0ab
*	//                e4d8c7b5-43c7-418c-b201-0ddc5190c744
*	//accdbe44-75d1-4a9b-979b-c11b98baa27b
*	EVData.searchPayload=
*	{"request":{"origin":{"@class":EVData.selectedEntityType,"UUID":EVData.selectedUUID},"in
*	lusion":{"gInclude":[EVData.selectedEntityType]},"gDirection":"BOTH"},"response":{"respons
*	eType":"SubTree","entity":["Equipment", "Location"]},"expand":["Equipment.State"]},
*	EVData.customTraversal=[{
*	name: "CH:AOR",
*	icon: "",
*	callbackFunc: function test(){
*	console.log("AOR");
*	},
*	filter: ["12345","6f2d91bf-cf75-11e7-8468-005056a8590e"] 
*	},
*	{
*	name: "CH:VS",
*	icon: "",
*	callbackFunc: function test(){
*	console.log("VS");
*	},
*	filter: "[12345,'asdfasdf'] "
*	},
*	{
*	name: "Graph",
*	icon: "",
*	entities: ["Equipment", "Service"],
*	callbackFunc: function test(a,b){
*	console.log("Graph");
*	}}
*	];
*	EVData.requestHeaders = {
*	Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
*	tenantId: 'T0',
*	ugId: 'Admin_UserGroup',
*	appId: 'SURE_APP',
*	Accept: 'application/json',
*	TransformationEnabled: true,
*	'Content-Type': 'application/json',
*	'Response-Type': 'flat',

*	}

*	var equipmentViewComponent = React.createElement(EquipmentView, EVData);
*	ReactDOM.render(equipmentViewComponent,
*	document.getElementById("equipmentView"));
*	//ReactDOM.render(equipmentViewComponent, document.getElementById("detailsPanel"));

*	}

*	var data = [
*	{
*	"label": "Equipment Name",
*	"value": "SURE UI Equipment Name"
*	},
*	{
*	"label": "Type",
*	"value": "SURE UI Type"
*	},
*	{
*	"label": "Sub Type",
*	"value": "SURE UI Sub Type"
*	},
*	{
*	"label": "Discovered Name",
*	"value": "SURE UI Discovered Name"
*	},
*	{
*	"label": "Peak Service Bandwidth(Gbs)",
*	"type": "iframe",
*	"URL": "http://localhost/angularChart",
*	"data": { test: true }
*	}
*	]

*	function onClose() {
*	console.log("inside onclose..");
*	var detailPanelElement = document.getElementById("detailsPanelWrapper")
*	detailPanelElement.classList.remove("expanded");
*	
*	
*	ReactDom.unmountComponentAtNode(document.getElementById("detailsPanel"));
*	}

*	function onClose(close) {
*	if(close){


*	console.log("inside onclose.."+close);

*	
*	
*	ReactDom.unmountComponentAtNode(document.getElementById("equipmentView"));
*	}
*	}

*	function unmountEVData() {
*	
*	
*	var EquipmentView = SUREUI.components.EquipmentView;
*	ReactDom.unmountComponentAtNode(document.getElementById("equipmentView"));
*	}

 * 
 *      var ifarmeObj = {
 *              type: "ACCESS_SURE_UI_COMPONENT",
 *               payload: {
 *                   componentKey: "EquipmentView",
 *                   properties: props
 *             }
 *        }
 * 
 *        iframe.contentWindow.postMessage(ifarmeObj, 'http://135.250.139.99:8092/'); 
 * 

 */



import React, { Component } from 'react';
import { Provider } from 'react-redux';
import EquipmentListModal  from '../containers/equipmentViewContainerModal';
import store from '../store/store';
import "../../styles/equipmentView.css"
class EquipmentViewModal extends React.Component{
     render(){
        return(
            <Provider store={store}>
                
    
<EquipmentListModal gridData = {this.props} />
                
                
                
            </Provider>
        )        
    }
}

export default EquipmentViewModal