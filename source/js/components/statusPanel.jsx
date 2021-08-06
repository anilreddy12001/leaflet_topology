/** 
 *  
 * Component : statusPanel.js
 *
 * @version 1.0
 * @author Gowtham.S
 * @ignore
 */

/**
* @class StatusPanel
* @memberof SUREUI.components
*
* @property {array}   [data=[ ]]       Predefined data for a component. It should be an array of object.
* @property {string}  data.id          Unique ID for a marker.
* @property {string}  data.latitude    Latitude of the location where marker need to display. 
* @property {string}  data.longitude   Longitude of the location where marker need to display. 
* @property {string}  data.name        Name of the location where marker need to display. 
* @property {object}  [data.state]     Status object. It can contain multiple state. Pass in each state as a property of an object. <pre><code>{"AlarmState" : ["MAJOR", "MINOR", "WARNING", "CRITICAL"]}</code></pre>
* @property {object}  [data.detail]    Reserved object to store additional information. * 
* @property {string}  tileServer    Tile Server url for map tiles.
* @property {object}  [dataSource]      Configuartion for SURE UI data model.
* @property {string}  [dataSource.method = GET] Http method for SURE REST API.
* @property {string}  dataSource.url  URL for SURE REST API.
* @property {object}  [dataSource.headers] Additional headers which usually includes metadata and authorization info.
* @property {object}  [markers]        Marker icon configuration
* @property {boolean} [markers.displayLabel = true ] Enable/Disable marker text.
* @property {object}  [markers.stateToDisplay] Status to display in a marker. It can contain multiple state. Pass in each state as a property of an object. <pre><code>{"AlarmState" : ["MAJOR", "MINOR", "WARNING", "CRITICAL"]}</code></pre>
* @property {object}  [style]         To override default styles. It should be an object. Pass in any styles you'd like and they will be applied inline on the input.
*
* @example <caption>consuming as a Library</caption>
*
* HTML
*  <div id="StatusPanel"></div>
*
* JS
*  
*  
*  var StatusPanel = SUREUI.components.StatusPanel;
*
*  let dataSource = {
*  method: "GET",
*  url: "http://135.250.139.104:8081/oss/sure/locations?limit=100&expand=Equipment.State&q=SELECT;[SureName,Longitude,Latitude,UUID,Equipment]"
*  headers : {
*      Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
*      tenantId: 'GlobalTenant',
*      ugId: 'Admin_UserGroup',
*      appId: 'SURE_APP',
*      Accept: 'application/json',
*      TransformationEnabled: true,
*      'Content-Type': 'application/json',
*      'Response-Type': 'flat'
*      }
*  };
* 
*  var props = {
*      dataSource : dataSource,
*      tileServer : "http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png"
*  }
* 
*  var statusPanelComponent = React.createElement(statusPanel, prop);
*  ReactDOM.render(statusPanelComponent, document.getElementById("StatusPanel"));
* 
* 
*/

