import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import validator from 'validator';
import {UAM_CONSTANTS} from "./uamConstants"
import { AlertDialogConfirm ,AlertDialogError} from '@nokia-csf-uxr/csfWidgets';
import { ToastContainer, toast } from 'react-toastify';
//import { style } from "react-toastify";
// style({
//   width: "500px"
// });
export const validateFormField = (validationType,field,value,labels) => {
    for(let type of validationType){
        let result = functionSwitch(type,field,value,labels);
        if(!result.valid)
        {
            return result;
        } 
    }
    return validatorObject();
}
export const notify = (msg) => {
    toast(msg, {
        className: {
          background: "#323232 !important",
          color: "rgb(250,250,250) !important",
         }
    });
  }
  export const renderErrorDialog =({title, message,id}) =>{
     var aboutOptions ={
         title: title
         , errorText: message 
          ,onClose: function () {
            ReactDOM.unmountComponentAtNode(document.getElementById(id));
        }
     };
         var component = React.createElement(AlertDialogError, aboutOptions);
         ReactDOM.render(component, document.getElementById(id));
     }

  export const confirmationPanal = (data)=>{
      var confirmationOptions = {
        title: data.title
        , confirmationText1: data.confirmationText
        , button1Text: data.cancleLabel
        , confirmationButtonLabel : data.deleteLabel
        , onClose: function(){
          ReactDOM.unmountComponentAtNode(document.getElementById(data.id));
        }
        , onConfirm: function () {
            data.callback(data.propData);
            ReactDOM.unmountComponentAtNode(document.getElementById(data.id));
        }
    };
    var component = React.createElement(AlertDialogConfirm, confirmationOptions);
    ReactDOM.render(component, document.getElementById(data.id));
    }
    
    const closeDialog = (target) => {
      ReactDOM.unmountComponentAtNode(document.getElementById(target));
    }

const functionSwitch = (valType,field,value,labels) => {
    switch(valType) {
      case(UAM_CONSTANTS.REQUIRED):
        return isMandatory(value,field,labels)
        break;
       case(UAM_CONSTANTS.EMAIL):
        return verifyEmail(value,labels);
        break;
    }
  }

 const validatorObject = (valid=true,message =`` ) =>
 {
    let validatorObj = {
        valid:valid,
        message:message
    }
    return validatorObj;
 } 
 const verifyEmail=(value,labels)=>
  {
    return (validator.isEmail(value)?validatorObject():validatorObject(false,labels.USER_CRUD_FIELD_EMAIL_VALIDATION));
  }
  const isMandatory=(value,field,labels)=>
  {
    return (validator.isEmpty(value)?validatorObject(false,replaceValue(labels.USER_CRUD_FIELD_VALIDATION,'{0}',field)):validatorObject());
  }

  export const checkErrors = (cloneForm,name,value,stateObj,refObj,labels)=>{
    for (var property in cloneForm) {
      if (cloneForm.hasOwnProperty(property) && stateObj.hasOwnProperty(property) ) {
        if(property === name){
          let validatedField= validateField(name, value,stateObj,refObj,labels);
          if(validatedField && !validatedField.valid){
            return true;
          }
        }else {
        if(cloneForm[property].hasError || stateObj[property]==''){
          return true;
        }
      }
      }
     }
     return false;
  }
  export const validateField = (fieldName, value,stateObj,refObj,labels)=>{
    var cloneForm = Object.assign({}, stateObj.formErrors); 
    let validatedObj = validateFormField(stateObj.formErrors[fieldName].rules,refObj[fieldName].props.label,value,labels);
    cloneForm[fieldName]["hasError"] = !validatedObj.valid;
    cloneForm[fieldName]["errorMsg"] = validatedObj.message;
    validatedObj["formElements"] = cloneForm;
    return validatedObj;
}

export const replaceValue = (message,searchString, replaceString) => {
  return (message.indexOf(searchString) !== -1 ? message.replace(searchString,replaceString) : message);
}

export const responseSplitter =({data,operation,entity,SuccessLabel,FailureLabel,name})=>{
  let result = {status:"FAILED",data:data};
  let success_status = [200,201,204];
  if(data){
    result.detailedMessage = data.data;
   if(success_status.some(a => a == data.status)){
     result.status = "SUCCESS";
     result.message = replaceValue(SuccessLabel,'{0}',name);
   }else{
    result.message =  data.data && data.data.indexOf(":") !== -1 ?( ((data.data.split(":")[1] || "").trim() && data.data.split(":").length==2) ? (data.data.split(":")[1] || "").trim() :replaceValue(FailureLabel,'{0}',name)):replaceValue(FailureLabel,'{0}',name);
    }
  }else{
    result.message  = replaceValue(FailureLabel,'{0}',name);
  }
  return result;
}
