/**
 * Sure UI Components
 *
 * @namespace sureUI
 */


import React from 'react';
import reactDom from 'react-dom';
import '../styles/sureUIComponents.css'
import '@nokia-csf-uxr/csfWidgets/csfWidgets.css'

import TopologyMap from './components/topologyMap.jsx';

import TopologyModal from "./components/topologyModal.jsx"

import Topology from './components/Topology.jsx';


const SUREUI = {
    components: {
        TopologyMap : TopologyMap,
        TopologyModal: TopologyModal,
        Topology:Topology
    }
}
/**
 *3rd party libraries
 *@namespace sureUI.external
 */
SUREUI.external = {
    csfWidgets: require('@nokia-csf-uxr/csfWidgets')
} 

export {
    SUREUI,
    
    TopologyMap,
    
    TopologyModal,
    
	Topology
}

window.SUREUI = SUREUI



