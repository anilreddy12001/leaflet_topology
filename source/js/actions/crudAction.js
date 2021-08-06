import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { ProgressIndicatorCircular } from '@nokia-csf-uxr/csfWidgets';


export const saveTenant = (data) => {
    return function(dispatch){
        return axios ({
            method: "POST",
            url: data.url,
            headers: data.requestHeaders,
            data: data.payload
            
        }).then(function(response)
        {
        dispatch(
             {
                type : 'CREATE_TENANT_RESPONSE',
                payload : response
             }
            );

        }).catch((error) => {
             console.log('Error', error.message);
             console.log(error.config);
         })
}
}

export const clearUserMessage = (data) => {
    return function(dispatch){
        dispatch(
            {
               type : 'USER_MESSAGES',
               payload : ""
            }
           ); 
    }
}

var progressOptions = {
    spinner: "right"
     ,overlay:true
     ,css : {small: false, medium: false, large: false, xlarge: true, xxlarge: false}
     
  };

export const userAction = (data) => {
   
    var component1 = React.createElement(ProgressIndicatorCircular, progressOptions);
    ReactDOM.render(component1, document.getElementById("progressIndicatorCircularID"));
    return function(dispatch){
        return axios ({
            method: data.method,
            url: data.url,
            headers: data.requestHeaders,           
            data: data.payload
        }).then(function(response)
        {
            ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularID"));  
            console.log(response);
        if('FETCH_USERGROUPS' == data.operation) { 
            let usergroupsData = response.data.element;
            let usergroups = usergroupsData.map(item => {
              let newObj = {};
              newObj['label'] = item.properties.UserGroupName;
              newObj['value'] = item.properties.UserGroupName;
              return newObj;
            })
         dispatch(
             {
                type : 'FETCH_USERGROUPS',
                payload : usergroups
             }
            );
        }
        else{
            dispatch(
                {
                   type : 'USER_MESSAGES',
                   payload : response
                }
               ); 
        }
        }).catch((error) => {
             console.log('Error', error.message);
             console.log(error.config);
             let userMessage = error.response;
             ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularID"));
             dispatch(
                {
                   type : 'USER_MESSAGES',
                   payload : userMessage
                   //payload : errorData.substr(errorData.lastIndexOf(':')+1)
                }
               );
         })
}
}

export const resetUAMStore = () => {
    return function (dispatch) {
        dispatch({
            type: "RESET_STORE"
        });
    }

}