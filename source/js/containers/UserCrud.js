/**
 * @class UserCrud
 * @version 1.0
 * @author Dileep H
 * @description Component class for maintaining user operations
 */
'use strict';

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { TextInput, Button, SelectItem, FormLayout, Label, AlertDialogError, ToggleButtonGroup } from '@nokia-csf-uxr/csfWidgets';
import { saveTenant, userAction, resetUAMStore } from '../actions/crudAction';
import "../../styles/crudScreens.css"
import { createUserPayload, messageLabels } from "../helpers/uam/UamHelper";
import { notify, checkErrors, validateField, responseSplitter, replaceValue } from "../helpers/uam/FormValidator";
import { UAM_LABELS } from "../helpers/uam/uamConstants"

class UserCrud extends Component {
  constructor(props) {
    super()
    this.getUIBlocks = this.getUIBlocks.bind(this);
    this.state = {
      firstName: '', lastName: '', email: '', username: '', userGroup: '', status: '',ldapId:false,
      formErrors: {
        firstName: { hasError: false, errorMsg: '', rules: ['required'] }
        , lastName: { hasError: false, errorMsg: '', rules: ['required'] },
        email: { hasError: false, errorMsg: '', rules: ['required', 'email'] },
        username: { hasError: false, errorMsg: '', rules: ['required'] },
        userGroup: { hasError: false, errorMsg: '', rules: ['required'] }
      },
      formHasError: true
    }
    this.notifyCondition = false; this.diffProps = false; this.operation = 'ADD';
    this.UAM_LABELS = props.translationData ? props.translationData : UAM_LABELS;
    this.statusBlock = this.statusBlock.bind(this);
  }

  static get defaultProps() {
    return {
      userGroups: [], userMessage: '', hasError: false
    }
  }

  componentWillMount() {
    this.operation = "ADD";
    if (this.props.editData) {
      this.operation = "EDIT";
      let { Firstname, Status, TenantId, Category, Email, Username, UgId, Groups, Lastname, PrimaryLabel,LDAP_ID } = this.props.editData;
       this.setState({ formHasError: false, firstName: Firstname, lastName: Lastname, email: Email, username: Username, userGroup: Groups, status: Status,ldapId: (LDAP_ID ? true : false), originalEmail: Email });
    }
  }

