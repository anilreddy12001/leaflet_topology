/**
 *  
 * Component : detailsPanel.js
 *
 * @version 1.0
 * @author Gowtham.S
 * @ignore
 */

/**
* @class DetailsPanel
* @memberof SUREUI.components
* 
*
* */

import React, { Component } from 'react';
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import "../../styles/detailsPanel.css"


class DetailsPanel extends Component {

    renderIframe(obj, index) {
        return (
            <div className="iframeContainer" key={index}>
                <div className="panelLabel">{obj.label}</div>
                <iframe ref={"iframeContent" + index}
                    onLoad={(event) => {
                        var ifarmeObj = {
                            type: "ACCESS_CUSTOM_HOOK",
                            payload: {
                                data: obj.data
                            }
                        }
                        event.target.contentWindow.postMessage(ifarmeObj, "*");
                    }}
                    src={obj.URL}></iframe>
            </div>
        )
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    renderString(obj, index) {
        //label formating Regex /([A-Z]*[a-z]*)/g
        //this.capitalizeFirstLetter(label)
        let label = obj.label.match(/.*/g).join(" ").trim()
        if (label === "URL" || label === "CustomHookURL") {
            let tenantID = getQueryStringValue("tenantId");
            let linkValue = (label === "CustomHookURL") ? `${obj.value}?tenantId=${tenantID}` : obj.value;
            return (
                <div className="propContainer" key={index}>
                    <div className="panelLabel">{label}</div>
                    <div className="propValue">
                        <a href={linkValue} title={linkValue} target="_blank" >{linkValue}</a>
                    </div>
                </div>
            )
        }
        return (
            <div className="propContainer" key={index}>
                <div className="panelLabel">{label}</div>
                <div className="propValue">{obj.value}</div>
            </div>
        )
    }

    getContent(data, index) {

        let type = data.type || "";
        switch (type.toLowerCase()) {
            case 'iframe':
                return this.renderIframe(data, index)
            default:
                return this.renderString(data, index);
        }
    }

    getContents(data) {
        return (
            <div id="bodyWrapper">
                {
                    data && data.map((element, index) => {
                        return this.getContent(element, index);
                    }, this)
                }
            </div>
        )
    }

    componentDidMount() {
        new PerfectScrollbar("#OverlayPanel .panel-body");
    }

    render() {
        const { data } = this.props;
        if (data && data.length) {
            return (
                <div id="OverlayPanel">
                    <div className="header">
                        <div className="title">{this.props.title}</div>
                        <div className="close" onClick={this.props.onClose}></div>
                    </div>
                    <div className="panel-body">{this.getContents(this.props.data)}</div>
                </div>
            )
        }
        else {
            return (
                <div id="OverlayPanel">
                    <div className="header">
                        <div className="title">No Information Is Available.</div>
                        <div className="close" onClick={this.props.onClose}></div>
                    </div>
                    <div className="panel-body"></div>
                </div>
            )
        }

    }
}

export default DetailsPanel
