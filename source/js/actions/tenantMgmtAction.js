/**
 *  
 * Action: tenantMgmtAction.js
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

function profileList(response, dispatch) {
    var profileDataObject = [];
    var profileData = response.data.element;
    if (profileData) {
        profileData.map(function (value, key) {
            var accessRoleObj = {};
            accessRoleObj['Name'] = value["ProfileName"];
            accessRoleObj['Description'] = value['Description'];
            var item = accessRoleObj;
            this.push(item);

        }, profileDataObject);
    }
    else {
        profileDataObject = [];
    }
    dispatch({
        type: 'GET_PROFILE_DATA_SUCCESS',
        payload: {
            response: profileDataObject

        }

    });
}
function profileShare(response, dispatch) {
    var profileDataObject = [];
    var profileData = response.data.element;
    if (profileData) {
        profileData.map(function (value, key) {
             var shareProfile ={};
              shareProfile['ProfileName'] = value["ProfileName"];
              shareProfile['Description'] = value['Description'];
             var item = shareProfile;
            this.push(item);
        }, profileDataObject);
    }
    else {
        profileDataObject = [];
    }
    dispatch({
        type: 'GET_PROFILE_DATA_SHARE_SUCCESS',
        payload: {
            response: profileDataObject

        }

    });
}
export const profileData = (data) => {
    var editHeaders = data.requestHeaders;
    editHeaders["response-type"] = 'Not-Flat';
    var profileDataObject = [];
    return function (dispatch) {
        return axios.all([
            axios({
                method: data.method,
                url: data.url,
                headers: editHeaders

            }),
            axios({
                method: data.method,
                url: data.sharingUrl,
                headers: editHeaders
            })

        ]).then(axios.spread(function (response, responseSharing) {
            profileList(response, dispatch);
            profileShare(responseSharing, dispatch);


        }));

    }
}
export const populateEmail = (data) => {
    return function (dispatch) {
        return axios({
            method: data.method,
            url: data.url,
            headers: data.requestHeaders

        }).then(function (response) {
            var emailData = response.data.element[0];
            var emailSettingsData;
            

            if (emailData && emailData.FromEmail && emailData.ReplyEmail && emailData.FromDisplayName) {
                emailSettingsData = emailData;
            }
           
            dispatch({
                type: 'POPULATE_DATA',
                payload: {
                    response: emailSettingsData

                }

            });
        })
    }
}

var progressOptions = {
    spinner: "right"
     ,overlay:true
     ,css : {small: false, medium: false, large: false, xlarge: true, xxlarge: false}
     
  };


export const addTenant = (data) => {
   
    var component1 = React.createElement(ProgressIndicatorCircular, progressOptions);
    ReactDOM.render(component1, document.getElementById("progressIndicatorCircularID"));
    return function (dispatch) {
        return axios({
            method: data.method,
            url: data.url,
            headers: data.requestHeaders,
            data: data.payload
        }).then(function (response) {
            if (response.status === 201 || 204) {

                if(!data.rolTenantInfo){
                return axios({
                    method: data.method,
                    url: data.userUrl,
                    headers: data.requestHeaders,
                    data: data.userPayload
                }).then(function (response1) {

                    if (response1.status === 201 ||204) {
                        if (data.sharingPayload != undefined && Object.keys(data.sharingPayload).length >0 && data.unsharingPayload != undefined && Object.keys(data.unsharingPayload).length >0 && data.unsharingPayload.ResourceIds.length > 0 ) {
                            return axios.all([
                                 axios({
                                         method: 'POST',
                                         url: data.shareAccessRole,
                                         headers: data.requestHeaders,
                                         data: data.sharingPayload
                                     }),
                                     axios({
                                         method: 'POST',
                                         url: data.unshareAccessRole,
                                         headers: data.requestHeaders,
                                         data: data.unsharingPayload
                                     })

                                        ]).then(axios.spread(function (shareData, unshareData) {
                                             if (data.EditUI) {
                                                  var msg = "UPDATED";
                                              } else {
                                                  var msg = "ADDED";
                                              }
                                                dispatch({
                                                    type: 'ADD_TENANT',
                                                    payload: {
                                                        response: msg + " :" + (shareData.data.SureName ? shareData.data.SureName : data.payload.SureName)

                                                    }

                                                });
                                         })).catch(function(error){
                                                    var type = "UPDATE_ERROR";
                                                     var errorData={};
                                                     errorData["updateError"]="UpdateFailed";
                                                     errorData["response"]=error.response.data.split(":")[1].trim();
                                                       dispatch({
                                                    type: type,
                                                    payload: {
                                                        response: errorData

                                                    }

                                                });
                                                        });
                         
                        }
                        else if(data.sharingPayload != undefined && Object.keys(data.sharingPayload).length >0 &&( data.unsharingPayload == undefined || Object.keys(data.unsharingPayload).length ==0 || data.unsharingPayload.ResourceIds.length == 0)){
                             return axios({
                                method: 'POST',
                                url: data.shareAccessRole,
                                headers: data.requestHeaders,
                                data: data.sharingPayload
                            }).then(function (response2) {
                                  if (data.EditUI) {
                                      var msg = "UPDATED";
                                  } else {
                                      var msg = "ADDED";
                                  }
                                dispatch({
                                    type: 'ADD_TENANT',
                                    payload: {
                                        response: msg + " :" + (response.data.SureName?response.data.SureName:data.payload.SureName)

                                    }

                                });
                            }).catch(function(error){
                                var type = "ADD_TENANT";
                                 var errorData=error.response.data.split(":")[1].trim();
                                   dispatch({
                                type: type,
                                payload: {
                                    response: errorData

                                }

                            });
                                    });
                        }
                     
                        else {
                             if(data.EditUI){
                              var msg = "UPDATED";
                         }else{
                             var msg = "ADDED";
                         }
                            dispatch({
                                type: 'ADD_TENANT',
                                payload: {
                                    response: msg + " :" + (response.data.SureName?response.data.SureName:data.payload.SureName)

                                }

                            });
                        }
                    }
                   

                }).catch(function(error){
                     if (error.config.method == "put") {
                         var type = "UPDATE_ERROR";
                         var errorData={};
                         errorData["updateError"]="UserFailed";
                         errorData["response"]=error.response.data.split(":")[1].split("");
                           dispatch({
                        type: type,
                        payload: {
                            response: errorData
        
                        }
        
                    });
                     } else {
                        
                         var type = "ADD_TENANT";
                         rollBackTenant(data);
                         dispatch({
                             type: type,
                             payload: {
                                 //  response:error.response.data.split(":")[0] +'='+ data.payload.UserGroupName
                                 response: error.response.data.split(":")[1]

                             }

                         });
                     }
                   
                  
                });
            }else{}
        }
        }).catch(function (error) {
            if(error.config.method=="put"){
                var type = "UPDATE_ERROR";
            }else{
               var type = "ADD_TENANT" ; 
            }
          //  rollBackTenant(data);
            dispatch({
                type: type,
                payload: {
                    //  response:error.response.data.split(":")[0] +'='+ data.payload.UserGroupName
                    response: error.response.data.split(":")[1]

                }

            });
        });

       

    }
}
function rollBackTenant(data) {
    // return function (dispatch) {
    return axios({
        method: "PATCH",
        url: data.url+'/deActivation/' + data.payload.SureName,
        headers: data.requestHeaders

    }).then(function (response) {
        //var UUID = response.data.element[0].UUID;
        return axios({
            method: "DELETE",
            url: data.url +'/'+data.payload.SureName,
            headers: data.requestHeaders

        }).then(function (response) {
            return response
        }).catch(function (error) {
            return error.response.data.split(":")[1];
        })


    })
    //}
}

//fetch tenant details
export const fetchTenant = (data)=>{
    var component1 = React.createElement(ProgressIndicatorCircular, progressOptions);
    ReactDOM.render(component1, document.getElementById("progressIndicatorCircularID"));
    delete data.requestHeaders['response-type'];
    delete data.requestHeaders['Response-Type'];
     data.requestHeaders['Response-Type']='flat';
     delete data.requestHeaders['TransformationEnabled'];
    return function (dispatch) {
        return axios.all([
            axios({
                method: data.method,
                url: data.url,
                headers: data.requestHeaders

            }),
            axios({
                method: data.method,
                url: data.userurl,
                headers: data.requestHeaders
            }),
            axios({
                method: data.method,
                url: data.fetchSharedResourceurl,
                headers: data.requestHeaders
            })

        ]).then(axios.spread(function (responseTenant, responseUser,responseSharedResource) {
            var details = {};
            var sharedResources={};
         if(responseTenant.data && responseTenant.data.element && responseTenant.data.element.length!=0){
            var data = responseTenant.data.element[0];
                if(data && data.properties){
            details['tenantInfo']=data.properties;}
             if(data.relationships){ details['profileInfo']=data.relationships.HAS_UG.relationship[0].Target.relationships.UG_USES_PROFILE.relationship[0].Target.relationships.FOLLOWS_CATALOG.relationship[0].Target.properties;
                }
               }
            
         
            if(responseUser.data && responseUser.data.element && responseUser.data.element.length!=0){
                var Userdata = responseUser.data.element[0];
               if(Userdata && Userdata.properties){
            details['tenantUserInfo']=Userdata.properties;} 
            }
            
               if(responseSharedResource.data && responseSharedResource.data.element && responseSharedResource.data.element.length!=0){
                   var responseSharedResourceLength = responseSharedResource.data.element.length;
                   for (var i = 0; i < responseSharedResourceLength; i++) {
                       sharedResources[responseSharedResource.data.element[i].SureName]=true;
                   }
                   details['sharedResources']=sharedResources;
            }
            
            
            dispatch({
                type: 'FETCH_TENANT_DATA',
                payload: {
                    response: details

                }

            });
        }) )/*.catch(function (error) {
           console.log("error");
        })*/;
}
}

export const resetPassWord = (data) => {
    return function (dispatch) {
        return axios({
            method: data.method,
            url: data.url,
            headers: data.requestHeaders

        }).then(function (response) {
            if(response.status == "204"){
                var emailData = "Success";
            }else {var emailData = "Fail";}
            
            dispatch({
                type: 'RESET_PW' ,
                payload: {
                    response: emailData

                }

            });
        })
    }
}

export const unmountTenantMgmt = () => {
    return function (dispatch) {
        dispatch(
            {
                type: 'RESET'
            });
    }
}






