/**
 *  
 * Component : dataGridContainer.js
 *
 * @author Sunitha.S
 *
 */
/**
 * @class DataGridList
 * @memberof SUREUI.components
 *

 * @property {object}  [gridData]      Configuartion for SURE UI data model.
 * @property {string}  [gridData.method = GET] Http method for SURE REST API.
 * @property {string}  gridData.columnurl  URL for SURE REST  to render column Data.
 * @property {string}  gridData.rowurl  URL for SURE REST  to render column Data.
 * @property {object}  [gridData.headers] Additional headers which usually includes metadata and authorization info.
 * @property {string}  [selectedEntity] selected Entity on which DataGrid refreshes and loads with respect to the selected Entity.
 * @property {string}   [editIcon]  path of the edit Icon to be displayed in each row.
 * @property {string}  [deleteIcon] path of the delete icon to be displayed in each row .
 * @property {string}   [sidemenuIcon] path of Traversal Menu Icon to be displayed on each Row.
 * @property {function} unmountData function which unmounts/refreshes the data Grid.
 * @property {object} rowMenu This array contains the list hower actions supported
 * @property {object} nameIcon Enable this for displaying icon along with rows, only applicablt for users,usergroups and tenant
 * @property {object} clientSideEnabled Enable this for performing the actions in client side
 * @property {object} searchChips Provide search chips for filtering the data
 * @example {@lang xml}
 * 
 * HTML
 *<div id="dataGrid" style="width:100%;height:600px;"></div>
 *
 *JS
 *  
 *  
 *  var DataGridList = SUREUI.components.DataGridList;
 * 
 * let gridData = {
 *              method: "GET",
 *             metadataUrl: "http://135.250.193.220:8081/osscm/commons/catalog/",
 *             domain: "http://135.250.193.220:8081/oss/sure/",
 *             rowurl: "networks?criteria=onlyRoot&limit=100&page=1&expand=Capacity,State",
 *             selectedEntity: "Network",
 *            columnurl: "specifications?q=specName;EQUALS;EntityAttribute&q=subType;EQUALS;English",
 *            editIcon: "../source/images/dataGrid/ic_edit.svg",
 *            deleteIcon:"../source/images/dataGrid/ic_delete.svg",
 *           sidemenuIcon:"../source/images/dataGrid/ic_more_vertical.svg"
 *           
 *        };
 * gridData.requestHeaders = {
 *           Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
 *           tenantId: 'GlobalTenant',
 *           ugId: 'Admin_UserGroup',
 *           appId: 'SURE_APP',
 *           Accept: 'application/json',
 *          TransformationEnabled: true,
 *         'Content-Type': 'application/json',
 *        'Response-Type': 'flat'
 *   }
 * 
 * var dataGridComponent = React.createElement(DataGridList, gridData);
 * ReactDOM.render(dataGridComponent, document.getElementById("dataGrid"));
 * 
 * 
 *  function unmountData() {
 *        
 *       
 *       var DataGridList = SUREUI.components.DataGridList;
 *       ReactDom.unmountComponentAtNode(document.getElementById("dataGrid"));
 *   }
 *  @example <caption>Access Profile Load in data grid</caption>

 *  HTML
 *<div id="dataGrid" style="width:100%;height:600px;"></div>
 *
 *JS
 *  
 *  
 *  var DataGridList = SUREUI.components.DataGridList;
 * 
 * let gridData = {
 *              method: "GET",
 *              metadataUrl: "http://135.250.139.92:8080/osscm/commons/catalog/",
 *              domain: "http://135.250.139.92:8080/oss-uam/sure/",
 *              rowurl: "accessRole/",
 *              selectedEntity: "profiles"
 *            columnurl: "specifications?q=specName;EQUALS;EntityAttribute&q=subType;EQUALS;English",
 *            editIcon: "../source/images/dataGrid/ic_edit.svg",
 *            deleteIcon:"../source/images/dataGrid/ic_delete.svg",
 *           sidemenuIcon:"../source/images/dataGrid/ic_more_vertical.svg"
 *           
 *        };
 * gridData.requestHeaders = {
 *           Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
 *           tenantId: 'GlobalTenant',
 *           ugId: 'Admin_UserGroup',
 *           appId: 'SURE_APP',
 *           Accept: 'application/json',
 *          TransformationEnabled: true,
 *         'Content-Type': 'application/json',
 *        'Response-Type': 'flat'
 *   }
 * 
 * var dataGridComponent = React.createElement(DataGridList, gridData);
 * ReactDOM.render(dataGridComponent, document.getElementById("dataGrid"));
 * 
 * 
 *  function unmountData() {
 *        
 *       
 *       var DataGridList = SUREUI.components.DataGridList;
 *       ReactDom.unmountComponentAtNode(document.getElementById("dataGrid"));
 *   }
@example <caption>UserGroup Load in data grid</caption>

 *  HTML
 *<div id="dataGrid" style="width:100%;height:600px;"></div>
 *
 *JS
 *  
 *  
 *  var DataGridList = SUREUI.components.DataGridList;
 * 
 * let gridData = {
 *               method: "GET",
 *               metadataUrl: "http://135.250.139.97:8080/osscm/commons/catalog/",
 *               domain: "http://135.250.139.119:8080/oss-uam/sure/",
 *               rowurl: "realms/SURE/groups",
 *               selectedEntity: "groups",
 *               columnurl: "specifications?q=specName;EQUALS;EntityAttribute&q=subType;EQUALS;English",
 *               editIcon: "../source/images/dataGrid/ic_edit.svg",
 *               deleteIcon:"../source/images/dataGrid/ic_delete.svg",
 *               sidemenuIcon:"../source/images/dataGrid/ic_more_vertical.svg"
 *           
 *        };
 * gridData.requestHeaders = {
 *           Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
 *           tenantId: 'GlobalTenant',
 *           ugId: 'Admin_UserGroup',
 *           appId: 'SURE_APP',
 *           Accept: 'application/json',
 *          TransformationEnabled: true,
 *         'Content-Type': 'application/json',
 *        'Response-Type': 'flat'
 *   }
 * 
 * var dataGridComponent = React.createElement(DataGridList, gridData);
 * ReactDOM.render(dataGridComponent, document.getElementById("dataGrid"));
 * 
 * 
 *  function unmountData() {
 *        
 *       
 *       var DataGridList = SUREUI.components.DataGridList;
 *       ReactDom.unmountComponentAtNode(document.getElementById("dataGrid"));
 *   }
@example <caption>Tenant Load in data grid</caption>

 *  HTML
 *<div id="dataGrid" style="width:100%;height:600px;"></div>
 *
 *JS
 *  
 *  
 *  var DataGridList = SUREUI.components.DataGridList;
 * 
 * let gridData = {
 *               
                metadataUrl: "http://135.250.139.119:8080/osscm/commons/catalog/",
                domain: "http://135.250.139.119:8080/oss-uam/sure/",
                rowurl: "tenants",
                selectedEntity: "tenants",
 *               columnurl: "specifications?q=specName;EQUALS;EntityAttribute&q=subType;EQUALS;English",
 *               editIcon: "../source/images/dataGrid/ic_edit.svg",
 *               deleteIcon:"../source/images/dataGrid/ic_delete.svg",
 *               sidemenuIcon:"../source/images/dataGrid/ic_more_vertical.svg"
 *           
 *        };
 * gridData.requestHeaders = {
 *           Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
 *           tenantId: 'GlobalTenant',
 *           ugId: 'Admin_UserGroup',
 *           appId: 'SURE_APP',
 *           Accept: 'application/json',
 *          TransformationEnabled: true,
 *         'Content-Type': 'application/json',
 *        'Response-Type': 'flat'
 *   }
 * 
 * var dataGridComponent = React.createElement(DataGridList, gridData);
 * ReactDOM.render(dataGridComponent, document.getElementById("dataGrid"));
 * 
 * 
 *  function unmountData() {
 *        
 *       
 *       var DataGridList = SUREUI.components.DataGridList;
 *       ReactDom.unmountComponentAtNode(document.getElementById("dataGrid"));
 *   }


 *  @example <caption>Load Users in data grid</caption>

 *  HTML
 *<div id="dataGrid" style="width:100%;height:600px;"></div>
 *
 *JS
 *  
 *  
 *  var DataGridList = SUREUI.components.DataGridList;
 * 
 * let gridData = {
 *              method: "GET",
 *              metadataUrl: "http://135.250.139.92:8080/osscm/commons/catalog/",
 *              domain: "http://135.250.139.92:8080/oss-uam/sure/",
 *              rowurl: "tenants/users?tenantId=T0",
 *              selectedEntity: "users"
 *              columnurl: "specifications?q=specName;EQUALS;EntityAttribute&q=subType;EQUALS;English",
 *              rowMenu: ["Edit","Delete","Add","","Graph"],
 *              nameIcon:true,
 *              clientSideEnabled : false,
 *              searchChips:undefined
 *       };
 * gridData.requestHeaders = {
 *           Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
 *           tenantId: 'GlobalTenant',
 *           ugId: 'Admin_UserGroup',
 *           appId: 'SURE_APP',
 *           Accept: 'application/json',
 *           TransformationEnabled: true,
 *           'Content-Type': 'application/json',
 *           'Response-Type': 'flat'
 *   }
 * 
 * var dataGridComponent = React.createElement(DataGridList, gridData);
 * ReactDOM.render(dataGridComponent, document.getElementById("dataGrid"));
 * 
 * function unmountData() {
 *        
 *       
 *       var DataGridList = SUREUI.components.DataGridList;
 *       ReactDom.unmountComponentAtNode(document.getElementById("dataGrid"));
 *   }
 * 
 * 
    
 */ 
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import DataList from '../containers/dataGridContainer'
import store from '../store/store';
import { ToastContainer } from 'react-toastify';

//Add Provider to the root
class DataGridList extends Component{
    
     render(){
    
        return(
            <Provider store={store}>
               <div  style={{height : "100%", width : "100%"}}> 
                <DataList gridData = {this.props}   />
                <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar={true} newestOnTop={false} />
                </div>
           </Provider>
            
        )        
    }
}

export default DataGridList