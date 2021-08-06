/**
 *  
 * Component : tenantMgmtContainer.js
 *
 * @author Sunitha.S
 *
 */

import React, { Component } from 'react';
import { Provider } from 'react-redux';
import EmailSettingsPanel from '../containers/emailSettings';
import store from '../store/store';


//Add Provider to the root
class EmailSetting extends Component{
    
     render(){
    
        return(
            <Provider store={store}>
               <div> 
                   <EmailSettingsPanel emailData = {this.props}/>  
                   
                </div>
           </Provider>
            
        )        
    }
}

export default EmailSetting