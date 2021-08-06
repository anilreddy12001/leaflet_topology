/**
 *  
 * Container: geoMapContainer.js
 *
 * @version 1.0
 * @author Neha
 *
 */

'use strict';

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { getGeoMapViewData,getGeoMapLayerViewData,updateStatusPanel,MarkerClick,updateGeoMarkers,resetGeoStore } from '../actions/geoMapAction.js';
import StatusPanel from '../components/statusPanel.jsx'
import {geoMapPathData } from '../helpers/geoMap/geoMapHelper.js';
import { showMap } from '../helpers/geoMap/geoMapHelper.js';
import Map from './mapCore.js';
import {drawMap ,parseStateDetails} from '../helpers/geoMap/geoMapHelper.js';
import {updateMarker} from '../helpers/geoMap/geoMapMarker.js';
import {cloneDeep} from 'lodash';

//Style
import style from '../../styles/geoMapComponent.css';


//Third party Dependencies
import L from 'leaflet';
import 'leaflet.markercluster';

 var mapLevel;
var level;
    var maxLevel = -1;
 let pathMap;
let mapBounds;
let baseUrl;
 
//Container Class
class GeoMapRoot extends Map {
    constructor(props) {
        super(props)
       // this.GeoMapHelperObj = new GeoMapHelper();
         this.mapLevel;
    this.maxLevel = -1;
         this.state = {
            showStatusPanel: false,
             statusPanelMat : props.options.statusPanelConfig 
             
        }
 
    }

    static get defaultProps() {
        return {
           center : [ 39.300299, -95.727541 ],
            zoom: 10,
            zoomControl : false,
           markerClickDetail: function (details) {
               var payload = {
                   type: "SURE_UI_COMPONENTS_POST_DATA",
                   payload: {
                       componentKey: "GeoMap",
                       properties: details
                   }
               }

               if (window.parent)
                   window.parent.postMessage(payload, "*")
           }
        }
    }

   componentWillUpdate(props) {
       

    } 
    
    componentDidUpdate(prevProps, prevState) {
         var parsedState = {};
       const { options } = this.props;
     var GEEOMap = this.props.geoMapData;
          if(prevProps.alarmStateData != this.props.alarmStateData){
            parsedState = parseStateDetails(this.props.alarmStateData,this.props.options.stateAttribute);
                  this.setState({ 
          statusPanelMat : parsedState 
       })
            }
        
        if(GEEOMap && (prevProps.geoMapData != this.props.geoMapData) && ((!GEEOMap.response || GEEOMap.response.length ==0) || (GEEOMap.mapObj && GEEOMap.mapObj.Empty))){
        mapLevel = mapLevel-1;
        }
        
        if(GEEOMap && GEEOMap.mapObj){
             if((!prevProps.geoMapData) || (prevProps.geoMapData && (prevProps.geoMapData != GEEOMap))){
            this.markerCluster = GEEOMap.mapObj.markerCluster;
                
            }
        } 
    } 
    
     componentWillReceiveProps(nextProp) { 
         if(nextProp.updateMarkersCluster && this.markerCluster != nextProp.updateMarkersCluster){
            this.markerCluster = nextProp.updateMarkersCluster;
            }
         var GEEOMap = nextProp.geoMapData;
       /*  if(GEEOMap && GEEOMap.mapObj){
             if((!this.props.geoMapData) || (this.props.geoMapData && (this.props.geoMapData != GEEOMap))){
            this.markerCluster = GEEOMap.mapObj.markerCluster;
                
            }
        } */
         if(nextProp && nextProp.statusPanelConfig){
            this.setState({ 
          statusPanelMat : nextProp.statusPanelConfig 
       })
        const { statusUpdateTimeStamp } = nextProp.statusPanelConfig;
        if (statusUpdateTimeStamp && statusUpdateTimeStamp != this.props.options.statusPanelConfig.statusUpdateTimeStamp) {
            let markers = updateMarker(nextProp.stateToDisplay, this.markerCluster);
            
        }  
             
         }
     }
    

