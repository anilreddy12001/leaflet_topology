
/**
 *  
 * Helper: geoMapHelper.js
 * @Initiation of Geo Map
 * @version 1.0
 * @author Neha
 *
 */
import {pathMap,mapBounds,baseUrl} from '../../containers/geoMapContainer.js';
import {createGeoMarker} from './geoMapMarker.js';
import L from 'leaflet';
import MiniMap from 'leaflet-minimap';
import React from 'react';
import ReactDOM from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';
//Style
import 'leaflet-minimap/dist/Control.MiniMap.min.css';
var maxLevel = -1;  let geoMapPathData = []; var mapDetails;
    var tile;var mapLayers; var stateDetails;

 export {geoMapPathData};

export const showMap = (currentEntity, currentRow, levelInp, respType) => {
        if (currentRow && currentRow['UUID']) {
            var request = new Request(currentEntity, currentRow['UUID']);
            var level = [];
            level.push(levelInp);
            var embededEntity = ['Location'];
            var response = new Response(respType, level, embededEntity);
            var expand = ['Equipment.Location', 'Path.State', 'Path.FCP', 'Path.Endpoint', 'Path.Equipment','Endpoint.State', 'FCP.State'];    
            var payload = new TopoologyPayload(expand, request, response);
        }
        return payload;
    
    function Request(classDet, uuid) {
       var self = {};
       
        self.origin = {
            '@class': classDet
            , 'UUID': uuid
        }, self.inclusion = {
            'gInclude': ['Service', 'Path', 'Endpoint', 'FCP', 'Equipment', 'Network']
            , 'relation': [{
                    "relType": "USES"
                    , "direction": "OUTGOING"
            }
                , {
                    "relType": "CONSUMES"
                    , "direction": "OUTGOING"
            }
                , {
                    "relType": "LINKS_TO"
                    , "direction": "OUTGOING"
            }
                , {
                    "relType": "ASSOCIATES_WITH"
                    , "direction": "OUTGOING"
            }
                , {
                    "relType": "PART_OF"
                    , "direction": "OUTGOING"
            }
                , {
                    "relType": "CONNECTS_TO"
                    , "direction": "OUTGOING"
            }
                , {
                    "relType": "DEPENDS_ON"
                    , "direction": "OUTGOING"
            }
                , {
                    "relType": "ATTACHES_TO"
                    , "direction": "OUTGOING"
            }
                , {
                    "relType": "TERMINATES_ON"
                    , "direction": "OUTGOING"
            }
                , {
                    "relType": "RELIES_ON"
                    , "direction": "OUTGOING"
            }
                , {
                    "relType": "ROUTES_TO"
                    , "direction": "OUTGOING"
            }
                , {
                    "relType": "RESIDES_ON"
                    , "direction": "OUTGOING"
            }
                , {
                    "relType": "FORWARDS_TO"
                    , "direction": "OUTGOING"
            }
                , {
                    "relType": "BELONGS_TO"
                    , "direction": "OUTGOING"
            }]
        }
       return self; 
    }
    
     function Response(resType, levels, embededEntity) {
        var response = {};
        response.responseType = resType, response.entity = ['Path'], response.levelData = {
            'level': levels
        }, response.embedEntity = embededEntity
        
        return response;
    }

    function TopoologyPayload(expand, request, response) {
        var load = {};
        load.request = request, load.response = response, load.expand = expand
        
        return load;
    }
    
}


