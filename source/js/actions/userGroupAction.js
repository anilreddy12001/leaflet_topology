/**
 *  
 * Action: userGroupAction.js
 *
 * @version 1.0
 * @author Sunitha.S
 *
 */

import axios from 'axios';
import React, { Component } from 'react';
import { ProgressIndicatorCircular } from '@nokia-csf-uxr/csfWidgets';


//Action Creators
//API call
export const profileData = (data) => {
    var editHeaders = data.requestHeaders;
    editHeaders["response-type"]= 'Not-Flat';
    var profileDataObject=[];
    return function (dispatch) {
    return axios({
                method: data.method,
                url: data.url,
                headers: editHeaders,
            }).then(function (response) {
          
            var profileData = response.data.element;
            if (profileData) {
                profileData.map(function (value, key) {
                        var item = value["ProfileName"]
                        this.push(item);
                    }, profileDataObject);
                }
                else {
                    profileDataObject = [];
                }
            dispatch({
                    type: 'GET_PROFILE_DATA_SUCCESS',
                    payload: {
                        response:profileDataObject

                    }

                });

        })
    
}
}
export const addUserGroup =(data) => {
    var component1 = React.createElement(ProgressIndicatorCircular, progressOptions);
    ReactDOM.render(component1, document.getElementById("progressIndicatorCircularID"));
    return function (dispatch) {
        return axios({
                    method: data.method,
                    url: data.url,
                    headers: data.requestHeaders,
                    data: data.payload,
                    
                }).then(function (response) {
                    ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularID"));
               if(response.status === 201)
                {
                dispatch({
                        type: 'ADD_USER_GROUP',
                        payload: {
                            response:"ADDED" +" :"+ response.data.UserGroupName
    
                        }
    
                    });
                }
                
            }).catch(function(error){
                dispatch({
                    type: 'ADD_USER_GROUP',
                    payload: {
                      //  response:error.response.data.split(":")[0] +'='+ data.payload.UserGroupName
                      response:error.response.data.split(":")[1]

                    }

                });
            });
               
        
    }
}

var progressOptions = {
    spinner: "right"
     ,overlay:true
     ,css : {small: false, medium: false, large: false, xlarge: true, xxlarge: false}
     
  };
// fetch the Usergroup data on Edit
export const editUserGroup =(data) => {
    var component1 = React.createElement(ProgressIndicatorCircular, progressOptions);
    ReactDOM.render(component1, document.getElementById("progressIndicatorCircularID"));
    var editHeaders1 = data.requestHeaders;
    editHeaders1["TransformationEnabled"]= false;
    return function (dispatch) {
        return axios({
                    method: data.method,
                    url: data.url,
                    headers: editHeaders1,
                   
                }).then(function (response) {
                    ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularID"));
                  console.log(response.data.element);
                dispatch({
                        type: 'EDIT_USER_GROUP',
                        payload: {
                            response:response.data.element[0]
    
                        }
    
                    });
                
                
            });
               
        
    }
}

export const updateUserGroup =(data) => {
    var component1 = React.createElement(ProgressIndicatorCircular, progressOptions);
    ReactDOM.render(component1, document.getElementById("progressIndicatorCircularID"));
    return function (dispatch) {
        return axios({
                    method: data.method,
                    url: data.url,
                    headers:data.requestHeaders,
                    data:data.payload
                }).then(function (response) {
                    ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularID"));
                dispatch({
                        type: 'UPDATE_USER_GROUP',
                        payload: {
                            response:"UPDATED"+":"+ data.payload.UserGroupName
    
                        }
    
                    });
                
                
            }).catch(function(error){
                dispatch({
                    type: 'UPDATE_USER_GROUP',
                    payload: {
                        response:error.response.data.split(":")[1]

                    }

                });
            });
               
        
    }
}
export const unmountUserGroup= () => {
    return function (dispatch) {
        dispatch(
            {
                type: 'RESET'
            });
    }
}






