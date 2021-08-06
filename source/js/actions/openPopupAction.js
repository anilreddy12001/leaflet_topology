import axios from 'axios';
import React, { Component } from 'react';
import { UAM_LABELS } from "../helpers/uam/uamConstants";
import { Snackbar } from '@nokia-csf-uxr/csfWidgets';

import { populateQuery } from './globalSearchAction';

export const saveSearchCategoryList = (data) => {

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
            else {
                catListObj = [];
            }
            dispatch({
                type: 'GET_CATEGORY_LIST_DATA_SUCCESS',
                payload: {
                    response: catListObj
                }
            });
        })
    }
}


export const fetchSearchPopupData = (data) => {
    return function (dispatch) {
        return axios({
            method: data.method,
            url: data.url,
            headers: data.requestHeaders

        }).then(function (response) {
            var details = {};
            if (response.data && response.data.element && response.data.element.length != 0) {
                var data = response.data.element[0];
                if (data && data.properties) {
                    details['QueryInfo'] = data.properties;
                }
            }
            dispatch({
                type: 'FETCH_SEARCHQUERY_DATA',
                payload: {
                    response: details
                }
            });
        });
    }
}


export const onDeleteSearchData = (data, refreshCategoryInBasePage) => {
    refreshCategoryInBasePage["requestHeaders"] = data.requestHeaders ? data.requestHeaders : {};
    return function (dispatch) {
        return axios({
            method: data.method,
            url: data.url,
            headers: data.requestHeaders

        }).then(function (response) {
            var msg = "DELETED SUCCESSFULLY";
            dispatch(populateQuery(refreshCategoryInBasePage));
            dispatch({
                type: "DELETE_SEARCH_DATA",
                payload: {
                    response: msg
                }
            });
        }).catch((error) => {
            var type = "DELETE_ERROR";
            var msg = "DeleteFailed"
            dispatch({
                type: type,
                payload: {
                    response: msg
                }
            });
        });
    }
}


export const savePayload = (data, refreshCategoryInBasePage) => {
    if (data.length != 0) {
        return function (dispatch) {
            return axios({
                method: data.method,
                url: data.url,
                headers: data.requestHeaders,
                data: data.payload
            }).then(function (response) {
                let msg = "ADDED";
                if (data.EditSearchPayload) {
                    msg = "UPDATED";
                }



                if (refreshCategoryInBasePage.basePageCategory !== "") {
                    refreshCategoryInBasePage["requestHeaders"] = data.requestHeaders ? data.requestHeaders : {};
                    dispatch(populateQuery(refreshCategoryInBasePage));
                }

                dispatch({
                    type: 'ADD_SEARCH_PAYLOAD',
                    payload: {
                        response: msg + " :" + (response.data.SureName ? response.data.SureName : data.payload.SureName)
                    }
                });
            }).catch((error) => {
                let _errorRes = error.response;
                var type = "UPDATE_ERROR";
                var errorData = {
                    "updateError": "UpdateFailed"
                };
                let eMessage = _errorRes && (_errorRes.data || _errorRes.data.message)

                if (eMessage.indexOf(':') > -1) {
                    errorData["response"] = eMessage.split(":")[1].trim();
                } else {
                    errorData["response"] = eMessage;
                }
                dispatch({
                    type: type,
                    payload: {
                        response: errorData
                    }
                });
            });
        }
    } else {
        var aboutOptions = {
            id: "errorDialog",
            title: propsCode.ADD_PROFILE_FAILED,
            errorText: propsCode.UPLOAD_PROFILE,
            onClose: function () {
                ReactDOM.unmountComponentAtNode(document.getElementById("infoDialog"));
            }
        };
        var component = React.createElement(csfWidgets.components.AlertDialogError, aboutOptions);
        ReactDOM.render(component, document.getElementById("infoDialog"));
    }
}

export const unmountSearchPopup = () => {
    return function (dispatch) {
        dispatch({
            type: 'RESET_SEARCH_DATA'
        });
    }
}
