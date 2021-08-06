'use strict';
import {Component} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'

class SearchCore extends Component{
    constructor(props){
        super(props)
    } 

    createMap(element, tileServer, zoom, clickHandler=()=>{}, zIndex = 15 ){ 
        let map = L.map(element,{
                    attributionControl: false,
                })
        let tileLayer = L.tileLayer(tileServer, {
            attribution: '',
            maxZoom: zoom,
            zIndex: zIndex
        }).addTo(map);
        map.on('click', clickHandler);
        return map
    };

    customControl(map, position, className, clickCallback, title = className){
        let control  = L.Control.extend({
                    options: {
                        position: position
                    },
                    onAdd: function (map) {
                        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
                        var icon = L.DomUtil.create('a', className , container);
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
}

export default SearchCore;