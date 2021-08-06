/**
 *  
 * Component : equipmentMap.js
 *
 * @version 1.0
 * @author Gowtham.S
 * @ignore
 */

 /**
 * @class EquipmentMap
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
 *  <div id="equipmentMapView"></div>
 *
 * JS
 *  
 *  
 *  var EuipmentMap = SUREUI.components.EuipmentMap;
 *
 *  let dataSource = {
 *  method: "GET",
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
 *  var equipmentmapComponent = React.createElement(EuipmentMap, props);
 *  ReactDOM.render(equipmentmapComponent, document.getElementById("equipmentMapView"));
 * 
 * 
 *  @example <caption>Access component through iframe</caption>
 * 
 *  HTML
 *      <iframe id="equipmentMap" src="http://135.250.139.99:8092/" ></iframe>
 * 
 *  JS
 *      var iframe = document.getElementById('equipmentMap');
 *      let dataSource = {
 *          method: "GET",
 *          url: "http://135.250.139.104:8081/oss/sure/locations?limit=100&expand=Equipment.State&q=SELECT;[SureName,Longitude,Latitude,UUID,Equipment]"
 *          headers : {
 *              Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
 *              tenantId: 'GlobalTenant',
 *              ugId: 'Admin_UserGroup',
 *              appId: 'SURE_APP',
 *              Accept: 'application/json',
 *              TransformationEnabled: true,
 *              'Content-Type': 'application/json',
 *              'Response-Type': 'flat'
 *          }
 *      };
 * 
 *      var props = {
 *          dataSource : dataSource,
 *          tileServer : "http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png"
 *        }
 * 
 *      var ifarmeObj = {
 *              type: "ACCESS_SURE_UI_COMPONENT",
 *               payload: {
 *                   componentKey: "EquipmentMap",
 *                   properties: props
 *             }
 *        }
 * 
 *        iframe.contentWindow.postMessage(ifarmeObj, 'http://135.250.139.99:8092/'); 
 * 
 */

import React, { Component } from 'react';
import { Provider } from 'react-redux';
import EquipmentMapRoot from '../containers/equipmentMapContainer'
import store from '../store/store';
//Add Provider to the root
class EquipmentMap extends Component{
     render(){
        return(
            <Provider store={store}>
                <EquipmentMapRoot {...this.props} />
            </Provider>
        )        
    }
}

export default EquipmentMap