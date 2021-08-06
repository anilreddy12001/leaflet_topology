/**
 *  
 * Container: equipmentMapContainer.js
 *
 * @version 1.0
 * @author Gowtham.S
 *
 */

'use strict';

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getEquipmentMapData, updateStatusPanel, showTreeViewData, resetStore } from '../actions/equipmentMapAction.js'
import StatusPanel from '../components/statusPanel.jsx'
import Map from './mapCore.js';
import { TreeView } from '../sureUIComponents.js';
import axios from 'axios';
import equipmentMapHelper from '../helpers/equipmentHelper';
import { ProgressBarIndeterminate } from '@nokia-csf-uxr/csfWidgets';
//Style
import style from '../../styles/equipmentMap.css';

//Third party Dependencies
import L from 'leaflet';
import 'leaflet.markercluster';


/**
 * 
 * @class EquipmentMapRoot
 * @extends {Map}
 * @description Container Class
 * @memberof sureUI.components
 */

class EquipmentMapRoot extends Map {
    constructor(props) {
        super(props);

        //Component initialization
        this.state = {
            showStatusPanel: false,
            showTreeView: false,
            continueFlag: 0,
            searchLoad: false
        }
        this.isExpanded = false;
        this.eMHelperObj = new equipmentMapHelper(props);
        this.plotMarker = this.plotMarker.bind(this);
        this.constructContextMenuForMarkers = this.constructContextMenuForMarkers.bind(this);
    }

    static get defaultProps() {
        return {
            center: [59.938043, 30.337157],
            data: [],
            maxZoom: 22,
            zoom: 5,
            minZoom: 0,
            markers: {
                displayLabel: true,
                size: "small"
            },
            progress: 0,
            onMarkerClick: function (details) {
                var payload = {
                    type: "SURE_UI_COMPONENTS_POST_DATA",
                    payload: {
                        componentKey: "EquipmentMap",
                        properties: details
                    }
                }
                if (window.parent)
                    window.parent.postMessage(payload, "*")
            },
            style: {
                height: window.innerHeight,
                width: window.innerWidth
            },
            stateToDisplay: {}
        }
    }

    componentWillMount() { 
        const {  dataSource } = this.props;
        dataSource.headers["Response-Type"] = "flat"
        dataSource.headers["TransformationEnabled"] = true;
        //Loop the below query to get icons mentioned in the specifications.\
        console.log(this.props);
        var domain = dataSource.url.split('/oss')[0];
        var specheaders=dataSource.headers;
        specheaders.TransformationEnabled=true;
        //make a call to get file list:
        var fileNameList=[];
        //console.log(tMHelperObj);
        axios({
            method: "GET",
            //url: 'https://135.250.139.91:28443/osscm/commons/catalog/specifications?q=specName;EQUALS;EntityAttribute&q=subType;EQUALS;English',
            url: domain+'/osscm/commons/catalog/specifications?q=specName;EQUALS;EntityAttribute&q=subType;EQUALS;English',
            headers: specheaders

        }).then((res)=> {

if(res.data.entityAttributes && res.data.entityAttributes.customGUI_Icons && res.data.entityAttributes.customGUI_Icons.defaultAttribute){
    console.log(res.data.entityAttributes.customGUI_Icons.defaultAttribute);
    res.data.entityAttributes.customGUI_Icons.defaultAttribute.forEach(function(item){

        fileNameList.push({combo:item.entityAttribute, fileName: item.visibleColumn});
    
    })
}
else{

}


 //get svg file contents of each file:
 var iconsFromDocker={};
 iconsFromDocker.customGUI_combinations=this.props.customGUI_combinations.split('__');//['Label','Type','SubType','Vendor'];
 var promises=[];
 var customGUI_iconPath=this.props.customGUI_iconPath;
 console.log(customGUI_iconPath);
 console.log(this.props.customGUI_combinations);

 fileNameList.forEach(function (singleElement) {

   let myUrl = domain+'/sure-ui/properties?fileName=fetchSVGFile&subName='+customGUI_iconPath+''+singleElement.fileName;
  promises.push(axios.get(myUrl))
 })


 axios.all(promises).then(results => {
    results.forEach((res, index) =>{
        //mainObject[response.identifier] = response.value;
        if(res.data==''){
            console.log("blank response..");
            
        }
        else{
            iconsFromDocker[fileNameList[index].combo]=res.data.replace("<svg","<svg ").replace(" width=","").replace(" height=","");
            
        }
    })
    
    //console.log(iconsFromDocker);
    if(JSON.stringify(iconsFromDocker)!='{}'){
        this.eMHelperObj.setEqLocationIcon(iconsFromDocker);
    }
    
}).catch(error =>{
    console.log(error);
    //this.tMHelperObj.setEqIcon(iconList);
    
    })
      
    

    })
}

