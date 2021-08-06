    /**
   *  
   * UamHelper
   *
   * @version 1.0
   * @author Dileep H
   * @desc helper class conataining common functionalities for UAM
   */
  import OverlayLoader from 'react-overlay-loading/lib/OverlayLoader'
  import React, { Component } from 'react';
  import '../../libs/core.js';
     export default class UamHelper{
     checkForQ(url) {return (url && (url.indexOf("?q")!==-1 || 
     url.indexOf("?criteria")!==-1 ||  url.indexOf("?expand")!==-1 || url.indexOf("tenantName=")!==-1 ) || url.indexOf("tenants/users?tenantId")!==-1 )?'&':'?';};
     createUrl(obj,urlConstructed){
       let url = "";
       if(obj){
        url = obj.reduce((previousValue, currentValue,currentIndex, arr) => {
          return previousValue+currentValue+"&"
        },urlConstructed);  
      }
      return url;
    }

    static headerWithoutTransform(data) {
       var reqHeaders = Object.assign({}, data.requestHeaders);
       const uamEntities = ['tenants','users'];
          if(uamEntities.some(a => a === (data.selectedEntity || {} ).toLowerCase())){
          reqHeaders['TransformationEnabled'] = false;
          }
      return reqHeaders;
    }

    createSearchUrl(tokens){
      let filteredObj;
      if(tokens && tokens.length>0){
        filteredObj = tokens.map(function(token){
          var prefix = "";
          var operator = "";
          var suffix = "";
          if (token.value) {
            for(var i=0; i < token.value.length; i++){
              if(token.value[i].id === "first-field"){
                prefix = token.value[i].dbName + ";";
              }else if (token.value[i].id === "condition") {
                if (token.value[i].value === ":") {
                  operator = "CONTAINS;";
                } else if (token.value[i].value === "!:") {
                  operator = "NOT CONTAINS;";
                }else if (token.value[i].value === "=") {
                  operator = "EQUALS;";
                } else if (token.value[i].value === "!=") {
                  operator = "NOT EQUAL;"
                }else if (token.value[i].value === "Starts With") {
                  operator = "STARTS WITH;"
                }else if (token.value[i].value === "Ends With") {
                  operator = "ENDS WITH;"
                }else {
                  operator = token.value[i].value + ";";
                }
              }else if (token.value[i].id.startsWith("query")){
                suffix = token.value[i].value;
              }else{
                console.log("chip doesnot met the condition");
              }
            }                 
          }
          return ("q="+ (prefix == "Profile;"? "Profile.Item.SureName;" :prefix)+ operator + suffix) ;
        })
      }
      return filteredObj;
   }

   constructSearchUrl(tokens,urlConstructed){
    var filteredObject = this.createSearchUrl(tokens);
    let rowUrlConstructed ="";
    if(filteredObject && filteredObject.length>0){
      if(filteredObject && filteredObject.length>0){
        rowUrlConstructed = this.createUrl(filteredObject,urlConstructed);
      }
    }
    return rowUrlConstructed;
  }
  }

  export const randomPassword = () => {
         return Math.random().toString(36).slice(-8);
}
export const createUserPayload = (data,operation) =>{
  let userPayload = {};
  let status = ( "EDIT" == operation && data.status == 'Locked') ? false : true; 
  let {username:UserName,firstName:UserFirstName,lastName:UserLastName,password:UserPassword,email:UserEMail,userGroup : userGroup} = data;
  Object.assign(userPayload, {UserName,UserFirstName, UserLastName,UserEMail,Enabled:status,UserGroups : [].concat(userGroup)});
  return userPayload;
}

export const progressPanal = (active)=>{
  return(
   /* <div className='sweet-loading' style={{ zIndex: 2}} id="loadOverlay">
    <OverlayLoader 
          color={'#3572b0'} 
          loader="ClipLoader" 
          text="Loading"
          textColor = {'black'}
          active={true} 
          backgroundColor={'black'} 
          opacity=".9"   
     >
    </OverlayLoader>
    </div>*/
	<div></div>
)
}

export const messageLabels = ({label}) =>{
  return {
    resetPassword : {
     successLabel : label.USER_CRUD_RESET_SUCCESS,
     failureLabel : label.USER_CRUD_RESET_MAIL_FAILED,
     title : label.USER_CRUD_RESET_FAILED
    },
    lock : {
     successLabel : label.USER_CRUD_LOCK_SUCCESS,
     failureLabel : label.USER_CRUD_LOCK_FAILED,
     title : label.USER_CRUD_STATUS_FAILED
    },
    unlock : {
      successLabel : label.USER_CRUD_UNLOCK_SUCCESS,
      failureLabel : label.USER_CRUD_UNLOCK_FAILED,
      title : label.USER_CRUD_STATUS_FAILED
     },
     lockTenant : {
      successLabel : label.TENANT_CRUD_LOCK_SUCCESS,
      failureLabel : label.USER_CRUD_LOCK_FAILED,
      title : label.TENANT_CRUD_STATUS_FAILED
     },
     unlockTenant : {
       successLabel : label.TENANT_CRUD_UNLOCK_SUCCESS,
       failureLabel : label.TENANT_CRUD_UNLOCK_FAILED,
       title : label.TENANT_CRUD_STATUS_FAILED
      },
     add : {
      successLabel : label.USER_CRUD_ADD_SUCCESS,
      failureLabel : label.USER_CRUD_ADD_FAILED_UNKNOWN,
      title : label.USER_CRUD_ADD_FAILED
     },
     edit : {
      successLabel : label.USER_CRUD_EDIT_SUCCESS,
      failureLabel : label.USER_CRUD_EDIT_FAILED_UNKNOWN,
      title : label.USER_CRUD_UPDATE_FAILED
     },
     delete :{
      successLabel : label.USER_CRUD_DELETE_SUCCESS,
      failureLabel : label.USER_CRUD_DELETE_FAILED_UNKNOWN,
      title : label.USER_CRUD_DELETE_FAILED_HEADER
     },
     deleteTenant :{
      successLabel : label.USER_CRUD_DELETE_SUCCESS,
      failureLabel : label.TENANT_CRUD_DELETE_FAILED_UNKNOWN,
      title : label.USER_CRUD_DELETE_FAILED_HEADER
     }
  }
}  
