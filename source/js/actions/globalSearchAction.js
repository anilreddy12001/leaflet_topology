/**
 *  
 * Action: globalSearchAction.js
 *
 * @version 1.0
 * @author Sunitha.S
 *
 */

import axios from 'axios';
import React, { Component } from 'react';
import { ProgressIndicatorCircular } from '@nokia-csf-uxr/csfWidgets';

//Action Creators
//API call
export const categoryList = (data) => {
      var catListObj = [];
      return function (dispatch) {
            return axios({
                  method: data.method,
                  url: data.url,
                  headers: data.requestHeaders,
            }).then(function (response) {
                  var catData = response.data.entityAttributes.SUREGUIMenu.defaultAttribute;
                  if (catData && catData != undefined) {
                        catData.map(function (value, key) {
                              var item = value["visibleColumn"]
                              this.push(item);
                        }, catListObj);
                  }
                 // catListObj.push("Policy");
                  dispatch({
                        type: 'GET_CATEGORY_LIST_DATA_SUCCESS',
                        payload: {
                              response: catListObj
                        }
                  });
            });
      }
}

export const populateQuery = (data) => {
      var queryListObj = [];
      return function (dispatch) {
            return axios({
                  method: data.method,
                  url: data.url,
                  headers: data.requestHeaders,
            }).then(function (response) {
                  var searchResultData;
                  var queryData = response.data.element;
                  if (queryData && queryData != undefined) {
                        queryData.map(function (value, key) {
                              var item = value.properties['SureName']
                              this.push(item);
                        }, queryListObj);
                        searchResultData = queryData

                  }
                  else {
                        queryListObj = [];
                        searchResultData = "";
                  }
                  dispatch({
                        type: 'GET_QUERY_LIST_DATA_SUCCESS',
                        payload: {
                              response: queryListObj
                        }
                  });
                  dispatch({
                        type: 'GET_QUERY_DATA_SUCCESS',
                        payload: {
                              response: searchResultData
                        }
                  });

            }).catch(function (error) {
                  dispatch({
                        type: 'GET_QUERY_DATA_FAILURE',
                        payload: {
                              response: error.response.data
                        }
                  });
            });
      }
}
export const searchQuery = (data) => {
      return function (dispatch) {
            columnSearchResponse(data, dispatch);
            rowSearchResponse(data, dispatch)
      }
}


export const unmountGlobalSearch = () => {
      return function (dispatch) {
            dispatch({
                  type: 'RESET_GSEARCH'
            });
      }
}

function columnSearchResponse(data, dispatch) {
      return axios({
            method: "GET",
            url: data.columnUrl,
            headers: data.requestHeaders
      }).then(function (response) {
            var searchColumnData = [];
            var columnData = response.data.entityAttributes.GlobalSearch.defaultAttribute;
            if (columnData && columnData != undefined) {
                  columnData.map(function (value, key) {
                        var item = {};
                        item['field'] = value["entityAttribute"];

                        item['displayName'] = value["visibleColumn"];

                        this.push(item);
                  }, searchColumnData);
            }
            else {
                  searchColumnData = [];
            }
            dispatch({
                  type: 'GET_COLUMN_GSEARCH_DATA_SUCCESS',
                  payload: {
                        response: searchColumnData
                  }
            });
      });
}

function rowSearchResponse(data, dispatch) {
      if (data.payload) {
            return axios({
                  method: data.method,
                  url: data.url,
                  headers: data.requestHeaders,
                  data: data.payload
            }).then(function (response) {
                  var searchResultData = [];
                  var rowSearch = response.data.entities ? response.data.entities : response.data.element;
                  if (rowSearch) {
                        rowSearch.map(function (value, key) {
                              var item = value["properties"];
                              this.push(item);
                        }, searchResultData);
                  }
                  else {
                        searchResultData = [];
                  }
                  dispatch({
                        type: 'GET_ROW_GSEARCH_DATA_SUCCESS',
                        payload: {
                              response: searchResultData
                        }
                  });
            }).catch(function (error) {
                  var errorData;
                  var type = "ROW_DATA_ERROR";
                  if (error.response.data) {
                        errorData = error.response.data.split(":");
                        errorData = errorData[1];
                  }
                  else {
                        errorData = error;
                  }
                  dispatch({
                        type: type,
                        payload: {
                              response: errorData

                        }
                  });
            });
      }
      else {
            return axios({
                  method: data.method,
                  url: data.url,
                  headers: data.requestHeaders,

            }).then(function (response) {
                  var searchResultData = [];
                  var rowSearch = response.data.entities ? response.data.entities : response.data.element;
                  if (rowSearch) {
                        rowSearch.map(function (value, key) {
                              var item = value["properties"];
                              this.push(item);
                        }, searchResultData);
                  }
                  else {
                        searchResultData = [];
                  }
                  dispatch({
                        type: 'GET_ROW_GSEARCH_DATA_SUCCESS',
                        payload: {
                              response: searchResultData

                        }

                  });
            }).catch(function (error) {
                  var errorData;
                  var type = "ROW_DATA_ERROR";
                  if (error.response.data) {
                        errorData = error.response.data.split(":");
                        errorData = errorData[1];

                  }
                  else {
                        errorData = error;
                  }

                  dispatch({
                        type: type,
                        payload: {
                              response: errorData

                        }
                  });
            });
      }
}