    componentDidMount() {
        const { getEquipmentMapData, dataSource, data } = this.props;
        let _self= this;
        let map = this.createMap(this.refs.equipmentMap, this.props.tileServer, this.props.maxZoom, this.clearSelection.bind(this), 15, this.props.minZoom);
        map = this.customControl(map, 'bottomleft', 'mapviewsettings', this.openSettings.bind(this), "Settings");
        map = this.customControl(map, 'topright', 'mapviewfullscreen', this.toggleMapView.bind(this), "Toggle Screen View");
        map.zoomControl.setPosition('bottomleft');
        map = this.customControl(map, 'bottomleft', 'treeviewsettings', this.openTreeView.bind(this), "TreeView");
        map.createPane("customOverlay");
        map.setView(this.props.center, this.props.zoom);
        map.on("load", (e) => { this.eMHelperObj.onLoad(document.querySelector("#equipmentMap .leaflet-customOverlay-pane")) });
        map.on('moveend', (e) => {
            if (this.state.searchLoad!=true && this.state.showTreeView!=true) {
                this.markerGroup && this.markerGroup.clearLayers();
                this.eMHelperObj.markers && this.eMHelperObj.markers.clearLayers();    
                this.setState({ progress: 0 });
                let cToken = axios.CancelToken.source();
                this.eMHelperObj.onMoveEnd(document.querySelector("#equipmentMap"));
                this.setState({ isNewData: true });
                let _source = this.state.source;
                _source && _source.cancel('API ABORTED');
                this.setState({ source: cToken });
                getEquipmentMapData(dataSource, map.getBounds(), cToken);
            }
        });

        var constructContextMenuForMarkersOnload = function constructContextMenuForMarkers(itemID, type, props) {
            var contextmenuitems = [];
            var entityType = topologyMapHelper.directory[itemID].type;

            if (props.customHookData) {
                for (var i = 0; i < props.customHookData.length; i++) {
                    props.customHookData[i].entityType = entityType;
                    if (props.customHookData[i].DisplayName) {
                        contextmenuitems.push({ text: props.customHookData[i].DisplayName, callback: showCustomHook.bind(event, props.customHookData[i]) });
                    }
                    else {
                        contextmenuitems.push({ text: props.customHookData[i].SureName, callback: showCustomHook.bind(event, props.customHookData[i]) });
                    }
                }
            }
            // console.log("constructContextMenuForMarkersOnload for geomap/p2p..");
            return ({
                contextmenu: true,
                contextmenuItems: contextmenuitems
            });

            //show custom hooks:
            function showCustomHook(e, params) {
                //for geomap/p2pmap
                //e.relatedTarget.options.contextmenuItems[0].customHookUR
                //console.log(props.customHookData.CustomHook_URL); 
                //var urlWithSort=props.dataSource.domain+'/oss/sure/items?q=Type;EQUALS;CUSTOM_HOOK&q=EntityType;EQUALS;'+props.dataSource.payload[0].request.origin["@class"]+'&q=SubType;EQUALS;COMPONENT';

                if (!props.dataSource.domain) {
                    props.dataSource.domain = props.dataSource.url.split('/oss')[0];

                }
                var selectedEntityUUID = params.relatedTarget.options.id;
                var entityType = e.entityType;
                // var urlForCustomHooks=props.dataSource.domain+'/oss/sure/items?q=Type;EQUALS;CUSTOM_HOOK&q=EntityType;EQUALS;Equipment&q=SubType;EQUALS;COMPONENT';
                var urlForCustomHooks = props.dataSource.domain + '/oss/sure/graphSearch?limit=100&page=1';
                var payloadForCustomHook = { "request": {}, "response": { "responseType": "List", "entity": ["FCP", "Endpoint"], "selfJoin": "true", "responseFilter": [{ "for": "Equipment", "filter": ["UUID;NOT EQUAL;47ffef93-779f-476d-a229-6473cc89f842"] }] }, "expand": ["Capacity", "State"], "searchFilter": [{ "for": "Equipment", "filter": ["UUID;EQUALS;47ffef93-779f-476d-a229-6473cc89f842"] }] };

                payloadForCustomHook.response.responseFilter[0].for = entityType;
                payloadForCustomHook.response.responseFilter[0].filter[0] = "UUID;NOT EQUAL;" + selectedEntityUUID;
                payloadForCustomHook.searchFilter[0].for = entityType;
                payloadForCustomHook.searchFilter[0].filter[0] = "UUID;EQUALS;" + selectedEntityUUID;

                //https://135.250.139.91:28443/oss/sure/graphSearch?limit=100&page=1
                //get data to be fed to customhook:
                return axios({
                    method: "POST",
                    url: urlForCustomHooks,
                    headers: props.dataSource.headers,
                    data: payloadForCustomHook
                }).then(
                    (function (response) {
                        var lastRow = -1;
                        var dataRow = response.data.element;
                        var objRowdataNew = [];

                        if (dataRow) {
                            dataRow.map(function (value, key) {
                                var item = value;
                                this.push(item);
                            }, objRowdataNew);
                        }
                        else {
                            objRowdataNew = [];
                        }


                        if (objRowdataNew.length < 100) {
                            lastRow = params.startRow + objRowdataNew.length;
                        }

                        //params.successCallback(objRowdataNew, lastRow);
                        //reloadCount && gridData.dataCount(params.startRow + objRowdata.length);
                        /* if (objRowdata.length < 100) {
                           lastRow = params.startRow + objRowdata.length;
                         }
                         params.successCallback(objRowdata, lastRow);*/
                        //
                        //to show in a new window:


                        if (e.DisplayAs.toLowerCase() == 'window') {
                            //window.open(props.customHookData.CustomHook_URL+'/?UUID='+e.relatedTarget.options.UUID);


                            var strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
                            var contentWindow = window.open(e.CustomHookURL);//+ "?launchedBy=SURE"
                            /*var self = this;
                            var dataToPost = {
                                type: "ACCESS_CUSTOM_HOOK",
                                payload: {
                                    userName: this.userName,
                                    product: this.DisplayName.replace("CH:",""),
                                    dataSource: this.dataSource,
                                    data: rowData
                                }
                            };*/


                            //async function to provied delay for postmessage
                            /*setTimeout(function() {
                                    contentWindow.postMessage(dataToPost,self.CustomHookURL)
                                }, 10); */

                        }
                        else if (e.DisplayAs.toLowerCase() == 'popup') {
                            var rowData, columnData = [];
                            var columnData = [{ field: 'DisplayName', displayName: 'Display Name' }, { field: 'SureName', displayName: 'Name' }, { field: '@class', displayName: 'Type' }, { field: 'SubType', displayName: 'Sub Type' }, { field: 'UUID', displayName: 'UUID' }];
                            if (!rowData || rowData == '') {

                                /* var rowData=[{test: 'test1',test1: 'test1'}, {test: 'test1',test1: 'test1'},{test: 'test1',test1: 'test1'}];
                                 columnData=[{field: 'test',displayName: 'test'},{field: 'test1',displayName: 'test1'}];
                                 var DisplayName='test user1';*/
                            }
                            var modalWindow = SUREUI.components.ModalWindow;
                            if (e.titleBgColor) { var titleBgColor = e.titleBgColor; } else { var titleBgColor = '#3f51b5'; } //Setting default bg color for custom hook's header.
                            var prop = {
                                customHookObject: e,
                                height: 1000,
                                width: 1000,
                                headerColor: titleBgColor,
                                id: "modalWindowContainer",
                                header: true,
                                title: e.DisplayName,
                                iconBaseURL: "SURE_UI_Components/",
                                iframeSource: e.CustomHookURL,
                                iframeDataSource: props.dataSource,
                                userName: e.CreatedBy,
                                data: rowData,
                                rowData: objRowdataNew,
                                columnData: columnData,
                                onClose: function () {
                                    ReactDOM.unmountComponentAtNode(document.getElementById("modalWindow"));
                                }
                            }
                            var modalWindowComponent = React.createElement(modalWindow, prop);
                            ReactDOM.render(modalWindowComponent, document.getElementById("modalWindow"));
                        }
                        //axios to get fcp/endpoints of selected entity:
                    })
                );
            }
        }
        this.map = map;

        if (data.length > 0 && !equipmentMapHelper.directory) {
            equipmentMapHelper.directory = data.reduce(function (total, currentValue, i) {
                total[currentValue.id] = currentValue
                return total
            }, {});

            let firstEleemnt = data[0];
            const { stateToDisplay, onMarkerClick, fetchLocEquip } = this.props;
            // console.log(this.props);
            var props = this.props;
            // console.log(this.props.treeViewData);
            this.markerClusters = this.eMHelperObj.getMarkers(equipmentMapHelper.directory, stateToDisplay, onMarkerClick, props, constructContextMenuForMarkersOnload);
            this.map.addLayer(this.markerClusters);
            this.map.setView([firstEleemnt.latitude, firstEleemnt.longitude], 10);
        }

        let cToken = axios.CancelToken.source();
        let _source = this.state.source;
        _source && _source.cancel('API ABORTED');
        this.setState({ source: cToken });
        dataSource.searchPayload && this.setState({ searchLoad: true });
        getEquipmentMapData(dataSource, this.map.getBounds(), cToken);

        // MATCH (n:Location) where n.Latitude>=22.524627220545295 and n.Longitude>=90.60974121 and n.Latitude<=22.7001879 and n.Longitude<=92.4636 RETURN count(*) as count

        // let q = `Latitude;LESS%20OR%20EQUAL;${NE.lat}&q=Longitude;LESS%20OR%20EQUAL;${NE.lng}&q=Latitude;GREATER%20OR%20EQUAL;${SW.lat}&q=Longitude;GREATER%20OR%20EQUAL;${SW.lng}`;
        /* TEST DATA:
         NE.lat:  10.009847413486593 NE.lng:  10.014209747314455 
         SW.lat:  9.990321744626526 SW.lng:  9.985241889953615
         */
    }
    plotMarker(nextProp, directory) {
        const { stateToDisplay, onMarkerClick } = nextProp;
        var props = nextProp;
        var constructContextMenuForMarkers = this.constructContextMenuForMarkers;
        this.markerClusters = this.eMHelperObj.getMarkers(directory, stateToDisplay, onMarkerClick, props, constructContextMenuForMarkers);
        this.map.addLayer(this.markerClusters);
        //concat with existing value
        equipmentMapHelper.directory = Object.assign(equipmentMapHelper.directory, directory);

    }
    constructContextMenuForMarkers(itemID, type, props, directory) {
        var contextmenuitems = [];
        console.log(props.customHookData);
        var entityType = 'Location' //directory[itemID].type;
        console.log("itemID:: " + itemID + ":type:: " + entityType);
        if (props.customHookData) {
            for (var i = 0; i < props.customHookData.length; i++) {
                props.customHookData[i].entityType = entityType;
                if (props.customHookData[i].EntitiesKeys && props.customHookData[i].EntitiesKeys.indexOf(itemID) != -1 && entityType == props.customHookData[i].EntityType) {
                    if (props.customHookData[i].DisplayName) {
                        contextmenuitems.push({
                            text: props.customHookData[i].DisplayName,
                            callback: showCustomHook.bind(event, props.customHookData[i])
                        });
                    } else {
                        contextmenuitems.push({
                            text: props.customHookData[i].SureName,
                            callback: showCustomHook.bind(event, props.customHookData[i])
                        });
                    }
                } else if (!props.customHookData[i].EntitiesKeys && (entityType == props.customHookData[i].EntityType)) {
                    if (props.customHookData[i].DisplayName) {
                        contextmenuitems.push({
                            text: props.customHookData[i].DisplayName,
                            callback: showCustomHook.bind(event, props.customHookData[i])
                        });
                    } else {
                        contextmenuitems.push({
                            text: props.customHookData[i].SureName,
                            callback: showCustomHook.bind(event, props.customHookData[i])
                        });
                    }
                }
            }
        }
        // console.log("constructContextMenuForMarkersWillreceiveprops for geomap/p2p..");
        return ({
            contextmenu: true,
            contextmenuItems: contextmenuitems
        });
    }

