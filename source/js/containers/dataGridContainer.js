/**
 *  
 * Container: dataGridContainer.js
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
import { DataGrid, Snackbar, ProgressIndicatorCircular } from '@nokia-csf-uxr/csfWidgets';
import axios from 'axios';
import { gridViewData, unmountGridData, traversalAction, gridSearchData } from '../actions/datalistAction.js';
import { userAction } from '../actions/crudAction';
import { notify, replaceValue, renderErrorDialog, responseSplitter, confirmationPanal } from "../helpers/uam/FormValidator";
import UamHelper, { messageLabels, progressPanal } from "../helpers/uam/UamHelper";
import OverlayLoader from 'react-overlay-loading/lib/OverlayLoader'
import { UAM_LABELS } from "../helpers/uam/uamConstants"
import _ from 'lodash';
import { clearUserMessage } from "../actions/crudAction.js"
//Style
import style from '../../styles/dataGrid.css';

var entityType;
let traversalData;
let columnSelected = [];
let displayedColumnsOnApply = [];
/**
 * 
 * @class DataList
 * @description Container Class
 * @memberof sureUI.components
 **/

class DataList extends Component {
  constructor(props) {
    super(props);
    this.updateData = this.updateData.bind(this);
    //this.responseParseFn = this.responseParseFn.bind(this);
    this.uamHelper = new UamHelper();
    this.state = {
      data: '',
      loading: true,
      historyBaseFlag: false,
      selectedRow: '', selectedMethod: '', initialColumnData: [], deletedRow: ''
    };
    this.ajaxWaiting = true; this.UAM_LABELS = UAM_LABELS;
  }
  static get defaultProps() {
    return {
      sureEntities: ['location', 'network', 'equipment', 'endpoint', 'fcp', 'path', 'service'],
      userMessage: "",
      passRowDataDetail: function passRowData(selectedRowData) {
        if (window.parent)
          window.parent.postMessage(selectedRowData, "*");
        return (selectedRowData);
      }
    }
  }

  componentWillMount() {
    const { gridData, gridViewData, unmountGridData, gridSearchData } = this.props;

    if (gridData.historyBaseFlag) {
      this.setState({
        historyBaseFlag: gridData.historyBaseFlag
      });
    }

    //Action Creators to retrive gridData
    if (Object.keys(gridData.searchPayload).length != 0 && !gridData.searchChips) {

      gridSearchData({
        searchUrl: gridData.domain + 'graphSearch?limit=100&page=1',
        requestHeaders: gridData.requestHeaders ? gridData.requestHeaders : {},
        columnUrl: gridData.metadataUrl + gridData.columnurl,
        selectedEntity: gridData.selectedEntity,
        imageIconurl: gridData.imageIconurl,
        externalIconURL: gridData.externalIconURL,
        stateConfig: gridData.stateConfig,
        passRowData: gridData.passRowData,
        editRow: gridData.editRow,
        deleteRow: gridData.deleteRow,
        traversalEntity: gridData.traversalEntity,
        dataCount: gridData.dataCount,
        searchPayload: gridData.searchPayload,
        rowMenu: gridData.rowMenu,
        nameIcon: gridData.nameIcon,
        historyFlag: gridData.historyFlag,
        //columnResponse: gridData.columnResponse?gridData.columnResponse:colPreferenceSelected,
        columnResponse: gridData.columnResponse,

        clientSideEnabled: gridData.clientSideEnabled
      })
    }

    else {
      var rowUrlConstructed = gridData.domain + gridData.rowurl;
      if (gridData.searchChips) {
        let urlConstructed = rowUrlConstructed + this.uamHelper.checkForQ(gridData.rowurl);
        if (gridData.searchChips) {
          rowUrlConstructed = this.uamHelper.constructSearchUrl(gridData.searchChips, urlConstructed).slice(0, -1);
        }
      }
      gridViewData({
        rowurl: rowUrlConstructed,
        requestHeaders: gridData.requestHeaders ? gridData.requestHeaders : {},
        method: gridData.method,
        columnUrl: gridData.metadataUrl + gridData.columnurl,
        selectedEntity: gridData.selectedEntity,
        imageIconurl: gridData.imageIconurl,
        externalIconURL: gridData.externalIconURL,
        passRowData: gridData.passRowData,
        editRow: gridData.editRow,
        deleteRow: gridData.deleteRow,
        traversalEntity: gridData.traversalEntity,
        stateConfig: gridData.stateConfig,
        dataCount: gridData.dataCount,
        traversalClick: gridData.traversalClick,
        columnResponse: gridData.columnResponse,
        rowMenu: gridData.rowMenu,
        nameIcon: gridData.nameIcon,
        clientSideEnabled: gridData.clientSideEnabled
      });
    }
  }

  onGridReady(params) {
    this.gridApi = params.value.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
    const checkColumnSizeFunc = this.checkColumnSize.bind(this);
    this.updateData(this.props.rowData, this.props.selectedEntity, checkColumnSizeFunc);
    if (this.props.gridData.traversalClick) {
      const { traversalAction } = this.props;
      traversalAction({
        url: this.props.gridData.domain + "graphSearch?limit=100&page=1",
        imageIconurl: this.props.gridData.imageIconurl,
        requestHeaders: this.props.gridData.requestHeaders ? this.props.gridData.requestHeaders : {},
        payload: this.props.gridData.traversalClick,
        method: this.props.gridData.method,
        columnUrl: this.props.gridData.metadataUrl + this.props.gridData.columnurl,
        selectedEntity: entityType
      });
    }
    console.log('all columns');
    console.log(this.gridApi.gridCore.columnApi.getColumnState());
    var initialColumnData = this.gridApi.gridCore.columnApi.getColumnState();
    var newObjDatachecked = [];
    var newObjDataUnchecked = [];
    for (var d = 0; d < initialColumnData.length; d++) {

      if (initialColumnData[d].hide == false) {
        newObjDatachecked.push(initialColumnData[d].colId);
      }
      else {
        newObjDataUnchecked.push(initialColumnData[d].colId);
      }
    }

    var newArrayObj = [];
    newArrayObj = this.columnPreferenceUpdate(newObjDatachecked, newObjDataUnchecked);
    this.props.gridData.columnPreference(newArrayObj);
  }

