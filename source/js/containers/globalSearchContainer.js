/**
 * 
 *  
 * Container: globalSearchContainer.js
 *
 * @version 1.0
 * @author Sunitha.S
 *
 */
'use strict';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect, Provider } from 'react-redux';
import { categoryList, unmountGlobalSearch, populateQuery, searchQuery } from '../actions/globalSearchAction.js';
import { TextInput, SelectItem, TextArea, AppToolbar, Button, DataGrid, AlertDialogError, AlertDialogInfo } from '@nokia-csf-uxr/csfWidgets';
import { UAM_LABELS } from "../helpers/uam/uamConstants";
import { checkErrors, validateField, responseSplitter } from "../helpers/uam/FormValidator";
import OpenPopup from "../components/openPopup.jsx"
import '../../styles/globalSearch.css';
class GlobalSearchData extends Component {
      constructor(props) {
            super(props);
            this.isEditable = true;
            var self = this;
            this.state = {
                  text: '',
                  textDesc: '',
                  category: '',
                  query: '',
                  disabled: true,
                  pageTitle: '',
                  searchDataSet: '',
                  searchType: '',
                  searchData: '',
                  promptText: '',
                  columnResult: '',
                  rowResult: '',
                  openPopupData: props.gSearchData.searchPopupData,
                  uuid: '',
                  datagrid: '',
                  formErrors: {
                        category: { hasError: false, errorMsg: '', rules: ['required'] },
                        query: { hasError: false, errorMsg: '', rules: ['required'] }
                  },
                  formHasError: true
            };

            this.state.openPopupData.onDelete = function (flag) {
                  self.isEditable = !flag;
            }
            this.UAM_LABELS = props.gSearchData.propsCode ? props.gSearchData.propsCode : UAM_LABELS;
      }
      static get defaultProps() {
            return { category: [], query: [], hasError: false }
      }

      renderInfoDialog(title, detailedMsg) {
            var aboutOptions = {
                  id: "alertDialogInfo",
                  title: title,
                  infoText: detailedMsg,
                  onClose: function () {
                        ReactDOM.unmountComponentAtNode(document.getElementById("infoDialog"));
                  }
            };
            var component = React.createElement(AlertDialogInfo, aboutOptions);
            ReactDOM.render(component, document.getElementById("infoDialog"));
      }

      renderErrorDialog(title, detailedMsg) {
            var aboutOptions = {
                  id: "errorDialog",
                  title: title,
                  errorText: detailedMsg,
                  onClose: function () {
                        ReactDOM.unmountComponentAtNode(document.getElementById("errorDialog"));
                  }
            };

            var component = React.createElement(AlertDialogError, aboutOptions);
            ReactDOM.render(component, document.getElementById("errorDialog"));
      }
      onChangeCategory(newText) {
            var cloneForm = Object.assign({}, this.state.formErrors);
            cloneForm.category.errorMsg = '';
            const { gSearchData, populateQuery } = this.props;
            this.setState({
                  category: newText.value, formErrors: cloneForm, searchData: '',
                  formHasError: checkErrors(cloneForm, 'category', newText.value, this.state, this.refs, this.UAM_LABELS),
                  textDesc: "",
                  searchType: "",
                  searchData: "",
                  uuid: ""
            });

            if (newText && newText.value) {
                  populateQuery({
                        requestHeaders: gSearchData.requestHeaders ? gSearchData.requestHeaders : {},
                        method: gSearchData.method,
                        url: gSearchData.domain + "items?q=Label;EQUALS;Template%20Search&q=Type;EQUALS;" + newText.value,
                  });
            }
      }

      onChangePrompt(promptTextVal) {
            this.setState({ promptText: promptTextVal.value.trim() });
      }
      onChangeQuery(newText) {
            var cloneForm = Object.assign({}, this.state.formErrors);
            cloneForm.query.errorMsg = '';
            const { gSearchData } = this.props

            this.setState({
                  query: newText.value,
                  formHasError: checkErrors(cloneForm, 'query', newText.value, this.state, this.refs, this.UAM_LABELS)
            });

            var savedSearchData = this.state.searchDataSet;
            if (savedSearchData && savedSearchData != undefined) {
                  savedSearchData.map(function (value, key) {
                        var item = value.properties['SureName'];
                        if (item == newText.value) {
                              this.setState({
                                    textDesc: value.properties['Description'],
                                    searchType: value.properties['Search Type'],
                                    searchData: value.properties['Data'],
                                    uuid: value.properties['UUID']
                              });
                        }
                  }, this);
            }
      }

