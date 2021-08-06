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
import { profileData, addUserGroup, editUserGroup, updateUserGroup, unmountUserGroup } from '../actions/userGroupAction.js';
import { TextInput, SelectItem, TextArea, AppToolbar, Button, Card, FormLayout } from '@nokia-csf-uxr/csfWidgets';
import { UAM_LABELS } from "../helpers/uam/uamConstants";
import { toast } from 'react-toastify';
import { AlertDialogError } from '@nokia-csf-uxr/csfWidgets';
//Style
import style from '../../styles/dataGrid.css';


class UserGroupData extends Component {

  constructor(props) {

    super(props);

    this.state = {
      text: '',
      error: false,
      textDesc: '',
      charCount: 0,
      errorText: false,
      selectedItem: '',
      disabled: false,
      pageTitle:''
    };
    this.UAM_LABELS = props.formData.propsCode ? props.formData.propsCode : UAM_LABELS;

  }
  static get defaultProps() {
    return {}
  }
  onChangeText(newText) {
    this.setState({ text: newText.value, error: newText.value.length == 0, disabled: false });


  }
  onChangeDesc(newText) {
    this.setState({ textDesc: newText.value, charCount: newText.value.length, errorText: newText.value.length > 300 });
  }
  onChangeProfile(newText) {
    this.setState({
      selectedItem: newText.value
    });

  }
  saveUserGroup(e) {
    const { formData } = this.props;
    const { addUserGroup } = this.props;
    const { updateUserGroup } = this.props;
    e.preventDefault();
    var userGroup_Name = this.state.text.trim();
    var userGroup_Desc = this.state.textDesc;
    var userProfile = this.state.selectedItem;
    if (!userGroup_Name || !userProfile) {

      return null;
    }
    var userGroupAddPayload = {
      "@class": "UserGroup",
      "UserGroupName": "UG1",
      "Description": "desc",
      "UgUsesProfile": [
        {
          "Type": "UG_USES_PROFILE",
          "NeoDirection": "SOURCE_TO_TARGET",
          "Target": {
            "@class": "Profile",
            "IsTenantAdminProfile": true,
            "IsAppAdminProfile": false,
            "ProfileName": "Profile",
            "AppUsesProfile": {
              "Type": "APP_USES_PROFILE",
              "NeoDirection": "SOURCE_TO_TARGET",
              "Source": {
                "@class": "Client",
                "Features": {},
                "SureName": formData.requestHeaders.appId,
                "Associations": {},
                "Label": "Client"
              },
              "Features": {}
            },
            "FollowsCatalog": [
              {
                "Type": "FOLLOWS_CATALOG",
                "NeoDirection": "SOURCE_TO_TARGET",
                "Target": {
                  "@class": "Item",
                  "Type": "Catalog",
                  "Category": "MT_FRAMEWORK",
                  "Features": {},
                  "SureName": "xyz",
                  "SubType": "AccessRole",
                  "Associations": {},
                  "Label": "Item"
                },
                "Features": {}
              }
            ],
            "Features": {},
            "Category": "MT_FRAMEWORK",

            "Label": "Profile"
          },
          "Features": {}
        }
      ]
    };

    if (userGroupAddPayload && userGroup_Name && userProfile) {
      //userGroupAddPayload = formData.payload;
      userGroupAddPayload.UserGroupName = userGroup_Name;
      userGroupAddPayload.Description = userGroup_Desc;
      userGroupAddPayload.UgUsesProfile[0].Target.FollowsCatalog[0].Target["SureName"] = userProfile;
    }

    if (formData.editUrl && formData.editUrl != "") {
      updateUserGroup({
        requestHeaders: formData.requestHeaders ? formData.requestHeaders : {},
        method: 'PUT',
        url: formData.domain + formData.updateUrl,
        payload: userGroupAddPayload
      });
    }
    else {
      addUserGroup({
        requestHeaders: formData.requestHeaders ? formData.requestHeaders : {},
        method: 'POST',
        url: formData.domain + formData.createUrl,
        payload: userGroupAddPayload
      });
    }


  }
  componentWillMount() {
    const { formData } = this.props;
    const { profileData } = this.props;
    const { editUserGroup } = this.props;
    const { unmountUserGroup } = this.props;
    this.setState({ pageTitle: this.UAM_LABELS.USERGROUP_ADD_HEADING })
    profileData({
      requestHeaders: formData.requestHeaders ? formData.requestHeaders : {},
      method: formData.method,
      url: formData.domain + formData.profileUrl
    });
    if (formData.editUrl && formData.editUrl != "") {
      editUserGroup({
        requestHeaders: formData.requestHeaders ? formData.requestHeaders : {},
        method: formData.method,
        url: formData.domain + formData.editUrl

      });
    }
    unmountUserGroup({});

  }