    drawSVGIcon(markerData) {
        const { markerCount } = markerData;
        return `<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="mapviewclustersvg" viewBox="-3 -3 6 6" width="6" height="6" style="transform: rotate(-90deg);">
                    <g>
                        <rect id="mapviewclusterrect" x="-2.75" y="-2.75" rx="0.25" ry="0.25" height="5.5" width="6.5"></rect>
                        <text id="mapviewclustertext" x="0" y="0" font-size="1" text-anchor="middle">Site count </text>
                        <text id="mapviewclustertext" x="0" y="2" font-size="2.5" text-anchor="middle"> ${markerCount}</text>
                    </g>
                </svg>`
    }

    componentWillReceiveProps(nextProp) {
        const { data, progress, markerCount } = nextProp;
        const { statusUpdateTimeStamp } = nextProp.statusPanel;
        let { viewPoint } = nextProp;
        if (statusUpdateTimeStamp && statusUpdateTimeStamp != this.props.statusPanel.statusUpdateTimeStamp) {
            let markers = this.eMHelperObj.updateMarkers(equipmentMapHelper.directory, nextProp.stateToDisplay, this.markerClusters)
        }
        if (nextProp.statusPanel.clusterRadius && (this.eMHelperObj.markers.options.maxClusterRadius != nextProp.statusPanel.clusterRadius)) {
            this.eMHelperObj.markers.options.maxClusterRadius = nextProp.statusPanel.clusterRadius;
            this.eMHelperObj.markers.clearLayers();
            this.plotMarker(nextProp, equipmentMapHelper.directory);
        }
        this.setState({ progress: progress });
        if (typeof (markerCount) != "undefined" && markerCount > 2000 && viewPoint != null) {
            // var x= this.map.getBounds().getCenter();// getting lat and lng of map center
            this.markerGroup && this.markerGroup.clearLayers();
            this.eMHelperObj.markers && this.eMHelperObj.markers.clearLayers();
            var x = {
                lat: viewPoint.lat,
                lng: viewPoint.lng
            } // adding marker to any one if lat & lng from Data;
            var markerGroup = L.layerGroup().addTo(this.map);

            var icon1 = L.divIcon({
                className: 'marker-count ',
                iconSize: null,
                html: `<div class="icon" style="marker-count"> Count : ${markerCount} </div>`
            });
            let icon = new L.DivIcon({
                className: '',
                html: `${this.drawSVGIcon({ markerCount })}`,
                iconSize: [48, 48]
            })

            this.markerGroup = markerGroup;
            var marker = L.marker([x.lat, x.lng], { title: 'Total count', opacity: 0.9, draggable: true, icon: icon })
                .addTo(markerGroup);
        }
        else if (nextProp.data.length !== this.props.data.length) {
            equipmentMapHelper.directory = (this.state.isNewData && {}) || equipmentMapHelper.directory || {}
            if (data.length > 0 && !equipmentMapHelper.directory[data[0].id] && Object.keys(equipmentMapHelper.directory).length == 0) {
                this.markerGroup && this.markerGroup.clearLayers();
                this.eMHelperObj.markers && this.eMHelperObj.markers.clearLayers();

                let directory = data.reduce(function (total, currentValue, i) {
                    total[currentValue.id] = currentValue
                    return total
                }, {});
                this.plotMarker(nextProp, directory);
                this.setState({ isNewData: false });
            }
            else {
                let _data = data.slice(this.state.continueFlag)
                let directory = _data.reduce(function (total, currentValue, i) {
                    total[currentValue.id] = currentValue
                    return total
                }, {});
                this.plotMarker(nextProp, directory);
            }
            this.setState({ continueFlag: data.length });

            if (data.length > 0 && this.state.searchLoad)
                this.map.setView([data[0].latitude, data[0].longitude], 6);
        }
    }

