

/**
 *  
 * Component : search.js
 *
 * @version 1.0
 * @author hpanda
 *
 */

 /**
 * @class Search
 * @memberof SUREUI.components
 *
 * @property {object}  [searchProps] Predefined configuration property for Search component.
 * @property {string}  [searchProps.id] A unique id for the component. For accessibility requirements, there can be no two elements with the same ID on a given page.
 * @property {string}  [searchProps.placeHolder] holds the value to be displayed at Search Panel for the component i.e. Hint text rendered in the search input
 * @property {boolean}  [searchProps.editable] Defermine whether or not the chips are editable.
 * @property {function}  [searchProps.onTokenChange] Callback function which gets called when a new chip it added/deleted, and produces the chips to be consumed
 * @property {function}  [searchProps.getSearchResult] Callback function which gets called when a new chip it added/deleted and produces the search result
 * @property {object}  [dataSource]      Configuartion for SURE UI data model.
 * @property {string}  [dataSource.method = GET] Http method for SURE REST API.
 * @property {string}  dataSource.url  URL for SURE REST API.
 * @property {object}  [dataSource.headers] Additional headers which usually includes metadata and authorization info.
 */ 

import React, { Component } from 'react';
import { Provider } from 'react-redux';
import SearchComp from '../containers/searchContainer'
import store from '../store/store';
//Add Provider to the root
class Search extends Component{
     render(){
        return(
            <Provider store={store}>
                <SearchComp options={this.props} />
            </Provider>
        )        
    }
}

export default Search;