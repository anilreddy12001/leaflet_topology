import React, { Component } from 'react';
import { Button } from "@nokia-csf-uxr/csfWidgets";
import "../../styles/wrapper.css"

class Wrapper extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="wrapper">
                <div id="header">
                    <p id="headerContent">{this.props.headerText}</p>
                </div>
                <div id="body" >
                    {this.props.children}
                </div>
                <div id="footer">
                    <Button id="cancel" text="CANCEL" onClick={() => { this.props.onCancel(this.props) }} />
                    <Button id="save" text="SAVE" onClick={() => { this.props.onSave(this.props) }} isCallToAction />
                </div>
            </div>
        )
    }
}

export default Wrapper