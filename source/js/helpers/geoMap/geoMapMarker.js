/**
 *  
 * Helper: geoMapMarker.js
 * @Creating Markers and Path on Geo Map
 * @version 1.0
 * @author Neha
 *
 **/

import {pathMap} from '../../containers/geoMapContainer.js';
import {MarkerClick } from '../../actions/geoMapAction.js';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import '../leaflet-canvasicon.js';
import 'leaflet-contextmenu';
import 'leaflet-contextmenu/dist/leaflet.contextmenu.css';
import '../leaflet-piechart.js';
import 'leaflet-curve';
import {cloneDeep} from 'lodash';
//Style
import style from '../../../styles/geoMapComponent.css';

var mapLayers = null;
export const createGeoMarker = (data, pathMap, tile, configObj,props,props1) => {
    var props = props;
    var globalVarObj={};
        globalVarObj["stateKey"]="";
        globalVarObj["iconUrl"] = "";
        globalVarObj["drawIcons"] = "";
        globalVarObj["equipmentState"] = "";
        globalVarObj["polyPoints"] = "";
       var iconDetail = "";
    var locationState = "";
	   globalVarObj["locationState"]="";
    var MAP_constants = {
		'LOCATION' : 'LOCATION',
		'NORMAL' : 'Normal',
		'DEFAULT_COLOR' : '#BDBDBD',
		'OUTLINE_COLOR' : '#42A5F5',
       
	}
    var customHooksData = props.customHookTraversal;
    var drawIcons = props.drawIcons;
       globalVarObj["stateKey"] = props.stateAttribute;
      // globalVarObj["iconUrl"] = configObj.iconurl;
   //  globalVarObj["baseUrl"] = configObj.baseUrl;
   //    globalVarObj["drawIcons"]= configObj.drawIcons;
       globalVarObj["equipmentState"] = configObj.equipmentState;
       var stateKey =  globalVarObj["stateKey"];
       var equipmentState = globalVarObj["equipmentState"];
       

		if(configObj.stateDetails){
			configObj.stateDetails.forEach(function(item){
						if(item.stateType && stateKey && item.stateType.toUpperCase() === stateKey.toUpperCase()){
							 iconDetail = item.properties; 
						}
						if(item.stateType && stateKey && item.stateType.toUpperCase() === equipmentState.toUpperCase()){
							locationState = item.properties; 
						}
			  });
			}
        globalVarObj["polyPoints"] = "";
		var mapObj = {};
    var pieAttached;
    var polyline;
    var DrawPolyData;
    var selectedPolyline;
    var highlightPoly;
	var markerOut;
    var newMarker;
    var unselectedLayer;
    var selectedLayer;
    var polyPoints =[];
    var flagCheck = false;
		var markers = null;
    var iconUrl =  props.iconUrl;
    var baseUrl = props.baseUrl;
		var dataLen = data.length;
		markers = L.markerClusterGroup({
			spiderfyOnMaxZoom : true,
			showCoverageOnHover : true,
			zoomToBoundsOnClick : true
		});
		var marker;
		var collectMarker = [];
		var collectPolyline = [];
		var markerDuplicate;
		var locationMarked = {};
    var pathFlag = false;
		for (var mapLoop = 0; mapLoop < dataLen; mapLoop++) {
			var locations = data[mapLoop].locations;
			if (locations.length > 1) {
                if(mapLayers && mapLayers.getLayers().length!=0 && !pathFlag){
                mapLayers.eachLayer(function(layer){
                    var Dellayers = layer;
                    if(pathMap.hasLayer(Dellayers)){
                pathMap.removeLayer(Dellayers);
            }
                })
         mapLayers.clearLayers();
                pathFlag = true; 
                    
                     if(mapLayers){mapLayers = null;}
            }
            
           
				var paths = data[mapLoop].path;
				var polylinePoints = [];
                // map click to remove all selection
                 pathMap.on('click',function(e){
                     if(markers.hasLayer(markerOut) && unselectedLayer){
                         markers.removeLayer(markerOut);
                         mapLayers.removeLayer(markerOut);
                         if(newMarker){
                        markers.addLayer(newMarker); 
                        mapLayers.addLayer(newMarker);
                         }else {
                         markers.addLayer(unselectedLayer); 
                        mapLayers.addLayer(unselectedLayer);
                         }
                     }
                     if (selectedPolyline && pathMap.hasLayer(selectedPolyline)) {
								pathMap.removeLayer(selectedPolyline);
                                mapLayers.removeLayer(selectedPolyline);
							}
                            
                        })
                
				for (var i = 0; i < locations.length; i++) {
					if (!locationMarked[locations[i].SureName]) {
						var siteIcon = getIcon({
                            baseUrl : baseUrl,
							iconUrl : iconUrl,
							locationState : null,
							badgeState : null,
							selected : false,
							badge : false,
							markerColor : null,
                            state : {}
						}, drawIcons);
						var toolColor = MAP_constants.DEFAULT_COLOR;
						var markerColor = null
						var entity = MAP_constants.LOCATION;
						var subType = null;
						var entityName = locations[i].SureName;
						var siteAlarm = 'default';
						var icon = null;
						var markerState = null;
						var state = null;
                        var States = {};
						if (locations[i].Attaches) {
							var attachTo = locations[i].Attaches;
							entity = attachTo.Type;
							subType = attachTo.SubType;
							entityName = attachTo.SureName;
                            if(attachTo.state){
                               var stateOptions = attachTo.state;
                                Object.keys(stateOptions).forEach(
                                    function(key){
                                        States[key] = stateOptions[key];
                                    }) 
                               }
                            
							if (attachTo.state && attachTo.state[stateKey]) {
								state = attachTo.state[stateKey];
								siteAlarm = state.toUpperCase();
								for ( var key in iconDetail) {
									if (iconDetail[key].state.toUpperCase() == siteAlarm) {
										toolColor = iconDetail[key].color;
										break;
									}
								}
							}
							if (attachTo.state && attachTo.state[equipmentState]) {
								markerState = attachTo.state[equipmentState];
								for (var keys in locationState) {
									if (locationState[keys].state.toUpperCase() == attachTo.state[equipmentState].toUpperCase()) {
										markerColor = locationState[keys].color;
										break;
									}
								}
							}
							icon = getIcon({
								 baseUrl : baseUrl,
							     iconUrl : iconUrl,
								badgeState : state,
								badge : true,
								badgeColor : toolColor
							}, drawIcons);
							siteIcon = getIcon({
								 baseUrl : baseUrl,
							     iconUrl : iconUrl,
								locationState : markerState,
								badgeState : state,
								selected : false,
								badge : false,
								markerColor : markerColor,
								badgeColor : toolColor,
                                state : States,
                                statusPanelInit : true
							}, drawIcons);
						} else {

							//   commonService.showToast('Location coordinates for '+locations[i].SureName+' are not known.');
						}
                       var opts = {icon : new L.DivIcon({
								className : 'my-div-icon',
								html : '<img  class="map-icon-img"  src="' + siteIcon + '"/>' + '<span class="icon-text">' + locations[i].SureName + '</span>'
							}),
                                    contextmenu: true,
                                contextmenuWidth: 140,
                                   contextmenuInheritItems : false,
                                contextmenuItems: customHooksData
                                  }
						marker = L.marker([ locations[i].Latitude, locations[i].Longitude ], opts);
                        var detailsMarker = Object.assign({},locations[i]);
                        var detailsLocMarker = detailsMarker;
                        var detailsAttaches = detailsLocMarker.Attaches;
                        delete detailsLocMarker.Attaches;
                        Object.assign(detailsLocMarker,detailsAttaches);
                        marker.details = detailsLocMarker;
						var selectMarker;
						var markerDuplicate = _.cloneDeep(marker);
						marker.state = siteAlarm;
						marker.iconDetails = {
                            baseUrl : baseUrl,
                            iconUrl : iconUrl,
							locationState : markerState,
							badgeState : state,
							selected : false,
							badge : false,
							markerColor : markerColor,
							badgeColor : toolColor,
                            state : States,
                            locName : locations[i].SureName,
                            siteIcon : siteIcon
						};
						//markerOut.iconDetails.iconColor
						collectMarker.push(markerDuplicate);
						var props = props;
						marker.on('click', function(e) {
							if (markers.hasLayer(markerOut) && unselectedLayer && !flagCheck) {
                                var select =  unselectedLayer.iconDetails.selected;
                                unselectedLayer.iconDetails = markerOut.iconDetails;
                                unselectedLayer.iconDetails.selected = select;
                                if(markerOut.iconDetails.badgeEnabled || markerOut.iconDetails.locEnabled || markerOut.iconDetails.iconColor){
                                    var iconDetailsUnselect = unselectedLayer.iconDetails;
                                    if(markerOut.iconDetails.badgeEnabled){
                                        iconDetailsUnselect["badgeEnabled"]= true;
                                    }
                                    if(markerOut.iconDetails.locEnabled){
                                        iconDetailsUnselect["locEnabled"]= true; 
                                    }
                                    var IconUpdate = getIcon(iconDetailsUnselect, drawIcons);

                                     var opts = {icon : new L.DivIcon({
								className : 'my-div-icon',
								html : '<img class="map-icon-img"  src="' + IconUpdate + '"/>' + '<span class="icon-text">' + markerOut.iconDetails.locName + '</span>'
							}),
                                    contextmenu: true,
                                contextmenuWidth: 140,
                                contextmenuInheritItems : false,
                                contextmenuItems: customHooksData
                                  };
                                     newMarker = L.marker(unselectedLayer.getLatLng(), opts);
                                    newMarker._events = unselectedLayer._events;
                                    newMarker.details = unselectedLayer.details;
                                 newMarker.iconDetails =  iconDetailsUnselect;
                                 newMarker.bindTooltip(unselectedLayer.getTooltip());
                                markers.addLayer(newMarker);
                                mapLayers.addLayer(newMarker);
                                }else {
                                   markers.addLayer(unselectedLayer); 
                                     mapLayers.addLayer(unselectedLayer);
                                }
								markers.removeLayer(markerOut);
                                mapLayers.removeLayer(markerOut);
                               
							}
							if (selectedPolyline && pathMap.hasLayer(selectedPolyline)) {
								pathMap.removeLayer(selectedPolyline);
                                mapLayers.removeLayer(selectedPolyline);
							}
							if (highlightPoly && pathMap.hasLayer(highlightPoly)) {
								pathMap.removeLayer(highlightPoly);
                                mapLayers.removeLayer(highlightPoly);
							}

							
                            var element = this.getElement(this);
                            selectedLayer = Object.assign({},this);
                            unselectedLayer = this;
							var state = this.state;
							var iconDetailsOld = Object.assign({},this.iconDetails);;
							var name = event.target.parentElement.innerText;
							this._map.removeLayer(this);
							markers.removeLayer(this);
							iconDetailsOld['selected'] = true;
                            if(!iconDetailsOld.siteIcon){
							var siteIconNew = getIcon(iconDetailsOld, drawIcons);
                            var opts = {icon : new L.DivIcon({
								className : 'my-div-icon',
								html : '<img class="map-icon-img"  src="' + siteIconNew + '"/>' + '<span class="icon-text">' + name + '</span>'
							}),
                                    contextmenu: true,
                                contextmenuWidth: 140,
                                contextmenuInheritItems : false,
                                contextmenuItems: customHooksData
                                  };
							markerOut = L.marker(this._latlng, opts);
							markerOut.bindTooltip(unselectedLayer.getTooltip());
                           
							markers.addLayer(markerOut);
                            }else {
                                var siteIconNew = getIcon(iconDetailsOld, drawIcons);
                                var latlng = this.getLatLng();
                            var opts = {icon : new L.DivIcon({
								className : 'my-div-icon',
								html : '<img class="map-icon-img"  src="' + siteIconNew + '"/>' + '<span class="icon-text">' + name + '</span>'
							}),
                                    contextmenu: true,
                                contextmenuWidth: 140,
                                contextmenuInheritItems : false,
                                contextmenuItems: customHooksData
                                  };
                                if(markers.hasLayer(markerOut)){
                                  markers.removeLayer(markerOut);  
                                }
                               
                                markerOut = L.marker(latlng, opts);
                                markerOut.bindTooltip(unselectedLayer.getTooltip());
                                 markerOut.state = siteAlarm;
                                markerOut.iconDetails = iconDetailsOld;
                                markerOut.details = this.details;
                                markers.addLayer(markerOut);
                            }
                            
                            markerOut.state = siteAlarm;
                            markerOut.iconDetails = iconDetailsOld;
                            if(this.details){
                              var detailsMarker = this.details;  
                            } else {
                                var detailsMarker = this.iconDetails;
                            }
                            if(this && this.details && this.details.state){
                            var stateMarker = this.details.state;
                            }else {
                                 var stateMarker = this.iconDetails.state;
                            }
                            if(detailsMarker && detailsMarker.state){
                             delete detailsMarker.state;
                            }
                            Object.assign(detailsMarker,stateMarker); 
                        //Details Panel
                            if(props.markerClickDetail){
                                props.markerClickDetail(detailsMarker); 
                            }else {
                                 props1.markerClickDetail(detailsMarker); 
                            }
                         
                            markers.refreshClusters();
                            flagCheck = false;
						});
						var popupContent = createToolTip(toolColor, entity, entityName, siteAlarm && siteAlarm != "default" ? siteAlarm : null, siteAlarm && siteAlarm != "default" ? icon : null, subType);
						marker.bindTooltip(popupContent, {
							closeButton : false,
							minWidth : 300,
							direction : 'bottom',
							className : 'leaflet-tooltip-ed',
							sticky : 'true'
						});
						if (!markers.hasLayer(marker)) {
							markers.addLayer(marker);
						   // collectMarker.push(markers);
						}
					}
					polylinePoints.push(new L.LatLng(locations[i].Latitude, locations[i].Longitude));
					locationMarked[locations[i].SureName] = locations[i].SureName;
				}
				if (data[mapLoop] && "loop" != data[mapLoop].type) {
					pathMap.addLayer(markers);
                    DrawPolyData = drawPolyline(paths, polylinePoints, pathMap);
                    if(DrawPolyData.polyline){
                      polyline = DrawPolyData.polyline;  
                    }
                    if(DrawPolyData.pie){
                       pieAttached = DrawPolyData.pie
                       }
					collectPolyline.push(_.cloneDeep(polyline));
                    if(!mapLayers){
					mapLayers=	L.layerGroup([markers, polyline]);   
					}else {
                        mapLayers.addLayer(markers);
						mapLayers.addLayer(polyline);
					}
                    if(pieAttached){
                        mapLayers.addLayer(pieAttached); 
                       }
					
					if (polyline) {
						pathMap.addLayer(polyline);
					}
					polyline.on('click', function(event) {
						var layer = this;
						if (selectedPolyline && pathMap.hasLayer(selectedPolyline)) {
							pathMap.removeLayer(selectedPolyline);
						}
						if (highlightPoly && pathMap.hasLayer(highlightPoly)) {
							pathMap.removeLayer(highlightPoly);
						}
						if (markerOut && pathMap.hasLayer(markerOut)) {
							pathMap.removeLayer(markerOut);
							pathMap.addLayer(unselectedLayer);

						}
						
						if (event.target.cluster) {
						} else {  
                            pathMap.removeLayer(this);
							var polylineOptions = {
								color : MAP_constants.OUTLINE_COLOR,
								weight : 6,
								opacity : 1
							};
							selectedPolyline = new L.Polyline(this._latlngs, polylineOptions);
							selectedPolyline.bindTooltip(this._tooltip);
							pathMap.addLayer(selectedPolyline);
                            mapLayers.addLayer(selectedPolyline);

							if (layer) {
								pathMap.addLayer(layer);
                                mapLayers.addLayer(layer);
							}
                            var details = layer.detail;
                            var statesInfo = layer.detail.state;
                            delete details.state;
                            Object.assign(details,statesInfo);
                            props.markerClickDetail(details);
						}
                        L.DomEvent.stopPropagation(event);
                        flagCheck = true;
					});
				}
				//tile.addTo(pathMap);
			} else {
				return null;
			}
		}
		mapObj['pathMap'] = pathMap;
		mapObj['polyline'] = polyline;
        mapObj['mapLayers'] = mapLayers;
        mapObj['markerCluster'] = markers;
		mapObj['collectMarker'] = collectMarker;
		mapObj['collectPolyline'] = collectPolyline;
		return mapObj;
    
     function drawIcon(locationObj,stateIconColor) {
        var icon = stateIconColor;
         var iconColor;
         if(locationObj && locationObj.iconColor){
             iconColor = locationObj.iconColor.color;
         }
		var outline = locationObj.selected ? MAP_constants.OUTLINE_COLOR : null;
		var tearDropColor = iconColor ? iconColor : "#BDBDBD";
		var badgeCol = locationObj.badgeColor ? locationObj.badgeColor : "#BDBDBD";
		var markerBadge = null;
		if (locationObj.badge) {
			if (locationObj.badgeState) {
				var char = locationObj.badgeState.toUpperCase().charAt(0);
				markerBadge = "data:image/svg+xml;charset=utf-8," + "<svg viewBox='0 0 32 32' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' style='enable-background:new 0 0 32 32;' xml:space='preserve' x='0px' y='0px'>\
		  		<g><circle id='severityBackgrnd' fill='" + badgeCol + "' cx='16' cy='16.1' r='15'/><text x='16' y='16.1' text-anchor='middle' font-family='Arial' style='font-weight: 900;font-size:130%'  fill='#f9fbfd' dy='.3em'>" + char + "</text></g></svg>";
			}
			return markerBadge;
		}
		var markerIcon = "data:image/svg+xml;charset=utf-8,";
		markerIcon += encodeURIComponent("<svg width='20px' height='24px' viewBox='0 0 20 30' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>\
                      <g id='locationMarker_Id' stroke='null' stroke-width='1' fill='none' fill-rule='evenodd'>\
                          <g fill='" + tearDropColor + "'  stroke='" + outline + "' stroke-width='1.5'>\
                              <path  id='tearDrop' d='M7.9964124,24 C7.9964124,24 16.3051778,17.7981979 15.9913273,12.2953973 C15.7138588,7.43048918 12.411882,4 7.9964124,4 C3.5809428,4 1.0992023405,8.01561877 0.50149746311,12.2953973 C-0.126521704,18.2961154 7.9964124,24 7.9964124,24  Z'></path>\
                          </g> " + (markerBadge ? markerBadge : '') + "</g> </svg>");
		return markerIcon;
	//<path  id='tearDrop' d='M7.9964124,24 C7.9964124,24 16.3051778,17.7981979 15.9913273,12.2953973 C15.7138588,7.43048918 12.411882,4 7.9964124,4 C3.5809428,4 0.0992023405,7.71561877 0.00149746311,12.2953973 C-0.126521704,18.2961154 7.9964124,24 7.9964124,24 Z'></path>\
	//M8.0964124,24 C7.9564124,24 16.3051778,17.7981979 15.9913273,12.2953973 C15.7138588,7.43048918 12.411882,4 7.9964124,4 C3.5809428,4 0.0992023405,7.71561877 0.50149746311,12.2953973 C-0.126521704,18.2961154 7.9964124,24 7.9964124,24 Z   
	}
   
	function getIcon(props, draw) {
        var draw = draw;
        if(props.iconUrl && props.iconUrl.length!=0){
           draw = false;
        var iconUrl =props.iconUrl;
           }
        
		if (draw) {
			return drawIcon(props);
		}
		if (props.badge) {
			var icon = "./" + iconUrl + (props.badgeState ? props.badgeState.toLowerCase() : "marker_default") + ".svg";
		} else if(props.statusPanelInit){
                  props.badgeState = null;
            props.locationState = null;
            var icon = iconUrl+ "location_" +(props.badgeState ? props.badgeState.toLowerCase() : "default") + "_" + (props.locationState ? props.locationState.toLowerCase() : "default") + (props.selected ? "_selected" : "") + ".svg";
                  }
        else if(props.siteIcon && props.selected){
            var badgeS = null;
            var locationS = null;
            if(props.badgeEnabled){
                var badgeS = props.badgeState;
            }
             if(props.locEnabled){
                var locationS = props.locationState;
            }
            var icon = iconUrl+  "location_" +(badgeS ? badgeS.toLowerCase() : "default") + "_" + (locationS ? locationS.toLowerCase() : "default") + (props.selected ? "_selected" : "") + ".svg"; 
           
        }
        else if(!props.selected){
                if(props.badgeEnabled){
                var badgeS = props.badgeState;
            }
             if(props.locEnabled){
                var locationS = props.locationState;
            }
            var icon = iconUrl+  "location_" + (badgeS ? badgeS.toLowerCase() : "default") + "_" + (locationS ? locationS.toLowerCase() : "default") + (props.selected ? "_selected" : "") + ".svg";
        }
            else {
        var icon =  iconUrl+  "location_" +(props.badgeState ? props.badgeState.toLowerCase() : "default") + "_" + (props.locationState  ? props.locationState.toLowerCase() : "default") + (props.selected ? "_selected" : "") + ".svg";
		}
		return icon;
	}
    
    function createToolTip(color, entity, name, alarm, icon, subType, percentage) {
		var toolTip = '<div class="{style.menu-bg}"><div class="menu-bg-copy" style="background-color:' + color + '">' + '</div><div class="path">' + entity + '</div><div class="toolFont" >' + name + '</div><div class="toolFont" >';
		if (icon) {
			toolTip = toolTip + '<img src="' + icon + '" style="width:12px;height:10px;">' + '<span class="toolFont">' + (alarm) + ' Alarm</span> ';
			if (percentage) {
				toolTip = toolTip + '<span class="toolFont" style="float:right">' + (percentage) + ' </span> ';
			}
		}
		if (subType) {
			toolTip = toolTip + '<div class="path toolFont">' + 'Subtype' + '</div><div class="toolFont" >' + subType + '</div>';
		}
		toolTip = toolTip + '</div>';
		return toolTip;
	}
    function pieValues(name, value, color, strokeStyle, lineWidth) {
		this.name = name, this.value = value, this.style = {
			fillStyle : color,
			strokeStyle : strokeStyle,
			lineWidth : lineWidth
		}
	}
    
	function expandPaths(event) {
		var piePaths = event.relatedTarget.paths;
		var self = this;
		var selLayer;
		var alarmColor = MAP_constants.DEFAULT_COLOR;
		var polylinePoints = polyPoints;
		var polylineMark = event.relatedTarget.polyMark;
		if (pathMap.hasLayer(event.relatedTarget)) {
			pathMap.removeLayer(event.relatedTarget);
            mapLayers.removeLayer(event.relatedTarget);
		}
		var token = false;


		//TODO group layer or somthing else
		pathMap.eachLayer(function(layer) {
			if (layer._latlngs && !token) {
				if (JSON.stringify(layer._latlngs) == JSON.stringify(polylineMark)) {
					pathMap.removeLayer(layer);
                    mapLayers.removeLayer(layer);
					selLayer = polylineMark;
					token = true;
				}
			}

		});


		var curvedData = curvePath(selLayer, piePaths);
	    var pathNum = curvedData.length;
        var stateAttribute = props.stateAttribute;
		for (var i = 0; i < piePaths.length; i++) {
            var alarmState = undefined;
            var icon;
			if (piePaths[i].state && piePaths[i].state[stateAttribute]) {
                alarmState = piePaths[i].state[stateAttribute];
            }  
				for (var key in iconDetail) {
					if (alarmState && iconDetail[key].state.toUpperCase() == alarmState.toUpperCase()) {
						alarmColor = iconDetail[key].color;
						break;
					}else {
                        alarmColor =  MAP_constants.DEFAULT_COLOR;
                    }
				}
          if (alarmState){
				 icon = getIcon({
					 baseUrl : baseUrl,
				    iconUrl : iconUrl,
					locationState : null,
					badgeState : alarmState.toLowerCase(),
					selected : false,
					badge : true,
					markerColor : null,
					badgeColor : alarmColor
				}, drawIcons);
          }else {
             icon = null; 
          };
				var SureName = piePaths[i].SureName;
				var polylineOptions = {
					color : alarmColor,
					weight : 3
				};

				if (i == piePaths.length - 1) {
					var selectPolyline = new L.Polyline(selLayer, polylineOptions);
                    selectPolyline.detail = piePaths[i];
					pathMap.addLayer(selectPolyline);
                    mapLayers.addLayer(selectPolyline);
					var popupContent = createToolTip(polylineOptions.color, 'PATH', SureName, alarmState, icon);
					selectPolyline.bindTooltip(popupContent, {
						closeButton : false,
						minWidth : 300,
						direction : 'bottom',
						className : 'leaflet-tooltip-ed',
						sticky : 'true'
					});
					selectPolyline.on('click', function(event) {
						var layer = this;
						if (highlightPoly && pathMap.hasLayer(highlightPoly)) {
							pathMap.removeLayer(highlightPoly);
                            mapLayers.removeLayer(highlightPoly);
						}
						if (selectedPolyline && pathMap.hasLayer(selectedPolyline)) {
							pathMap.removeLayer(selectedPolyline);
                            mapLayers.removeLayer(selectedPolyline);
						}
						if (markerOut && pathMap.hasLayer(markerOut) && unselectedLayer) {
							pathMap.removeLayer(markerOut);
							pathMap.addLayer(unselectedLayer);
                            mapLayers.removeLayer(markerOut);
							mapLayers.addLayer(unselectedLayer);

						}
						pathMap.removeLayer(this);
                        mapLayers.removeLayer(this);

						alarmColor = event.target.options.color;
						polylineOptions = {
							color : MAP_constants.OUTLINE_COLOR,
							weight : 6,
							opacity : 1
						};
						highlightPoly = new L.Polyline(selLayer, polylineOptions);
						highlightPoly.bindTooltip(this._tooltip);
						pathMap.addLayer(highlightPoly);
                        mapLayers.addLayer(highlightPoly);
						if (layer) {
							pathMap.addLayer(layer);
                            mapLayers.addLayer(layer);
						}
                          var details = layer.detail;
                            var statesInfo = layer.detail.state;
                            delete details.state;
                            Object.assign(details,statesInfo);
                            props.markerClickDetail(details);
					});
				} else {
					var curveConnectPath = L.curve(
						[
							'M', curvedData[i].latlng1,
							'Q', curvedData[i].midpointLatLng,
							curvedData[i].latlng2
						], {
							color : alarmColor,
							weight : 3
						}).addTo(pathMap);
                    mapLayers.addLayer(curveConnectPath);
					curveConnectPath.sureName = piePaths[i].SureName;
                    curveConnectPath.detail = piePaths[i];
					curveConnectPath.on('click', function(event) {
						var layer = this;
						if (highlightPoly && pathMap.hasLayer(highlightPoly)) {
							pathMap.removeLayer(highlightPoly);
                            mapLayers.removeLayer(highlightPoly);
						}
						if (selectedPolyline && pathMap.hasLayer(selectedPolyline)) {
							pathMap.removeLayer(selectedPolyline);
                            mapLayers.removeLayer(selectedPolyline);
						}
						if (markerOut && pathMap.hasLayer(markerOut) && unselectedLayer) {
							pathMap.removeLayer(markerOut);
                            mapLayers.removeLayer(markerOut);
							pathMap.addLayer(unselectedLayer);
                            mapLayers.addLayer(unselectedLayer);

						}
						pathMap.removeLayer(this);
                        mapLayers.removeLayer(this);
						alarmColor = event.target.options.color;
						for (var i = 0; i < curvedData.length; i++) {
							if (JSON.stringify(curvedData[i].midpointLatLng) == JSON.stringify(event.target._coords[event.target._coords.length - 2])) {
								i = i;
								break;
							}

						}
						highlightPoly = L.curve(
							[
								'M', curvedData[i].latlng1,
								'Q', curvedData[i].midpointLatLng,
								curvedData[i].latlng2
							], {
								color : MAP_constants.OUTLINE_COLOR,
								weight : 6,
								opacity : 1
							});
						highlightPoly.bindTooltip(this._tooltip);
						pathMap.addLayer(highlightPoly);
                         mapLayers.addLayer(highlightPoly);
						if (layer) {
							pathMap.addLayer(layer);
                            mapLayers.addLayer(layer);
						}
                        
                           var details = layer.detail;
                            var statesInfo = layer.detail.state;
                            delete details.state;
                            Object.assign(details,statesInfo);
                            props.markerClickDetail(details);
					});
					var popupContent = createToolTip(polylineOptions.color, 'PATH', SureName, alarmState, icon);

					curveConnectPath.bindTooltip(popupContent, {
						closeButton : false,
						minWidth : 300,
						direction : 'bottom',
						className : 'leaflet-tooltip-ed',
						sticky : 'true'
					});

				}
		//	}
		}
	};
    
    function curvePath(polylinePoints, piePaths) {
		var pathsLength = piePaths.length;
		var coordsPoints = [];
		var thetaOffset;
		var j = 25;
		var latlng1 = [ polylinePoints[1].lat, polylinePoints[1].lng ],
			latlng2 = [ polylinePoints[0].lat, polylinePoints[0].lng ];

		var offsetX = latlng2[1] - latlng1[1],
			offsetY = latlng2[0] - latlng1[0];

		var r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)),
			theta = Math.atan2(offsetY, offsetX);

		for (var i = 0; i < pathsLength - 1; i++) {
            var m;
			var iterateValue = (i + 2) % 2;
			var latlngs = {};
			switch (iterateValue) {
			case 1:
				thetaOffset =  j;
             //thetaOffset = (3.14 / 180) * j;
                m = j;
				//j += 10;
				break;
			case 0:
				thetaOffset =  -j;
                  m = -j;  
				//j += 10;
				break;
			}
			var r2 = (r / 2) / (Math.cos(thetaOffset)),
				theta2 = theta + thetaOffset;

			var midpointX = (r2 * Math.cos(theta2)) + latlng1[1],
				midpointY = (r2 * Math.sin(theta2)) + latlng1[0];

			var midpointLatLng = [ midpointY, midpointX ];
			latlngs.latlng1 = latlng1;
			latlngs.midpointLatLng = midpointLatLng;
			latlngs.latlng2 = latlng2;
			coordsPoints.push(latlngs);
            if(m ==j){
               j += 10;
               }
		}
		return coordsPoints;
	}
    
    
    function drawPolyline(paths, polylinePoints, pathMap) {
        var polyData ={};
        var pieLayer;
	var popupContents = [];
		var polyline;
		var pie;
		var polylineOptions = {
			color : MAP_constants.DEFAULT_COLOR,
			weight : 3,
			opacity : 1
		};
		var icon;
		if (paths && paths.length == 1) {
			if (paths[0].state && paths[0].state[stateKey]) {
				var state = paths[0].state[stateKey];
				for (var key in iconDetail) {
					if (iconDetail[key].state.toUpperCase() == state.toUpperCase()) {
						polylineOptions.color = iconDetail[key].color;
						break;
					}
				}
				icon = getIcon({
					 baseUrl : baseUrl,
				    iconUrl : iconUrl,
					badgeState : paths[0].state[stateKey].toLowerCase(),
					badge : true,
					badgeColor : polylineOptions.color
				}, drawIcons);
			} else {
				//Check it
				icon = null;
				state = "default";
			}
			polyline = new L.Polyline(polylinePoints, polylineOptions);
			polyline.SureName = paths[0].SureName;
            polyline.detail = paths[0];
			var popupContent = createToolTip(polylineOptions.color, 'PATH', paths[0].SureName, state, icon);
			polyline.bindTooltip(popupContent, {
				closeButton : false,
				minWidth : 300,
				direction : 'bottom',
				className : 'leaflet-tooltip-ed',
				sticky : 'true'
			});
            polyData["polyline"] = polyline;
		} else if (paths && paths.length > 1) {
			var length = paths.length;
			var critical = 0;
			var major = 0;
			var normal = 0;
			var alarm = 'default';
			let stateVal = {};
			var percentage = 0;
			for (var i = 0; i < length; i++) {
				if (paths[i].state && paths[i].state[stateKey]) {
					var val = paths[i].state && paths[i].state[stateKey];
					state = paths[i].state[stateKey];
					icon = getIcon({
						 baseUrl : baseUrl,
				        iconUrl : iconUrl,
						badgeState : paths[i].state[stateKey].toLowerCase(),
						badge : true,
						badgeColor : polylineOptions.color
					}, drawIcons);

					if (stateVal && stateVal[val]) {
						var value = stateVal[val];
						stateVal[val] = value + 1;
					} else if (stateVal && !stateVal[val]) {
						stateVal[val] = 1;

					}
				}else {
                    var val = "default";
                    
					if (stateVal && stateVal[val]) {
						var value = stateVal[val];
						stateVal[val] = value + 1;
					} else if (stateVal && !stateVal[val]) {
						stateVal[val] = 1;

					}
                   

                } 
				var popupContent = createToolTip(polylineOptions.color, 'PATH', paths[i].SureName, state, icon);
				popupContents.push(popupContent);
			}
			var rgba = MAP_constants.DEFAULT_COLOR;
			var pieData = [];
			var priority;
			if (stateVal !== {}) {
				for (var key in stateVal) {
					if (stateVal[key] > 0) {
						for (var obj in iconDetail) {
							if (iconDetail[obj].state.toUpperCase() == key.toUpperCase()) {
								rgba = iconDetail[obj].color;
								if (priority == null) {
									priority = iconDetail[obj].priority;
									icon = getIcon({
										 baseUrl : baseUrl,
							             iconUrl : iconUrl,
										badgeState : key,
										badge : true,
										badgeColor : rgba
									}, drawIcons);
									alarm = stateVal[key] + '' + key;
									percentage = ((stateVal[key] / paths.length) * 100).toFixed(0);
								} else {
									if (priority > iconDetail[obj].priority) {
										priority = iconDetail[obj].priority;
										icon = getIcon({
											 baseUrl : baseUrl,
							                 iconUrl : iconUrl,
											badgeState : key,
											badge : true,
											badgeColor : rgba
										}, drawIcons);
										alarm = stateVal[key] + '' + key;
										percentage = ((stateVal[key] / paths.length) * 100).toFixed(0);
									}
								}
								if (iconDetail[obj].priority && iconDetail[obj].priority == priority) {
									polylineOptions.color = iconDetail[obj].color;
								}
							}
							;
						}
						var stateData = new pieValues(key, stateVal[key], rgba, 'rgba(117, 117, 117, 1)', 5);
						pieData.push(stateData);
					}
				}
			} else {

				var stateData = new pieValues('Default', '0', rgba, 'rgba(117, 117, 117, 1)', 5);
				pieData.push(stateData);
			}
			pie = L.piechartMarker(L.latLng((polylinePoints[0].lat + polylinePoints[1].lat) / 2, (polylinePoints[0].lng + polylinePoints[1].lng) / 2), {
				radius : (pathMap.hasLayer() ? (40075016.686 * Math.abs(Math.cos(pathMap.getCenter().lat / 180 * Math.PI)) / Math.pow(2, pathMap.getZoom() + 8)) : 14),
				data : pieData,
				contextmenu : true,
				contextmenuItems : [ {
					text : "EXPAND_CLUSTER",
					index : 0,
					callback : expandPaths
				} ]
			});
			pie.paths = paths;
			pie.polyMark = polylinePoints;
			var paths1 = paths;
			polyline = new L.Polyline(polylinePoints, polylineOptions);
			polyline.cluster = true;
			var popupContentCluster = createToolTip(polylineOptions.color, 'PATH CLUSTER', paths.length + ' Paths', alarm, icon, undefined, percentage + "%");
			polyline.bindTooltip(popupContentCluster, {
				closeButton : false,
				minWidth : 300,
				direction : 'bottom',
				className : 'leaflet-tooltip-ed',
				sticky : 'true'
			});
			polyPoints.push(polylinePoints);
			if (pie) {
				pie.bindTooltip(popupContentCluster, {
					closeButton : false,
					minWidth : 300,
					direction : 'bottom',
					className : 'leaflet-tooltip-ed',
					sticky : 'true'
				});
				pathMap.addLayer(pie);
                if(pie && mapLayers){
                    mapLayers.addLayer(pie);
                }
				pieLayer = pie;
			}
            polyData["polyline"] = polyline;
            polyData["pie"] = pie;
            
		}
		return polyData;
	}

}


