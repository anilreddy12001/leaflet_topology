import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';
import { AlertDialogError, ProgressIndicatorCircular } from '@nokia-csf-uxr/csfWidgets';

export const addData = (data) => {
    //Processing
    var self = this ? this : {};

    self.isJSON = (str) => {
        try {
            return (JSON.parse(str) && !!str);
        } catch (e) {
            return false;
        }
    }

    self.validData = (data) => {
        var fileData;
        var reader = new FileReader();

        reader.onload = function () {
            fileData = reader.result;
        }

        reader.readAsText(data.value[data.value.length - 1].file);

        return self.isJSON(fileData);
    }

    return function (dispatch) {

        if (data.value && data.value.length >0  && data.value[0].filename &&  data.value[0].filename.indexOf(".json") ==-1){
            //data.value || []).filter((item) => (item.filename).indexOf(".json") !=-1) ){ //checking valid file type
            dispatch({
                type: "INVALID_FILE",
                message: "File type not supported"
            })
        } else { //Checking valid JSON
            var fileData;
            var reader = new FileReader();

            reader.onload = function () {
                fileData = reader.result;

                if (self.isJSON(fileData)) {
                    dispatch({
                        type: "ADD_PROFILES_DATA",
                        payload: data.value.filter((item) => item.status == "pending")
                            .map((item) => Object.assign({}, item, {
                                status: "complete",
                                text: fileData
                            }))
                    });
                } else {
                    dispatch({
                        type: "INVALID_FILE",
                        message: "Invalid data"
                    })
                }
            }

            reader.readAsText(data.value[data.value.length - 1].file);
        }

    }

}

export const deleteData = (data, fileName) => {
    return function (dispatch) {
        dispatch({
            type: "DELETE_PROFILES_DATA",
            payload: data.filter((item) => item.filename != fileName)
        });
    }

}

var progressOptions = {
    spinner: "right"
     ,overlay:true
     ,css : {small: false, medium: false, large: false, xlarge: true, xxlarge: false}
     
  };

export const saveProfile = (payload, props) => {
    var component1 = React.createElement(ProgressIndicatorCircular, progressOptions);
    ReactDOM.render(component1, document.getElementById("progressIndicatorCircularID"));
    var self = this ? this : {};
    var data = props.dataSource;
    var propsCode = props.propsCode;
    if(payload.length!=0){
    return function (dispatch) {
        return axios({
                method: 'POST',
                url: data.url,
                headers: data.headers,
                data: payload[0].text
            }).then(function (response) {
                ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularID"));
                dispatch({
                    type: "SAVE_PROFILES_DATA",
                    message: "PROFILE_CREATED_SUCCESSFULLY"+":"+response.data.ProfileName,
                    checkFlag : true
                });
            })
            .catch((error) => {
                console.log('Error', error.message);
                dispatch({
                    type: "SAVE_PROFILES_DATA",
                    message: error.response.data.split(":")[1].trim(),
                    checkFlag : false
                });
            });
    }
}else {
     
      var aboutOptions ={
            id: "errorDialog"
            , title: propsCode.ADD_PROFILE_FAILED
            , errorText: propsCode.UPLOAD_PROFILE  
              ,onClose: function () {
               
                ReactDOM.unmountComponentAtNode(document.getElementById("infoDialog"));  
            }
        };
            var component = React.createElement(csfWidgets.components.AlertDialogError, aboutOptions);
            ReactDOM.render(component, document.getElementById("infoDialog"));   
} 
}

export const resetStore = () => {
    return function (dispatch) {
        dispatch({
            type: "RESET_STORE"
        });
    }

}