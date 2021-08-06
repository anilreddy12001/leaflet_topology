/**
 *  
 * Component : settings.jsx
 *
 * @version 1.0
 * @author Gowtham.S, Sunitha
 * @ignore
 */

 /**
 * @class Settings
 * @memberof SUREUI.components
 *
 * 
 * @property {boolean}  theme_isEnabled       If true, will display placeholder to upload load and color picker.
 * @property {string}  theme_color       Company brand color of a tenant in RGBA. e.g. rgba(255,255,255,1)
 * @property {object}   emailData       Predefined data for emailsettings.
 * @property {string}  emailData.fromEmail      From eMail.
 * @property {string}  emailData.displayName    Display name. 
 * @property {string}  emailData.replyToEmail   Reply eMail. 
 * @property {string}  emailData.tenantId       Tenant ID.
 * @property {string}  emailData.ugId       User group ID. 
 * @property {function}  onSave       callback function which will be called upon save.
 * @property {function}  onCancel       callback function which will be called upon cancel.
 * @example <caption>Access component as a Library</caption>
 * 
 *	var Settings = SUREUI.components.Settings;
 
 *	var props = {
 
 *		theme_isEnabled: true,
 *		theme_color: "rgba(255,255,255,1)",
 *		emailData: {
 *			fromEmail: 'abc@nokia.com',
 *			displayName: 'Test',
 *			replyToEmail: 'qwe@nokia.com',
 *			tenantId: 'T0',
 *			ugId: 'default_UserGroup'
 *		},
 *		onSave: function (item) {
 *			console.log(item);
 *		},
 *		onCancel: function (item) {
 
 *		},
 *		onError: function (item) {
 
 *		}
 *	}
 
 *	var settingsComponent = React.createElement(Settings, props);
 *	ReactDOM.render(settingsComponent, document.getElementById("settingsView")); //container height is must to render the component 
 
 */

import React, { Component } from 'react';
import { ToggleSwitch, FileUploader, Button, Tabs, Tab } from "@nokia-csf-uxr/csfWidgets";
import Wrapper from "./wrapper.jsx"
import EmailSettings from "../containers/emailSettings"
import { SketchPicker, ChromePicker } from 'react-color';
import "../../styles/settings.css"

class Settings extends Component {

    constructor(props) {
        super(props);
        this.state = {
            displayColorPicker: false,
            theme_fileData: [],
            emailData : props.emailData,
           
            
        };
        this.stateChanges = new Set();
        this.handleFieldChange = this.handleFieldChange.bind(this);
    }

    static get defaultProps() {
        return {
            theme_isEnabled: false,
            theme_color: "rgba(255,255,255,1)",
            theme_onLogoChange: function (item) {

            },
        }
    }

    componentWillMount() {
        const {emailData} = this.props;
        const { theme_color, theme_isEnabled, theme_fileData } = this.props;
        var componentArray = theme_color.replace(/[^\d,]/g, '').split(',') //will clone color obj
        var rgb = {
            r: parseInt(componentArray[0]),
            g: parseInt(componentArray[1]),
            b: parseInt(componentArray[2]),
            a: componentArray[3] ? parseInt(componentArray[3]) : 1
        }

        this.setState({
            customTheme: theme_isEnabled,
            theme_fileData: theme_fileData || [],
            hex: this.rgbToHex(rgb.r, rgb.g, rgb.b),
            rgb: rgb,
            tenantFromEmail:emailData.fromEmail,
            tenantReplyEmail:emailData.replyToEmail,
            tenantDisplayName:emailData.displayName

        })
    }

    toggleCustomTheme() {
        this.stateChanges.add(0);
        this.setState({
            customTheme: !this.state.customTheme,
            theme_fileData : []
        })
    }    

    renderThemeSwitch(isEnabled) {
        return (
            <div id="themeSwitchContainer">
                <div id="themeSwitchWrapper">
                    <div>
                        <div id="themeSwitchLabel">Custom Theme</div>
                        <div id="themeSwitchHelperText">
                            This option allows you to upload a custom logo and background graphic as well as set the primary color.
                        </div>
                    </div>
                    <div id="themeSwitch">
                        <ToggleSwitch id="ToggleID" onChange={this.toggleCustomTheme.bind(this) } checked={isEnabled} hasLabel={false} />
                    </div>
                </div>
            </div>
        )
    }

