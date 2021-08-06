'use strict';
import {
    Component
}
from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'
import topologyMapRoot from './topologyMapContainer.js';
class TopologyMap extends Component {
    constructor(props) {
        super(props);
    }
    createMap(element, zoom, clickHandler = () => {}, zIndex = 15) {
        let map = L.map(element, {
            crs: L.CRS.Simple,
            center : [ 39.300299, -95.727541 ],
            attributionControl: false,
            zoom: zoom,
            zoomControl: false
         })
        map.on('click', clickHandler);
        return map
    }
    
    
    customControl(map, position, className1, className2, className3, clickCallback1, clickCallback2, clickCallback3, title1 = className, title2=className, title3=className){
        let control  = L.Control.extend({
                    options: {
                        position: position
                    },
                    onAdd: function (map) {
                        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom settingsContainer');
                        var icon3 = L.DomUtil.create('a', className3 , container);
                        L.DomEvent.on(icon3, 'click', L.DomEvent.stopPropagation)
                            .on(icon3, 'click', L.DomEvent.preventDefault)
                            .on(icon3, 'click', clickCallback3);
                            icon3.title = title3;
                        
                        var icon2 = L.DomUtil.create('a', className2 , container);
                        L.DomEvent.on(icon2, 'click', L.DomEvent.stopPropagation)
                            .on(icon2, 'click', L.DomEvent.preventDefault)
                            .on(icon2, 'click', clickCallback2);
                            icon2.title = title2;
                        
                        var icon1 = L.DomUtil.create('a', className1 , container);
                        L.DomEvent.on(icon1, 'click', L.DomEvent.stopPropagation)
                            .on(icon1, 'click', L.DomEvent.preventDefault)
                            .on(icon1, 'click', clickCallback1);
                            icon1.title = title1;
                        
                        return container;
                    }
                });
        map.addControl(new control());
        return map
    }
    

 

};
export default TopologyMap;