  componentDidMount() {
    fetchUserGroup(this.props);
    ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularID"));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userMessage && ((this.notifyCondition && nextProps.userMessage.status == 204 && (this.operation == "RESET_PASSWORD" || this.operation == "EDIT")) || (this.notifyCondition && nextProps.userMessage.data) || (this.notifyCondition && nextProps.userMessage.data && nextProps.userMessage.data.UserName))) {
      this.diffProps = true;
    }
  }

  onFormCancel(props) {
    const { resetUAMStore } = this.props;
    resetUAMStore();
    let { cancel, elementId } = this.props.hookMethods;
    cancel(elementId);
  }

  statusBlock() {
    return (
      <div id="statusDivss" className={'cardLayout ' + (this.state.status == 'Active' ? 'unlockedStyle ' : 'lockedStyle')} >
        <div id="buttonGroupId" ><Label text={this.UAM_LABELS.USER_CRUD_ACCOUNT_STATUS} />
          <ToggleButtonGroup id="toggleButtonGroupID" onChange={(e) => this.onStatusChange(e)} groupName="Status button group"
            buttons={[{ id: "toggleButtonGroupID-cleared", disabled: "true", isSelected:(this.state.status == 'Active'), text: this.UAM_LABELS.ACTIVE, tooltip: { text: this.UAM_LABELS.ACTIVE } }, {
              id:"toggleButtonGroupID-conditions",disabled: "true", isSelected:(this.state.status != 'Active'), text: this.UAM_LABELS.LOCKED, tooltip: { text: this.UAM_LABELS.LOCKED }
            }]} />
        </div>
      </div>
    )
  }

  getUIBlocks(message, flag, data, success, title) {
    return (
      <div id="uamParent" className="csf-widgets-wizard csf-widgets-wizard-fullscreen-wrapper">
        {message && flag && !success && <AlertDialogError id="alertDialogError" title={title} errorText={message} onClose={this.onClose.bind(this)} trapFocus={true} />}
        {/* {success && <Snackbar id="snackbarID" dataList={[{message: message,duration: 3000}]} />} */}
        <div id="uamHeader" className="csf-widgets-wizard-header">
          <p role="presentation" id="uamHeaderText" className="csf-widgets-wizard-header-title">{this.props.headerText}</p>
        </div>
        <div id="uamMain" className="csf-widgets-wizard-main">
          <div className="centreDiv" >
            {this.props.editData && !this.state.ldapId && this.statusBlock()}
            <div id="test" className="cardLayout">
              <div className="tenatForm">
                <FormLayout id="formMargin" >

                  <div>
                    <TextInput name="firstName" ref="firstName" id="firstNameId" error={this.state.formErrors.firstName.hasError} errorMsg={this.state.formErrors.firstName.errorMsg} text={this.state.firstName} label={this.UAM_LABELS.USER_CRUD_FIRSTNAME_LABEL} required={true} onChange={(e) => this.onValueChange(e, "firstName")}
                      onBlur={(e) => this.onFocusChange(e, "firstName")} readOnly={this.state.ldapId} inputPattern = "^[a-zA-Z0-9\-_]+$" />
                  </div>

                  <div>
                    <TextInput name="lastName" ref="lastName" id="lastNameId" text={this.state.lastName} label={this.UAM_LABELS.USER_CRUD_LASTTNAME_LABEL} required={true} error={this.state.formErrors.lastName.hasError} errorMsg={this.state.formErrors.lastName.errorMsg} onChange={(e) => this.onValueChange(e, "lastName")}
                      onBlur={(e) => this.onFocusChange(e, "lastName")} readOnly={this.state.ldapId} inputPattern = "^[a-zA-Z0-9\-_]+$" />
                  </div>

                  <div >

                    <TextInput name="email" ref="email" id="emailId" text={this.state.email} label={this.UAM_LABELS.USER_CRUD_EMAIL_LABEL} required={true} onChange={(e) => this.onValueChange(e, "email")} error={this.state.formErrors.email.hasError} errorMsg={this.state.formErrors.email.errorMsg}
                      onBlur={(e) => this.onFocusChange(e, "email")} readOnly={this.state.ldapId}/>
                  </div>
                  {/* {this.props.editData ?
                    <div id="editUsernameDiv"> <TextInput name="username" ref="username" id="usernameEditId" text={this.state.username} label={this.UAM_LABELS.USER_CRUD_USERNAME_LABEL} required={true} onChange={(e) => this.onValueChange(e, "username")} error={this.state.formErrors.username.hasError} errorMsg={this.state.formErrors.username.errorMsg}
                      onBlur={(e) => this.onFocusChange(e, "username")} readOnly={true} displayTooltipOnFocus={false} hasOutline={false} /> </div> :
                    <div  ><TextInput name="username" ref="username" id="usernameId" text={this.state.username} label={this.UAM_LABELS.USER_CRUD_USERNAME_LABEL} required={true} onChange={(e) => this.onValueChange(e, "username")} error={this.state.formErrors.username.hasError} errorMsg={this.state.formErrors.username.errorMsg}
                      onBlur={(e) => this.onFocusChange(e, "username")} /></div>} */}
                  <div id="editUsernameDiv"> <TextInput name="username" ref="username" id="usernameFieldId" text={this.state.username} label={this.UAM_LABELS.USER_CRUD_USERNAME_LABEL} required={true} onChange={(e) => this.onValueChange(e, "username")} error={this.state.formErrors.username.hasError} errorMsg={this.state.formErrors.username.errorMsg}
                      onBlur={(e) => this.onFocusChange(e, "username")} readOnly={this.props.editData} displayTooltipOnFocus={false} inputPattern = "^[a-zA-Z0-9\-_]+$" /> </div>    

                  <div id="resetPasswordDiv" >
                    {this.props.editData && !this.state.ldapId && <Button text={this.UAM_LABELS.USER_CRUD_PASSWORD_RESET} onClick={this.passwordReset.bind(this)} disabled={this.state.status == 'Locked'} />}
                  </div>

                  <div  >
                    <SelectItem id="selectItemID" ref="userGroup" data={this.props.userGroups} hinttext="hint text" ignoreAccents={false} name="userGroup"
                      autofocus={true} searchable maxHeight={null} onChange={this.onGroupChange.bind(this)}
                      label={this.UAM_LABELS.USER_CRUD_USERGROUP_LABEL} required={true} selectedItem={this.state.userGroup} minWidth={100}
                      onBlur={(e) => this.onFocusChange(e, "userGroup")} onBlurResetsInput={true}
                      error={this.state.formErrors.userGroup.hasError} errorMsg={this.state.formErrors.userGroup.errorMsg} />
                  </div>

                </FormLayout>
              </div>
            </div>
          </div>
        </div>
        <div id="uamFooter" className="csf-widgets-wizard-footer">
          <div id="uamFooterActions" className="csf-widgets-wizard-footer-actions" >
            <Button id="cancelUam" text={this.UAM_LABELS.CANCEL} onClick={this.onFormCancel.bind(this)}  > </Button>
            <Button id="saveUam" text={this.UAM_LABELS.SAVE} onClick={this.onFormSubmit.bind(this)} disabled={this.state.formHasError}> </Button>
          </div>
        </div>
      </div>
    )
  }

  onClose() {
    this.notifyCondition = false;
    this.diffProps = false;
    this.forceUpdate();
  }

  onGroupChange(e) {
    var cloneForm = Object.assign({}, this.state.formErrors);
    cloneForm.userGroup.errorMsg = '';
    this.setState({ userGroup: e.value, formErrors: cloneForm });
    this.setState({ formHasError: checkErrors(cloneForm, 'userGroup', e.value, this.state, this.refs, this.UAM_LABELS) });
  };

  onValueChange(e, name) {
    let { value } = e;
    var cloneForm = Object.assign({}, this.state.formErrors);
    this.setState({ [name]: value },
      () => { this.validateFieldWrapper(name, value) });
    this.setState({ formHasError: checkErrors(cloneForm, name, value, this.state, this.refs, this.UAM_LABELS) });
  }

  onStatusChange(e) {
    let stateSelected = (e.value && (e.value.buttons || []).length > 1 && e.value.buttons[0].isSelected) ? 'Active' : 'Locked';
    this.setState({ status: stateSelected });
  }

  onFocusChange(e, name) {
    let { value } = e;
    this.setState({ [name]: value },
      () => { this.validateFieldWrapper(name, value) });
  };

  validateFieldWrapper(fieldName, value) {
    let res = validateField(fieldName, value, this.state, this.refs, this.UAM_LABELS);
    this.setState({ formErrors: res.formElements });
    return res.valid;
  }

  passwordReset() {
    this.notifyCondition = true;
    this.operation = "RESET_PASSWORD";
    let { userAction, baseUrl, headers, editData } = this.props;
    userAction({
      method: 'PUT', url: baseUrl + "tenants/users/" + editData.Username + "/resetPassword?tenantId=" + headers.tenantId, requestHeaders: headers,
      payload: null, operation: 'UPDATE_USER'
    })
  }

  onFormSubmit() {
    let validForm = true;
    for (var key in this.state.formErrors) {
      let validData = this.validateFieldWrapper(key, this.state[key]);
      if (!validData) {
        validForm = false;
      }
    }
    if (validForm) {
      this.operation = this.props.editData ? 'EDIT' : 'ADD';
      this.operation == 'EDIT' ? this.editUser(this.state.ldapId) : this.saveUser();
    }
  }

  saveUser() {
    this.notifyCondition = true;
    const { userAction, baseUrl, headers } = this.props;
    let payload = createUserPayload(this.state);
    userAction({
      method: 'POST', url: baseUrl + "tenants/users?tenantId=" + headers.tenantId, requestHeaders: headers,
      payload: payload, operation: 'SAVE_USERS'
    })
  }

  editUser(ldapUser) {
    this.notifyCondition = true;
    const { userAction, baseUrl, headers } = this.props;
    let payload = createUserPayload(this.state, this.operation);
    let finalUrl = baseUrl + "tenants/users?tenantId=" + headers.tenantId + (ldapUser ? "&updateGroupOnly=true" : "");
    userAction({
      method: 'PUT', url: finalUrl, requestHeaders: headers,
      payload: payload, operation: 'UPDATE_USERS'
    })
  }

  render() {
    var notifyFlag = false;
    var suc = false;
    var labels = {};
    var splitedResponse = { message: "", detailedMessage: "" };
    if (this.props.userMessage && this.notifyCondition && (this.diffProps)) {
      let { success, elementId } = this.props.hookMethods;
      if ("RESET_PASSWORD" == this.operation) {
        labels = messageLabels({ label: this.UAM_LABELS })['resetPassword'];
        splitedResponse = responseSplitter({ data: this.props.userMessage, operation: this.operation, entity: 'User', SuccessLabel: labels.successLabel, FailureLabel: labels.failureLabel, name: this.state.originalEmail });
        if (splitedResponse && splitedResponse.status == "SUCCESS") {
          suc = this.setSuccessFlags(suc);
          notify(splitedResponse.message);
        }
      } else {
        labels = messageLabels({ label: this.UAM_LABELS })[this.operation.toLowerCase()];
        splitedResponse = responseSplitter({ data: this.props.userMessage, operation: this.operation, entity: 'User', SuccessLabel: labels.successLabel, FailureLabel: labels.failureLabel, name: this.state.username });
        if (splitedResponse.status == "SUCCESS") {
          suc = this.setSuccessFlags(suc);
          const { resetUAMStore } = this.props;
          resetUAMStore();
          success(elementId, splitedResponse.message);
        }
      }
      notifyFlag = true;
    }
    return (<div id="tenantCreateID" > {
      this.getUIBlocks(splitedResponse.message, notifyFlag, splitedResponse.detailedMessage, suc, labels.title)
    }
    </div>
    )
  }

  setSuccessFlags(suc) {
    suc = true;
    this.notifyCondition = false;
    this.diffProps = false;
    return suc;
  }

}

function mapStateToProps(state) {
  let crudDataObj = {};
  crudDataObj.userGroups = state.createUser.usergroup;
  crudDataObj.userMessage = state.createUser.userMessages;
  return crudDataObj;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    saveTenant: saveTenant,
    userAction: userAction,
    resetUAMStore: resetUAMStore
  }, dispatch);
}

function fetchUserGroup(propsPassed) {
  let { baseUrl, headers, payload, userAction } = propsPassed;
  let userGroupUrl = baseUrl.concat('userGroups?q=Tenant.UUID;EQUALS;' + headers.tenantId);
  userAction({
    method: 'GET', url: userGroupUrl, requestHeaders: headers,
    payload: payload, operation: 'FETCH_USERGROUPS'
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(UserCrud);
