/**
 *  
 * Container: tenantMgmtContainer.js
 *
 * @version 1.0
 * @author Sunitha.S
 *
 */
'use strict';

import React, { Component } from 'react';

import { bindActionCreators } from 'redux';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import '../../styles/tenantMgmt.css';
import { profileData, unmountTenantMgmt, unmountTenant, addTenant, populateEmail, fetchTenant, resetPassWord } from '../actions/tenantMgmtAction.js';
import { TextInput, SelectItem,SelectItemNew,AppToolbar, Button, Card, FormLayout, CheckBoxGroup, CheckBox, SvgIcon } from '@nokia-csf-uxr/csfWidgets';
import { checkErrors, validateField, responseSplitter } from "../helpers/uam/FormValidator";
import { UAM_LABELS } from "../helpers/uam/uamConstants";
import { COUNTRY_LIST } from "../helpers/uam/country.js";
import { toast } from 'react-toastify';
import { AlertDialogError } from '@nokia-csf-uxr/csfWidgets';
import { ProgressIndicatorCircular } from '@nokia-csf-uxr/csfWidgets';
//Style

const isEmpty = (obj = {}) => Object
  .keys(obj)
  .length === 0;


/*let objProfileArray = [];
let unsharedProfile = [];*/
class TenantMgmtData extends Component {

  constructor(props) {

    super(props);
    this.sharedResource = undefined
    this.state = {
      tenantName: '',
      tenantAddress: '',
      tenantCity: '',
      tenantCountry: '',
      tenantAdminFirstName: '',
      tenantAdminLastName: '',
      tenantAdminEmail: '',
      tenantContactName: '',
      tenantContactEmail: '',
      tenantReplyEmail: '',
      tenantDisplayName: '',
      tenantFromEmail: '',
      tenantProfile: '',
      profileSelected: [],
      tenantProfileDesc: '',
      pageTitle: "",
      tenantPortalLoginUrl: "",
      checked: false,
      formErrors: {
        tenantName: { hasError: false, errorMsg: '', rules: ['required'] },
        tenantAdminFirstName: { hasError: false, errorMsg: '', rules: ['required'] },
        tenantAdminLastName: { hasError: false, errorMsg: '', rules: ['required'] },
        tenantAdminEmail: { hasError: false, errorMsg: '', rules: ['required', 'email'] },
        tenantReplyEmail: { hasError: false, errorMsg: '', rules: ['required', 'email'] },
        tenantDisplayName: { hasError: false, errorMsg: '', rules: ['required'] },
        tenantFromEmail: { hasError: false, errorMsg: '', rules: ['required', 'email'] },
        tenantProfile: { hasError: false, errorMsg: '', rules: ['required'] }
      },
      formHasError: true,
      disabled: false,
      editTenant: false,
      cloneTenantData: {},
      profileObj: {},
      rolTenantInfo: false
    };

    this.UAM_LABELS = props.tenantData.propsCode ? props.tenantData.propsCode : UAM_LABELS;
    this.COUNTRY_LIST = COUNTRY_LIST;

  }

  static get defaultProps() {
    return {
      tenantProfile: [], tenantCountry: [], hasError: false
    }
  }
  renderErrorDialog(title, detailedMsg) {

    var aboutOptions = {
      id: "errorDialog"
      , title: title
      , errorText: detailedMsg

      , onClose: function () {

        ReactDOM.unmountComponentAtNode(document.getElementById("infoDialog"));

      }
    };

    var component = React.createElement(AlertDialogError, aboutOptions);

    ReactDOM.render(component, document.getElementById("infoDialog"));
  }

  onSelectChange(e) {
    var cloneForm = Object.assign({}, this.state.formErrors);
    cloneForm.tenantProfile.errorMsg = '';
    var selectedProfileData = e.value.split(':');
    this.setState({
      tenantProfile: e.value, 
      tenantProfileDesc: selectedProfileData[1],
      formErrors: cloneForm,
      formHasError: checkErrors(cloneForm, 'tenantProfile', selectedProfileData[0], this.state, this.refs, this.UAM_LABELS) })
   
  };
  onSelectChangeCountry(e) {
    this.setState({ tenantCountry: e.value });
  };