    componentDidMount() {
        let tileServer = 'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png';
        baseUrl = this.props.options.iconBaseUrl;
         var GeoData = this.props.options.Geodata;
        var alarmData = this.props.options.alarmStatus;
        var customHooksData = this.props.options.customHookTraversal;
        var props = this.props.options;
         mapLevel = this.props.options.mapLevel;
       // var iconUrl = "../../images/map/";
         pathMap = this.createMap(this.refs.geoMapContainer, tileServer, this.props.zoom);
         pathMap = this.customControlGeo(pathMap, 'bottomleft', 'navigateToTopology', this.navP2p.bind(this), "navigate_To_Topology",baseUrl,"link-24x24.png");
         pathMap = this.customControlGeo(pathMap, 'bottomleft', 'expandLayers', this.levelUp.bind(this), "EXPAND_LAYERS",baseUrl,"ic_map_with_layers_24px.svg");
        pathMap = this.customControlGeo(pathMap, 'bottomleft', 'collapseLayers', this.levelDown.bind(this), "COLLAPSE_LAYERS",baseUrl,"ic_layers_separation_1_24px.svg");
         pathMap = this.customControlGeo(pathMap, 'bottomleft', 'sep1', '', "","");
        pathMap = this.customControlGeo(pathMap, 'bottomleft', 'zoomIn', this.zoomIn.bind(this), "ZOOM_IN",baseUrl,"ic_zoom_in.svg");
        pathMap = this.customControlGeo(pathMap, 'bottomleft', 'zomOut', this.zoomOut.bind(this), "ZOOM_OUT",baseUrl,"ic_zoom_out.svg");
        pathMap = this.customControlGeo(pathMap, 'bottomleft', 'Geomapviewsettings', this.openSettings.bind(this), "Settings",baseUrl,"ic_settings_24px.svg");
        pathMap.options.minZoom = 2;
        pathMap._layersMaxZoom = 10;
         var GeoData = this.props.options.Geodata;
        if(GeoData && GeoData.length!=0 ){
     var mapObj = drawMap(GeoData,mapLevel==0?true:false,undefined,mapLevel,alarmData,props,this.props);
     this.markerCluster = mapObj.markerCluster;
        }
        pathMap.setView(this.props.center, this.props.zoom);
        this.map = pathMap;   
    }

    componentWillMount() {
        var mapOptions = this.props.options.selectedEntityRow;
        var CurrentEntity = this.props.options.currentEntity;
        var GeoData = this.props.options.Geodata;
        var alarmData = this.props.options.alarmStatus;
        var customHooksData = this.props.options.customHookTraversal
        var mapLevel = this.props.options.mapLevel;
        const { getGeoMapViewData } = this.props;
        const { MarkerClick } = this.props;
               
if (GeoData && GeoData.length==0){
        // to get payload
        if(mapLevel == 0 || mapLevel == undefined){
             var payload = showMap(this.props.options.currentEntity,mapOptions,'0','List');
        }else{
            var payload = showMap(this.props.options.currentEntity,mapOptions,mapLevel,'List');
        }
        //Action Creator to retrive mapData    
      getGeoMapViewData({  
            topourl: this.props.options.domain + this.props.options.topourl,
            Alarmurl: this.props.options.metadataUrl +  this.props.options.Alarmurl,
            requestHeaders: this.props.options.requestHeaders ? this.props.options.requestHeaders : {},
            AalrmrequestHeaders : this.props.options.AalrmrequestHeaders ? this.props.options.AalrmrequestHeaders : {},
            methodGeo: this.props.options.methodGeo,
            methodAlarms: this.props.options.methodAlarms,
            geoDataUnmount : this.props.options.geoDataUnmount,
            props : this.props.options,
            props1 :  this.props,
            payload: payload
        },mapLevel);
}
    }
  
     componentWillUnmount() {
        this.props.resetGeoStore();
    }
    
    // zoom in
    zoomIn(event){
         pathMap.zoomIn();
    }
   
    
    //zoom out
     zoomOut(event){
         pathMap.zoomOut();
    }
    
    // expand layers
   levelUp(event){
    if(pathMap){
            mapBounds = pathMap.getBounds();
        }
        this.levelexpand(mapLevel + 1,(maxLevel == -1?true:false));
    
    } 
    