  componentWillReceiveProps(nextProps) {

    const { formData } = this.props;
    if (nextProps.userGroupCreation ) {
      
      
      
      if(nextProps.userGroupCreation.split(':')[0].trim() =='ADDED')
        {
      toast(nextProps.userGroupCreation.split(':')[1].trim() + " " + this.UAM_LABELS[nextProps.userGroupCreation.split(':')[0].trim()]   , {
        className: 'darker-toast',
        progressClassName: 'transparent-progress'
      });
      var props = this.props;
        setTimeout(function () {
          props.unmountUserGroup();
          formData.unmountGroup();
        }, 1500);
    }
    else {
    //   var myString = formData.propsCode[nextProps.userGroupCreation.split('=')[0].trim()];
     
    //  var res = myString.replace("name {0}",nextProps.userGroupCreation.split('=')[1].trim());
     

      this.renderErrorDialog(this.UAM_LABELS.ADD_USERGROUP_FAILED,nextProps.userGroupCreation); 
    }
      // if (nextProps.userGroupCreation == "Successfully Created") {
        
      // }
    }


    if (nextProps.userGroupEdit) {
      this.setState({pageTitle: this.UAM_LABELS.USERGROUP_EDIT_HEADING})
      this.setState({ text: nextProps.userGroupEdit.UserGroupName, error: nextProps.userGroupEdit.UserGroupName.length == 0, disabled: true });
      //this.setState({ text: nextProps.userGroupEdit['UserGroupName'], charCount: nextProps.userGroupEdit['UserGroupName'].length, errorText: newText.text.length > 300 });
      if (nextProps.userGroupEdit.Description && nextProps.userGroupEdit.Description != "") {
        this.setState({ textDesc: nextProps.userGroupEdit.Description, charCount: nextProps.userGroupEdit.Description.length, errorText: nextProps.userGroupEdit.Description.length > 300 });
      }
      this.setState({
        selectedItem: nextProps.userGroupEdit.Associations.Association[0].Target.Associations.Association[0].Target["SureName"]

      });

    }
    if (nextProps.userGroupUpdation) {
      if (nextProps.userGroupUpdation.split(':')[0].trim() == 'UPDATED') {
        toast(nextProps.userGroupUpdation.split(':')[1].trim() + " " + this.UAM_LABELS[nextProps.userGroupUpdation.split(':')[0].trim()], {
          className: 'darker-toast',
          progressClassName: 'transparent-progress'
        });
        var props = this.props;
        setTimeout(function () {
          props.unmountUserGroup();
          formData.unmountGroup();
        }, 1500);
      }
      else {

        this.renderErrorDialog(this.UAM_LABELS.UPDATE_USERGROUP_FAILED, nextProps.userGroupUpdation);
      }



    }


  }
  cancelUserGroup() {
    const { formData } = this.props;
    // this.props.formData.userGroupCancel("CANCEL");
    this.props.unmountUserGroup();
    formData.unmountGroup();

  }
  renderErrorDialog(title, detailedMsg) {
 
  var aboutOptions ={
         id: "errorDialog"
         , title: title
         , errorText: detailedMsg 
         /*, detailsText: errorParameter + detailedError*/ 
           ,onClose: function () {
            
             ReactDOM.unmountComponentAtNode(document.getElementById("infoDialog"));
             
             
         }
     };

         var component = React.createElement(AlertDialogError, aboutOptions);

         ReactDOM.render(component, document.getElementById("infoDialog"));
     }
  render() {
    if (this.props.responseData && Object.keys(this.props.responseData).length > 0) {
      var profileDataSet = this.props.responseData;

      var profileArray = [];
      profileDataSet.map(function (value, key) {
        var obj = {};

        obj['label'] = value;
        obj['value'] = value;

        this.push(obj);
      }, profileArray);

      return (

        <div >

          <AppToolbar id="basic" pageTitle={this.state.pageTitle} subTitle="" iconBtns={null} />

          <div id="inventoryRoleView">
            <form onSubmit={this.saveUserGroup.bind(this)}>



              <div >
                <Card id="card1" css={{ width: 600, height: 350 }} >
                  <FormLayout>
                    <div >

                      <TextInput id="userGroupName" placeholder={this.UAM_LABELS.INVENTORY_NAME} required={true}  onChange={this.onChangeText.bind(this)} label={this.UAM_LABELS.INVENTORY_NAME} text={this.state.text} errorMsg="Field Cannot Be Empty" error={this.state.error} disabled={this.state.disabled} inputPattern = "^[a-zA-Z0-9\-_]+$" />

                    </div>
                    <div >

                      <TextArea id="portNumber" placeholder={this.UAM_LABELS.DESCRIPTION}  label={this.UAM_LABELS.DESCRIPTION} onChange={this.onChangeDesc.bind(this)} text={this.state.textDesc} charCount={this.state.charCount} maxCharCount={300} errorMsg="Too Much Text" error={this.state.errorText} />


                    </div>

                    <div >

                      <SelectItem id="profile" data={profileArray} required={true} label={this.UAM_LABELS.PROFILE} selectedItem={this.state.selectedItem} onChange={this.onChangeProfile.bind(this)} maxHeight={100} />


                    </div>
                  </FormLayout>
                </Card>
              </div>




              <div style={{ bottom: "0",left:"0", position: "fixed", height: "50px", border: "#ccc 1px solid", width: "100%" }}   >
                <div style={{ float: "right" }}>
                  <Button id="cancel" text="CANCEL" onClick={this.cancelUserGroup.bind(this)} /> <Button id="submit" text="SAVE" disabled={!this.state.text} isCallToAction={true} />
                </div>
              </div>

            </form>
          </div>
        </div>
      )
    }
    else {
      return null
    }

  }

}
function mapStateToProps(state) {

  let dataObj = {};

  if (state.userGroup.responseData) {

    dataObj.responseData = state.userGroup.responseData;
    dataObj.userGroupCreation = state.userGroup.userGroupCreation;
    dataObj.userGroupEdit = state.userGroup.userGroupEdit;
    dataObj.userGroupUpdation = state.userGroup.userGroupUpdation;
    dataObj.timeStamp = state.userGroup.timeStamp;

  }

  return dataObj;


}
function mapDispatchToProps(dispatch) {

  return bindActionCreators({

    profileData: profileData,
    addUserGroup: addUserGroup,
    editUserGroup: editUserGroup,
    updateUserGroup: updateUserGroup,
    unmountUserGroup: unmountUserGroup



  }, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(UserGroupData);