  onValueChange(e) {
    /* let { name, value } = e;*/
    // to change after dileep's confirmation
    let { value } = e;
    var name = e.nativeEvent.target.attributes.name.value;
    if (this.state.editTenant && (name == "tenantAdminEmail" || name == "tenantAdminFirstName" || name == "tenantAdminLastName")) {
      document.getElementById("Resetpw").style.display = "none";
      document.getElementById("pwInfo").style.display = "block";
    }

    var cloneForm = Object.assign({}, this.state.formErrors);
    this.setState({ [name]: value },
      () => { this.validateFieldWrapper(name, value) });
    this.setState({ formHasError: checkErrors(cloneForm, name, value, this.state, this.refs, this.UAM_LABELS) });
  };
  onValueNotRequiredChange(e) {
    /* let { name, value } = e;*/
    // to change after dileep's confirmation
    let { value } = e;
    var name = e.nativeEvent.target.attributes.name.value;
    this.setState({ [name]: value });

  };
  onFocusNotRequiredChange(e) {
    // let { name, value } = e.event.target;
    // to change after dileep's confirmation
    let { value } = e;
    var name = e.nativeEvent.target.attributes.name.value;
    this.setState({ [name]: value });
  };

  onFocusChange(e) {
    //  let { name, value } = e.event.target;
    // to change after dileep's confirmation
    let { value } = e;
    var name = e.nativeEvent.target.attributes.name.value;
    this.setState({ [name]: value },
      () => { this.validateFieldWrapper(name, value) });
  };
  onFocusChangeItem(e ,name) {
    let { value } = e;
    this.setState({ [name]: value },
      () => { this.validateFieldWrapper(name, value) });
  };

  sharedProfile(e) {

    var objProfileArray = [];
    var unsharedProfile = [];
    this.setState({ profileObj: e.value });
    var x = e.value;
    let objCopy = Object.assign({}, x);
    for (var key in x) {
      if (x.hasOwnProperty(key)) {
        console.log(key + " -> " + x[key]);
        if (x[key] == true) {
          if (objProfileArray.indexOf(key) == -1) {
              objProfileArray.push(key)
          }
        }
        else {
          
          if (unsharedProfile.indexOf(key) == -1) {
           unsharedProfile.push(key)
           }
          objProfileArray.forEach(function (prfValue) {

            if (prfValue == key) {
              objProfileArray.splice(objProfileArray.indexOf(key), 1);
            }
          });
          
        }
      }
    }

    this.newSharedProfile = objProfileArray;
    //const {sharedResources} = this.props.tenantDetails;
  
    var arrayOfSharedResources = Object.keys(this.sharedResource).filter((x)=>{return this.sharedResource[x]})
    unsharedProfile = unsharedProfile.filter((x) => {return arrayOfSharedResources.indexOf(x) != -1})
    
    this.unshareProfile = unsharedProfile;

  }

  validateFieldWrapper(fieldName, value) {
    let res = validateField(fieldName, value, this.state, this.refs, this.UAM_LABELS);
    this.setState({ formErrors: res.formElements });
    return res.valid;
  }

