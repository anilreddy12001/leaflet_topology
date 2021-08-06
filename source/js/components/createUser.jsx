/**
 *  
 * Component : UserCrud.js
 *
 * @version 1.0
 * @author dihariha
 * @ignore
 */

/**
* @class CreateUser
* @memberof SUREUI.components

* @property {object}  dataSource      Configuartion for SURE UI data model.
* @property {string}  dataSource.headerText Header text to show while loading the component
* @property {object}  dataSource.headers Authorization headers which usually includes response format and authorization info.
* @property {object}  hookMethods This contains the set of callback methods 
* @property {function}  hookMethods.cancel Callback method for cancel button
* @property {string}  hookMethods.elementId id of the component
* @property {function}  hookMethods.success Callback method for success operation
* @property {object} translationData Pass the internationalisation data if required
* @property {object} editData  Pass only at the time of editing the user, this is mandatory in Edit operation
*
* @example <caption>Consuming creating user as a library</caption>
*
* HTML
*  <div id="createUserId"></div>
*
* JS
*  var CreateUser = SUREUI.components.CreateUser;
*
*  var dataSource = {
*               headerText :'Add User',
*               baseUrl: "<IP ADDRESS>/oss-uam/sure/",
*                headers: {
*                    Authorization: <Authorization Tocken>,
*                    tenantId: <Tenant Id , this is the UUID of the tenant>,
*                    ugId: <User Group ID>,
*                    appId: <App ID>,
*                    Accept: 'application/json',
*                    TransformationEnabled: false,
*                    'Content-Type': 'application/json',
*                    'Response-Type': 'flat'
*                },
*                hookMethods:{cancel:unMount,elementId:"createUserId",success:unMount},
*                translationData :undefined,
*                editData:undefined
*            }
*         
*            var createUserComponent = React.createElement(CreateUser, dataSource);
*            ReactDOM.render(createUserComponent, document.getElementById("createUserId"));
* 
* 
*/

import React, { Component } from 'react';
import { Provider } from 'react-redux';
import store from '../store/store';
import UserCrud from "../containers/UserCrud";
import { ToastContainer } from 'react-toastify';
export default class CreateUser extends Component{

    render() {
        return (
          <Provider store={store}>
          <div>
            <UserCrud {...this.props} />
            <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar={true} newestOnTop={false} />
          </div>
          </Provider>
        )
    }
}
