/**
 *  
 * Component : geoMap.js
 *
 * @version 1.0
 *
 *
 */

/**
 * @class GeoMap
 * @memberof SUREUI.components
 *
 * @property {object}  options                                  Configuartion for SURE UI data model.
 * @property {array}   [options.Geodata = []]                   Predefined data for a component. It should be an array of object.
 * @property {array}   options.Geodata.locations                Location details to plot on Map. It should be an array of object.
 * @property {string}  options.Geodata.locations.SureName       Location Name to plot on Map.
 * @property {string}  options.Geodata.locations.Latitude       Latitude of the location where marker will display.
 * @property {string}  options.Geodata.locations.Longitude      Longitude of the location where marker will display
 * @property {object}  options.Geodata.locations.Attaches       Other details for drawing markers as Type, Subtype,Alarm State <pre><code>{"Attaches": {"Type": "LCTP","SureName": "Port A/1-FCP","DisplayName": "Port A/1-FCP","state": {"AlarmState": "MAJOR"}}}</code></pre>
 * @property {array}   options.Geodata.path                      Path details to plot on Map between locations defined. It should be an array of object.
 * @property {string}  options.Geodata.path.Type                 Type of path to be markedon map.
 * @property {string}  options.Geodata.path.SureName             Name of path to be plotted on Map.
 * @property {object}  [options.Geodata.path.state]              Status object. It can contain multiple state. Pass in each state as a property of an object. <pre><code>{"AlarmState" : ["MAJOR", "MINOR", "WARNING", "CRITICAL"]}</code></pre>
 * @property {array}   [options.alarmStatus = []]                 Predefined data for alarm status of a component. It should be an array of object. 
 * @property {string}  options.alarmStatus.stateType              Define Alarm State type as AlarmState,Operational State etc.
 * @property {array}   options.alarmStatus.properties             Defined Properties of Alarms. It should be an array of object.
 * @property {string}  options.alarmStatus.properties.state       Defined name of Alarm.
 * @property {string}  options.alarmStatus.properties.priority    Defined priority of Alarm. It has to be a number. Priority is handeled in ascending order.
 * @property {string}  options.alarmStatus.properties.color       Defined color of Alarm.The markers and paths with the alarm will be of the defined color. It has to be HEX COLOR CODE. 
 * @property {string}  options.methodGeo                          POST Http method for SURE REST API.
 * @property {string}  options.methodAlarms                       GET Http method for SURE REST API of ALARM STATUS.
 * @property {string}  options.metadataUrl                        Http method for SURE REST API METADATA.
 * @property {string}  options.domain                             Http domain for SURE REST API.
 * @property {string}  options.topourl                            URL for SURE REST  to render Geo Map Data.
 * @property {string}  options.Alarmurl                           URL for SURE REST  to render Alarm Status Data.
 * @property {object}  [options.geoDataUnmount]                   Function/Object with the component call to mount other component once Geo Map is unmounted.
 * @property {object}  options.AalrmrequestHeaders                Additional headers for Aalrm Status API which usually includes authorization info.
 * @property {object}  options.requestHeaders                     Additional headers for Geo Map API which usually includes authorization info.
 * @property {string}  options.currentEntity                      Current Entity on which Geo Map Loads.
 * @property {string}  options.iconBaseUrl                        Url of folder location where the component resides to load the icons with absolute path
 * @property {string}  options.selectedEntityRow                  Selected Entity Row Data on which Geo Map Loads.
 
 * @example {@lang xml}
 *
 * @example <caption>Access component as a Library</caption>
 *
 * HTML
 * <div id="geoMapView"></div>
 * <span id="infoDialog"></span>
 *
 * JS
 * 
 * 
 * var geoMap = SUREUI.components.GeoMap;
 *     var geoDataUnmount = function(x){
 *        if(x){
 *            ReactDOM.render(dataGridComponent, document.getElementById("dataGrid"));
 *        }
 *    }
 *
 * let options = {
 *               methodGeo: "POST",
 *               methodAlarms: "GET",
 *              metadataUrl: "http://135.250.193.220:8081/osscm/commons/catalog/",
 *              domain: "http://135.250.193.220:8081",
 *             topourl: "/oss/sure/topology",
 *              Alarmurl : "specifications?q=specName;EQUALS;AlarmState;ic,specName;EQUALS;OperationalState;ic&q=subType;EQUALS;State&q=specType;EQUALS;State;ic&fullTree=true",
 *              style: {
 *                 height: window.innerHeight,
 *                 width: window.innerWidth
 *             }
 *         };
            
 *         options.geoDataUnmount = geoDataUnmount;
        
 *         options.AalrmrequestHeaders = {
 *            Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
 *           tenantId: 'GlobalTenant',
 *           ugId: 'Admin_UserGroup',
 *           appId: 'SURE_APP',
 *           Accept: 'application/json',
 *           TransformationEnabled: false,
 *          'Content-Type': 'application/json',
 *          'Response-Type': 'normal'
 *      };
            
 *     options.requestHeaders = {
 *          Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
 *          tenantId: 'GlobalTenant',
 *         ugId: 'Admin_UserGroup',
 *         appId: 'SURE_APP',
 *          Accept: 'application/json',
 *          TransformationEnabled: true,
 *         'Content-Type': 'application/json',
 *         'Response-Type': 'flat'
 *      };
            
 *     options.currentEntity = "";
            
 *      options.iconBaseUrl = "";
            
 *   options.selectedEntityRow =   {
 *                        "CreatedByAppId": "SURE_APP",
 *                        "CreationDate": "2017-10-06T15:51:19.559+05:30",
 *                        "CreatedByUgId": "GlobalTenant_Admin_UserGroup",
 *                       "UpdatedByUgId": "GlobalTenant_Admin_UserGroup",
 *                       "SubType": "LSP",
 *                       "Category": "SERVICE",
 *                       "DiscoveryLevel": "Level4",
 *                       "CreatedByTenantId": "GlobalTenant",
 *                       "Template Name": "TestPath",
 *                      "CAPACITY_Sub_caps": "125 Mbps",
 *                      "Name": "TestingPath",
 *                      "Template Version": "1.0",
 *                      "CreatedByUserId": "admin",
 *                      "Type": "P2P Path",
 *                      "DiscoveredName": "PathforServiceOnMap",
 *                      "UpdatedByTenantId": "GlobalTenant",
 *                      "UpdatedByAppId": "SURE_APP",
 *                      "SureName": "PathforServiceOnMap",
 *                      "DisplayName": "PathforServiceOnMap",
 *                      "UUID": "182345ae-aa80-11e7-a52e-005056a80946",
 *                      "UpdatedByUserId": "admin",
 *                      "LastUpdateDate": "2017-10-06T16:00:44.228+05:30",
 *                      "PrimaryLabel": "Path"
 *                    };
 *           options.Geodata = [
 *                             {
 *                               "path": [
 *                                 {
 *                                     "Type": "P2P Path",
 *                                     "SureName": "PathforServiceOnMap",
 *                                     "state": {
 *                                               "AlarmState": "CRITICAL"
 *                                               }
 *                                 }
 *                                       ],
 *                               "locations": [
 *                                 {
 *                                   "DiscoveredName": "Mumbai",
 *                                   "SureName": "Mumbai",
 *                                   "DisplayName": "Mumbai",
 *                                   "Latitude": "19.075984",
 *                                   "Longitude": "72.877656",
 *                                   "Attaches": {
 *                                     "Type": "LCTP",
 *                                     "SureName": "Port A/1-FCP",
 *                                     "DisplayName": "Port A/1-FCP",
 *                                     "state": {
 *                                               "AlarmState": "MAJOR"
 *                                               }
 *                                   }
 *                                 },
 *                                 {
 *                                   "DiscoveredName": "Bangalore",
 *                                   "SureName": "Bangalore",
 *                                   "DisplayName": "Bangalore",
 *                                   "Latitude": "12.971599",
 *                                   "Longitude": "77.594563",
 *                                   "Attaches": {
 *                                     "SubType": "Endpoint SAP",
 *                                     "Type": "UNI",
 *                                     "SureName": "Endpoint1",
 *                                       "state": {
 *                                               "AlarmState": "CRITICAL"
 *                                               }
 *                                           }
 *                                 }
 *                               ]
 *                             }
 *                       ];
 *           options.alarmStatus = [
 *                                     {
 *                                       "stateType": "AlarmState",
 *                                       "properties": [
 *                                         {
 *                                           "state": "WARNING",
 *                                           "priority": "4",
 *                                           "color": "#42A5F5"
 *                                         },
 *                                         {
 *                                           "state": "CRITICAL",
 *                                           "priority": "1",
 *                                           "color": "#BE0006"
 *                                         },
 *                                         {
 *                                           "state": "MAJOR",
 *                                           "priority": "2",
 *                                           "color": "#FF7900"
 *                                         },
 *                                         {
 *                                           "state": "MINOR",
 *                                           "color": "#FFCC00",
 *                                           "priority": "3"
 *                                         }
 *                                       ]
 *                                     }
 *                                   ];
 *                                   
 *   var geomapComponent = React.createElement(geoMap, options);
 *   ReactDOM.render(geomapComponent, document.getElementById("geoMapView"));
 * 
 * 
 *  @example <caption>Access component through iframe</caption>
 * 
 *  HTML
 *      <iframe id="geoMap" src="http://135.250.139.99:8092/" ></iframe>
 * 
 *  JS
 *      var iframe = document.getElementById('geoMap');
 *      let options = {
 *               methodGeo: "POST",
 *               methodAlarms: "GET",
 *              metadataUrl: "http://135.250.193.220:8081/osscm/commons/catalog/",
 *              domain: "http://135.250.193.220:8081",
 *             topourl: "/oss/sure/topology",
 *              Alarmurl : "specifications?q=specName;EQUALS;AlarmState;ic,specName;EQUALS;OperationalState;ic&q=subType;EQUALS;State&q=specType;EQUALS;State;ic&fullTree=true",
 *              style: {
 *                 height: window.innerHeight,
 *                 width: window.innerWidth
 *             }
 *         };
            
 *         options.geoDataUnmount = geoDataUnmount;
        
 *         options.AalrmrequestHeaders = {
 *            Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
 *           tenantId: 'GlobalTenant',
 *           ugId: 'Admin_UserGroup',
 *           appId: 'SURE_APP',
 *           Accept: 'application/json',
 *           TransformationEnabled: false,
 *          'Content-Type': 'application/json',
 *          'Response-Type': 'normal'
 *      };
            
 *     options.requestHeaders = {
 *          Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
 *          tenantId: 'GlobalTenant',
 *         ugId: 'Admin_UserGroup',
 *         appId: 'SURE_APP',
 *          Accept: 'application/json',
 *          TransformationEnabled: true,
 *         'Content-Type': 'application/json',
 *         'Response-Type': 'flat'
 *      };
            
 *     options.currentEntity = "Path";
            
 *      options.iconBaseUrl = "";
            
 *   options.selectedEntityRow =   {
 *                        "CreatedByAppId": "SURE_APP",
 *                        "CreationDate": "2017-10-06T15:51:19.559+05:30",
 *                        "CreatedByUgId": "GlobalTenant_Admin_UserGroup",
 *                       "UpdatedByUgId": "GlobalTenant_Admin_UserGroup",
 *                       "SubType": "LSP",
 *                       "Category": "SERVICE",
 *                       "DiscoveryLevel": "Level4",
 *                       "CreatedByTenantId": "GlobalTenant",
 *                       "Template Name": "TestPath",
 *                      "CAPACITY_Sub_caps": "125 Mbps",
 *                      "Name": "TestingPath",
 *                      "Template Version": "1.0",
 *                      "CreatedByUserId": "admin",
 *                      "Type": "P2P Path",
 *                      "DiscoveredName": "PathforServiceOnMap",
 *                      "UpdatedByTenantId": "GlobalTenant",
 *                      "UpdatedByAppId": "SURE_APP",
 *                      "SureName": "PathforServiceOnMap",
 *                      "DisplayName": "PathforServiceOnMap",
 *                      "UUID": "182345ae-aa80-11e7-a52e-005056a80946",
 *                      "UpdatedByUserId": "admin",
 *                      "LastUpdateDate": "2017-10-06T16:00:44.228+05:30",
 *                      "PrimaryLabel": "Path"
 *                    };
 *              options.Geodata = [
 *                             {
 *                              "path": [
 *                                 {
 *                                     "Type": "P2P Path",
 *                                     "SureName": "PathforServiceOnMap",
 *                                     "state": {
 *                                               "AlarmState": "CRITICAL"
 *                                               }
 *                                  }
 *                                       ],
 *                               "locations": [
 *                                 {
 *                                    "DiscoveredName": "Mumbai",
 *                                   "SureName": "Mumbai",
 *                                    "DisplayName": "Mumbai",
 *                                   "Latitude": "19.075984",
 *                                   "Longitude": "72.877656",
 *                                   "Attaches": {
 *                                     "Type": "LCTP",
 *                                     "SureName": "Port A/1-FCP",
 *                                     "DisplayName": "Port A/1-FCP",
 *                                     "state": {
 *                                               "AlarmState": "MAJOR"
 *                                               }
 *                                   }
 *                                 },
 *                                 {
 *                                   "DiscoveredName": "Bangalore",
 *                                   "SureName": "Bangalore",
 *                                   "DisplayName": "Bangalore",
 *                                   "Latitude": "12.971599",
 *                                   "Longitude": "77.594563",
 *                                   "Attaches": {
 *                                     "SubType": "Endpoint SAP",
 *                                     "Type": "UNI",
 *                                     "SureName": "Endpoint1",
 *                                       "state": {
 *                                               "AlarmState": "CRITICAL"
 *                                               }
 *                                           }
 *                                 }
 *                               ]
 *                             }
 *                       ];
 *           options.alarmStatus = [
 *                                     {
 *                                       "stateType": "AlarmState",
 *                                       "properties": [
 *                                         {
 *                                           "state": "WARNING",
 *                                           "priority": "4",
 *                                           "color": "#42A5F5"
 *                                         },
 *                                         {
 *                                            "state": "CRITICAL",
 *                                           "priority": "1",
 *                                           "color": "#BE0006"
 *                                         },
 *                                         {
 *                                           "state": "MAJOR",
 *                                           "priority": "2",
 *                                           "color": "#FF7900"
 *                                         },
 *                                         {
 *                                           "state": "MINOR",
 *                                           "color": "#FFCC00",
 *                                           "priority": "3"
 *                                         }
 *                                       ]
 *                                     }
 *                                   ];
 * 
 *      var ifarmeObj = {
 *              type: "ACCESS_SURE_UI_COMPONENT",
 *               payload: {
 *                   componentKey: "GeoMap",
 *                   properties: options
 *             }
 *        }
 * 
 *        iframe.contentWindow.postMessage(iframeObj, 'http://135.250.139.99:8092/'); 
 * 
 */


import React, { Component } from 'react';
import { Provider } from 'react-redux';
import GeoMapRoot from '../containers/geoMapContainer'
import store from '../store/store';
import { ToastContainer, toast } from 'react-toastify';
//Add Provider to the root
class GeoMap extends Component{
     render(){
        return(
            <Provider store={store}>
                <div>
                <GeoMapRoot options={this.props} />
                            <ToastContainer 
          position="bottom-center"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop={false}
        />
          
                    </div>
            </Provider>
        )        
    }
}

export default GeoMap