/**
 *  
 * Component : globalSearchContainer.js
 *
 * @author Sunitha.S
 *
 */
/**
 * @class Global Search
 * @memberof SUREUI.components
 * */
import React, { Component } from 'react';
import { Provider } from 'react-redux';
 import GlobalSearchData from '../containers/globalSearchContainer'
import store from '../store/store';
import { ToastContainer, toast } from 'react-toastify';
//Add Provider to the root
class GlobalSearch extends Component{
     render(){    
        return(
            <Provider store={store}>
                <div>
                    <GlobalSearchData gSearchData = {this.props}/>
                    <ToastContainer
                        position="bottom-center"
                        autoClose={3000}
                        hideProgressBar={true}
                        newestOnTop={false}/>
                </div>
            </Provider>
        )
    }
}
export default GlobalSearch;