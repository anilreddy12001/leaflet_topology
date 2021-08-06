/**
 *  
 * Container: searchContainer.js
 *
 * @version 1.0
 * @author hpanda
 *
 */

'use strict';

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { SearchwChipsScopeConditionQuery} from "@nokia-csf-uxr/csfWidgets";
import { getSearchData, searchTokenData, resetStore } from '../actions/searchAction.js'
import SearchCore from './searchCore.js';



//Container Class
class SearchComp extends SearchCore {

    constructor(props) {
        super(props)
        this.state={
            chips:[]
        }
    }
    
    static get defaultProps() {
        return { }
    }

    componentWillReceiveProps(nextProp) {
        if(nextProp.options.getSearchResult){
            nextProp.options.getSearchResult(nextProp.searchTdata)
        }
    }

    componentDidMount() {
        console.log(this.props);
    }
    
    componentWillUnmount() {
        this.props.resetStore();
    }

    onUpdate(chips){
        const { dataSource, onTokenChange } = this.props.options;
        onTokenChange(chips.data);
        
        this.setState({chips:chips.data})
        if(dataSource.searchAPI)
            this.props.getSearchData(chips);
    }

    componentWillMount() {
        const { dataSource, chips, onTokenChange} = this.props.options;
        const { searchTokenData } = this.props;
		if(chips && chips.length > 0){
			this.setState({chips: chips})
			onTokenChange(chips);
        }
        searchTokenData(dataSource); 
    }

    render() {
        return (
           <SearchwChipsScopeConditionQuery delayedFetch={false} asyncFetchQueries={ text => new Promise((resolve) => { resolve(!_.isEmpty(text) ? [{ value: text, label: text }] : []); })}
            listMaxHeight={320} onUpdate={this.onUpdate.bind(this)} queryGroupName="query" scopeGroupName="scope" placeHolder="Search" acceptOpenQuery={false} scopes={this.props.queryData || []} chips={this.state.chips}/>
        )
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getSearchData: getSearchData,
        resetStore: resetStore,
        searchTokenData: searchTokenData,
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        searchTdata : state.search.data,
        queryData : state.search.searchColumnData
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchComp);



