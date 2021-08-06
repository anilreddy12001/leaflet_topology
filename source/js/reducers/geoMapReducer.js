/*
 * All reducers get two parameters passed in, state and action that occurred
 *       > state isn't entire apps state, only the part of state that this reducer is responsible for
 * */

// "state = {}" is set so that we don't throw an error when app first boots up

export default function(state={}, action) {
	switch(action.type) {
		case 'GET_GEOMAP_DATA':			
			return Object.assign({}, state, {geoMapData : action.payload});
			break;
        case 'GET_ALARMSTATUS_DATA':	
				return Object.assign({}, state, {alarmStateData : action.payload});
            break;
        case 'UPDATE_STATUS_PANEL' :
			return Object.assign({}, state, {statusPanel : action.payload});
			break;
		case 'SET_STATE_TO_DISPLAY' :
			return Object.assign({}, state, {stateToDisplay : action.payload});
			break;
        case 'SET_MARKER_CLICK_DETAILS' :
			return Object.assign({}, state, {markerClickDetail : action.payload});
			break;
        case 'UPDATE_GEO_MARKERS' :
            return Object.assign({}, state, {updateMarkersCluster : action.payload});
			break;
        case 'RESET_GEO_STORE' :
			return {};
            break;
            
	}
	return state;
}