    onFileSelect(e) {
        this.stateChanges.add(0);
        this.setState({
            theme_fileData:e.value.map((item) => {return Object.assign(item, {status: "complete", uploadDate: ""})})
                            .filter((item, index) =>{return index==e.value.length - 1})
        })
    }

    onFileDelete() {
        this.stateChanges.add(0);
        this.setState({
            theme_fileData:[]
        })
    }   

    renderFileUploader() {
        return (
            <div id="fileUploaderContainer">
                <div>
                    <div id="fileUploaderLabel">Logo</div>
                    <div id="fileUploaderHelperText">Upload your company logo.</div>
                </div>
                <div id="fileUploaderInnerContainer">
                    <div id="fileUploaderWrapper">
                        <FileUploader 
                            denyMultipleFileDrop={true} 
                            allowOnlyOneFileInUploader= {true}
                            fileTypes = "image/svg+xml,image/png"
                            data={this.state.theme_fileData} 
                            dropZoneDateColumnHeader = ""
                            fileDeleteResponse={this.onFileDelete.bind(this)}
                            onFileSelect={this.onFileSelect.bind(this)} />
                        <div id="fileUploaderHelperText1">Files have to be less than 1mb. Supported file formats .PNG, .SVG</div>
                    </div>
                </div>
            </div>
        )
    }

    calculateColorPickerPosition(element, targetWidth, targetHeight) {

        var settingsElement = document.querySelector("#settings").getBoundingClientRect();

        const elemRect = element.getBoundingClientRect();

        if (elemRect.right + targetWidth < window.innerWidth) //alignRight
            return { left: elemRect.right + 5 - settingsElement.left, top: elemRect.top - settingsElement.top - targetHeight/2 + elemRect.height/2 }

        else if (elemRect.top - targetHeight > 0) //alingTop
            return { left: elemRect.left + (element.offsetWidth / 2 - targetWidth / 2), top: (elemRect.top - targetHeight - 5) }

        else if (elemRect.left - targetWidth > 0) //alignLeft
            return { left: elemRect.left - targetWidth - 5 }

        else if (elemRect.bottom + targetHeight < window.innerHeight)//alingBottom
            return { left: elemRect.left + (element.offsetWidth / 2 - targetWidth / 2), top: elemRect.bottom + 5 }

        else//alingRight
            return { left: elemRect.right + 5 }

        //alignLeft is not necessary as flexbox is center aligned, so right and left position both will be true
    }

    //Color Conversion
    componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
    
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    onChangeColorPicker(obj, event) {
        this.stateChanges.add(0)
        this.setState({
            hex: obj.hex,
            rgb: obj.rgb
        })
    }

    onChangeRGB(obj){
        this.stateChanges.add(0)
        this.setState({
            hex: this.rgbToHex(obj.r, obj.g, obj.b),
            rgb: obj
        })
    }

    onChangeHEX(obj){
        this.stateChanges.add(0)
        var rgb = this.hexToRgb(obj)
        if(rgb){
            this.setState({rgb : Object.assign(this.state.rgb , rgb)})
        }
        else{
            const {r, g, b} = this.state.rgb;
            this.setState({hex: this.rgbToHex(r, g, b)})
        }
    }

    openColorPicker() {

        const btnColorPicker = this.refs.btnColorPicker; //225x240 color picker dimension

        this.setState({
            displayColorPicker: true,
            colorPickerStyle: this.calculateColorPickerPosition(btnColorPicker, 225, 180)
        })
    }