    componentWillUnmount() {
        equipmentMapHelper.directory = undefined
        this.markerClusters && this.map.removeLayer(this.markerClusters);
        this.props.resetStore();
        let _source = this.state.source;
        _source && _source.cancel('API ABORTED');
    }

    toggleMapView(event) {
        this.isExpanded = !this.isExpanded;
        let mapElement = document.querySelector("#equipmentMap");
        this.isExpanded ? mapElement.classList.add("expanded") : mapElement.classList.remove("expanded")
        this.props.toggleFullScreen(this.isExpanded, this.map)
    }

    openSettings(event) {
        if (this.props.statusPanel) {
            let elemetBounds = event.target.getBoundingClientRect();

            let style = Object.assign({}, this.props.statusPanel.style, {
                left: elemetBounds.left + elemetBounds.width + 3 + "px",
                bottom: "0px",
                marginBottom: "10px"
            })

            this.setState({
                showStatusPanel: !this.state.showStatusPanel,
                showTreeView: false,
                style: style
            })
        }

    };


    openTreeView(event) {
        var elemetBounds = event.target.getBoundingClientRect();

        var style = Object.assign({}, this.props.treeViewData.style, {
            left: elemetBounds.left + elemetBounds.width + 3 + "px",
            bottom: "0px",
            marginBottom: "10px"
        })

        this.setState({
            showTreeView: !this.state.showTreeView,
            showStatusPanel: false,
            style: style
        })

        var treeViewComponent = React.createElement(TreeView, this.props.treeViewData);
        ReactDOM.render(treeViewComponent, document.getElementById("treeViewId"));
    };