      saveGlobalSearch(e) {
            const { gSearchData, searchQuery } = this.props;
            e && e.preventDefault();
            var promptText = this.state.promptText;
            var searchTypeData = this.state.searchType;
            var searchItem = this.state.searchData;

            var newQueryString = '';
            var constuctedQueryStr = [];

            if (searchItem != "" && searchItem != undefined) {
                  var searchArray = [];
                  var inputPromptText = [];
                  // searchArray = strToArray(searchItem.trim(), "${var}");
                  var temp = searchItem.trim();
                  var count = (temp.match(/\${var}/g) || []).length;
                  console.log(count);
                  inputPromptText = strToArray(promptText, ",");
                  if (count === inputPromptText.length) {
                        for (var i = 0; i < inputPromptText.length; i++) {
                              searchItem = searchItem.replace('${var}', inputPromptText[i])
                        }
                        searchItem = searchItem.replace(/\${var}/g, ' ');

                        if (searchTypeData == "Query String") {

                              if(this.state.category.toLowerCase()== "policy"){
                                    searchQuery({
                                          requestHeaders: gSearchData.requestHeaders ? gSearchData.requestHeaders : {},
                                          method: gSearchData.method,
                                          columnUrl: gSearchData.catUrl + "specifications?q=ASC;specName&q=specName;EQUALS;EntityAttribute&q=specType;EQUALS;GlobalSearch&q=subType;EQUALS;English",
                                          url: gSearchData.domain + "policies?" + searchItem
                                    })
                              }
                              else{
                                    searchQuery({
                                          requestHeaders: gSearchData.requestHeaders ? gSearchData.requestHeaders : {},
                                          method: gSearchData.method,
                                          columnUrl: gSearchData.catUrl + "specifications?q=ASC;specName&q=specName;EQUALS;EntityAttribute&q=specType;EQUALS;GlobalSearch&q=subType;EQUALS;English",
                                          url: gSearchData.domain + this.state.category.toLowerCase() + "s?" + searchItem
                                    })
                              }
                              
                        }
                        else {
                              var payloadData = JSON.parse(searchItem);
                              payloadData.response['responseType'] = "List";
                              searchQuery({
                                    requestHeaders: gSearchData.requestHeaders ? gSearchData.requestHeaders : {},
                                    method: "POST",
                                    columnUrl: gSearchData.catUrl + "specifications?q=ASC;specName&q=specName;EQUALS;EntityAttribute&q=specType;EQUALS;GlobalSearch&q=subType;EQUALS;English",
                                    url: gSearchData.domain + "topology",
                                    payload: payloadData
                              })
                        }

                  }
                  else {
                        this.renderErrorDialog("Error", "Please provide valid number of inputs according to the description");
                  }
                  //searchItem = searchItem.replace('${var}', promptText);
            }
            else {
                  this.renderInfoDialog("Alert", "Please select the Query");
            }
      }

      componentWillMount() {
            const { gSearchData, categoryList, unmountGlobalSearch } = this.props;
            this.setState({ pageTitle: this.UAM_LABELS.TEMPLATE_SEARCH });

            categoryList({
                  requestHeaders: gSearchData.requestHeaders ? gSearchData.requestHeaders : {},
                  method: gSearchData.method,
                  url: gSearchData.catUrl + "specifications?q=ASC;specName&q=specName;EQUALS;SUREGUIMenu&q=subType;EQUALS;English"
            });

            unmountGlobalSearch({});

      }
      componentDidUpdate(prevProps) {
            // Typical usage (don't forget to compare props):
            if (this.props.querySearchData !== prevProps.querySearchData) { }
      }