export const updateMarker = (stateToDisplay, markerCluster) => {
let lMarkers = markerCluster.getLayers();
       lMarkers.forEach(function (item) {
          var siteIconNew = getIcon(item.iconDetails, true,stateToDisplay);
          var x = item.getElement(item);
           var text =  x.innerText;
           x.innerHTML = '<img class="map-icon-img"  src="' + siteIconNew + '"/>' + '<span class="icon-text">' + text + '</span>'
           if(item.options && item.options.icon.options){
               item.options.icon.options.html = '<img class="map-icon-img"  src="' + siteIconNew + '"/>' + '<span class="icon-text">' + text + '</span>'
           }
        })
        markerCluster.refreshClusters();

    
    function getIcon(props, draw,stateToDisplay) {
        
        if(props.iconUrl && props.iconUrl.length!=0){
            draw = false;
            var iconUrl = props.iconUrl;
        }
         let locState =  props.locationState;
        if(stateToDisplay){
           var stateToDisplayKeys = Object.keys(stateToDisplay);
             let alarmSubState = {};
        for (var i = 0; i < stateToDisplayKeys.length; i++) {
            var state = stateToDisplayKeys[i];
            alarmSubState = alarmSubState ? alarmSubState : {};
            alarmSubState[state] = stateToDisplay[state].map(function (value) {
                return value.text;
            })
        }
             let stateFromMarker = props.state;
           
             for (var i = 0; i < stateToDisplayKeys.length; i++) {
            var state = stateToDisplayKeys[i];
            if (stateFromMarker && stateFromMarker[state]) {
                var filteredSubState = alarmSubState[state].filter(function (x) {
                    return stateFromMarker[state].indexOf(x) != -1
                })[0];
                if (filteredSubState) {
                     locState =  props.locationState;
                    var stateIconColor = stateToDisplay[state][alarmSubState[state].indexOf(filteredSubState)]
                     props.iconColor = stateIconColor;
                    if (stateIconColor.badge) {
                        var badgeState = stateIconColor.text;
                        var badgeEnabled = true;
                      //  var locState = stateIconColor.text;
                       
                    }
                    else
                        var stateMarkerColor = stateIconColor.color;
                   
                }else {
                    if(!locState)locState = null;
                }
                
            }
                 else {
                   locState = null;
                }
        }
           }
		if (draw) {
			return drawIcon(props,stateMarkerColor,badgeState,badgeEnabled,locState);
		}
		if (props.badge) {
			var icon = "./" + iconUrl +  "location_" +(badgeState ? badgeState.toLowerCase() : "marker_default") + ".svg";
		} else {
            var icon =  iconUrl+ "location_" +(badgeState ? badgeState.toLowerCase() : "default") + "_" + (locState ? locState.toLowerCase() : "default") + (props.selected ? "_selected" : "") + ".svg";
            
            props["badgeEnabled"]= badgeEnabled;
            if(locState !=null){
              props["locEnabled"]= true;   
            }
            else{
                 props["locEnabled"]= false; 
            }
		}
		return icon;
	}
    function drawIcon(locationObj,stateMarkerColor,badgeState,badgeEnabled,locState) {
        var iconColor = stateMarkerColor;
        var MAP_constants = {
		'LOCATION' : 'LOCATION',
		'NORMAL' : 'Normal',
		'DEFAULT_COLOR' : '#BDBDBD',
		'OUTLINE_COLOR' : '#42A5F5'
	}
		var outline = locationObj.selected ? MAP_constants.OUTLINE_COLOR : null;
        
         if(locState !=null){
              locationObj["locEnabled"]= true
             var tearDropColor = iconColor;
            }
            else{
                 locationObj["locEnabled"]= false; 
                var tearDropColor = "#BDBDBD";
            }
	//	var tearDropColor = iconColor ? iconColor : "#BDBDBD";
	//	var badgeCol = locationObj.badgeColor ? locationObj.badgeColor : "#BDBDBD";
		var markerBadge = null;
         locationObj["badgeEnabled"]= badgeEnabled;
        if(badgeEnabled){
            var badgeCol = locationObj.badgeColor ? locationObj.badgeColor : "#BDBDBD";
            var char = locationObj.badgeState.toUpperCase().charAt(0);
            markerBadge = "<circle cx='15' cy='5' r='4.5' fill='" + badgeCol + "' style='stroke:white ;stroke-width:1.5;'/><text x='15' y='5' text-anchor='middle' font-family='Arial' style='font-weight: 700; font-size:34%'  fill='#f9fbfd' dy='.3em'>" + char + "</text>";
            
            	//return markerBadge;
            
           }
		var markerIcon = "data:image/svg+xml;charset=utf-8,";
		markerIcon += encodeURIComponent("<svg width='20px' height='24px' viewBox='0 0 20 30' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>\
                      <g id='locationMarker_Id' stroke='null' stroke-width='1' fill='none' fill-rule='evenodd'>\
                          <g fill='" + tearDropColor + "'  stroke='" + outline + "' stroke-width='1.5'>\
                              <path  id='tearDrop' d='M7.9964124,24 C7.9964124,24 16.3051778,17.7981979 15.9913273,12.2953973 C15.7138588,7.43048918 12.411882,4 7.9964124,4 C3.5809428,4 0.0992023405,7.71561877 0.00149746311,12.2953973 C-0.126521704,18.2961154 7.9964124,24 7.9964124,24  Z'></path>\
                          </g> " + (markerBadge ? markerBadge : '') + "</g> </svg>" );
		return markerIcon;  
	}
}