export const getgeoMapformattedData = (resolve) => { 

  function formattedData(path, locations, state) {
        this.path = path, this.locations = locations;
        if (locations && locations.length == 1) {
            this.type = "loop";
        }
        else if (locations && locations.length == 2) {
            this.type = "endtoend";
        }
        else if (locations && locations.length > 2) {
            this.type = "multy";
        }
    }
        var dataArray = [];
        var locationMap = {};
        var formatedData;
        var formatedDataCopy;
        if (resolve && resolve.element && resolve.element.length > 0) {
            var eleLength = resolve.element.length;
            for (var i = 0; i < eleLength; i++) {
                var pathDetails = [];
                var locations = [];
                var state;
                var pathItems = resolve.element[i].properties;
                var completeLoc = "";
                pathDetails.push(pathItems);
                if (resolve.element[i].relationships) {
                    if (resolve.element[i].relationships.LOCATED_AT && resolve.element[i].relationships.LOCATED_AT.relationship && resolve.element[i].relationships.LOCATED_AT.relationship.length > 0) {
                    	var connectionMap =[];
                    	var connectionArray=['ATTACHES_TO','LINKS_TO','TERMINATES_ON'];
                        var locationsRaw = resolve.element[i].relationships.LOCATED_AT.relationship;
                        var locLength = locationsRaw.length;
                        var connection ;
                        for(var prop in resolve.element[0].relationships){
                        	if(connectionArray.indexOf(prop) > -1){
                        		connectionMap.push(prop);
                        	}
                        	}
                        for (var locLoop = 0; locLoop < locLength; locLoop++) {
                            var loccopy = JSON.parse(JSON.stringify(locLoop));
                        	connection = connectionMap.length >(1) ? connectionMap[locLoop] :connectionMap[0];
                        	var locLoopInn = connectionMap.length > 1 ? 0: loccopy;
                            if (locationsRaw[locLoop] && locationsRaw[locLoop].Target.properties && (locationsRaw[locLoop].Target.properties['Latitude'] && locationsRaw[locLoop].Target.properties['Longitude'])) {
                                var locat  = null;
                                locat = locationsRaw[locLoop].Target.properties;
                                if (resolve.element[i].relationships[connection] && resolve.element[i].relationships[connection].relationship && resolve.element[i].relationships[connection].relationship[locLoopInn]) {
                                    locat['Attaches'] = resolve.element[i].relationships[connection].relationship[locLoopInn].Target.properties;
                                    if (locat.Attaches && resolve.element[i].relationships[connection].relationship[locLoopInn].Target.relationships && resolve.element[i].relationships[connection].relationship[locLoopInn].Target.relationships.HAS_STATE && resolve.element[i].relationships[connection].relationship[locLoopInn].Target.relationships.HAS_STATE.relationship[0]) {
                                        locat.Attaches['state'] = resolve.element[i].relationships[connection].relationship[locLoopInn].Target.relationships.HAS_STATE.relationship[0].Target.properties;
                                    }
                                }
                                var locatcopy = Object.assign({}, locat);
                                locations.push(locatcopy);
                                completeLoc = completeLoc + locat['SureName'] + "-";
                            }
                       
                        }
                    }
                    if (resolve.element[i].relationships.HAS_STATE && resolve.element[i].relationships.HAS_STATE.relationship && resolve.element[i].relationships.HAS_STATE.relationship.length > 0 && resolve.element[i].relationships.HAS_STATE.relationship[0] && resolve.element[i].relationships.HAS_STATE.relationship[0].Target && resolve.element[i].relationships.HAS_STATE.relationship[0].Target.properties) {
                        state = resolve.element[i].relationships.HAS_STATE.relationship[0].Target.properties;
                        pathDetails[0]['state'] = state;
                    }
                }
                if (completeLoc && completeLoc.length > 1) {
                    completeLoc = completeLoc.slice(0, -1);
                    var ss = completeLoc.split("-");
                    var reverseLoc ="";
                    if(ss && ss.length>=1){
                    	reverseLoc = ss[1]+"-"+ss[0]; 
                    }
                    if (locationMap[completeLoc] >=0 || locationMap[reverseLoc] >=0) {
                    	if(locationMap[completeLoc] >=0){
                        var newPath = dataArray[locationMap[completeLoc]]
                        newPath.path.push(pathItems);
                    	}else{
                    		var newPath = dataArray[locationMap[reverseLoc]]
                            newPath.path.push(pathItems);
                    	}
                    }
                    else {
                        locationMap[completeLoc] = dataArray.length;
                        formatedDataCopy =  new formattedData(pathDetails, locations);
                        dataArray.push(formatedDataCopy);
                    }
                }
            }
        }
        return dataArray;
}
  

