/**
 *  
 * Container: emailSettings.js
 *
 * @version 1.0
 * @author Sunitha.S
 *
 */
'use strict';

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import ReactDOM from 'react-dom';
import { TextInput, Label } from '@nokia-csf-uxr/csfWidgets';
import { checkErrors, validateField } from "../helpers/uam/FormValidator";
import { populateEmail } from '../actions/emailSettingAction.js';
import { UAM_LABELS } from "../helpers/uam/uamConstants";
import { AlertDialogError } from '@nokia-csf-uxr/csfWidgets';
//Style
class EmailSettingsPanel extends Component {

      constructor(props) {

            super(props);

            this.state = {

                  tenantReplyEmail: '',
                  tenantDisplayName: '',
                  tenantFromEmail: '',

                  formErrors: {
                        tenantReplyEmail: { hasError: false, errorMsg: '', rules: ['required', 'email'] },
                        tenantDisplayName: { hasError: false, errorMsg: '', rules: ['required'] },
                        tenantFromEmail: { hasError: false, errorMsg: '', rules: ['required', 'email'] },

                  },
                  formHasError: true,
                  disabled: false,
                  params : {}

            };

            this.UAM_LABELS = UAM_LABELS;
            this.onValueChange = this.onValueChange.bind(this);

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


     
      onValueChange(e) {
            /* let { name, value } = e;*/
            // to change after dileep's confirmation
            let { value } = e;
            var name = e.nativeEvent.target.attributes.name.value;
            var cloneForm = Object.assign({}, this.state.formErrors);
            this.setState({ [name]: value },
                  () => { this.validateFieldWrapper(name, value) });
            this.setState({ formHasError: checkErrors(cloneForm, name, value, this.state, this.refs, this.UAM_LABELS) });
          
            //Object.assign({[name]:value},params)
            
            this.props.onChange(name,value);

           
            
      };
      onFocusChange(e) {
            //  let { name, value } = e.event.target;
            // to change after dileep's confirmation
            let { value } = e;
            var name = e.nativeEvent.target.attributes.name.value;
            this.setState({ [name]: value },
                  () => { this.validateFieldWrapper(name, value) });
      };

      validateFieldWrapper(fieldName, value) {
            let res = validateField(fieldName, value, this.state, this.refs, this.UAM_LABELS);
            this.setState({ formErrors: res.formElements });
            return res.valid;
      }


      componentWillMount() {
            // const { emailData } = this.props;

            this.setState({ tenantFromEmail: this.props.fromEmail, tenantReplyEmail: this.props.replyToEmail, tenantDisplayName: this.props.displayName });

      }
      componentDidMount(){
            this.props.onChange(this.state.params);
      }
 
      render() {

            return (

                  <div id="card">
                        <div id="emailSetting">
                              <div>
                                    <Label id="basicLabel" text={this.UAM_LABELS.EMAIL_SETTINGS} position="top" />
                              </div>
                              <div class="emailText">

                                    <TextInput id="tenantFromEmail" name="tenantFromEmail" ref="tenantFromEmail"
                                          onChange={(e) => this.onValueChange(e)} label={this.UAM_LABELS.FROM_EMAIL}
                                          text={this.state.tenantFromEmail} errorMsg={this.state.formErrors.tenantFromEmail.errorMsg}
                                          error={this.state.formErrors.tenantFromEmail.hasError} onBlur={(e) => this.onFocusChange(e)}
                                          disabled={this.state.disabled} required={true} />

                              </div>
                              <div class="emailText">
                                    <TextInput id="tenantDisplayName" name="tenantDisplayName" ref="tenantDisplayName"
                                          onChange={(e) => this.onValueChange(e)} label={this.UAM_LABELS.FROM_DISPLAY_NAME}
                                          text={this.state.tenantDisplayName} errorMsg={this.state.formErrors.tenantDisplayName.errorMsg}
                                          error={this.state.formErrors.tenantDisplayName.hasError} onBlur={(e) => this.onFocusChange(e)}
                                          disabled={this.state.disabled} required={true} />
                              </div>
                              <div class="emailText">
                                    <TextInput id="tenantReplyEmail" name="tenantReplyEmail" ref="tenantReplyEmail"
                                          onChange={(e) => this.onValueChange(e)} label={this.UAM_LABELS.REPLY_TO_EMAIL}
                                          text={this.state.tenantReplyEmail} errorMsg={this.state.formErrors.tenantReplyEmail.errorMsg}
                                          error={this.state.formErrors.tenantReplyEmail.hasError} onBlur={(e) => this.onFocusChange(e)}
                                          disabled={this.state.disabled} required={true} />
                              </div>
                        </div>

                  </div>




            )
      }

}
function mapStateToProps(state) {


};

function mapDispatchToProps(dispatch) {

      return bindActionCreators({

           // populateEmail: populateEmail


      }, dispatch);
}
export default EmailSettingsPanel;