import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import '../../styles/statusPanel.css'
import { ToggleSwitch, RadioButton,Slider } from "@nokia-csf-uxr/csfWidgets";
//Add Provider to the root
class StatusPanel extends Component {

    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.state ={
            showCluster: true
        }
    }

    static get defaultProps() {
        return {
            statusUpdateTimeStamp: Date.now()
        }
    }

    statusChange(index, groupIndex, newValue) {
        let statusGroups = JSON.parse(JSON.stringify(this.props.status));
        let statusGroup = statusGroups[groupIndex];
        let status = statusGroup.items.filter((item) => item.text == statusGroup.value)

        if (status.length > 0)
            status[0].values[index].enabled = newValue;

        let statusPanel = Object.assign({}, this.props, { status: statusGroups }, { statusUpdateTimeStamp: Date.now() })
        this.props.onChange(statusPanel)


    }

    statusGroupChange(index, newValue) {
        let statusGroups = JSON.parse(JSON.stringify(this.props.status));
        statusGroups[index].value = newValue;

        let statusPanel = Object.assign({}, this.props, { status: statusGroups }, { statusUpdateTimeStamp: Date.now() })
        this.props.onChange(statusPanel)
    }

    selectGroup(value) {
        let statusPanel = Object.assign({}, this.props, { groupToShow: value })
        this.props.onChange(statusPanel)
    }

    labelChange(displayLabel) {
        let statusPanel = Object.assign({}, this.props, { displayLabel: displayLabel })
        this.props.onChange(statusPanel)
    }
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        if(value<80){
        var cluster_msg = document.getElementById("clustermsg"); 
        document.getElementById("clustermsg").style.display="block";
        cluster_msg.innerHTML ="Value >= 80"; 
        document.getElementById("statusId").style.display = "block";
                    }else{
        document.getElementById("clustermsg").style.display="none";
        let statusPanel = Object.assign({}, this.props, {[name]:value })
        this.props.onChange(statusPanel);
        document.getElementById("statusId").style.display = "none";
                     }
    }
   
    sizeChange(size) {
        let statusPanel = Object.assign({}, this.props, { size: size })
        this.props.onChange(statusPanel)
    }

    renderSize(sizeFromProp) {
        return (
            ['S', 'M', 'L', 'XL'].map((size, i) =>
                <div  key={i} className="col-xs-3 colPadding" >
                    <RadioButton className="col-xs-3 colPadding" id={"rb" + size} onChange={() => { this.sizeChange(size) }} value={size} label={size} checked={sizeFromProp == size}/>
                </div>
            )
        )
    }

    renderStatus(statusFromProp, groupIndex) {
            
            if(statusFromProp.values && Array.isArray(statusFromProp.values)){
                
        return (
            <div className="row paddingBottom status">
                {statusFromProp.values.map((value, index) =>
                    [<div key={"header" + value.text + index} className="col-xs-6 statusPadding" >
                        <img className="statusIcon" src={value.icon} />
                        <span className="statusName">{value.text}</span>
                    </div>,
                    <div key={value.text + index} className="col-xs-6 statusPadding" >
                        <ToggleSwitch className="pull-right" labelPosition="left" id={"ts" + value.text} checked={value.enabled} onChange={() => this.statusChange(index, groupIndex, !value.enabled)} />
                    </div>]
                )}
            </div>
        )
        }
    }

    renderStatusGroup(statusGroupsFromProp, groupToShow) {
        
        return (
            statusGroupsFromProp.map((statusGroup, groupIndex) =>
                [<div
                    key={"header" + statusGroup.text + groupIndex}
                    className={"row statusGroupHeader " + (groupToShow != statusGroup.text ? "collapsed" : "")}
                    onClick={() => this.selectGroup(statusGroup.text)}>
                    <div className="colPadding statusHeader">{statusGroup.text}</div>
                </div>,
                <div key={groupIndex} className="row statusGroup">
                    <div className="col-xs-12 colPadding" >{
                        statusGroup.items.map((status, index) =>
                            <div key={status.text + index} className={statusGroup.value == status.text && status.values && status.values.length > 0 ? "selected" : ""}>
                                <RadioButton id={"rb" + groupIndex + status.text} checked={statusGroup.value == status.text} onChange={() => this.statusGroupChange(groupIndex, status.text)} label={status.label} />
                                {this.renderStatus(status, groupIndex)}
                            </div>
                        )
                    }</div>
                </div>]
            )
        )
    }

    render() {
        return (
            <div id="statusId" className={"statusPanel " + (this.props.show ? "show" : "")} style={this.props.style}>
                <div className="row paddingBottom divider">
                    <div className="col-xs-6 colPadding" >Labels</div>
                    <div className="col-xs-6 colPadding" >
                        <ToggleSwitch className="pull-right" onChange={() => this.labelChange(!this.props.displayLabel)} id="tslabel" checked={this.props.displayLabel} />
                    </div>
                </div>
                <div className="row ">
                    <div className="colPadding">Marker Size</div>
                </div>
                <div className="row">
                    {this.renderSize(this.props.size)}
                </div>
                <div id="clusterDist" style={{ display: this.state.showCluster ? "block" : "none" }} className="row paddingBottom divider">
                    <div className="col-xs-6 colPadding">Cluster Distance<br /><p id="clustermsg" className="clustermsg-class" ></p></div>
                    <div className="col-xs-6 colPadding">
                        <input id="inputCluster" type="Number" placeholder="Enter Cluster Distance" 
                            name="clusterRadius"
                            defaultValue={this.props.clusterRadius}
                            className="form-control"
                            onBlur={this.handleInputChange} />
                    </div>
                                     
                </div>
                <div id="statusGroupContainer">
                    {this.renderStatusGroup(this.props.status, this.props.groupToShow)}
                </div>
            </div>
        )
    }
}

export default StatusPanel