  saveTenant(e) {

    const { tenantData } = this.props;
    const { addTenant } = this.props;

    if (e) { e.preventDefault(); }
    var selectedProfile = this.state.tenantProfile
    selectedProfile = selectedProfile.split(':');
    var tenantName = this.state.tenantName.trim();
    var tenantAddress = this.state.tenantAddress;
    var tenantCity = this.state.tenantCity;
    var tenantCountry = this.state.tenantCountry;
    var tenantProfile = selectedProfile[0];
    var tenantAdminFirstName = this.state.tenantAdminFirstName;
    var tenantAdminLastName = this.state.tenantAdminLastName;
    var tenantAdminEmail = this.state.tenantAdminEmail;
    var tenantContactName = this.state.tenantContactName;
    var tenantContactEmail = this.state.tenantContactEmail;
    var tenantFromEmail = this.state.tenantFromEmail;
    var tenantDisplayName = this.state.tenantDisplayName;
    var tenantReplyEmail = this.state.tenantReplyEmail;
    // this.setState({profileSelected:this.sharedProfile()});

    if (!tenantName || !tenantProfile) {

      return null;
    }
    var tenantCreatePayload = {
      "@class": "Tenant",
      "AuthEndPoint": "1.1.1.1",

      "RealmName": "RealmNew",
      "FromEmail": "abc@xyz.com",
      "ReplyEmail": "mnop@xyz.com",
      "FromDisplayName": "Admin Email",

      "HasUG": [
        {
          "Type": "HAS_UG",
          "NeoDirection": "SOURCE_TO_TARGET",
          "Target": {
            "@class": "UserGroup",

            "UserGroupName": "default_UserGroup",

            "UgUsesProfile": [
              {
                "Type": "UG_USES_PROFILE",
                "NeoDirection": "SOURCE_TO_TARGET",
                "Target": {
                  "@class": "Profile",

                  "IsTenantAdminProfile": true,

                  "ProfileName": "Profile",
                  "AppUsesProfile": {
                    "Type": "APP_USES_PROFILE",
                    "NeoDirection": "SOURCE_TO_TARGET",
                    "Source": {
                      "@class": "Client",
                      "Features": {
                      },
                      "SureName": tenantData.requestHeaders.appId,
                      "Associations": {
                      },
                      "Label": "Client"
                    },
                    "Features": {
                    }
                  },
                  "FollowsCatalog": [
                    {
                      "Type": "FOLLOWS_CATALOG",
                      "NeoDirection": "SOURCE_TO_TARGET",
                      "Target": {
                        "@class": "Item",
                        "Type": "Catalog",
                        "Features": {

                        },
                        "SureName": "INFRA_TENANT_ACCESS_PROFILE",
                        "SubType": "AccessRole",
                        "Category": "MT_FRAMEWORK",
                        "Associations": {
                        },
                        "Label": "Item"
                      },
                      "Features": {
                      }
                    }
                  ],
                  "Features": {
                  },
                  "Category": "MT_FRAMEWORK",

                  "Label": "Profile"
                },
                "Features": {
                }
              }
            ],
            "Features": {
            },
            "Category": "MT_FRAMEWORK",

            "Label": "UserGroup"
          },
          "Features": {
          }
        }
      ],
      "RuleType": "static",
      "Features": {
        "Feature": []

      },
      "SureName": "Tenant_New",
      "Category": "MT_FRAMEWORK",

      "Label": "Tenant"
    };

    if (tenantName && tenantProfile) {

      //  tenantCreatePayload = tenantData.payload;
      tenantCreatePayload.HasUG[0].Target.UserGroupName = tenantData.userGroup;
      tenantCreatePayload.RealmName = tenantName;
      tenantCreatePayload.SureName = tenantName;
      tenantCreatePayload.FromEmail = tenantFromEmail;
      tenantCreatePayload.ReplyEmail = tenantReplyEmail;
      tenantCreatePayload.FromDisplayName = tenantDisplayName;
      // tenantCreatePayload.Features.Feature.push({
      //   "Name": this.UAM_LABELS.ADDRESS, "Value": tenantAddress, "Name": this.UAM_LABELS.CITY, "Value": tenantCity, "Name": this.UAM_LABELS.COUNTRY,
      //   "Value": tenantCountry, "Name": this.UAM_LABELS.CONTACT_NAME, "Value": tenantContactName, "Name": "ContactEmail", "Value": tenantContactEmail

      // });
      tenantCreatePayload.Features.Feature.push({ "Name": "Address", "Value": tenantAddress });
      tenantCreatePayload.Features.Feature.push({ "Name": "City", "Value": tenantCity });
      tenantCreatePayload.Features.Feature.push({ "Name": "Country", "Value": tenantCountry });
      tenantCreatePayload.Features.Feature.push({ "Name": "ContactName", "Value": tenantContactName });
      tenantCreatePayload.Features.Feature.push({ "Name": "ContactEmail", "Value": tenantContactEmail });


      tenantCreatePayload.HasUG[0].Target.UgUsesProfile[0].Target.FollowsCatalog[0].Target["SureName"] = tenantProfile;
    }

    var userCreatePayload = {

      "UserName": "dxfdgf",
      "UserFirstName": "sdfds",
      "UserLastName": "dsfdsfsdf",
      "UserEMail": "sdfdsf@gjhj.com",
      "Enabled": true,
      "UserGroups": ["dfdfd"]
    };
    if (tenantAdminFirstName && tenantAdminLastName && tenantAdminEmail) {

      // userCreatePayload = tenantData.userPayload;
      userCreatePayload.UserName = tenantData.userName;
      userCreatePayload.UserFirstName = tenantAdminFirstName;
      userCreatePayload.UserLastName = tenantAdminLastName;
      userCreatePayload.UserEMail = tenantAdminEmail;
      userCreatePayload.UserGroups = [tenantData.userGroup];

    }

    var shareProfilePayload = {
      //"SourceTenantId": "string",
      "DestinationTenantId": "string",
      "ResourceIds": [
        "string"
      ],

      "AutoAccept": true,
      "AccessRights": "string",
      "EquipmentHierarchy": true,
      "AccessRoleHierarchy": true
    };
    var unshareProfilePayload = {};
    if (this.newSharedProfile && this.newSharedProfile != undefined) {

      // shareProfilePayload = tenantData.sharingPayload;
      //shareProfilePayload.SourceTenantId = tenantData.requestHeaders.tenantId;
      shareProfilePayload.DestinationTenantId = tenantName;
      shareProfilePayload.ResourceIds = this.newSharedProfile;
      shareProfilePayload.AccessRights = "R";
    }
    else {
      shareProfilePayload = {};
    }
    if (this.unshareProfile && this.unshareProfile != undefined) {

      // shareProfilePayload = tenantData.sharingPayload;
      // unshareProfilePayload.SourceTenantId = tenantData.requestHeaders.tenantId;
      unshareProfilePayload.DestinationTenantId = tenantName;
      unshareProfilePayload.ResourceIds = this.unshareProfile;
      unshareProfilePayload.AccessRights = "R";
    }
    else {
      unshareProfilePayload = {};
    }


    addTenant({
      requestHeaders: tenantData.requestHeaders ? tenantData.requestHeaders : {},
      method: this.state.editTenant ? 'PUT' : 'POST',
      url: tenantData.domain + tenantData.createUrl,
      payload: tenantCreatePayload,
      userUrl: tenantData.domain + tenantData.createUserUrl + "?tenantId=" + tenantName,
      userPayload: userCreatePayload,
      shareAccessRole: tenantData.domain + tenantData.shareAccessRole,
      unshareAccessRole: tenantData.domain + tenantData.unshareAccessRole,
      sharingPayload: shareProfilePayload,
      unsharingPayload: unshareProfilePayload,
      domain: tenantData.domain,
      EditUI: this.state.editTenant,
      rolTenantInfo: this.state.rolTenantInfo
    });

  };
  componentWillMount() {
    const { tenantData } = this.props;
    const { profileData } = this.props;
    const { populateEmail } = this.props;
    const { fetchTenant } = this.props;
    const { unmountTenantMgmt } = this.props;
    this.setState({ pageTitle: tenantData.editTenant ? this.UAM_LABELS.TENANT_EDIT_HEADING : this.UAM_LABELS.TENANT_ADD_HEADING })
    this.setState({ editTenant: tenantData.editTenant, disabled: tenantData.editTenant })
    profileData({
      requestHeaders: tenantData.requestHeaders ? tenantData.requestHeaders : {},
      method: tenantData.method,
      url: tenantData.domain + tenantData.profileUrl,
      sharingUrl: tenantData.domain + tenantData.profileSharingUrl
    });
    populateEmail({
      requestHeaders: tenantData.requestHeaders ? tenantData.requestHeaders : {},
      method: tenantData.method,
      url: tenantData.domain + tenantData.populateEmail + tenantData.requestHeaders['tenantId'],
    })

    if (tenantData.editTenant) {
      this.setState({ tenantPortalLoginUrl: tenantData.tenantPortalLoginUrl })
      fetchTenant({
        requestHeaders: tenantData.requestHeaders ? tenantData.requestHeaders : {},
        method: tenantData.method,
        url: tenantData.domain + tenantData.tenantFetchUrl,
        userurl: tenantData.domain + tenantData.tenantUserFetchUrl,
        fetchSharedResourceurl: tenantData.domain + tenantData.tenantfetchSharedResourceUrl
      });
    }
    unmountTenantMgmt({});

  }