export const drawMap = (data,first,p2p,mapLevel,alarmData,props,props1) => {
    if(document.getElementsByClassName("leaflet-control-minimap")){
        var x = document.getElementsByClassName("leaflet-control-minimap");
        for(var i =0; i<x.length;i++){
            x[i].remove();
        }
    }
    
      if(first){
         geoMapPathData[0] =data;
    }
    
    if(mapLevel && mapLevel!=0){
         geoMapPathData[mapLevel] =data;
    }
    
    if(alarmData){
        stateDetails =alarmData;
 }
 	    var config = {};
    if(mapLevel){
         config['level'] = mapLevel;
    } else {
        config['level'] = 0;
    }
       
        config['mapDetails']="";
        config['tile']="";
        config['stateKey'] = props.stateAttribute;
        config['tileLayer'] = "http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png";
        config['baseUrl'] = baseUrl;
        config['stateDetails'] = stateDetails;
        config['equipmentState'] = "OperationalState";
        
        config['drawIcons'] = false;
    if (!mapDetails || !tile) {
			mapDetails = getMapEnvironmentDetails(config.tileLayer);
			tile = mapDetails.tileLayer;
           // tile = config.tile ;
		}
        var mapObj = new initMap(data,config,pathMap,props,props1);
  
        if (!mapObj.Empty){
         //   var path1Map = Object.assign({}, mapObj['pathMap']);
            var path1Map = mapObj['pathMap'];
           var polyline = mapObj['polyline'];
           var collectMarker = mapObj.collectMarker;
           var collectPolyline = mapObj.collectPolyline;
        path1Map.setView(new L.LatLng(59.92448055859924, 10.758276373601069),5);
        
	 	   if(mapBounds){
               path1Map.fitBounds(mapBounds);
               }else{
                path1Map.invalidateSize();
               setTimeout(function () {
                   path1Map.invalidateSize();
                   path1Map.fitBounds(polyline.getBounds());
                   path1Map.setZoom(path1Map.getZoom()-1);
               }, 5);   
               }
          if(first ){
        	   path1Map.invalidateSize();
               setTimeout(function () {
                   path1Map.invalidateSize();
                   path1Map.fitBounds(polyline.getBounds());
                   path1Map.setZoom(path1Map.getZoom()-1);
               }, 5);
           }
           else{
        	  
           }
           

       var osm2 = new L.TileLayer('http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png', {minZoom: 0, maxZoom: 13 });
       var layers = new L.LayerGroup([osm2, ...mapObj.collectMarker,...mapObj.collectPolyline]);
        var miniMap = new L.Control.MiniMap(layers, { toggleDisplay: true, zoomLevelOffset: -5, width: 264, height: 159, border: 8 }).addTo(path1Map);
        path1Map.invalidateSize();
        path1Map.fitBounds(polyline.getBounds());
        path1Map.setZoom(path1Map.getZoom()-1);
            
   } else {
       geoMapPathData.pop();
       mapLevel = mapLevel-1;
       new notify("Location coordinates are not known.");
   }
    
    // toaster message
    function notify(msg) {
        toast(msg, {
            className: 'darker-toast',
            progressClassName: 'transparent-progress'
        });
    }
   
    //This is the function to initialise the map
	  function initMap(data, configObj,pathMap,props,props1) {
		var configurations = configObj;
		var stateKey = configObj.stateKey;
		if(!pathMap){
			pathMap = L.map('pathMap', {
				center : [ 39.300299, -95.727541 ],
				zoomControl : false,
                contextmenu: true,
				worldCopyJump : false
			});
		}
		else{
		
		}
		pathMap.options.minZoom = 2;
		pathMap._layersMaxZoom = 10;
		if (data && data.length > 0) {
			mapObj = createGeoMarker(data, pathMap, tile, configObj,props,props1);
            if(mapObj){
                mapLayers=mapObj.mapLayers; 
            }
            
		}
          if(!mapObj){
              mapObj={};
             mapObj["Empty"]="true"; 
          }
		return mapObj;
	}
    
    function getMapEnvironmentDetails(tileImage) {
		var mapDetails = {};
		mapDetails['tileLayer'] = getMapTile(tileImage);
		return mapDetails;
	}
    function getMapTile(tileImage) {
        var mapTileLayer;
		if (tileImage) {
			mapTileLayer = L.tileLayer(tileImage
				, {
					attribution : '',
					maxZoom : 10,
				});
		}
		return mapTileLayer;
	}
   
    return mapObj;
}

export const parseStateDetails = (lStates,stateAttribute) => {
    var stateAttribute = stateAttribute;
            return {
                displayLabel: true,
                size: "M",                    
                style: {
                    width: "240px",
                    zIndex: 401,
                },
                groupToShow: "Badge Status Indication",
                status: [{
                    text: "Badge Status Indication",
                    value: "None",
                    items: [
                        {
                            text: "None",
                            label: "None",
                            values: []
                        },
                        {
                            text: stateAttribute,
                            label: "Alarms",
                            values:  getStateValues(stateAttribute, lStates)
                        }
                    ]
                },
                {
                    text: "Marker Status Indication",
                    value: "None",
                    items: [
                        {
                            text: "None",
                            label: "None",
                            values: [],
                            type: "radioButton"
                        },
                        {
                            text: "OperationalState",
                            label: "Operational State",
                            values:  getStateValues("OperationalState", lStates)
                        },
                        {
                            text: "AdministrativeState",
                            label: "Administrative State",
                            values:  getStateValues("AdministrativeState", lStates)
                        },
                    ]
                }]
            }
    
    
        function getStateValues(state, lStates){
            var filteredObj = lStates.filter(function(x){ return x.stateType == state})            
            if(filteredObj && filteredObj.length && filteredObj.length > 0){
               return filteredObj[0].properties.map(function(item){
                    var result = {
                        text: item.state,
                        icon: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(drawSVG(item.color, item.badgeText ? item.badgeText : "" )),
                        color: item.color,
                        enabled: true
                    }
                    if(item.badgeText){
                        result.badge = item.badgeText
                    }
                    return result
                })
            }
            else {
                var x =[];
                return x;
            }
            
            

        }
    
  function drawSVG(color, badge) {
            var svg = '<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="mapviewsettingssvg" viewBox="0 0 6 6" width="6" height="6">\
                     <circle cx="3" cy="3" r="3" fill="'+ color + '"/><text x="3" y="3" text-anchor="middle" font-family="Arial" style="font-weight: bold; font-size:20%"  fill="#f9fbfd" dy=".3em">' + badge + '</text>\
                    </svg>';
            return svg
        }  
        
}