    clearSelection() {

        if (this.state.showStatusPanel)
            this.setState({
                showStatusPanel: false
            })
        if (this.state.showTreeView)
            this.setState({
                showTreeView: false
            })


        var selectedElement = document.getElementById("equipmentMap").querySelectorAll(".selected");
        if (selectedElement[0]) {
            if (this.props.onMapClick)
                this.props.onMapClick();
            selectedElement[0].classList.remove("selected");
        }

    }

    getTreeViewData(locationListData, state, markerClick) {
        console.log(this);
        this.markerClusters && this.map.removeLayer(this.markerClusters);
        equipmentMapHelper.directory = {};
        this.eMHelperObj = new equipmentMapHelper(this.props);
        this.markerClusters = this.eMHelperObj.getMarkers(locationListData, state, markerClick);
        this.map.addLayer(this.markerClusters);
        let lMarkers = this.markerClusters.getLayers();
        equipmentMapHelper.directory = Object.assign(equipmentMapHelper.directory, locationListData)
        var group = new L.featureGroup(lMarkers);
        if (lMarkers.length > 0) {
            this.map.fitBounds(group.getBounds());
        }
        //   if (Object.values(locationListData).indexOf('detail') == -1)
        //   this.map.setView([Object.values(locationListData)[0].detail.Latitude, Object.values(locationListData)[0].detail.Longitude], 15);

    }

