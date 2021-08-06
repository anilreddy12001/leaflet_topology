 /**
 * @class openPopup
 * @memberof SUREUI.components
 *
 
 */ 

import React, { Component } from 'react';
import { Provider } from 'react-redux';
import OpenPopupForSearch from '../containers/openPopupContainer'
import store from '../store/store';
import { ToastContainer, toast } from 'react-toastify';

class OpenPopup extends Component{
     render(){
        return(
            <Provider store={store}>
            <div>
                <OpenPopupForSearch searchPopupData = {this.props} />
                <ToastContainer 
             position="top-center"
             autoClose={100000}
             hideProgressBar={true}
             newestOnTop={true}
           />
           </div>
            </Provider>
              
        )        
    }
}

export default OpenPopup;