    levelexpand(level,fetchNew,p2p){
      level = level==-1?0:level;
        var props = this.props.options; 
        if (fetchNew) {
            var mapOptions = this.props.options.selectedEntityRow;
            var CurrentEntity = this.props.options.currentEntity;
            const { getGeoMapLayerViewData } = this.props;
        // to get payload
         var payload = showMap(CurrentEntity,mapOptions,level,'List');
             mapLevel = level;
        //Action Creator to retrive Layer mapData
        getGeoMapLayerViewData({  
            topourl: this.props.options.domain + this.props.options.topourl,
            requestHeaders: this.props.options.requestHeaders ? this.props.options.requestHeaders : {},
            methodGeo: this.props.options.methodGeo,
            props : this.props.options,
            props1 :  this.props,
            payload: payload
        },mapLevel);
        }else if(maxLevel>=level || p2p){
            var geomapObj = drawMap(geoMapPathData[level],props,this.props);
            
            this.markerCluster = geomapObj.markerCluster;
             mapLevel = mapLevel + 1;
        }else{
            // alert ("no layers to expand");
        	//commonService.showToast($scope.translateData.NO_EXPAND);	
        }
  } 
    
    // collapse layer
    
     levelDown(event){
        if(pathMap){
            mapBounds = pathMap.getBounds();
        }
        this.levlDown();
     }
    
    levlDown() {
        var props = this.props.options;
        const {updateGeoMarkers} = this.props;
        if (mapLevel > 0) {
            mapLevel = mapLevel - 1;
            var x =geoMapPathData;
            if(geoMapPathData.hasOwnProperty(mapLevel)){
             var mapGeoObj = drawMap(geoMapPathData[mapLevel],undefined,undefined,mapLevel,undefined,props,this.props);
            updateGeoMarkers(mapGeoObj.markerCluster);
            //this.markerCluster = mapGeoObj.markerCluster;
            }else{
            this.levelexpand(mapLevel,true,true);
            }
        }else {
            this.notify("no layers to collapse");
        }
    }
    
        //Map toggling
        navP2p(event) {            
            this.props.options.openP2PMap(mapLevel, this.props.options.selectedEntityRow.UUID);
        }
    notify(msg) {
        toast(msg, {
            className: 'darker-toast',
            progressClassName: 'transparent-progress'
        });
    }
    
    openSettings(event) {

        if (this.props.options.statusPanelConfig) {
            let elemetBounds = event.target.getBoundingClientRect();
            document.getElementById("clusterDist").style.display = "none";
            let style = Object.assign({}, this.props.options.statusPanelConfig.style, {
                left: elemetBounds.x + elemetBounds.width + 3 + "px",
                bottom: "0px",
                marginBottom: "10px"
            })

            this.setState({
                showStatusPanel: !this.state.showStatusPanel,
                style: style
            })
        }

    };

    render() {
        return (
            <div id="geoMap" className={"geoMap size_" + this.state.statusPanelMat.size.toLowerCase() + (this.state.statusPanelMat.displayLabel ? " showText" : "")} >
               <div className="statusPanelWrapper">
                    <StatusPanel {...this.state.statusPanelMat}
                        show={this.state.showStatusPanel}
                        onChange={this.props.updateStatusPanel.bind(this)}
                        style={this.state.style} />
                </div>

 <div ref="geoMapContainer" id="geoMapContainer" style={this.props.options.style}>
     </div>
            </div>
            
        )
    }
}

function mapStateToProps(state) {
    return {
        geoMapData: state.geoMap.geoMapData,
        alarmStateData: state.geoMap.alarmStateData,
        statusPanelConfig : state.geoMap.statusPanel,
        stateToDisplay : state.geoMap.stateToDisplay,
        markerClickDetail : state.geoMap.markerClickDetail,
        updateMarkersCluster : state.geoMap.updateMarkersCluster
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getGeoMapViewData: getGeoMapViewData,
        getGeoMapLayerViewData : getGeoMapLayerViewData,
        updateStatusPanel: updateStatusPanel,
        MarkerClick : MarkerClick,
        updateGeoMarkers : updateGeoMarkers,
        resetGeoStore : resetGeoStore
    }, dispatch);
}

//export default connect(mapStateToProps, mapDispatchToProps)(GeoMapRoot);
export default connect(mapStateToProps,mapDispatchToProps)(GeoMapRoot);
        export {pathMap,mapBounds,baseUrl};

       
       
        