    render() {
       
        let progressStyles = {
            width: this.state.progress + "%"
        }
        if (this.state.showTreeView) {
            return (
                <div id="equipmentMapContainer" className={"equipmentMapContainer size_" + this.props.statusPanel.size.toLowerCase() + (this.props.statusPanel.displayLabel ? " showText" : "")} >
                    <div className="treeViewWrapper" style={{ width: "300px", position: "absolute", "background-color": "#FFFFFF", bottom: "118px", left: "40px", "z-index": " 999" }}>
                        <TreeView  {...this.props.treeViewData} show={this.props.treeViewData.showTreeView}
                            getTreeViewData={this.getTreeViewData.bind(this)}
                            style={this.state.style} />
                    </div>
                    {this.state.progress < 100 && (
                              <ProgressBarIndeterminate id="progress-bar-indeterminate-1" />
                    )}
                    <div ref="equipmentMap" id="equipmentMap" style={this.props.style}></div>
                </div>
            )
        } else {
            return (
                <div id="equipmentMapContainer" className={"equipmentMapContainer size_" + this.props.statusPanel.size.toLowerCase() + (this.props.statusPanel.displayLabel ? " showText" : "")} >
                    <div className="statusPanelWrapper" style={{ height: this.props.style.height, position: "absolute" }}>
                        <StatusPanel {...this.props.statusPanel}
                            show={this.state.showStatusPanel}
                            onChange={this.props.updateStatusPanel.bind(this)}
                            clusterRadius={this.eMHelperObj.markers.options.maxClusterRadius}
                            style={this.state.style} />
                    </div>
                    {this.state.progress < 100 && (
                              <ProgressBarIndeterminate id="progress-bar-indeterminate-1" />
                    )}
                    <div ref="equipmentMap" id="equipmentMap" style={this.props.style}></div>
                </div>
            )
        }
    }
}

function mapStateToProps(state) {
    return state.equipmentMap
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getEquipmentMapData: getEquipmentMapData,
        updateStatusPanel: updateStatusPanel,
        showTreeViewData: showTreeViewData,
        resetStore: resetStore,

    }, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(EquipmentMapRoot);