  componentDidUpdate(prevProps, prevState) {
    var x = this.props.resetPw;
    ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularID"));
    if (x !== prevProps.resetPw) {
      if (x == "Success") {
        toast(this.UAM_LABELS.OTP_MESSGAE + " " + this.state.tenantAdminEmail, {
          className: 'darker-toast',
          progressClassName: 'transparent-progress'
        });
      }
    }

  }

  componentWillReceiveProps(nextProps) {
    const { tenantData } = this.props;
   // this.sharedResource = nextProps.tenantDetails.sharedResource;
    if (nextProps.responseDataCreate) {
      var x = nextProps.responseDataCreate.split(':')[0].trim();
      if (x == 'ADDED' || x == 'UPDATED') {
        toast(nextProps.responseDataCreate.split(':')[1].trim() + " " + this.UAM_LABELS[nextProps.responseDataCreate.split(':')[0].trim()], {
          className: 'darker-toast',
          progressClassName: 'transparent-progress'
        });
        if (this.state.editTenant && (this.props.tenantDetails.tenantUserInfo.Email != this.state.tenantAdminEmail || this.props.tenantDetails.tenantUserInfo.Firstname != this.state.tenantAdminFirstName || this.props.tenantDetails.tenantUserInfo.Lastname != this.state.tenantAdminLastName)) {
          this.resetPwEmail();
        }
        var props = this.props;
        setTimeout(function () {
          props.unmountTenantMgmt();
          tenantData.unmountTenant();
        }, 1500);
      }
      else {

        this.renderErrorDialog(this.UAM_LABELS.ADD_TENANT_FAILED, nextProps.responseDataCreate);
      }


    }

    if (nextProps.populateEmailSettings) {
      var emailSettings = nextProps.populateEmailSettings;

      this.setState({ tenantFromEmail: emailSettings.FromEmail, tenantReplyEmail: emailSettings.ReplyEmail, tenantDisplayName: emailSettings.FromDisplayName });
    }
    if (nextProps.updateErr != this.props.updateErr) {
      this.renderErrorDialog(this.UAM_LABELS.UPDATE_TENANT_FAILED, nextProps.updateErr.response);
    }

    if (nextProps.tenantDetails && Object.keys(nextProps.tenantDetails).length != 0) {
      if(!this.sharedResource)
      {
       this.sharedResource = Object.assign({},nextProps.tenantDetails.sharedResources);
      }
      this.updateEditTenantScreen(nextProps);
    }

  }
  componentDidMount() {
    var profileObj1 = {};
    if (!isEmpty(this.props.shareResponse)) {
      for (let value of Object.values(this.props.shareResponse)) {
        //console.log(value.ProfileName); 
        profileObj1[value.ProfileName] = this.state.checked || false;
      }
      this.setState({ profileObj: profileObj1 });
    }
    else {
      this.setState({ profileObj: {} });
    }
  }
  // update view with tenant details
  updateEditTenantScreen(props) {
    var tenantValue = props.tenantDetails;
    this.state.cloneTenantData = JSON.parse(JSON.stringify(tenantValue));
    var tenantFetched = tenantValue.tenantInfo;
    var tenantUserFetched = tenantValue.tenantUserInfo;
    var tenantProfileInfo = tenantValue.profileInfo;
    var tenantsharedResourceFetched = tenantValue.sharedResources;
    var cloneForm = Object.assign({}, this.state.formErrors);
    cloneForm.tenantProfile.errorMsg = '';

    this.setState({
      tenantName: tenantFetched.SureName ? tenantFetched.SureName : "",
      tenantAddress: tenantFetched.Address ? tenantFetched.Address : "",
      tenantCity: tenantFetched.City ? tenantFetched.City : "",
      tenantCountry: tenantFetched.Country ? tenantFetched.Country : "",
      tenantAdminFirstName: tenantUserFetched.Firstname ? tenantUserFetched.Firstname : "",
      tenantAdminLastName: tenantUserFetched.Lastname ? tenantUserFetched.Lastname : "",
      tenantAdminEmail: tenantUserFetched.Email ? tenantUserFetched.Email : "",
      tenantContactName: tenantFetched.ContactName ? tenantFetched.ContactName : "",
      tenantContactEmail: tenantFetched.ContactEmail ? tenantFetched.ContactEmail : "",
      tenantReplyEmail: tenantFetched.ReplyEmail ? tenantFetched.ReplyEmail : "",
      tenantDisplayName: tenantFetched.FromDisplayName ? tenantFetched.FromDisplayName : "",
      tenantFromEmail: tenantFetched.FromEmail ? tenantFetched.FromEmail : "",
      tenantProfile: tenantProfileInfo.SureName ? tenantProfileInfo.SureName : "",
      profileObj: tenantsharedResourceFetched ? tenantsharedResourceFetched : {},
      tenantProfileDesc: tenantProfileInfo.Description ? tenantProfileInfo.Description : ""
    }, function () {
      if (this.props.updateErr && this.props.updateErr.updateError == "UserFailed") {
        this.setState({ rolTenantInfo: true }, function () { this.saveTenant() });

      }
      if (this.state.tenantProfile && this.state.tenantProfile != "") {
        this.setState({ formHasError: checkErrors(cloneForm, 'tenantProfile', tenantProfileInfo.SureName, this.state, this.refs, this.UAM_LABELS) });
      }
    });

    /* if (props.updateErr && props.updateErr.updateError == "UserFailed") {
       this.saveTenant();
     }*/
  }

