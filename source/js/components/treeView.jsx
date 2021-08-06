 /**
 * @class openPopup
 * @memberof SUREUI.components
 *
 
 */ 

import React, { Component } from 'react';
import { Provider } from 'react-redux';
import TreeViewForMap from '../containers/treeViewContainer'
import store from '../store/store';


class TreeView extends Component{
     render(){
        return(
            <Provider store={store}>
            <div>
                <TreeViewForMap treeViewData = {this.props} />
                </div>
            </Provider>
              
        )        
    }
}

export default TreeView;