    renderColorPicker() {
        return (
            <div id="colorPickerContainer">
                <div>
                    <div id="colorPickerLabel">Colour</div>
                    <div id="colorPickerHelperText">Set your company colour.</div>
                    <div id="colorPickerInnerContainer">
                        <div id="colorPickerTextContainer">
                            <div id="colorPickerRGB">
                                <span id="colorPickerRGBLabel">RGB: </span>
                                <div>
                                    <input type="text" value={this.state.rgb.r} 
                                        onChange={(e) => { 
                                            this.onChangeRGB(Object.assign(this.state.rgb, {r:Number.isNaN(parseInt(e.target.value)) ? 255 : parseInt(e.target.value)})) 
                                        }} id="tbRed" className="tbRGB" />
                                    <input type="text" value={this.state.rgb.g} 
                                        onChange={(e) => { 
                                            this.onChangeRGB(Object.assign(this.state.rgb, {g:Number.isNaN(parseInt(e.target.value)) ? 255 : parseInt(e.target.value)})) 
                                        }} id="tbGreen" className="tbRGB" />
                                    <input type="text" value={this.state.rgb.b} 
                                        onChange={(e) => { 
                                            this.onChangeRGB(Object.assign(this.state.rgb, {b:Number.isNaN(parseInt(e.target.value)) ? 255 : parseInt(e.target.value)})) 
                                        }} id="tbBlue" className="tbRGB" />
                                </div>
                            </div>
                            <div id="colorPickerHEX">
                                <span id="colorPickerHEXLabel">HEX: </span>
                                <input type="text" className="tbHEX" spellCheck="false" onChange={(e)=>{this.setState({hex:e.target.value})}} onBlur={(e) => { this.onChangeHEX(e.target.value) }} value={(this.state.hex || "").toUpperCase()} />
                            </div>
                        </div>
                        <button ref="btnColorPicker" style={{ backgroundColor: "rgba(" + this.state.rgb.r + "," + this.state.rgb.g + "," + this.state.rgb.b + "," + this.state.rgb.a  + ")"  }} id="btnColorPicker" onClick={this.openColorPicker.bind(this)}></button>
                        
                    </div>
                </div>
            </div>
        )
    }

    onSave() {
        const { onSave } = this.props;
        const { customTheme, rgb, theme_fileData } = this.state;
      
        var saveEmailObj ={
        emailPayload: {
            tenantFromEmail: this.state.tenantFromEmail,
            tenantReplyEmail: this.state.tenantReplyEmail,
            tenantDisplayName: this.state.tenantDisplayName,
        },
        tabIndex: this.getTabIndex.bind(this)
    };
        var saveObj = {
            theme_isEnabled: customTheme,
            stateChanges: [...this.stateChanges],
            theme_color: "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + rgb.a + ")",
            theme_fileData: theme_fileData,
            emailSettingsPayload:saveEmailObj
        }

        onSave(saveObj);
    }

    onCancel(props) {
        const {onCancel} = this.props;
        onCancel();
    }
    getTabIndex(e)
    {
       if(e.value == 1)
       {
           return e.value;
       }
       else{
           return null;
       }
    } 
    handleFieldChange(fieldId, value) {
        if(value){
            this.stateChanges.add(1);
        }
       
        this.setState({ [fieldId]: value });
      }

    render() {
        const { customTheme } = this.state;
        return (
            <div id="settings">
                <Wrapper headerText="Settings" onSave={this.onSave.bind(this)} onCancel={this.onCancel.bind(this)}>
                    <Tabs className="settingsTabs" alignment="left">
                        <Tab id="basicTab1" label="CUSTOM THEME" tabIndex={0}>
                            <div id="card">
                                {this.renderThemeSwitch(customTheme)}
                                {customTheme && this.renderFileUploader()}
                                {customTheme && this.renderColorPicker()}
                            </div>
                        </Tab>
                        <Tab id="basicTab2" label="EMAIL SETTINGS" tabIndex={1} onClick = {this.getTabIndex.bind(this)}>
                        <EmailSettings {...this.state.emailData}   onChange={this.handleFieldChange} />
                        </Tab>
                    </Tabs>
                    {
                        this.state.displayColorPicker ?
                            <div style={this.state.colorPickerStyle} className="colorPickerPopOver">
                                <div className="colorPickerCover" onClick={() => { this.setState({ displayColorPicker: false }) }} />
                                <ChromePicker color={this.state.rgb} onChange={this.onChangeColorPicker.bind(this)} />
                            </div> : null
                    }
                </Wrapper>
            </div>
        )
    }
}

export default Settings