  dataCountFn(count) {
    const { gridData } = this.props;
    var reloadCount = !(['Lock', 'Unlock', 'Reset password'].includes(this.state.selectedMethod));
    if (gridData.dataCount && reloadCount) {
      gridData.dataCount(count);
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    const { gridData } = nextProps;
    const { gridViewData } = this.props;



    if (nextProps.gridData.selectedEntity && nextProps.gridData.selectedEntity != this.props.gridData.selectedEntity) {

      var rowUrlConstructed = gridData.domain + gridData.rowurl;

      gridViewData({
        rowurl: rowUrlConstructed,
        requestHeaders: gridData.requestHeaders ? gridData.requestHeaders : {},
        method: gridData.method,
        columnUrl: gridData.metadataUrl + gridData.columnurl,
        selectedEntity: gridData.selectedEntity,
        imageIconurl: gridData.imageIconurl,
        externalIconURL: gridData.externalIconURL,
        passRowData: gridData.passRowData,
        editRow: gridData.editRow,
        deleteRow: gridData.deleteRow,
        traversalEntity: gridData.traversalEntity,
        stateConfig: gridData.stateConfig,
        dataCount: gridData.dataCount,
        traversalClick: gridData.traversalClick,
        columnResponse: gridData.columnResponse,

        rowMenu: gridData.rowMenu,
        nameIcon: gridData.nameIcon,
        clientSideEnabled: gridData.clientSideEnabled
      });

    }
    if (_.includes(['Reset password', 'Delete'], nextState.selectedMethod) || ('Delete' === nextState.selectedMethod && ['profiles', 'usergroups'].includes(this.props.gridData.selectedEntity))) {
      return false;
    }
    else {
      return true;
    }
  }

  checkColumnSize() {
    if (!this.columnsResized) {
      this.gridApi.sizeColumnsToFit();
      this.columnsResized = true;
    }
  }
  responseParseFn(response) {
    var dataRow = response.data.entities ? response.data.entities : response.data.element;
    var objRowdata = [];

    if (dataRow) {
      dataRow.map(function (value, key) {
        // if(dataRow.relationships && dataRow.relationships.UG_USES_PROFILE){
        var x;
        if (value.relationships.UG_USES_PROFILE.relationship) {
          x = value.relationships.UG_USES_PROFILE.relationship;
          if (x[0].Target) {
            x = x[0].Target;
            if (x.relationships) {
              x = x.relationships;
              if (x.FOLLOWS_CATALOG) {
                x = x.FOLLOWS_CATALOG;
                if (x.relationship) {
                  x = x.relationship;
                  if (x[0].Target) {
                    x = x[0].Target;

                    if (x.properties) {
                      x = x.properties.SureName;


                    }
                  }

                }
              }
            }



          }
        }

        var item = value["properties"];
        if (Object.keys(x).length === 0) {
          item["Profile"] = '';
        }
        else {
          item["Profile"] = x;
        }

        this.push(item);

      }, objRowdata);
    }
    else {
      objRowdata = [];
    }
    return objRowdata;


  }
  // feeding the result for infinitescroll
  updateData(data, EntityObj, checkColumnSizeFunc) {
    console.log("updateData");
    var data = data;
    console.log("updating datagrid data:");
    console.log(data);
    const { gridData } = this.props;
    var states = this.state;
    var this1 = this;

    if (gridData && !gridData.clientSideEnabled) {
      if (gridData.selectedEntity != 'users' && (!(['Delete', 'Delete', 'Lock', 'Unlock', 'Reset password'].includes(this.state.selectedMethod)))) {
        this.dataCountFn(data ? data.length : 0);
      }
      var reloadCount = !(['Lock', 'Unlock', 'Reset password'].includes(this.state.selectedMethod));
      var newData = this.props;
      var pageCount = 1;
      var endCount;
      var urlConstructed = newData.gridData.domain + gridData.rowurl + this.uamHelper.checkForQ(gridData.rowurl);
      if (gridData.searchChips) {
        urlConstructed = this.uamHelper.constructSearchUrl(gridData.searchChips, urlConstructed);
      }
      var sureConditions = false;
      if (EntityObj && this.props.sureEntities.some(a => a === EntityObj.toLowerCase())) {
        let entity = EntityObj.toLowerCase();
        urlConstructed = newData.gridData.domain + entity + 's?';
        sureConditions = true;
      }
      const dataSource = {
        rowCount: null,
        getRows(params) {
          setTimeout(() => {
            console.log("asking for " + params.startRow + " to " + params.endRow + "Sort " + params.sortModel);
            if (!endCount) {
              endCount = params.endRow;
            }
            var limitGET=100;
            //var limit=100;
            if ((params.endRow != endCount && sessionStorage.getItem("lastRowReached")=="false") || (params.sortModel[0] && params.sortModel[0].sort==sessionStorage.getItem("previousSortDirection") &&(params.sortModel[0] && params.sortModel[0].colId==sessionStorage.getItem("previousSortColId")) )) {
              pageCount++;
              endCount = params.endRow;
            }
            else{
              limitGET= params.endRow;
             // limit=params.endRow;
              //pageCount=1;
          }
          
          //sessionStorage.getItem("previousSortDirection")==params.sortModel[0].sort;
            if((params.sortModel && params.sortModel[0] && (params.sortModel[0].sort!=sessionStorage.getItem("previousSortDirection")) ) || (params.sortModel.length==0 && sessionStorage.getItem("previousSortDirection")!="nosort") || (params.sortModel[0] && params.sortModel[0].colId!=sessionStorage.getItem("previousSortColId"))){
             pageCount=1;
            }
            var sortingUrl = '';
            var direction;
            var colName;
            
            if (params.sortModel.length != 0 && !gridData.clientSideEnabled) {
              var sortOrder = params.sortModel[0];
              direction = sortOrder['sort'];
              colName = sortOrder['colId'];
              sortingUrl = 'q=' + direction.toUpperCase() + ';' + colName + '&';

            }
            
            if (newData.gridData.requestHeaders['TransformationEnabled'] == false) {
              newData.gridData.requestHeaders['TransformationEnabled'] = true;
            }
            if (traversalData) {
              var traversePayload = JSON.parse(JSON.stringify(traversalData[2]));
            }
            console.log("searchLoad : " + Object.keys(gridData.searchPayload).length);
            if ((Object.keys(gridData.searchPayload).length === 0 && traversePayload == undefined && (entityType == undefined || states.historyBaseFlag)) || (gridData.searchChips) || (gridData.historyFlag=="historyGet" && sessionStorage.getItem("dataGridAction")=="get")) {
              console.log("Fresh Search/sorting(going as get query)..");
              //loading icon starts here
              //waiting(true);
              var progressOptions = {
                spinner: "right"
                , overlay: true
                , css: { small: false, medium: false, large: false, xlarge: true, xxlarge: false }

              };
              var component1 = React.createElement(ProgressIndicatorCircular, progressOptions);
              document.getElementById("progressIndicatorCircularID") && ReactDOM.render(component1, document.getElementById("progressIndicatorCircularID"));



              var urlWithSort = urlConstructed + sortingUrl + (sureConditions ? 'criteria=onlyRoot&limit='+limitGET+'&page=' + pageCount + '&expand=Capacity,State' : ('limit=100&page=' + pageCount));
              var reqHeaders = UamHelper.headerWithoutTransform(newData.gridData);
             
              return axios({
                method: newData.gridData.method,
                url: urlWithSort,
                headers: reqHeaders
              }).then(function (response) {
                //loading icon ends here
                //waiting(false);
                document.getElementById("progressIndicatorCircularID") && ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularID"));

                var lastRow = -1;
                var objRowdataNew = [];
                if (gridData.selectedEntity == 'usergroups') {
                  objRowdataNew = this1.responseParseFn(response)
                }
                else if (gridData.selectedEntity == 'customhook') {
                  var dataRow = response.data.entities ? response.data.entities : response.data.element;
                  if (dataRow) {
                    dataRow.map(function (value, key) {
                      var item = value["properties"];
                      if (item.GlobalCustomHook && item.GlobalCustomHook == "yes") {
                        this.push(item);
                      }
                    }, objRowdataNew);
                  }
                  else {
                    objRowdataNew = [];
                  }
                }
                else {
                  var dataRow = response.data.entities ? response.data.entities : response.data.element;


                  if (dataRow) {
                    dataRow.map(function (value, key) {
                      var item = value["properties"];
                      this.push(item);
                    }, objRowdataNew);
                  }
                  else {
                    objRowdataNew = [];
                  }
                }
                if (gridData.dataCount) {

                  reloadCount && gridData.dataCount(params.startRow + objRowdataNew.length);
                }
                if (objRowdataNew.length < 100) {
                  lastRow = params.startRow + objRowdataNew.length;
                  sessionStorage.setItem("lastRowReached","true");
                  
                }
                else{
                  sessionStorage.setItem("lastRowReached","false");
                }
                if(params.sortModel && params.sortModel[0] && params.sortModel[0].sort){
                  sessionStorage.setItem("previousSortDirection",params.sortModel[0].sort);
                  sessionStorage.setItem("previousSortColId",params.sortModel[0].colId);
                }
                else{
                  sessionStorage.setItem("previousSortDirection","nosort");
                  sessionStorage.setItem("previousSortColId","");
                }
                
                params.successCallback(objRowdataNew, lastRow);
                this1.columnResize(this1.gridApi, this1.props);
              });

            }
            else if (Object.keys(gridData.searchPayload).length > 0 && entityType == undefined) {
              console.log("Fresh Search/sorting(going as post query with search)..");
              var searchPayloadWithSort = gridData.searchPayload;
              if (direction && colName) {
                searchPayloadWithSort.response.responseFilter = [

                  { "for": gridData.selectedEntity, "filter": [direction.toUpperCase() + ";" + colName] }
                ]
              }
              return axios({
                method: 'POST',
                url: gridData.domain + 'graphSearch?limit=100&page=' + pageCount, //' + params.endRow + '
                headers: newData.gridData.requestHeaders,
                data: searchPayloadWithSort
              }).then(function (response) {
                var lastRow = -1;
                var dataRow = response.data.entities;
                var objRowdataNew = [];
                if (gridData.selectedEntity == 'usergroups') {
                  objRowdataNew = this1.responseParseFn(response)
                }
                else {
                  if (dataRow) {
                    dataRow.map(function (value, key) {
                      var item = value["properties"];
                      this.push(item);
                    }, objRowdataNew);
                  }
                  else {
                    objRowdataNew = [];
                  }
                }
                reloadCount && gridData.dataCount(params.startRow + objRowdataNew.length);
                if (objRowdataNew.length < 100) {
                  lastRow = params.startRow + objRowdataNew.length;
                  sessionStorage.setItem("lastRowReached","true");
                }
                else{
                  sessionStorage.setItem("lastRowReached","false");
                }
                if(params.sortModel && params.sortModel[0] && params.sortModel[0].sort){
                  sessionStorage.setItem("previousSortDirection",params.sortModel[0].sort);
                  sessionStorage.setItem("previousSortColId",params.sortModel[0].colId);
                }
                else{
                  sessionStorage.setItem("previousSortDirection","nosort");
                  sessionStorage.setItem("previousSortColId","");
                }
                
                params.successCallback(objRowdataNew, lastRow);
              });
            }
            //Traversal Data
            else {
             
            
                var traversePayload ;// JSON.parse(JSON.stringify(traversalData[2]));
               
              if (params.sortModel.length != 0 ) {
                if (states) {
                  console.log("//getting a global variable to indicate search is happening:"+sessionStorage.getItem("dataGridAction"));
                  if (gridData.searchPayload && Object.keys(gridData.searchPayload).length > 0 && sessionStorage.getItem("dataGridAction")=="search") {
                    console.log("inside gridData.searchPayload exists: ");
                    console.log(gridData.searchPayload);
                     traversePayload = JSON.parse(JSON.stringify(gridData.searchPayload));

                    var fromEntity = gridData.searchPayload.searchFilter[0].for;
                    traversePayload.response.responseFilter=[];
                    traversePayload.response.responseFilter[0]={for: entityType, filter:[]};
                    if (fromEntity == entityType) {
                      traversePayload.response.responseFilter[0].filter.push([direction.toUpperCase()] + ";" + [colName]);
                    } else {
                      traversePayload.response.responseFilter.push({
                        for: fromEntity,
                        filter: [[direction.toUpperCase()] + ";" + [colName]]
                      })
                    }
                    var urlWithSort = newData.gridData.domain + "graphSearch?limit=100&page=1";
                    var objRowdata = [];
                    var outputObjectFinal = [];
                    
                    //ajax call for traversal
                    return axios({
                      method: "POST",
                      url: urlWithSort,
                      headers: newData.gridData.requestHeaders,
                      data: traversePayload
                    }).then((function (rowTraversalResponse) {
                      var dataRow = rowTraversalResponse.data.entities;
                      var iconUrl = "";
                      var rowDetail = "";
                      var rowActionIcons = "";
                      var currentTraversalEntity = "";
                      var lastRow = -1;
                      if (dataRow) {
                        dataRow.map(function (value, key) {
                          var item = value["properties"];
                          this.push(item);
                        }, objRowdata);
                      }
                      else {
                        objRowdata = [];
                      }
                      reloadCount && gridData.dataCount(params.startRow + objRowdata.length);
                      if (objRowdata.length < 100) {
                        lastRow = params.startRow + objRowdata.length;
                        sessionStorage.setItem("lastRowReached","true");
                      }
                      else{
                        sessionStorage.setItem("lastRowReached","false");
                      }
                      if(params.sortModel && params.sortModel[0] && params.sortModel[0].sort){
                        sessionStorage.setItem("previousSortDirection",params.sortModel[0].sort);
                        sessionStorage.setItem("previousSortColId",params.sortModel[0].colId);
                      } else{
                        sessionStorage.setItem("previousSortDirection","nosort");
                        sessionStorage.setItem("previousSortColId","");
                      }
                      params.successCallback(objRowdata, lastRow);
                    }));
                  }
                  else if(traversePayload && sessionStorage.getItem("dataGridAction")=="traversal"){
                    console.log("gridData.traversePayload exists: ");
                    console.log(gridData.traversePayload);
                     traversePayload = JSON.parse(sessionStorage.getItem("dataGridActionTraversalPayload"));

                   // var fromEntity = gridData.searchPayload.searchFilter[0].for;
                   // if (fromEntity == entityType) {
                   //   traversePayload.response.responseFilter[0].filter.push([direction.toUpperCase()] + ";" + [colName]);
                   // } else {

                      traversePayload.response.responseFilter.push({
                        for: JSON.parse(sessionStorage.getItem("dataGridActionTraversalPayload")).response.entity[0],
                        filter: [[direction.toUpperCase()] + ";" + [colName]]
                      })
                  //  }
                    var urlWithSort = newData.gridData.domain + "graphSearch?limit=100&page=1";
                    var objRowdata = [];
                    var outputObjectFinal = [];
                    //ajax call for traversal
                    console.log("//getting a global variable to indicate traversal is happening:"+sessionStorage.getItem("dataGridAction"));
                    return axios({
                      method: "POST",
                      url: urlWithSort,
                      headers: newData.gridData.requestHeaders,
                      data: traversePayload
                    }).then((function (rowTraversalResponse) {
                      var dataRow = rowTraversalResponse.data.entities;
                      var iconUrl = "";
                      var rowDetail = "";
                      var rowActionIcons = "";
                      var currentTraversalEntity = "";
                      var lastRow = -1;
                      if (dataRow) {
                        dataRow.map(function (value, key) {
                          var item = value["properties"];
                          this.push(item);
                        }, objRowdata);
                      }
                      else {
                        objRowdata = [];
                      }
                      reloadCount && gridData.dataCount(params.startRow + objRowdata.length);
                      if (objRowdata.length < 100) {
                        lastRow = params.startRow + objRowdata.length;
                      }
                      params.successCallback(objRowdata, lastRow);
                    }));

                  }
                  else {
                    console.log("get query..");
                    var urlWithSort = urlConstructed + sortingUrl + (sureConditions ? 'criteria=onlyRoot&limit=100&page=' + pageCount + '&expand=Capacity,State' : ('limit=100&page=' + pageCount));
                    var objRowdata = [];
                    var outputObjectFinal = [];
                    //ajax call for traversal
                    console.log("//getting a global variable to indicate get is happening:"+sessionStorage.getItem("dataGridAction"));
                    return axios({
                      method: "GET",
                      url: urlWithSort,
                      headers: newData.gridData.requestHeaders

                    }).then((function (rowTraversalResponse) {
                      var dataRow = rowTraversalResponse.data.entities;

                      var lastRow = -1;
                      if (dataRow) {
                        dataRow.map(function (value, key) {
                          var item = value["properties"];
                          this.push(item);
                        }, objRowdata);
                      }
                      else {
                        objRowdata = [];
                      }
                      reloadCount && gridData.dataCount(params.startRow + objRowdata.length);
                      if (objRowdata.length < 100) {
                        lastRow = params.startRow + objRowdata.length;
                      }
                      params.successCallback(objRowdata, lastRow);
                    }));

                  }


                } else {
                  //no history flag:
                  console.log("//getting a global variable to indicate which action happened before sort:"+sessionStorage.getItem("dataGridAction"));
                  if(sessionStorage.getItem("dataGridAction")=="search"){
//search sort code:

                  }
                  else if(sessionStorage.getItem("dataGridAction")=="traverse"){
//traversal sort code:
var fromEntity = traversePayload.searchFilter[0].for;
                  if (fromEntity == entityType) {
                    traversePayload.response.responseFilter[0].filter.push([direction.toUpperCase()] + ";" + [colName]);

                  } else {
                    traversePayload.response.responseFilter.push({
                      for: entityType,
                      filter: [[direction.toUpperCase()] + ";" + [colName]]
                    })
                    if (traversePayload.response.selfJoin) {
                      delete traversePayload.response.selfJoin;
                    }
                  }
                  //for traversal from one entity to similar subentity
                  if (traversalData[1] == entityType && traversalData[1] != undefined) {
                    if (traversePayload && traversePayload.request) {
                      (traversePayload.request.gDirection = entityType == "Path" || entityType == "Service" || entityType == "Policy" ? "OUTGOING" : "INCOMING");
                    }
                  }
                  //for traversal from Location to Equipment
                  if (traversalData[1] == "Location" && entityType != undefined && entityType == "Equipment") {
                    if (traversePayload && traversePayload.response) {
                      traversePayload.response.levelData = {
                        level: ["0"]
                      };
                    }
                  }
                  if (traversalData[1] != entityType && traversePayload.request && traversePayload.request.level) {
                   // delete traversePayload.request.level; //commented this line to fix the sorting issue: https://jiradc2.ext.net.nokia.com/browse/UIVSTM-2804
                  }
                  console.log("//getting a global variable to indicate traversal is happening:"+sessionStorage.getItem("dataGridAction"));
                  var urlWithSort = newData.gridData.domain + "graphSearch?limit=100&page=1";
                  var objRowdata = [];
                  var outputObjectFinal = [];
                  //ajax call for traversal
                  console.log("making call with traversal payload..");
                  console.log(newData.gridData.requestHeaders);
                  return axios({
                    method: "POST",
                    url: urlWithSort,
                    headers: newData.gridData.requestHeaders,
                    data: traversePayload
                  }).then((function (rowTraversalResponse) {
                    var dataRow = rowTraversalResponse.data.entities;
                    var iconUrl = "";
                    var rowDetail = "";
                    var rowActionIcons = "";
                    var currentTraversalEntity = "";
                    var lastRow = -1;
                    if (dataRow) {
                      dataRow.map(function (value, key) {
                        var item = value["properties"];
                        this.push(item);
                      }, objRowdata);
                    }
                    else {
                      objRowdata = [];
                    }
                    reloadCount && gridData.dataCount(params.startRow + objRowdata.length);
                    if (objRowdata.length < 100) {
                      lastRow = params.startRow + objRowdata.length;
                    }
                    params.successCallback(objRowdata, lastRow);
                  }));




                  }
                  
                  
                }
              }
              else {
                var lastRow = -1;
                var dataRow = data;
                if (dataRow) {
                  objRowdata = dataRow;
                }
                else {
                  objRowdata = [];
                }
                reloadCount && gridData.dataCount(params.startRow + objRowdata.length);
                if (objRowdata.length < 100) {
                  lastRow = params.startRow + objRowdata.length;
                }
                params.successCallback(objRowdata, lastRow);
              }
            }
          }, 500);
        },
      };
      this.gridApi.setDatasource(dataSource);
    }
  }

  columnResize(gridApi, props) {
    if (props.gridData.selectedEntity === "users") {
      document.getElementById("errors") && ReactDOM.unmountComponentAtNode(document.getElementById("errors"));
    }
    if (props.gridData.selectedEntity === "customhook") {
      gridApi.gridOptionsWrapper.gridOptions.enableSorting = false;
      gridApi.gridOptionsWrapper.gridOptions.enableServerSideSorting = false;
    }
    for (var i = 0; i < props.columnData.length - 1; i++) {
      if (props.columnData[i].displayName == "URL") {
        props.columnData[i].sortable = false;
      }
    }

  }

  componentWillReceiveProps(nextProps) {
    //  const { gridData } = this.props;
    this.setState({ initialColumnData: [] });
    console.log(this.gridApi);



    if (nextProps.gridData.searchChips != undefined && Object.keys(nextProps.gridData.searchChips).length > 0 && this.props.gridData.searchChips != nextProps.gridData.searchChips) {
      const { gridData } = nextProps;

      const { gridViewData } = this.props;
      var rowUrlConstructed = gridData.domain + gridData.rowurl;
      if (gridData.searchChips) {
        let urlConstructed = rowUrlConstructed + this.uamHelper.checkForQ(gridData.rowurl);
        if (gridData.searchChips) {
          rowUrlConstructed = this.uamHelper.constructSearchUrl(gridData.searchChips, urlConstructed).slice(0, -1);
        }
      }
      gridViewData({
        rowurl: rowUrlConstructed,
        requestHeaders: gridData.requestHeaders ? gridData.requestHeaders : {},
        method: gridData.method,
        columnUrl: gridData.metadataUrl + gridData.columnurl,
        selectedEntity: gridData.selectedEntity,
        imageIconurl: gridData.imageIconurl,
        externalIconURL: gridData.externalIconURL,
        passRowData: gridData.passRowData,
        editRow: gridData.editRow,
        deleteRow: gridData.deleteRow,
        traversalEntity: gridData.traversalEntity,
        stateConfig: gridData.stateConfig,
        dataCount: gridData.dataCount,
        traversalClick: gridData.traversalClick,
        columnResponse: gridData.columnResponse,
        rowMenu: gridData.rowMenu,
        nameIcon: gridData.nameIcon,
        clientSideEnabled: gridData.clientSideEnabled
      });
    }
    else if (nextProps.gridData.searchChips != undefined && Object.keys(nextProps.gridData.searchChips).length == 0) {
      const { gridData } = this.props;
      const { gridViewData } = this.props;
      var rowUrlConstructed = gridData.domain + gridData.rowurl;
      gridViewData({
        rowurl: rowUrlConstructed,
        requestHeaders: gridData.requestHeaders ? gridData.requestHeaders : {},
        method: gridData.method,
        columnUrl: gridData.metadataUrl + gridData.columnurl,
        selectedEntity: gridData.selectedEntity,
        imageIconurl: gridData.imageIconurl,
        externalIconURL: gridData.externalIconURL,
        passRowData: gridData.passRowData,
        editRow: gridData.editRow,
        deleteRow: gridData.deleteRow,
        traversalEntity: gridData.traversalEntity,
        stateConfig: gridData.stateConfig,
        dataCount: gridData.dataCount,
        traversalClick: gridData.traversalClick,
        columnResponse: gridData.columnResponse,
        rowMenu: gridData.rowMenu,
        nameIcon: gridData.nameIcon,
        clientSideEnabled: gridData.clientSideEnabled
      });
    }



    if ((this.props.rowData !== nextProps.rowData) && this.gridApi != null) {
      this.updateData(nextProps.rowData, nextProps.currentTraversalEntity);

      // this.setState({changed: true});
    }
    if ((this.props.columnData !== nextProps.columnData) && Object.keys(nextProps.columnData).length > 0) {
      this.setState({ initialColumnData: [...this.state.initialColumnData, nextProps.columnData] });
    }
    if ((this.props.columnData !== nextProps.columnData) && this.gridApi != null) {
      console.log(nextProps.columnData);
      this.gridApi.setColumnDefs(nextProps.columnData);
      this.gridApi.refreshHeader();

      this.gridApi.sizeColumnsToFit();
    }


    if ((this.props.rowData !== nextProps.rowData) && (this.props.columnData !== nextProps.columnData) && this.props.gridData.selectedEntity != 'users') {
      this.setState({
        data: nextProps.rowData,
        loading: false
      });
    }
    if (['tenants', 'users', 'usergroups', 'profiles'].includes(this.props.gridData.selectedEntity) && nextProps.userMessage && document.getElementById("errors")) {
      ReactDOM.unmountComponentAtNode(document.getElementById("errors"));
      this.entityRowOperations({ message: nextProps.userMessage, selfState: this.state, self: this, entity: this.props.gridData.selectedEntity });
      this.props.clearUserMessage();
    }
  }

  entityRowOperations({ message, selfState, self, entity }) {
    var splitedResponse = { message: "", detailedMessage: "" };
    var replacedValues = entity == 'usergroups' ? selfState.selectedRow.UserGroupName : selfState.selectedRow.SureName;
    var labels = messageLabels({ label: self.UAM_LABELS })['Lock' == selfState.selectedMethod ? 'lockTenant' : ('Unlock' == selfState.selectedMethod ? 'unlockTenant' : 'deleteTenant')];
    var headerEntityLabel = entity == 'usergroups' ? self.UAM_LABELS.USER_CRUD_USERGROUP_LABEL : self.UAM_LABELS.TENANT_HEADER;
    if (entity == 'tenants') {
      headerEntityLabel = self.UAM_LABELS.TENANT_HEADER;
    }
    else if (entity == 'profiles') {
      headerEntityLabel = self.UAM_LABELS.PROFILE;
    }
    if (entity == 'users') {
      replacedValues = selfState.selectedMethod == 'Reset password' ? selfState.selectedRow.Email : selfState.selectedRow.Username;
      labels = messageLabels({ label: self.UAM_LABELS })['Reset password' == selfState.selectedMethod ? 'resetPassword' : selfState.selectedMethod.toLowerCase().trim()];
      headerEntityLabel = self.UAM_LABELS.USER;
    }
    splitedResponse = responseSplitter({ data: message, SuccessLabel: labels.successLabel, FailureLabel: labels.failureLabel, name: replacedValues });
    _.includes([200, 204], message.status) ? this.updateAndNotify(splitedResponse) : renderErrorDialog({ title: replaceValue(labels.title, '{0}', headerEntityLabel), message: splitedResponse.message, id: 'alertsSpan' });
  }

  updateAndNotify({ message }) {
    if (this.state.selectedMethod == "Reset password") {
      notify(message);
    } else {
      if (this.props.gridData.selectedEntity == "tenants") {
        this.state.selectedMethod == "Delete" ? this.onRemoveSelected(message) : this.setUpdatedTenantRow();
      }
      else {
        this.updateData(this.props.rowData, this.props.selectedEntityData);
        this.state.selectedMethod == "Delete" && notify(message);
      }
    }
  }

  setUpdatedTenantRow() {
    var selectedTenant = this.state.selectedRow.SureName;
    var rowNode = this.gridApi.gridCore.gridOptions.api.getRowNode(selectedTenant)
    var rowNodeNew = rowNode.data;
    rowNodeNew.State = rowNode.data.State == "Active" ? "InActive" : "Active";
    rowNode.setData(rowNodeNew);
  }

  onRemoveSelected(message) {
    notify(message);
    var deletedArray = [];
    deletedArray.push(this.state.deletedRow);
    var selectedData = deletedArray;
    //var selectedData = this.gridApi.getSelectedRows();
    var count = this.gridApi.gridCore.gridOptions.api.getDisplayedRowCount() - 1;
    var res = this.gridApi.gridCore.gridOptions.api.updateRowData({ remove: selectedData });
    this.dataCountFn(count);
  }

  componentWillUnmount() {
    this.props.unmountGridData();
  }

  onSelectionChanged() {
    const { gridData } = this.props;
    var selectedRows = this.gridApi.getSelectedRows();
    if (gridData.passRowData) {
      gridData.passRowData(selectedRows);
    }
    if (this.props.passRowDataDetail) {
      this.props.passRowDataDetail(selectedRows);
    }
  }

  // callback function for Dynamic Traversal Menu
  dynamicRow(paramsData) {
    var dynamicdata = this.props;
    var dynamicActions = [];
    const { gridData } = this.props;

    if (['users', 'tenants'].includes(this.props.gridData.selectedEntity)) {
      paramsData.updateActions(dynamicActions);
    }

    else {
      //getting traversal menu items..
      console.log("getting traversal menu items..");
      return axios({
        method: "GET",
        url: this.props.gridData.domain + 'metaGraph/' + paramsData.rowData.PrimaryLabel + '/' + paramsData.rowData.UUID,
        headers: this.props.gridData.requestHeaders
      }).then(function (response) {
        var traversalIcon = "";
        var traversalEntitiesdata = "";
        traversalEntitiesdata = response.data.metaObject[0].traversalEntities;
        traversalEntitiesdata.push("Policy");
        traversalEntitiesdata.push("Customer");
        let entityList = traversalEntitiesdata;
        let entityMenuIcons = ["dv_Equipment.svg", "dv_Network.svg", "dv_Path.svg", "dv_Location.svg", "dv_Endpoint.svg", "dv_Service.svg", "ic_FCP.svg", "dv_Policy.svg", "dv_Customer.svg"];
        entityList.forEach(function (entity) {
          entityMenuIcons.forEach(function (icons) {
            let index = icons.lastIndexOf("/") + 1;
            let filename = icons.substr(index);
            let menuIcon = filename.split("_").pop();
            let finalIcon = menuIcon.substr(0, menuIcon.indexOf("."));
            if (finalIcon == entity) {
              dynamicActions.push({
                name: entity,
                icon: gridData.imageIconurl + require("../../images/traversalMenu/" + icons)
              });
            }
          });
        });
        if (gridData.customTraversal) {
          if (gridData.customTraversal.length > 0) {
            var lineDivider = document.createElement("hr");
            lineDivider.className = "list-dividerCH";
            gridData.customTraversal.forEach(function (item) {
              if (item.filter) {
                if (item.filter.indexOf(paramsData.rowData['UUID']) != -1)
                  dynamicActions.push({
                    name: item.name,
                    icon: item.icon
                  });
              }
              else {
                if (item.entities.indexOf(paramsData.rowData['PrimaryLabel']) != -1)
                  dynamicActions.push({
                    name: item.name,
                    icon: item.icon
                  });
              }
            });
          }
        }
        paramsData.updateActions(dynamicActions);
      })
    }
  }

  //Edit call back
  editRowFn(params) {
    const { gridData } = this.props;
    gridData.editRow(params);
  }

  deleteEntity(data) {
    let { props, params, entity } = data;
    const { domain, requestHeaders } = props.gridData;
    const { userAction } = props;
    var component = React.createElement(progressPanal);
    ReactDOM.render(component, document.getElementById("errors"));
    let url = entity == 'users' ? domain + "tenants/users?tenantId=" + requestHeaders.tenantId + "&q=Username;EQUALS;" + params.Username : domain + "tenants/" + params.UUID;
    if (entity == 'usergroups') {
      url = domain + 'userGroups/' + params.UUID + '?detachDelete=true&_r=' + Date.now()
    }
    else if (entity == 'profiles') {
      url = domain + 'accessRole/' + params.SureName;
    }
    userAction({
      method: 'DELETE', url: url, requestHeaders: requestHeaders,
      payload: null, operation: 'DELETE_USER'
    })
  }

  deleteRowFn(params) {
    const { gridData } = this.props;
    let translateData = this.UAM_LABELS;
    let entity = gridData.selectedEntity.toLowerCase();
    if (['users', 'tenants', 'usergroups', 'profiles'].includes(entity)) {
      let title = translateData.CONFIRM_DELETE_HEADER + " " + (entity == 'users' ? translateData.USER : entity == 'usergroups' ? translateData.USER_CRUD_USERGROUP_LABEL : entity == 'profiles' ? translateData.PROFILE : translateData.TENANT_HEADER);
      let confirmationText = translateData.CONFIRM_DELETE_MESSAGE + " " + (entity == 'users' ? translateData.USER : entity == 'usergroups' ? translateData.USER_CRUD_USERGROUP_LABEL : entity == 'profiles' ? translateData.PROFILE : translateData.TENANT_HEADER).toLowerCase() + " \"" + (entity == 'users' ? params[0].data.Username : entity == 'usergroups' ? params[0].data.UserGroupName : params[0].data.SureName) + "\"?"
      confirmationPanal({
        id: 'alertsSpan', title: title, confirmationText: confirmationText,
        cancleLabel: 'CANCEL.', deleteLabel: translateData.DELETE, callback: this.deleteEntity, propData: { props: this.props, params: params[0].data, entity: entity }
      });
    } else {
      gridData.deleteRow(params);
    }
  }

  traversalEntityFn(currentEntity) {
    var traversalSelectedEntity = this.props;
    traversalSelectedEntity.traversalEntity(currentEntity);
  }

  parentTraversalEntity(entity) {
    var parentEntity = this.props;
    parentEntity.gridData.parentTraversal(entity);
  }

  //Grid Update from traversal Menu 
  entityClick(params) {
    console.log("entityClick: ");
    console.log(params);
    const { traversalAction } = this.props;
    var menuData = this.props;
    for (let irow = 0; irow < params.value.items.length; irow++) {
      let row = params.value.items[irow];
      entityType = params.value.name;
      //creating a payload for traversal
      var payload = {
        "request": {
          "level": 1
        }
        , "response": {
          "responseType": "List"
          , "entity": [entityType]
          , "selfJoin": "true"
          , "responseFilter": [{
            "for": row.data.PrimaryLabel
            , "filter": ["UUID;NOT EQUAL;" + row.data.UUID]
          }
          ]
        }
        , "expand": ["Capacity", "State"]
        , "searchFilter": [{
          "for": row.data.PrimaryLabel
          , "filter": ["UUID;EQUALS;" + row.data.UUID]
        }
        ]
      };

      //for traversal from one entity to similar subentity
      if (row.data.PrimaryLabel == entityType && entityType != undefined) {
        if (payload && payload.request) {
          (payload.request.gDirection = entityType == "Path" || entityType == "Service" || entityType == "Policy" ? "OUTGOING" : "INCOMING");
        }
        //columnSelectedArray = this.state.columnAdd;
        var colPreferenceSelected = [];
        var displayedColumns = this.gridApi.gridCore.columnApi.getAllDisplayedColumns()
        if (displayedColumns == displayedColumnsOnApply) {
          colPreferenceSelected = columnSelected;
        }
      }
      //for traversal from Location to Equipment
      if (row.data.PrimaryLabel == "Location" && entityType != undefined && entityType == "Equipment") {
        if (payload && payload.response) {
          payload.response.levelData = {
            level: ["0"]
          };
        }
      }
      //
      //for traversal from Service to Customer
      if ((row.data.PrimaryLabel == "Service" || row.data.PrimaryLabel == "Policy") && entityType != undefined && entityType == "Customer") {
        if (payload && payload.request) {
          payload.request.level = '1';
          payload.request.gDirection='INCOMING';
          
        }
      }
      // if (row.data.PrimaryLabel != entityType) {
      //   delete payload.request.level;
      // }
      var traversalMenuData = [entityType, row.data.PrimaryLabel, payload, row.data];
      this.traversalEntityFn(traversalMenuData);
      traversalData = [entityType, row.data.PrimaryLabel, payload];
      //ajax call for traversal
      traversalAction({
        url: menuData.gridData.domain + "graphSearch?limit=100&page=1",
        imageIconurl: menuData.gridData.imageIconurl,
        requestHeaders: menuData.gridData.requestHeaders ? menuData.gridData.requestHeaders : {},
        payload: payload,
        externalIconURL: menuData.gridData.externalIconURL,
        stateConfig: menuData.gridData.stateConfig,
        method: menuData.gridData.method,
        columnUrl: menuData.gridData.metadataUrl + menuData.gridData.columnurl,
        selectedEntity: entityType,
        columnResponse: menuData.gridData.columnResponse ? menuData.gridData.columnResponse : colPreferenceSelected
      });
    }
  }

  menuTraversalFn(params) {

    this.setState({ selectedRow: params.value.items[0].data, selectedMethod: params.value.name });
    if (params.value.name == 'Edit') {
      for (let irow = 0; irow < params.value.items.length; irow++) {
        let row = params.value.items[irow];
        this.editRowFn(row);

      }
    }
    //else if (params.value.name == 'Delete' || params.value.name == 'Delete ') {
    else if (params.value.name == 'Delete') {
      this.deleteRowFn(params.value.items);
      this.setState({ deletedRow: params.value.items[0].data });
    }
    else if (params.value.name == 'Add') {

    }
    else if (params.value.name == '') {

      // do nothing
    }
    else if (params.value.name == 'Lock' || params.value.name == 'Unlock') {
      const { domain, requestHeaders, selectedEntity } = this.props.gridData;
      const { userAction } = this.props;
      var component = React.createElement(progressPanal);
      ReactDOM.render(component, document.getElementById("errors"));
      if (selectedEntity == 'tenants') {
        let url = domain + "tenants/" + (params.value.name == 'Lock' ? 'deActivation/' : 'activation/') + params.value.items[0].data.UUID;
        userAction({
          method: 'PATCH', url: url, requestHeaders: requestHeaders,
          payload: null, operation: 'UPDATE_USER'
        })
      }

      else {
        let status = params.value.name == 'Unlock' ? 'Active' : 'Lock';
        userAction({
          method: 'PUT', url: domain + "tenants/users/" + params.value.items[0].data.Username + "?tenantId=" + requestHeaders.tenantId + "&status=" + status, requestHeaders: requestHeaders,
          payload: null, operation: 'UPDATE_USER'
        })
      }
    }
    else if (params.value.name == 'Reset password') {
      var component = React.createElement(progressPanal);
      ReactDOM.render(component, document.getElementById("errors"));
      const { domain, requestHeaders } = this.props.gridData;
      const { userAction } = this.props;
      userAction({
        method: 'PUT', url: domain + "tenants/users/" + params.value.items[0].data.Username + "/resetPassword?tenantId=" + requestHeaders.tenantId, requestHeaders: requestHeaders,
        payload: null, operation: 'UPDATE_USER'
      })
    }
    else {
      if (Array.isArray(this.props.gridData.customTraversal)) {
        let filteredObj = this.props.gridData.customTraversal.filter(function (item) {
          return item.name == params.value.name
        })
        filteredObj = filteredObj && filteredObj[0] && filteredObj[0].callbackFunc;
        if (params.value.items[0].data) {
          typeof filteredObj == "function" ? filteredObj(params.value.name, params.value.items[0].data) : this.entityClick(params)
        }
      }
      else
        this.entityClick(params)
    }
    if (params.state) {
      console.log('Button State', params.state);
    }
  }

  columnPreferenceUpdate(columnCheckedArray, columnUnCheckedArray) {
    console.log(this.state.initialColumnData);
    var columnDataArray = this.state.initialColumnData;
    var visibleColumnArray = [];
    var hiddenColumnArray = [];
    var visibleColumnMainArray = [];
    var availableColumnMainArray = [];
    var changedColumnPreferenceArray = [];
    columnDataArray.map(function (value) {
      for (var i = 0; i < columnCheckedArray.length; i++) {
        for (var k = 0; k < value.length; k++) {
          if (value[k]['field'] == columnCheckedArray[i]) {
            var newObj = {};
            newObj['field'] = columnCheckedArray[i];
            newObj['hide'] = false;
            newObj['displayName'] = value[k]['displayName'];
            if (value[k]['field'] == "URL") {
              newObj['sortable'] = false;
            }
            visibleColumnArray.push(newObj);
          }
        }
      }
      for (var j = 0; j < columnUnCheckedArray.length; j++) {
        for (var k = 0; k < value.length; k++) {
          if (value[k]['field'] == columnUnCheckedArray[j]) {
            var newObj = {};
            newObj['field'] = columnUnCheckedArray[j];
            newObj['hide'] = true;
            newObj['displayName'] = value[k]['displayName'];
            if (value[k]['field'] == "URL") {
              newObj['sortable'] = false;
            }
            hiddenColumnArray.push(newObj);
          }
        }
      }
    });
    changedColumnPreferenceArray = visibleColumnArray.concat(hiddenColumnArray);
    return changedColumnPreferenceArray
  }
  onColumnChange(value) {
    columnSelected = [];
    var columnArraySelected = value.value.checkedColumns;
    var columnArrayUnselected = value.value.unCheckedColumns;
    var finalColumnArray = [];
    finalColumnArray = this.columnPreferenceUpdate(columnArraySelected, columnArrayUnselected);
    if (columnSelected && columnSelected.length == 0) {
      columnSelected.push(finalColumnArray);
    }
    displayedColumnsOnApply = this.gridApi.gridCore.columnApi.getAllDisplayedColumns();
    this.props.gridData.columnPreference(finalColumnArray);
  }

  render() {

    if (this.props.columnData && Object.keys(this.props.columnData).length > 0 && (this.props.rowData || this.props.gridData.selectedEntity == 'users')) {
      let rowMenus = populatRowMenu(this.props);

      var uam = false;
      var passData = this.props;
      var rows = this.props.rowData;
      this.ajaxWaiting = rows && rows.length > 0;
      var rowSelectionMode = 'multiple';
      let _selectedEntity = passData.gridData.selectedEntity.toLowerCase();
      //var rowSelectionMode = _selectedEntity == 'users' ? 'single' : 'multiple';
      if (_selectedEntity == 'tenants' || _selectedEntity == 'users' || _selectedEntity == 'usergroups' || _selectedEntity == 'profiles') {
        rowSelectionMode = 'single';
      }


      const uamEntities = ['tenants', 'users', 'usergroups', 'groups', 'profiles'];
      if (uamEntities.some(a => a === _selectedEntity)) {
        uam = true;
        this.props.columnData.map(item =>
          ((item.field == "SureName" || item.field == "Username" && item.hasOwnProperty("cellRendererFramework")) ? (item.headerClass = 'headerWithIcon') : item)
        );
      }
      const { traversalAction } = this.props;
      const { gridData } = this.props;
      function rowOptions() {
        if (uam) {
          return false;
        }
        else if (_selectedEntity === 'network') {
          return false;
        }
        else {
          return true;
        }
      }
      let serverSideSort = true;
      let rowModel = 'infinite';
      if (passData.gridData.clientSideEnabled) {
        serverSideSort = false;
        rowModel = 'inMemory';
        this.dataCountFn(rows ? this.props.rowData.length : rows.length);
      }

      return (
        <span id="dataGridMain" >
          <span id='errors'></span>
          <span id='alertsSpan'></span>
          <DataGrid gridOptions={{
            columnDefs: this.props.columnData,
            rowData: serverSideSort ? [] : rows,
            enableFilter: false,
            enableServerSideSorting: serverSideSort,
            enableSorting: !serverSideSort,
            enableStatusBar: true,
            alwaysShowStatusBar: false,
            enableRangeSelection: true,
            enableColResize: true,
            rowSelection: rowSelectionMode,
            getRowNodeId: function (data) {
              return (data.SureName ? data.SureName : data.Username);
            },
            rowModelType: rowModel,
            rowAction: {
              disableToolTips: true,
              types: rowMenus,
              callback: this.menuTraversalFn.bind(this),
              disable: function (params) {
                const action = params.name;
                const data = params.data;
                const index = params.index;
                //based on a particular action and data

                if (params.name === 'Edit') {
                  if (data !== undefined) {
                    
                    if (data['Template Name'] === undefined) {
                      return rowOptions();
                    }
                    else if(data['Template Name'] == ""){
                      return rowOptions(); 
                    }
                    else {
                      return false
                    }
		
                    
                  }
                }
                if (data !== undefined) {
                  if (action === 'Reset password' && data && (data.Status === "Locked" || data.hasOwnProperty("LDAP_ID"))) {
                    return true;
                  }
                  else if (action === 'Unlock' && data && ((data['PrimaryLabel'] == 'User' && (data.Status === "Active" || data.hasOwnProperty("LDAP_ID")))
                    || (data['PrimaryLabel'] == 'Tenant' && data.State === "Active"))) {
                    return true;
                  }
                  else if (action === 'Lock' && data && ((data['PrimaryLabel'] == 'User' && (data.Status === "Locked" || data.hasOwnProperty("LDAP_ID")))
                    || (data['PrimaryLabel'] == 'Tenant' && data.State !== "Active"))) {
                    return true;
                  }
                  else if (action === 'Delete' && data['PrimaryLabel'] == 'Tenant' && data.State === "Active") {
                    return true;
                  }
                }
                if (params.name === 'Delete') {
                  if (data !== undefined) {
                    if (data['PrimaryLabel'] == 'Network' || (data['Template Name'] && data['Template Name'].toLowerCase().indexOf('discovered') == 0  ) || (data['Template Name'] && data['Template Name'].toLowerCase().indexOf('discovered') == ""  )) {
                      return true;
                    }
                    else if (data['PrimaryLabel'] == 'UserGroup') {
                      if (gridData.adminUserGroup && gridData.adminUserGroup != "" && data['UserGroupName'] == gridData.adminUserGroup) {
                        return true;
                      }
                    }
                    else if (data['Template Name'] === undefined) {
                      return rowOptions();
                    }
                    else {
                      return false
                    }
                  }
                }
                // if (action === 'Add') {
                //   return true;
                // }
                // if (action === 'Graph') {
                //   return true;
                // }
                // if (action === 'Settings') {
                //   return false;
                // }
                return false;
              }
            },
            dynamicRowActions: (_selectedEntity == 'usergroups' || _selectedEntity == 'profiles' || _selectedEntity == 'customhook') ? false : this.dynamicRow.bind(this)

          }}
            onGridReady={this.onGridReady.bind(this)}
            onCellClicked={this.onSelectionChanged.bind(this)}
            onRowSelected={this.onSelectionChanged.bind(this)}
            manageColumnsOnApply={this.onColumnChange.bind(this)}
          />
          {this.ajaxWaiting && this.props.gridData.selectedEntity == 'users' && waiting(this.state)}
        </span>
      )
    }
    else {
      return waiting(this.state);
    }
    function waiting(stateObj) {
      return (
        <div className='sweet-loading'>
          <ProgressIndicatorCircular
            overlay={true} css={{ xlarge: true }}
          >
          </ProgressIndicatorCircular>
        </div>
      )
    }
  }
}

function mapStateToProps(state) {
  let gridDataobj = {};
  if (state.dataGrid.columnData && state.dataGrid.rowData) {
    gridDataobj.columnData = state.dataGrid.columnData;

    // do not delete the below commented block of code
    /*****************************************/
    /*gridDataobj.columnData.map(function(x) {
 return x["sortingOrder"]= ["desc","asc",null];
 
})*/
    /*****************************************/
    gridDataobj.rowData = state.dataGrid.rowData;
    gridDataobj.traversalEntity = state.dataGrid.traversalEntity;
    gridDataobj.selectedEntityData = state.dataGrid.selectedEntityData;
    gridDataobj.currentTraversalEntity = state.dataGrid.currentTraversalEntity;
  }
  if (state.createUser.userMessages) {
    gridDataobj.userMessage = state.createUser.userMessages;
  }
  return gridDataobj;
}

function populatRowMenu(props) {
  let data = props.gridData;
  var menuItems = data.rowMenu;
  if (data.selectedEntity === "users") {
    (data.rowMenu && data.rowMenu.includes("Edit")) ? menuItems = ["Edit", "Lock", "Unlock", "Delete", 'Reset password'] : menuItems = ["Lock", "Unlock", "Delete", 'Reset password'];
  }
  else if (data.selectedEntity === "tenants") {
    (data.rowMenu && data.rowMenu.includes("Edit")) ? menuItems = ["Edit", "Lock", "Unlock", 'Delete'] : menuItems = ["Lock", "Unlock", 'Delete'];
  }
  var rowMenus = [];
  menuItems.map(item => {
    var itemAltered = {};
    itemAltered.name = item;
    if (item != "" && !(item.indexOf(' ') >= 0)) {
      itemAltered.icon = data.imageIconurl + require("../../images/dataGrid/ic_" + item.toLowerCase() + ".svg");
    } else {
      itemAltered.icon = "";
    }
    rowMenus.push(itemAltered);
  }, rowMenus);
  return rowMenus;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    clearUserMessage: clearUserMessage,
    gridViewData: gridViewData,
    unmountGridData: unmountGridData,
    traversalAction: traversalAction,
    gridSearchData: gridSearchData,
    userAction: userAction
  }, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(DataList);
