/**
 *  
 * Component : addProfilesContainer.js
 *
 * @version 1.0
 * @author nehasi
 * @ignore
 */

/**
* @class AddProfiles
* @memberof SUREUI.components

* @property {object}  dataSource      Configuartion for SURE UI data model.
* @property {string}  dataSource.method Api method to load the component
* @property {string}  dataSource.url    Api url to load the component
* @property {object}  dataSource.headers Authorization headers which usually includes response format and authorization info.
* @property {object}  propsCode This contains the set of translated values/messages for language support methods if required
* @property {function}  unmount Callback method for cancel/unmounting the component
* @example <caption>Consuming add profiles as a library</caption>
*
* HTML
*   <div id="addProfilesView"></div>
    <span id="infoDialog"></span>
*
* JS
*   var AddProfiles = SUREUI.components.AddProfiles;

*
*   var dataSource = {
*               method: "GET",
*                url: "http://135.250.138.117:8080/oss-uam/sure/accessRole",
*               pagelimit:1000,
*                headers: {
*                    Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
*                    tenantId: 'T0',
*                    ugId: 'Admin_UserGroup',
*                    appId: 'SURE_APP',
*                    Accept: 'application/json',
*                    TransformationEnabled: true,
*                    'Content-Type': 'application/json'
*                }
*            }
*           var propsCode = sureCache.get('translatedCachedData');
*            var props = {data:[],dataSource: dataSource,propsCode: propsCode,unMount:unMount}
*            var addProfilesComponent = React.createElement(AddProfiles, props);
*           ReactDOM.render(addProfilesComponent, document.getElementById("addProfilesView"));


 *  @example <caption>Access Profile Load in iframe file</caption>
 *  HTML
 *      <iframe id="profileView"  src="http://135.250.139.99:8092/" ></iframe>
 *  JS
 *       var iframe = document.getElementById('profileView');
 *     var dataSource = {
 *                method: "GET",
 *               url: "http://135.250.139.92:8080/oss-uam/sure/accessRole/",
 *                pagelimit:1000,
 *               headers: {
 *                    Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
 *                   tenantId: 'T0',
 *                   ugId: 'Admin_UserGroup',
 *                  appId: 'SURE_APP',
 *                   Accept: 'application/json',
 *                    TransformationEnabled: true,
 *                   'Content-Type': 'application/json'
 *                }
 *           }
 *      var propsCode = {
 *                               "SELECT_LANG_FOR_TRANSLTN": "Language:",
 *                                "USER": "User",
 *                                "EQUIPMENT": "Equipment",
 *                                "SERVICE": "Service",
 *                               "NETWORK": "Network",
 *                                "PATH": "Path",
 *                                "CUSTOMER": "Customer",
 *                                "FCP": "FCP",
 *                                "ENDPOINT": "Endpoint",
 *                                "LOCATION": "Location",
 *                                "TENANT": "Tenants",
 *                                "USERGROUP": "User Groups",
 *                               "USERS": "Users",
 *                               "PROFILES": "Profiles",
 *                                "GRAPH": "Graph",
 *                               "ADD": "ADD",
 *                               "AUTO_REFRESH": "Auto Refresh",
 *                                "INVENTORY": "Inventory",
 *                                "TOPOLOGY": "Topology",
 *                                "CREATION_DATE": "Creation Date",
 *                                "ACTION": "Action",
 *                                "COPYRIGHT": "Copyright",
 *                                "VERSION": "Version",
 *                                "STATE": "State",
 *                                "COLUMN_PREFERENCES": "Column Preferences",
 *                                "ADMIN_STATE": "Admin State",
 *                               "MAP": "Map",
 *                               "VIEW_DETAILS": "View Details",
 *                               "CREATE": "Create",
 *                               "GENERAL_INFORMATION": "General Information",
 *                               "FEATURES": "Features",
 *                               "UPDATE": "Update",
 *                               "NETWORK_UPDATED_SUCCESSFULLY": "Network Updated Successfully",
 *                                "NETWORK_UPDATION_FAILED": "Network Updation failed",
 *                              "SUBNETWORK_CREATED_SUCCESSFULLY": "SubNetwork created Successfully",
 *                               "SUBNETWORK_CREATION_FAILED": "SubNetwork creation failed",
 *                                "NETWORK_CREATED_SUCCESSFULLY": "Network Created Successfully",
 *                               "NETWORK_CREATION_FAILED": "Network creation failed",
 *                               "SEARCH": "Search",
 *                               "SEARCH_MODE": "Search Mode",
 *                               "SAVE_SEARCH": "Save Search",
 *                               "SAVE_SEARCH_AS": "Save Search As",
 *                               "HELP": "Help",
 *                               "ABOUT_SURE": "About SURE",
 *                               "LEAVE_BLANK": "Leave blank for auto-generated",
 *                               "SELECT": "Select",
 *                               "SELECTED": "Selected",
 *                               "TYPE": "Type",
 *                               "SUB_TYPE": "Sub Type",
 *                               "VIEW_PROFILE": "View profile",
 *                               "SIGN_OUT": "Sign Out",
 *                               "LAUNCH_PAD": "Launch Pad",
 *                               "HISTORY": "HISTORY",
 *                               "VIEW": "View",
 *                               "DEFAULT": "Default",
 *                               "MORE_INFO": "More Info",
 *                               "FAVOURITE": "Favourite",
 *                               "CLOSE": "Close",
 *                               "CAPACITY": "Capacity",
 *                                "PHYSICAL_PORT": "Physical Port",
 *                                "SUB_PATH": "Sub Path",
 *                               "NAME": "Name",
 *                               "DESELECT_ALL": "Deselect All",
 *                               "CANCEL": "Cancel",
 *                               "PARENT": "Parent",
 *                               "NUMBER_OF_INSTANCES": "Number of instances",
 *                               "STARTING_AT": "Starting at",
 *                                "NOT_VALID_NUMBER": "Not a valid number",
 *                               "VALUE_IS_TOO_SHORT": "Value is too short",
 *                               "MINVALUE": "MinValue",
 *                               "MAXVALUE": "MaxValue",
 *                               "SHOULD_BE": "Should be",
 *                               "SAVE": "Save",
 *                               "BACK": "Back",
 *                               "NEXT": "Next",
 *                                "SHOW_NAVIGATION": "Show navigation",
 *                               "EXPAND_LAYERS": "Expand Layers",
 *                               "COLLAPSE_LAYERS": "Collapse Layers",
 *                               "ZOOM_IN": "Zoom In",
 *                               "ZOOM_OUT": "Zoom Out",
 *                               "EXPAND_CLUSTER": "Expand Cluster",
 *                               "INFORMATION": "Information",
 *                               "Loc_COORDS": "Location coordinates for",
 *                               "UNKNOWN": "are not known",
 *                               "SELECTROW": "Select a Row",
 *                               "NO_COLLAPSE": "No more layers to collapse",
 *                               "NO_EXPAND": "No more layers to expand",
 *                               "NAV_GEO": "Navigate to GeoMap",
 *                               "NAV_TOPOMAP": "Navigate to TopologyMap",
 *                               "CustomHook:EQP": "CustomHook:EQP",
 *                               "TOPOLOGY_MAP": "Topology Map",
 *                               "USER_EDIT_HEADING": "Edit User",
 *                               "USER_ADD_HEADING": "Add User",
 *                               "CONFIRM_DELETE_HEADER": "Confirm Delete",
 *                               "CONFIRM_DELETE_MESSAGE": "Are you sure you want to delete",
 *                               "ADD_PROFILE_FAILED": "Profile creation failed",
 *                               "PROFILE_CREATED_SUCCESSFULLY": "Successfully Created",
 *                               "UPLOAD_PROFILE" : "No File Uploaded to create Profile",
 *                               "DELETED": "has been deleted"
 *                        
 *                           };
 *            var props = {data:[],dataSource: dataSource,propsCode: propsCode,unMount:unMount}
 *          var iframeObj = {
 *               type: "ACCESS_SURE_UI_COMPONENT",
 *               payload: {
 *                   componentKey: "AddProfiles",
 *                   properties: props
 *                }
 *           }
 *
 *            var unMount = function(x){
 *         if(x){
 *            // ReactDOM.render(dataGridComponent, document.getElementById("dataGrid"));
 *         }
 *     }
 *
 *           iframe.contentWindow.postMessage(iframeObj, 'http://localhost/GIT/sure-sw/SURE-UI-Components/dist/');
 *       }
* 
*/


import React, { Component } from 'react';
import { Provider } from 'react-redux';
import AddProfilesRoot from '../containers/addProfilesContainer'
import store from '../store/store';
import { ToastContainer, toast } from 'react-toastify';
//Add Provider to the root
class AddProfiles extends Component{
     render(){
        return(
            <Provider store={store}>
                <div>
                <AddProfilesRoot {...this.props} />
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

export default AddProfiles