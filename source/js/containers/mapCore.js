'use strict';
import { Component } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import '../../styles/geoMapComponent.css';

class Map extends Component {
    constructor(props) {
        super(props)
    }

    createMap(element, tileServer, maxZoom=22, clickHandler = () => {}, zIndex = 15,minZoom=0) {
		if(element.getAttribute("id")=="geoMapContainer"){
			var x= false;
		}else {
			var x =true;
		}
        let map = L.map(element, {
            attributionControl: false,
			zoomControl : x,
            contextmenu: true
        })
        let tileLayer = L.tileLayer(tileServer, {
            attribution: '',
            maxZoom: maxZoom,
            minZoom:minZoom,
            zIndex: zIndex
        }).addTo(map);
       map.on('click', clickHandler);
        return map;
    };

    customControl(map, position, className, clickCallback, title = className) {
        let control = L.Control.extend({
            options: {
                position: position
            },
            onAdd: function (map) {
                var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom ' + className);
                var icon = L.DomUtil.create('a', className, container);
                L.DomEvent.on(icon, 'click', L.DomEvent.stopPropagation)
                    .on(icon, 'click', L.DomEvent.preventDefault)
                    .on(icon, 'click', clickCallback);
                icon.title = title;
                return container;
            }
        });
        map.addControl(new control());
        return map
    }
	
	 customControlGeo(map, position, className, clickCallback, title = className, baseUrl,iconUrl){
        if(document.getElementsByClassName("leaflet-control-custom").length==0){
             var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom leaflet-control-custom-geo container1');
        }else {
             container =document.getElementsByClassName("leaflet-control-custom-geo");
        }

        let control  = L.Control.extend({
                    options: {
                        position: position
                    },
                    onAdd: function (map) {
                     // var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom leaflet-control-custom-geo');
                        if(container.length>0){
                        container=container[0];
                        }
                         container.style.boxShadow = "2px 4px 4px grey !important";
                        if(clickCallback){
                        var icon = L.DomUtil.create('a', className , container);
                        icon.style.margin = "0px 0px -1px 0px";
                        if(iconUrl){
                            var image = L.DomUtil.create('img', className , icon)
                            image.style.width = '15px';
                            image.style.height = '30px';
                            image.style.margin = '1px 0px 0px 0px';
                            image.style.cursor = 'pointer';
                            console.log(baseUrl);
                           image.src = baseUrl+require("../../images/map/"+iconUrl)
                          //  image.src =require(iconUrl);
                        }
                        L.DomEvent.on(icon, 'click', L.DomEvent.stopPropagation)
                            .on(icon, 'click', L.DomEvent.preventDefault)
                            .on(icon, 'click', clickCallback);
                            icon.title = title.replace("_", " ");
                    }else {
            
                            var sep = L.DomUtil.create('hr', className, container);
                            sep.style.margin = "0px 2px 0px 3px";
                            sep.style.border = "1px solid #999";
                        
                        }
                        
                        return container;
                    }
                });
        map.addControl(new control());
        return map
    }
}

export default Map;