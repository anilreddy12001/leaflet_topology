/**
 *  
 * Component : tenantScreen.js
 *
 * @version 1.0
 * @author Gowtham.S
 * @description Designed for landing tenant screen
 * @ignore
 */

import React, { Component } from 'react';
import { TextInput, Button, CheckBox } from "@nokia-csf-uxr/csfWidgets";
import "../../styles/tenantScreen.css"
//Add Provider to the root
class TenantScreen extends Component {

    constructor(props) {
        super(props); 
        let tenantId = this.getCookie("SURE_TENANT_ID");       
        let rememberMe = this.getCookie("SURE_REMEMBER_TENANT_ID") == "true";
        this.state = {
            tenantId: tenantId ? tenantId : "",
            rememberMe: rememberMe ? rememberMe: false,
            disableSubmitButton: tenantId ? false : true
        };
    }

    inputChange(obj){
        if((obj.value && obj.value.length) > 0)
             this.setState({disableSubmitButton: false, tenantId: obj.value})
        else if(!this.state.disableSubmitButton)
            this.setState({disableSubmitButton: true, tenantId: obj.value})
    }

    GetNotificationArea(notificationMessage){
        return(
            <div className="csfWidgets login__notification-area">
                <div className="login__icon-container">
                    <svg className="svg-icon" width="24" height="24" viewBox="0 0 24 24" style={{"pointerEvents": "none"}}><path fill="#fc0" d="M12,3.3,2,22H22Zm1,15.5H11v-2h2Zm-2-4V10h2v4.8Z"></path></svg>
                </div>
                <p className="notification-message">{notificationMessage}</p>
            </div>
        )
    }

    GetLoginForm(){
        return(
            <div className="login__login-form--wrapper">
                <div className="login__notification-area--container">                    
                    {this.props.notificationMessage ? this.GetNotificationArea(this.props.notificationMessage): ""}
                </div>
                <div className="login__login-form">
                    <TextInput id="tbTenantID" text={this.state.tenantId} placeholder="Tenant ID" hasOutline={false} onChange={this.inputChange.bind(this)}></TextInput>
                    <CheckBox id="cbRememberTenantID" label="Remember Tenant ID" value={this.state.rememberMe} onChange={(x)=>{this.setState({rememberMe:x})}}></CheckBox>
                    <div id="submitContainer">
                        <Button id= "btAuthenticate" className="call-to-action" disabled={this.state.disableSubmitButton} text="Submit" toolTip = {true} toolTipText="Submit" onClick={this.onFormSubmit.bind(this)}></Button>
                    </div>
                </div>
            </div>
        )
    }

    getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    onFormSubmit(){
        document.cookie = "SURE_TENANT_ID=" + (this.state.rememberMe ? this.state.tenantId : "");
        document.cookie = "SURE_REMEMBER_TENANT_ID=" + this.state.rememberMe;
        this.props.onSubmit(this.state.tenantId);       
    }

    GetProductPage(obj){
        return(
            <div className="login__product-details csfWidgets" style={{ "background": "rgba(18, 65, 145, 0.7)" }}>
                <div className="text-content" style={{ "maxHeight": "410px" }}>
                    <div className="image-wrapper">
                        <img src="data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 19.2.1%2C SVG Export Plug-In . SVG Version: 6.00 Build 0)  --%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'%09 width='313px' height='53px' viewBox='0 0 313 53' style='enable-background:new 0 0 313 53%3B' xml:space='preserve'%3E%3Cstyle type='text/css'%3E%09.st0%7Bfill:%23FFFFFF%3B%7D%3C/style%3E%3Cpath class='st0' d='M15.1%2C52.2H0V1h26.1L56%2C39.2V1H71v51.3H45.5L15.1%2C13.3V52.2 M143.1%2C36.4c0%2C7.1-1.3%2C9.6-3.3%2C11.9%09c-3.2%2C3.5-7.8%2C4.6-16.8%2C4.6H97.3c-9%2C0-13.6-1.1-16.8-4.6c-2.1-2.4-3.3-4.8-3.3-11.9V16.6c0-7.1%2C1.3-9.6%2C3.3-11.9%09c3.2-3.5%2C7.9-4.6%2C16.8-4.6H123c9%2C0%2C13.6%2C1.1%2C16.8%2C4.6c2.1%2C2.4%2C3.3%2C4.8%2C3.3%2C11.9V36.4 M122.4%2C39.9c3.4%2C0%2C4.7-0.2%2C5.5-1%09c0.8-0.7%2C1.1-1.6%2C1.1-4.6V18.7c0-3-0.3-3.9-1.1-4.6c-0.8-0.8-2-1-5.5-1H97.9c-3.4%2C0-4.7%2C0.2-5.5%2C1c-0.8%2C0.7-1.1%2C1.6-1.1%2C4.6v15.6%09c0%2C3%2C0.3%2C3.9%2C1.1%2C4.6c0.8%2C0.8%2C2%2C1%2C5.5%2C1H122.4L122.4%2C39.9 M165%2C1v51.3h-15.7V1H165 M191.7%2C1h20.8l-28.1%2C24L216%2C52.2h-22.2L165%2C25.5%09L191.7%2C1 M218.9%2C1h15.8v51.3h-15.8 M294.7%2C52.2l-4.7-8.9h-30.5l-4.6%2C8.9h-17.4L265.5%2C1h19.6L313%2C52.2H294.7 M265.1%2C32.2h19.6%09l-9.8-18.6L265.1%2C32.2'/%3E%3C/svg%3E" className="csfWidgets null" alt="Nokia"></img>
                    </div>
                    <span className="login__product-name">{obj.productName}</span>
                    <span className="login__description">{obj.productDesc}</span>
                    <span className="login__version-number">Version {obj.productVersion}</span>
                </div>
                <div className="login__copyright-details"><div className="login__copyright-text">{obj.coyrightInfo}</div></div>
            </div>
        )
    }

    render() {
        return (
            <div id="tenantScreen">
                <div className="login csfWidgets">
                    <div className="login__wrapper">
                        {this.GetProductPage(this.props)}
                        {this.GetLoginForm.call(this)}                        
                    </div>
                </div>
            </div>
        )
    }
}


export default TenantScreen