  cancelTenant() {
    const { tenantData } = this.props;
    this.props.unmountTenantMgmt();
    tenantData.unmountTenant();

  }

  resetPwEmail() {
    const { tenantData } = this.props;
    const { resetPassWord } = this.props;
    resetPassWord({
      requestHeaders: tenantData.requestHeaders ? tenantData.requestHeaders : {},
      method: 'PUT',
      url: tenantData.domain + tenantData.createUserUrl + "/" + tenantData.userName + tenantData.triggerPwResetUrl
    })
  }

  checkBoxRender() {
    // const{ profileData } = this.props;
    var profileShareDataSet = this.props.shareResponse;


    return profileShareDataSet.map(function (value, index, key) {
      return (
        // <div className="shareProfile">
        <CheckBox
          key={index}
          label={`${value.ProfileName}  ` +
            `(${value.Description})`}
          // onChange={() => {
          //   var stateObj = {};
          //   stateObj[value['ProfileName']] = !this.state[value['ProfileName']]
          //   this.setState(stateObj);

          //     var combined = this.state.checkedArray.concat(value['ProfileName']);
          //     this.setState({ checkedArray: combined });
          //     if (this.state.checkedArray.length > 0) {
          //       this.newSharedProfile = this.state.checkedArray
          //     }


          //}}
          // value={this.state.checked}
          name={value.ProfileName}
        />
        //<span id="shareDesc">{value['Description']}</span>;
        // </div> 
      )
    }, this);
  }
  showDesc(descData) {
    return (<span id="shareDesc">{descData}</span>)
  }

