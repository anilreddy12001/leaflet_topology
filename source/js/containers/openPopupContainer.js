import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { saveSearchCategoryList, unmountGlobalSearch, savePayload, fetchSearchPopupData, onDeleteSearchData, unmountSearchPopup } from '../actions/openPopupAction.js';
import { TextInput, SelectItemNew, TextArea, AppToolbar, Button, DataGrid, Dialog, AlertDialogError, Snackbar } from '@nokia-csf-uxr/csfWidgets';
import { UAM_LABELS } from "../helpers/uam/uamConstants";
import { checkErrors, validateField, responseSplitter } from "../helpers/uam/FormValidator";
import { toast } from 'react-toastify';
import "../../styles/openPopup.css"

class OpenPopupForSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      textDesc: '',
      selectedItem: '',
      selectedItemQuery: '',
      disabled: false,
      templateTitle: '',
      searchDataSet: '',
      searchType: '',
      searchData: '',
      promptText: '',
      columnResult: '',
      rowResult: '',
      savedSearchCategory: '',
      queryType: '',
      queryName: '',
      queryDescription: '',
      query: '',
      charCount: 0,
      descriptionFlag: false,
      editSearchPayload: props.searchPopupData.editSearchPayload,
      formErrors: {
        savedSearchCategory: { hasError: false, errorMsg: '', rules: ['required'] },
        queryType: { hasError: false, errorMsg: '', rules: ['required'] },
        queryName: { hasError: false, errorMsg: '', rules: ['required'] },
        queryDescription: { hasError: false, errorMsg: '', rules: ['required'] },
        query: { hasError: false, errorMsg: '', rules: ['required'] }
      },
      formHasError: true,
      cloneSearchPayloadData: {}

    };
    this.UAM_LABELS = props.searchPopupData.propsCode ? props.searchPopupData.propsCode : UAM_LABELS;
  }

  static get defaultProps() {
    return {}
  }

  renderErrorDialog(title, detailedMsg) {
    var aboutOptions = {
      id: "errorDialog",
      title: title,
      errorText: detailedMsg,
      onClose: function () {
        ReactDOM.unmountComponentAtNode(document.getElementById("infoDialog"));
      }
    };
    var component = React.createElement(AlertDialogError, aboutOptions);
    ReactDOM.render(component, document.getElementById("infoDialog"));
  }

  onChangeCategory(newText) {
    const { searchPopupData } = this.props;
    this.setState({
      savedSearchCategory: newText.value
    });
  }

  onChangeQueryName(newText) {
    const { searchPopupData } = this.props;
    this.setState({
      queryName: newText.value
    });
  }




  onChangeQueryDescription(newText) {
    const { searchPopupData } = this.props;
    this.setState({
      queryDescription: newText.value
    });
  }


  onChangeQuery(newText) {
    const { searchPopupData } = this.props;
    this.setState({
      query: newText.value
    });
  }



  onChangeQueryType(e) {
    var cloneForm = Object.assign({}, this.state.formErrors);
    cloneForm.queryType.errorMsg = '';
    // var selectedSearchQueryType = e.value.split(':');
    this.setState({
      queryType: e.value,
      formHasError: checkErrors(cloneForm, 'queryType', e.value, this.state, this.refs, this.UAM_LABELS)
    })

  }





  onValueChange(e) {
    let { value } = e;
    var name = e.nativeEvent.target.attributes.name.value;

    var cloneForm = Object.assign({}, this.state.formErrors);
    this.setState({ [name]: value },
      () => { this.validateFieldWrapper(name, value) });
    this.setState({ formHasError: checkErrors(cloneForm, name, value, this.state, this.refs, this.UAM_LABELS) });
  };



  onTextAreaDescChange(e, name) {

    let { value } = e;
    var name = name;
    if (value.length > 200) {
      descriptionFlag = true;
    } else {
      this.setState({ queryDescription: value, charCount: value.length, descriptionFlag: false });
    }

    var cloneForm = Object.assign({}, this.state.formErrors);
    this.setState({ [name]: value },
      () => { this.validateFieldWrapper(name, value) });
    this.setState({ formHasError: checkErrors(cloneForm, name, value, this.state, this.refs, this.UAM_LABELS) });
  };

  onTextAreaChange(e, name) {

    let { value } = e;
    var name = name;

    var cloneForm = Object.assign({}, this.state.formErrors);
    this.setState({ [name]: value },
      () => { this.validateFieldWrapper(name, value) });
    this.setState({ formHasError: checkErrors(cloneForm, name, value, this.state, this.refs, this.UAM_LABELS) });
  };





  onFocusChange(e) {
    let { value } = e;
    var name = e.nativeEvent.target.attributes.name.value;
    this.setState({ [name]: value },
      () => { this.validateFieldWrapper(name, value) });
  };

  onTextAreaFocusChange(e, name) {
    let { value } = e;
    var name = name;
    this.setState({ [name]: value },
      () => { this.validateFieldWrapper(name, value) });

  }


  validateFieldWrapper(fieldName, value) {
    let res = validateField(fieldName, value, this.state, this.refs, this.UAM_LABELS);
    this.setState({ formErrors: res.formElements });
    return res.valid;
  }

  onSelectChange(e) {
    var cloneForm = Object.assign({}, this.state.formErrors);
    cloneForm.savedSearchCategory.errorMsg = '';
    var selectedSearchQuery = e.value.split(':');
    this.setState({
      savedSearchCategory: selectedSearchQuery[0]
    })
    this.setState({ formHasError: checkErrors(cloneForm, 'savedSearchCategory', selectedSearchQuery[0], this.state, this.refs, this.UAM_LABELS) });
  };


  componentWillMount() {
    const {
      searchPopupData,
      saveSearchCategoryList,
      fetchSearchPopupData,
      unmountSearchPopup
    } = this.props;

    this.setState({ templateTitle: this.UAM_LABELS.TEMPLATE_SEARCH })
    saveSearchCategoryList({
      requestHeaders: searchPopupData.requestHeaders ? searchPopupData.requestHeaders : {},
      method: searchPopupData.method,
      url: searchPopupData.catUrl + "specifications?q=ASC;specName&q=specName;EQUALS;SUREGUIMenu&q=subType;EQUALS;English"
    });
    if (searchPopupData.editSearchPayload) {

      fetchSearchPopupData({
        requestHeaders: searchPopupData.requestHeaders ? searchPopupData.requestHeaders : {},
        method: searchPopupData.method,
        url: searchPopupData.domain + "items?q=UUID;EQUALS;" + searchPopupData.uuid
      });
    }
    //searchPopupData.unMount();

  }

  onDeleteSearch() {
    const { onDeleteSearchData } = this.props;
    const { uuid, requestHeaders, domain, SureName, refreshCategoryInBasePage } = this.props.searchPopupData;
    if (uuid) {
      onDeleteSearchData({
        requestHeaders: requestHeaders ? requestHeaders : {},
        method: "DELETE",
        url: domain + "items?q=UUID;EQUALS;" + uuid,
        SureName: SureName
      }, refreshCategoryInBasePage);
    }
  }


  componentWillReceiveProps(nextProps) {
    const { searchPopupData } = this.props;
    // this.sharedResource = nextProps.tenantDetails.sharedResource;
    if (nextProps.responseCreatePayload) {
      var x = nextProps.responseCreatePayload.split(':')[0].trim();
      if (x == 'ADDED' || x == 'UPDATED') {
        // toast(nextProps.responseCreatePayload.split(':')[1].trim() + " " + this.UAM_LABELS[nextProps.responseCreatePayload.split(':')[0].trim()], {
        //   className: 'toastSearchPopup',
        //   progressClassName: 'transparent-progress'
        // });
        var dataList = {
          dataList: [{
            message: nextProps.responseCreatePayload.split(':')[1].trim() + " " + this.UAM_LABELS[nextProps.responseCreatePayload.split(':')[0].trim()],
            duration: 2000, autoIncreaseDuration: false
          }]
        };

        var snack = React.createElement(Snackbar, dataList);
        ReactDOM.render(snack, document.getElementById("snackbarID"));
        var props = this.props;
        setTimeout(function () {
          props.unmountSearchPopup();
          searchPopupData.unMount();
          ReactDOM.unmountComponentAtNode(document.getElementById("snackbarID"))
        }, 3000);
        searchPopupData.onDelete(false);
      }
      else {
        this.renderErrorDialog(this.UAM_LABELS.ADD_SEARCHPAYLOAD_FAILED, nextProps.responseCreatePayload);
      }
    }
    if (nextProps.deleteResponse && nextProps.deleteResponse != this.props.deleteResponse) {
      var dataList = {
        dataList: [{
          message: this.state.queryName + " " + nextProps.deleteResponse,
          duration: 2000, autoIncreaseDuration: false
        }]
      };
      var snack = React.createElement(Snackbar, dataList);
      ReactDOM.render(snack, document.getElementById("snackbarID"));
      var props = this.props;
      searchPopupData.onDelete(true);

      if (nextProps.deleteResponse && nextProps.deleteResponse != this.props.deleteResponse) {
        setTimeout(function () {
          props.unmountSearchPopup();
          searchPopupData.unMount();
          ReactDOM.unmountComponentAtNode(document.getElementById("snackbarID"))
        }, 3000);
      }
    }

    if (nextProps.deleteErr != this.props.deleteErr) {
      searchPopupData.onDelete(false);
      this.renderErrorDialog(this.UAM_LABELS.DELETE_SEARCHPAYLOAD_FAILED, nextProps.deleteErr.response);
    }

    if (nextProps.updateErr != this.props.updateErr) {
      if (searchPopupData.editSearchPayload) {
        this.renderErrorDialog(this.UAM_LABELS.UPDATE_SEARCHPAYLOAD_FAILED, nextProps.updateErr.response);
      }
      else {
        this.renderErrorDialog(this.UAM_LABELS.ADD_SEARCHPAYLOAD_FAILED, nextProps.updateErr.response);
      }
    }

    if (nextProps.searchQueryDetails && searchPopupData.editSearchPayload == true && Object.keys(nextProps.searchQueryDetails).length != 0) {
      this.updateEditSearchPayloadScreen(nextProps);
    }

  }

  updateEditSearchPayloadScreen(props) {
    var searchPayloadValue = props.searchQueryDetails;
    this.state.cloneSearchPayloadData = JSON.parse(JSON.stringify(searchPayloadValue));
    var searchPayloadFetched = searchPayloadValue.QueryInfo;

    this.setState({
      queryName: searchPayloadFetched.SureName ? searchPayloadFetched.SureName : "",
      savedSearchCategory: searchPayloadFetched.Type ? searchPayloadFetched.Type : "",
      queryType: searchPayloadFetched['Search Type'] ? searchPayloadFetched['Search Type'] : "",
      queryDescription: searchPayloadFetched.Description ? searchPayloadFetched.Description : "",
      query: searchPayloadFetched.Data ? searchPayloadFetched.Data : "",

    });


  }

  if(queryName) {
    jsonPayload.push({ "Name": "SureName", "Value": queryName });
    jsonPayload.push({ "Name": "CategoryValue", "Value": savedSearchCategory });
    jsonPayload.Features.Feature.push({ "Name": "QueryTypeValue", "Value": queryType });
    jsonPayload.Features.Feature.push({ "Name": "QueryDescriptionValue", "Value": queryDescription });
    jsonPayload.Features.Feature.push({ "Name": "QueryValue", "Value": query });
  }


  onSavePayload() {
    var queryData = "";
    if (this.state.query) {
      var queryPayload = this.state.query;
      if (isJson(queryPayload) == true && this.state.queryType == 'Payload') {

        queryData = this.state.query

      }
      else if (this.state.queryType == 'Query String' && isJson(queryPayload) != true) {
        queryData = this.state.query

      }
      else {
        this.renderErrorDialog("Error", "Please enter the valid Query");
      }

    }
    const { searchPopupData, savePayload } = this.props;
    var jsonPayload = {
      "@class": "Item",
      "DisplayName": this.state.queryName,
      "SureName": this.state.queryName,
      "Category": "MT_FRAMEWORK",
      "Features": {
        "Feature": [
          {
            "Name": "Label",
            "Value": this.state.templateTitle
          },
          {
            "Name": "Data",
            "Value": queryData
          },
          {
            "Name": "Description",
            "Value": this.state.queryDescription
          },
          {
            "Name": "Search Type",
            "Value": this.state.queryType
          },
        ]
      },
      "Type": this.state.savedSearchCategory
    };

    if (queryData != "") {
      savePayload({
        requestHeaders: searchPopupData.requestHeaders ? searchPopupData.requestHeaders : {},
        method: this.state.editSearchPayload ? 'PUT' : 'POST',
        url: searchPopupData.domain + "items",
        payload: jsonPayload,
        EditSearchPayload: this.state.editSearchPayload
        // jsonPayload,this.props
      }, searchPopupData.refreshCategoryInBasePage);
      // searchPopupData.unMount();
    }

  }

  cancelPopup() {
    var props = this.props;
    const { searchPopupData } = this.props;
    // this.props.unmountSearchPopup();
    props.unmountSearchPopup();
    searchPopupData.unMount();
  }

  render() {
    const { searchPopupData } = this.props;
    if (this.props.responseData && Object.keys(this.props.responseData).length > 0) {
      var categoryDataSet = this.props.responseData;

      var categoryArray = [];
      var queryTypeArray = [
        { label: 'Query String', value: 'Query String' },
        { label: 'Payload', value: 'Payload' },
      ];
      categoryArray = formatDataSet(categoryDataSet);
      var deleteIconButton = require("../../images/dataGrid/ic_delete.svg");
      return (
        <div id="openPopup">
          <Dialog id="wBtnBar" title={this.state.templateTitle} height={800} width={800}
            header trapFocus={false} theme="white">
            <div>
              <SelectItemNew id="savedSearchCategory" className="queryNameClass" name="savedSearchCategory" ref="savedSearchCategory" options={categoryArray} required={true} errorMsg={this.state.formErrors.savedSearchCategory.errorMsg} error={this.state.formErrors.savedSearchCategory.hasError} onChange={this.onSelectChange.bind(this)} label={this.UAM_LABELS.CATEGORY} selectedItem={this.state.savedSearchCategory} onBlur={(e) => this.onFocusChange(e)} maxHeight={150} />
            </div>

            <div className="queryTypeClass">
              <SelectItemNew id="queryType" className="queryNameClass" name="queryType" ref="queryType" options={queryTypeArray} required={true} errorMsg={this.state.formErrors.queryType.errorMsg} error={this.state.formErrors.queryType.hasError} label={this.UAM_LABELS.QUERYTYPE} selectedItem={this.state.queryType} onChange={this.onChangeQueryType.bind(this)} onBlur={(e) => this.onFocusChange(e)} maxHeight={150} />
            </div>
            <div className="queryTypeClass">
              <TextInput id="queryName" className="queryNameClass" name="queryName" ref="queryName" disabled={this.state.editSearchPayload} text={this.state.queryName} required={true} onChange={(e) => this.onValueChange(e)} errorMsg={this.state.formErrors.queryName.errorMsg} error={this.state.formErrors.queryName.hasError} label={this.UAM_LABELS.QUERYNAME} onBlur={(e) => this.onFocusChange(e)} />
            </div>
            <div className="queryTypeClass">
              <TextArea id="queryDescription" className="querydescriptionClass" name="queryDescription" ref="queryDescription" text={this.state.queryDescription} required={true} onChange={(e) => this.onTextAreaDescChange(e, "queryDescription")} errorMsg={this.state.formErrors.queryDescription.errorMsg} error={this.state.formErrors.queryDescription.hasError} label={this.UAM_LABELS.QUERYDESCRIPTION} rows={3} columns={6} onBlur={(e) => this.onTextAreaFocusChange(e, "queryDescription")} charCount={this.state.charCount} maxCharCount={200} disabled={this.state.descriptionFlag} />
            </div>
            <div className="queryTypeClass">
              <TextArea id="query" className="querydescriptionClass" name="query" ref="query" text={this.state.query} required={true} onChange={(e) => this.onTextAreaChange(e, "query")} errorMsg={this.state.formErrors.query.errorMsg} error={this.state.formErrors.query.hasError} label={this.UAM_LABELS.QUERY} rows={8} columns={150} onBlur={(e) => this.onTextAreaFocusChange(e, "query")} />
            </div>
            <div id="Footer" className="footerCancelSave">
              <div id="FooterActions" className="footerActionsCancelSave" >
                <div className="deleteIcon">
                  <Button id="txtBtnwIcon" iconPosition="left" disabled={!this.state.editSearchPayload} icon={searchPopupData.imageIconurl + deleteIconButton} onClick={this.onDeleteSearch.bind(this)} />
                </div>
                <div className="cancelSave">
                  <Button id="ok" text="cancel" onClick={this.cancelPopup.bind(this)} />
                  <Button id="cancel" text="save" onClick={this.onSavePayload.bind(this)} disabled={this.state.formHasError} />
                </div>
              </div>
            </div>
          </Dialog>
        </div>
      )
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

  // listArray = listArray.filter(e => e !== 'Association')
  // listArray.splice(i,1);
  return listArray
}
function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function mapStateToProps(state) {
  let popSearchState = state.popupSearch;
  let dataObj = {};

  if (popSearchState.responseData) {
    dataObj.responseData = popSearchState.responseData;
    dataObj.responseCreatePayload = popSearchState.responseCreatePayload;
    dataObj.deleteResponse = popSearchState.deleteResponse;
    dataObj.timeStamp = popSearchState.timeStamp;
    dataObj.updateErr = popSearchState.updateErr;

  }
  if (popSearchState.searchQueryDetails) {
    dataObj.searchQueryDetails = popSearchState.searchQueryDetails;
  }
  return dataObj;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    saveSearchCategoryList: saveSearchCategoryList,
    savePayload: savePayload,
    fetchSearchPopupData: fetchSearchPopupData,
    onDeleteSearchData: onDeleteSearchData,
    unmountSearchPopup: unmountSearchPopup

  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(OpenPopupForSearch);