      componentWillReceiveProps(nextProps) {
            if (nextProps.querySearchData) {
                  this.setState({ searchDataSet: nextProps.querySearchData })
            }
            if (nextProps.querySearchDataFailure) {
                  this.renderErrorDialog(this.UAM_LABELS.SEARCH_FAILED, nextProps.querySearchDataFailure);
            }
            if (nextProps.gridrowError) {
                  this.renderErrorDialog("ERROR", nextProps.gridrowError)
            }
            if (nextProps.gridColumnSearchData && Object.keys(nextProps.gridColumnSearchData).length > 0 && nextProps.gridRowSearchData) {
                  this.setState({
                        datagrid:
                              <div className="dataGridDiv">
                                    <span className="gridHeading">{this.UAM_LABELS.QUERY_RESULTS}</span>
                                    <div style={{ height: "600px", width: "100%" }}>
                                          <DataGrid gridOptions={{
                                                columnDefs: nextProps.gridColumnSearchData,
                                                rowData: nextProps.gridRowSearchData
                                          }}
                                                onGridReady={this.onGridReady.bind(this)}
                                                onRowSelected={this.rowSelectedFn.bind(this)} />
                                    </div>
                              </div>
                  });
            }
      }
      onGridReady(params) {
            this.api = params.value.api;
      }
      // to pass the selected row data
      rowSelectedFn() {
            const { gSearchData } = this.props;
            var selectedRows = this.api.getSelectedRows();
            if (gSearchData.onRowSelect) {
                  gSearchData.onRowSelect(selectedRows);
            }
            this.api.deselectAll();
      }
      render() {
            console.log("inside global search render:");
            console.log(this.props);
            var { gSearchData } = this.props;
            var this1 = this;
            var crudSearchPopup = this1.state.openPopupData;
            const refreshCategoryInBasePage = {
                  method: gSearchData.method,
                  url: gSearchData.domain + "items?q=Label;EQUALS;Template%20Search&q=Type;EQUALS;" + this.state.category,
                  basePageCategory: this.state.category
            }

            if (gSearchData.isAdmin  || gSearchData.isLabelFilter) {
                  var iconButtonProps = {
                        iconBtns: [
                              {
                                    id: 'add',
                                    icon: gSearchData.imageIconurl + require("../../images/dataGrid/ic_add.svg"),
                                    value: 'add',
                                    toolTip: true,
                                    toolTipText: 'Add',
                              },
                              {
                                    id: 'edit',
                                    icon: gSearchData.imageIconurl + require("../../images/dataGrid/ic_edit.svg"),
                                    value: 'edit',
                                    toolTip: true,
                                    toolTipText: 'Edit',
                              }
                        ],

                        onIconButtonClick(onClickedObject) {
                              console.log(onClickedObject.value);
                              crudSearchPopup["refreshCategoryInBasePage"] = refreshCategoryInBasePage;
                              if (onClickedObject.value == "add") {
                                    crudSearchPopup["editSearchPayload"] = false;
                                    var component1 = React.createElement(OpenPopup, crudSearchPopup);
                                    ReactDOM.render(component1, document.getElementById("openPopupId"));
                              }
                              else if (onClickedObject.value == "edit") {
                                    if (this1.isEditable == true || this1.state.uuid != '') {
                                          if (this1.state.uuid != '') {
                                                crudSearchPopup.uuid = this1.state.uuid;
                                                if (crudSearchPopup.uuid) {
                                                      crudSearchPopup.editSearchPayload = true;
                                                }
                                                else {
                                                      crudSearchPopup.editSearchPayload = false;
                                                }
                                                var component1 = React.createElement(OpenPopup, crudSearchPopup);
                                                ReactDOM.render(component1, document.getElementById("openPopupId"));
                                          }
                                          else {
                                                this1.renderInfoDialog(this1.UAM_LABELS.SELECT_QUERY_TO_EDIT, this1.UAM_LABELS.PLEASE_SELECT_QUERY);
                                          }
                                    }
                                    else {
                                          this1.renderErrorDialog(this1.UAM_LABELS.ERROR, this1.UAM_LABELS.RECORD_NOT_EXISTS);
                                    }
                              }
                        },
                        moreButtonToolTip: false
                  };
            }
            else {
                  var iconButtonProps = { iconBtns: [] }
            }

            if (this.props.responseData && Object.keys(this.props.responseData).length > 0) {
                  var categoryDataSet = this.props.responseData;
                  //categoryDataSet.push("Policy");
                  var categoryArray = [];
                  var queryListArray = [];
                  categoryArray = formatDataSet(categoryDataSet);
                  if (this.props.queryResponseData && Object.keys(this.props.queryResponseData).length > 0) {
                        var queryDataSet = this.props.queryResponseData;
                        queryListArray = formatDataSetQuery(this.state.category, queryDataSet);
                  }
                  var imagepath = require("../../images/dv_backspace_black.svg");
                  return (
                        <div>
                              <AppToolbar id="basic" pageTitle={this.state.pageTitle} subTitle="" {...iconButtonProps} />
                              <div>
                                    <form onSubmit={this.saveGlobalSearch.bind(this)}>
                                          <div className="searchLayout">
                                                <div className="gSearchRdiv">
                                                      <div>
                                                            <SelectItem id="category" name="category" ref="category"
                                                                  data={categoryArray} required={true}
                                                                  label={this.UAM_LABELS.CATEGORY}
                                                                  selectedItem={this.state.category}
                                                                  errorMsg={this.state.formErrors.category.errorMsg}
                                                                  error={this.state.formErrors.category.hasError}
                                                                  onChange={this.onChangeCategory.bind(this)}
                                                                  maxHeight={150} />
                                                      </div>
                                                      <div className="divAlign">
                                                            <SelectItem id="query" name="query" ref="query"
                                                                  data={queryListArray} required={true}
                                                                  label={this.UAM_LABELS.QUERY}
                                                                  selectedItem={this.state.query}
                                                                  errorMsg={this.state.formErrors.query.errorMsg}
                                                                  error={this.state.formErrors.query.hasError}
                                                                  onChange={this.onChangeQuery.bind(this)}
                                                                  maxHeight={100} />
                                                      </div>
                                                </div>
                                                <div className="gSearchRdiv">
                                                      <TextArea
                                                            id="searchDesc"
                                                            text={this.state.textDesc}
                                                            label={this.UAM_LABELS.DESCRIPTION}
                                                            rows={4}
                                                            column={30}
                                                            disabled={this.state.disabled} />

                                                </div>
                                          </div>
                                          <div className="promptTextClass">
                                                <TextInput id="prompt" onChange={this.onChangePrompt.bind(this)} label={this.UAM_LABELS.PROMPT} text={this.state.promptText} width={800} />
                                                <span className="searchBtnClass">
                                                      <Button id="submit" text={this.UAM_LABELS.SEARCH} isCallToAction={true} disabled={this.state.formHasError} />
                                                </span>
                                          </div>
                                    </form>
                                    {this.state.datagrid}
                              </div>
                        </div>)
            }
            else {
                  return null
            }

      }

}
function formatDataSet(dataSet) {
      var listArray = [];
      dataSet.map(function (value, key) {
            var obj = {};

            obj['label'] = value;
            obj['value'] = value;

            if (obj['label'] != 'Association') {
                  this.push(obj);
            }
      }, listArray);
      return listArray
}
function strToArray(inputStr, str) {
      // var str = inputStr.match("${var}");
      var temp = new Array();
      temp = inputStr.split(str);
      return temp;

}
function formatDataSetQuery(entity, dataSet) {
      var listArray = [];
      dataSet.map(function (value, key) {
            var obj = {};

            obj['label'] = entity + "." + value;
            obj['value'] = value;

            this.push(obj);
      }, listArray);
      return listArray
}
function mapStateToProps(state) {
      let dataObj = {};
      if (state.globalSearch.responseData) {
            const _gbSearch = state.globalSearch;
            dataObj = {
                  responseData: _gbSearch.responseData,
                  queryResponseData: _gbSearch.queryResponseData,
                  querySearchData: _gbSearch.querySearchData,
                  searchResult: _gbSearch.searchResult,
                  gridRowSearchData: _gbSearch.gridRowSearchData,
                  gridColumnSearchData: _gbSearch.gridColumnSearchData,
                  querySearchDataFailure: _gbSearch.querySearchDataFailure,
                  gridrowError: _gbSearch.gridrowError
            }
      }
      return dataObj;
}
function mapDispatchToProps(dispatch) {

      return bindActionCreators({
            categoryList: categoryList,
            populateQuery: populateQuery,
            searchQuery: searchQuery,
            unmountGlobalSearch: unmountGlobalSearch
      }, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(GlobalSearchData);