  render() {
    if (this.props.responseData && Object.keys(this.props.responseData).length > 0 && this.props.shareResponse && Object.keys(this.props.shareResponse).length > 0) {
      const { tenantData } = this.props;
      var profileDataSet = this.props.responseData;
      var profileShareSet = this.props.shareResponse;
      var countryArray = this.COUNTRY_LIST;
      var profileArray = [];
      var profileShareArray = [];
      profileDataSet.map(function (value, key) {
        var obj = {};
        obj['label'] = value['Name'];
        obj['value'] = value['Name'] + ':' + value['Description'];;


        this.push(obj);
      }, profileArray);




      return (

        <div class="tenantMgmt" >
          <div class="tenantHeader">
          <AppToolbar id="basic" pageTitle={this.state.pageTitle} subTitle="" iconBtns={null} />
          </div>
          <div id="tenantMgmtAdd">
            <form onSubmit={this.saveTenant.bind(this)}>

              <div>

                <Card id="card1" className="card1" css={{ width: 900, height: 400 }} >
                  <FormLayout>
                    <div >

                      <TextInput id="tenantName" name="tenantName" ref="tenantName" onChange={(e) => this.onValueChange(e)} label={this.UAM_LABELS.TENANT_NAME}
                        text={this.state.tenantName} errorMsg={this.state.formErrors.tenantName.errorMsg} error={this.state.formErrors.tenantName.hasError} disabled={this.state.disabled}
                        onBlur={(e) => this.onFocusChange(e)} required={true} inputPattern = "^[a-zA-Z0-9\-_]+$" />

                    </div>
                    <div>
                      <TextInput id="tenantAddress" name="tenantAddress" ref="tenantAddress" onChange={(e) => this.onValueNotRequiredChange(e)}
                        label={this.UAM_LABELS.ADDRESS} text={this.state.tenantAddress} onBlur={(e) => this.onFocusNotRequiredChange(e)} />
                    </div>
                    <div>
                      <TextInput id="tenantCity" name="tenantCity" ref="tenantCity" onChange={(e) => this.onValueNotRequiredChange(e)}
                        label={this.UAM_LABELS.CITY} text={this.state.tenantCity} onBlur={(e) => this.onFocusNotRequiredChange(e)} />
                    </div>
                    <div>
                      <SelectItem id="tenantCountry" name="tenantCountry" ref="tenantCountry" data={countryArray}
                        label={this.UAM_LABELS.COUNTRY} selectedItem={this.state.tenantCountry}
                        onChange={this.onSelectChangeCountry.bind(this)} maxHeight={100} searchable={true} onBlur={(e) => this.onFocusNotRequiredChange(e)} />
                    </div>

                  </FormLayout>
                </Card>
                <div style={{ height: 80 }}>

                </div>
                <div id="cardHeader">{this.UAM_LABELS.CONTACT_INFO}</div>
                <Card id="card2" className="card2" css={{ width: 900, height: 250 }} >
                  <FormLayout>
                    <div >

                      <TextInput id="tenantContactName" name="tenantContactName" ref="tenantContactName"
                        onChange={(e) => this.onValueNotRequiredChange(e)} label={this.UAM_LABELS.CONTACT_NAME}
                        text={this.state.tenantContactName} onBlur={(e) => this.onFocusNotRequiredChange(e)} />

                    </div>
                    <div>
                      <TextInput id="tenantContactEmail" name="tenantContactEmail" ref="tenantContactEmail"
                        onChange={(e) => this.onValueNotRequiredChange(e)} label={this.UAM_LABELS.EMAIL}
                        text={this.state.tenantContactEmail} onBlur={(e) => this.onFocusNotRequiredChange(e)} />
                    </div>

                  </FormLayout>
                </Card>

                <div style={{ height: 80 }}>

                </div>
                <div id="cardHeader">{this.UAM_LABELS.TENANT_ADMINISTRATOR}</div>
                <Card id="card3" className="card3" css={{ width: 900, height: this.state.editTenant ? 698 : 570 }} >
                  <FormLayout>
                    <div >
                      <TextInput id="tenantAdminFirstName" name="tenantAdminFirstName" ref="tenantAdminFirstName"
                        onChange={(e) => this.onValueChange(e)} label={this.UAM_LABELS.USER_CRUD_FIRSTNAME_LABEL}
                        text={this.state.tenantAdminFirstName} errorMsg={this.state.formErrors.tenantAdminFirstName.errorMsg}
                        error={this.state.formErrors.tenantAdminFirstName.hasError} onBlur={(e) => this.onFocusChange(e)} required={true} />

                    </div>
                    <div >
                      <TextInput id="tenantAdminLastName" name="tenantAdminLastName" ref="tenantAdminLastName"
                        onChange={(e) => this.onValueChange(e)} label={this.UAM_LABELS.USER_CRUD_LASTTNAME_LABEL}
                        text={this.state.tenantAdminLastName} errorMsg={this.state.formErrors.tenantAdminLastName.errorMsg}
                        error={this.state.formErrors.tenantAdminLastName.hasError} onBlur={(e) => this.onFocusChange(e)} required={true} />

                    </div>
                    <div>
                      <TextInput id="tenantAdminEmail" name="tenantAdminEmail" ref="tenantAdminEmail"
                        onChange={(e) => this.onValueChange(e)} label={this.UAM_LABELS.EMAIL}
                        text={this.state.tenantAdminEmail} errorMsg={this.state.formErrors.tenantAdminEmail.errorMsg}
                        error={this.state.formErrors.tenantAdminEmail.hasError} onBlur={(e) => this.onFocusChange(e)} required={true} />
                    </div>
                    <div>
                      <TextInput id="tenantUserName" name="tenantUserName" ref="tenantUserName"
                        label={this.UAM_LABELS.USERNAME} text={tenantData.userName} readOnly={true} />
                    </div>
                    <div>
                      <TextInput id="tenantUserGroup" name="tenantUserGroup" ref="tenantUserGROUP"
                        label={this.UAM_LABELS.USER_CRUD_USERGROUP_LABEL} text={tenantData.userGroup}
                        readOnly={true} />
                    </div>
                    <div >

                      <SelectItem id="tenantProfile" name="tenantProfile" ref="tenantProfile" data={profileArray}
                        label={this.UAM_LABELS.PROFILE} selectedItem={this.state.tenantProfile} errorMsg={this.state.formErrors.tenantProfile.errorMsg}
                        error={this.state.formErrors.tenantProfile.hasError} onChange={this.onSelectChange.bind(this)}
                        maxHeight={100}  maxWidth={400} onBlur={(e) => this.onFocusChangeItem(e ,"tenantProfile")} required={true} />


                    </div>
                    <span><label>{this.state.tenantProfileDesc}</label></span>

                    <div id="Resetpw" style={{ display: this.state.editTenant ? "block" : "none" }}>
                      <span id="tenantEmail" onClick={this.resetPwEmail.bind(this)} >{this.UAM_LABELS.TENANT_CRUD_RESETPW}</span>
                    </div>
                    <div id="pwInfo" style={{ display: "none" }}>
                      <span id="pwInfoSpan" ><img className="manImg" />A new password will be sent to {this.state.tenantAdminEmail}</span>
                    </div>
                    <div id="tenantPortalUrl1" style={{ display: this.state.editTenant ? "none" : "none" }}>
                      <TextInput id="tenantPortalUrl" name="tenantPortalUrl" refs="tenantPortalUrl"
                        label={this.UAM_LABELS.TENANT_CRUD_TENANTPORTALURL} text={this.state.tenantPortalLoginUrl} readOnly={true}
                      />
                    </div>
                  </FormLayout>
                </Card>

                <div style={{ height: 80 }}>

                </div>
                <div id="cardHeader">{this.UAM_LABELS.EMAIL_SETTINGS}</div>
                <Card id="card4" className="card4" css={{ width: 900, height: 350 }} >
                  <FormLayout>
                    <div >

                      <TextInput id="tenantFromEmail" name="tenantFromEmail" ref="tenantFromEmail"
                        onChange={(e) => this.onValueChange(e)} label={this.UAM_LABELS.FROM_EMAIL}
                        text={this.state.tenantFromEmail} errorMsg={this.state.formErrors.tenantFromEmail.errorMsg}
                        error={this.state.formErrors.tenantFromEmail.hasError} onBlur={(e) => this.onFocusChange(e)}
                        disabled={this.state.disabled} required={true} />

                    </div>
                    <div>
                      <TextInput id="tenantDisplayName" name="tenantDisplayName" ref="tenantDisplayName"
                        onChange={(e) => this.onValueChange(e)} label={this.UAM_LABELS.FROM_DISPLAY_NAME}
                        text={this.state.tenantDisplayName} errorMsg={this.state.formErrors.tenantDisplayName.errorMsg}
                        error={this.state.formErrors.tenantDisplayName.hasError} onBlur={(e) => this.onFocusChange(e)}
                        disabled={this.state.disabled} required={true} />
                    </div>
                    <div>
                      <TextInput id="tenantReplyEmail" name="tenantReplyEmail" ref="tenantReplyEmail"
                        onChange={(e) => this.onValueChange(e)} label={this.UAM_LABELS.REPLY_TO_EMAIL}
                        text={this.state.tenantReplyEmail} errorMsg={this.state.formErrors.tenantReplyEmail.errorMsg}
                        error={this.state.formErrors.tenantReplyEmail.hasError} onBlur={(e) => this.onFocusChange(e)}
                        disabled={this.state.disabled} required={true} />
                    </div>


                  </FormLayout>
                </Card>
                <div style={{ height: 80 }}>

                </div>
                <div id="cardHeader">{this.UAM_LABELS.SHARED_PROFILES}</div>
                <Card id="card5" css={{ width: 900, height: 250, }} className="card shareProfile" initiallyExpanded={true}>
                  <FormLayout>
                    <CheckBoxGroup id="profileSelected" name="profileSelected" label="" values={this.state.profileObj} onChange={this.sharedProfile.bind(this)}>
                      {this.checkBoxRender()}
                    </CheckBoxGroup>
                  </FormLayout>
                </Card>
              </div>
              <div style={{ height: 80 }}>

              </div>
              <div style={{ bottom: "0",left:"0", position: "fixed", height: "50px", border: "#ccc 1px solid", width: "100%",background:"#fff" }}   >
                <div style={{ float: "right" }}>
                  <Button id="cancel" text="CANCEL" onClick={this.cancelTenant.bind(this)} /> <Button id="submit" text="SAVE" isCallToAction={true} disabled={this.state.formHasError} />
                </div>
              </div>

            </form>
          </div>
        </div>
      )
    }
    else if (this.state.editTenant) {
      return progressBarLoading(this.state);
    }else{
      return null;
    }
    function progressBarLoading(stateObj) {
      return (
        <div style={{ paddingTop: "150px"}}>
        <ProgressIndicatorCircular id="progressIndicatorCircularID" spinner="right" className="" overlay
            css={{small: false, medium: false, large: false, xlarge: true, xxlarge: false}} />
            </div>
      )
    }

  }

}
function mapStateToProps(state) {

  let dataObj = {};

  if (state.tenantCreate.responseData) {

    dataObj.responseData = state.tenantCreate.responseData;
    dataObj.shareResponse = state.tenantCreate.shareResponse;
    dataObj.responseDataCreate = state.tenantCreate.responseDataCreate;
    dataObj.timeStamp = state.tenantCreate.timeStamp;
    dataObj.populateEmailSettings = state.tenantCreate.populateEmailSettings;

  }
  if (state.tenantCreate.tenantDetails) { dataObj.tenantDetails = state.tenantCreate.tenantDetails; }
  if (state.tenantCreate.resetPw) { dataObj.resetPw = state.tenantCreate.resetPw; }
  if (state.tenantCreate.updateErr) { dataObj.updateErr = state.tenantCreate.updateErr; }

  return dataObj;


}

function mapDispatchToProps(dispatch) {

  return bindActionCreators({

    profileData: profileData,
    profileData: profileData,
    addTenant: addTenant,
    populateEmail: populateEmail,
    unmountTenantMgmt: unmountTenantMgmt,
    fetchTenant: fetchTenant,
    resetPassWord: resetPassWord

  }, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(TenantMgmtData);
