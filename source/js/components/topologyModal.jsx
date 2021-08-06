/**
 *  
 * Component : modalPopup.js
 *
 * @version 1.0
 * @author Gowtham.S
 * @description designed for modal window from Topology and geomap
 * @ignore
 */

import React, { Component } from 'react';
import PerfectScrollbar from "perfect-scrollbar";
import { Dialog, IconButton, SvgIcon } from "@nokia-csf-uxr/csfWidgets";
import "../../styles/topologyModal.css";
//Add Provider to the root
class TopologyModal extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isExtended: false,
            toolTipPosition: {
                left: 0,
                top: 0,
            }
        }
    }

    componentDidMount() {

        if (this.refs.childElementContainer) {
            const ps = new PerfectScrollbar(this.refs.childElementContainer, {
                wheelPropagation: true,
                minScrollbarLength: 20
            });
        }

    }

    drawClose() {
        return <svg id="modalCloseSVG" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <title>close</title>
            <polygon points="19.07 6.34 17.66 4.93 12 10.59 6.34 4.93 4.93 6.34 10.59 12 4.93 17.66 6.34 19.07 12 13.41 17.66 19.07 19.07 17.66 13.41 12 19.07 6.34" fill="#acacac" />
        </svg>
    }

    drawSVG(type, entityColor, statusColor) {
        switch (type) {
            case "ENTITY":
                return (
                    <svg width="20" height="20" viewBox="0 0 125 125" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="25" width="100" height="100" fill={entityColor && entityColor != "" ? entityColor : "#acacac"} />
                        {statusColor && statusColor != "#acacac" && <circle cx="95" cy="30" r="30" stroke="#ffffff" strokeWidth="10" fill={statusColor} />}
                    </svg>)
            case "TOOLTIP":
                return (
                    <svg width="10" height="10" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="20" fill={statusColor && statusColor != "" ? statusColor : "#acacac"} />
                    </svg>)
            default:
                break;
        }

    }

    getElements() {
        var obj = [
            {}
        ]
    }

    customToolTip() {

    }

    renderEntity(obj) {
        const { entityClick } = this.props;
        return (
            [
                <div key={0} className="elementIcon" onClick={(e) => entityClick(obj)} onMouseEnter={(e) => this.showToolTip.call(this, obj, e)} onMouseLeave={this.hideToolTip.bind(this)}>{this.drawSVG("ENTITY", obj.color, obj.statusColor)}</div>,
                <div key={1} className="elementName" onClick={(e) => entityClick(obj)} onMouseEnter={(e) => this.showToolTip.call(this, obj, e)} onMouseLeave={this.hideToolTip.bind(this)}>{obj.name}</div>
            ]
        )
    }

    showToolTip(data, e) {

        clearTimeout(this.showToolTipTimeout);

        if (e.clientX / window.innerWidth * 100 < 50)
            var toolTipPosition = { bottom: -(e.clientY - 10), left: e.clientX + 15 };
        else
            var toolTipPosition = { bottom: -(e.clientY - 10), right: window.innerWidth - e.clientX - 15 }

        this.showToolTipTimeout = setTimeout(() => {
            this.setState({
                toolTipPosition: toolTipPosition,
                toolTipData: data
            })
        }, 200);

    }

    hideToolTip(e) {
        this.setState({
            toolTipData: undefined
        })
    }

    onToolTipHover(e) {
        const { onMouseEnter } = this.props;

        if (onMouseEnter) {
            onMouseEnter();
        }
        // console.log("tooltipover");
        // console.log(e.target.getBoundingClientRect())
        // clearTimeout(this.hideToolTipTimeout);
    }

    onToolTipLeave() {
        //this.isToolTipFocus = false;
        if (this.state.toolTipData) {
            this.setState({ toolTipData: undefined })
        }
    }

    renderAssociations(obj, pathClick, onMouseEnter) {
        var self = this;
        return (
            <div className="modalChildElementsContainer individualEntityContainer">
                <div className="modalEntityElementsHeader">
                    <span>{"Associations"}</span>
                </div>
                <div ref="childElementContainer" className="modalEntityElementWrapper">
                    <div className="modalEntityElements">
                        {
                            obj.map((item, index) => self.renderAssociationElements(item, index, pathClick, onMouseEnter))
                        }
                    </div>
                </div>
            </div>
        )
    }

    renderAssociationElements(obj, index, pathClick) {
        return (
            <div className={"modalEntityElement individualEntity"} key={index}
                onClick={() => { pathClick && obj && obj.path && pathClick(obj.path) }}>
                <div className="modalEntityElementSource">
                    {this.renderEntity(obj)}
                </div>
            </div>
        )
    }

    renderEntityElements(obj, index, pathClick) {
        return (
            <div className={"modalEntityElement " + (obj.isSelected ? "selectedPath" : "")} key={index}
                onClick={() => { pathClick && obj && obj.path && pathClick(obj.path) }}>
                <div className="modalEntityElementSource">
                    {this.renderEntity(obj.origin)}
                </div>
                <div className="modalEntityElementPath">
                    <hr style={{ borderColor: obj.path.statusColor || obj.path.color }} onMouseEnter={(e) => this.showToolTip.call(this, obj.path, e)} onMouseLeave={this.hideToolTip.bind(this)}></hr>
                </div>
                <div className="modalEntityElementDestination">
                    {this.renderEntity(obj.destination)}
                </div>
            </div>
        )
    }

    renderModalHeader(data, isClicked, onClose) {

        var endpointInfo = data.endpointInfo && data.endpointInfo.length > 1 ? data.endpointInfo : undefined;
        return (
            <div className="modalHeader">
                <div className="modalHeaderContent" >
                    <strong className="itemName">{endpointInfo ? data.type.toUpperCase() + "S" : data.type.toUpperCase()}</strong>
                    {<div className="itemsCount">{data.name}</div>}
                    {endpointInfo && <div className="itemsCount">count: {endpointInfo.length}</div>}
                    {
                    !(data.endpointInfo && data.endpointInfo.length > 0) &&
                    !data.equipmentInfo &&
                    data.statusName && data.statusColor &&
                    <div className="statusInfo">
                        {this.drawSVG("TOOLTIP", "", data.statusColor || data.color)}
                        <div className="name">{data.statusName || ""}</div>
                    </div>}
            </div>
            <div className="modalClose" onClick={onClose}>
                {isClicked && this.drawClose()}
            </div>
            </div >
        )
    }

    renderModalRootElement(data) {
        return (
            <div className="modalRootElements" >
                <div className="modalEntityElements">
                    {this.renderEntityElements(data)}
                </div>
            </div>
        )
    }

    renderModalChildElements(data, pathClick, onMouseEnter) {

        var self = this;
        return (
            <div className="modalChildElementsContainer">
                <div className="modalEntityElementsHeader">
                    <span>{"Origin"}</span>
                    <span>{"Destination"}</span>
                </div>
                <div ref="childElementContainer" className="modalEntityElementWrapper">
                    <div className="modalEntityElements">
                        {
                            data.map((item, index) => self.renderEntityElements(item, index, pathClick, onMouseEnter))
                        }
                    </div>
                </div>
            </div>
        )
    }

    // calculatePosition(element, targetWidth, targetHeight) {

    //     const elemRect = element.getBoundingClientRect();

    //     if (elemRect.right + targetWidth < window.innerWidth) //alignRight
    //         return { left: elemRect.right + 5 }

    //     else if (elemRect.top - targetHeight > 0) //alingTop
    //         return { left: elemRect.left + (element.offsetWidth/2 - targetWidth/2), top: (elemRect.top - targetHeight - 5) }

    //     else if (elemRect.left - targetWidth > 0) //alignLeft
    //         return { left: elemRect.left - targetWidth - 5}

    //     else if (elemRect.bottom + targetHeight < window.innerHeight)//alingBottom
    //         return { left: elemRect.left + (element.offsetWidth/2 - targetWidth/2), top: elemRect.bottom + 5  }

    //     else//alingRight
    //         return {  left: elemRect.right + 5 }

    //     //alignLeft is not necessary as flexbox is center aligned, so right and left position both will be true
    // }


    renderToolTip(data, targetElement) {

        var inlineStyle = {};

        if (data && (data.color && data.color != "") || (data.statusColor && data.statusColor != "")) {
            inlineStyle.borderTopColor = data.statusColor || data.color;
        }

        return (
            <div id="topologyModal" style={Object.assign({}, inlineStyle, this.state.toolTipPosition)} onMouseLeave={(e) => this.onToolTipLeave.call(this)} onMouseEnter={(e) => this.onToolTipHover.call(this, e)} className="toolTipWrapper">
                <div className="toolTipContainer">
                    <strong className="entityType">{data.type.toUpperCase()}</strong>
                    <div className="entityName">{data.name}</div>
                    {
                        (data.statusColor || data.color) &&
                        <div className="statusInfo">
                            {this.drawSVG("TOOLTIP", "", data.statusColor || data.color)}
                            <div className="name">{data.statusName}</div>
                        </div>
                    }
                </div>
            </div>
        )
    }

    render() {
        const { data, isClicked, style, onMouseEnter, onMouseLeave, onClose, onPathClick } = this.props;

        if (data.endpointInfo && data.endpointInfo.length > 0) {
            var innerStyle = data && { borderTopColor: data.endpointInfo[0].path.statusColor || data.endpointInfo[0].path.color || "#acacac" }
        }
        else {
            var innerStyle = data && { borderTopColor: data.statusColor || data.color || "#acacac" }
        }

        if (data)
            return (
                <div id="topologyModalWrapper" className="modalPopOver">
                    <div id="topologyModal" style={Object.assign({}, style, innerStyle)} onMouseEnter={onMouseEnter && onMouseEnter.bind(this)} onMouseLeave={onMouseLeave && onMouseLeave.bind(this)} className={this.state.isExtended ? "extended" : ""}>
                        {
                            this.renderModalHeader(data, isClicked, onClose)
                        }
                        {/* {
                            isClicked && data.equipmentInfo && this.renderModalRootElement(data.equipmentInfo)
                        } */}
                        {
                            data.associations && data.associations.length > 0 && this.renderAssociations(data.associations, onPathClick, onMouseEnter)
                        }
                        {
                            data.endpointInfo && data.endpointInfo.length > 0 && this.renderModalChildElements(data.endpointInfo, onPathClick, onMouseEnter)
                        }
                    </div>
                    <div>
                        {
                            this.state.toolTipData && this.renderToolTip(this.state.toolTipData)
                        }
                    </div>
                </div>
            )
        else
            return (<div></div>);
    }
}


export default TopologyModal