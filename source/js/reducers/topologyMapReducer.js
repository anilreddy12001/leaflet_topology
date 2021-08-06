
export default function (state = {}, action) {
    switch (action.type) {
        case 'TOPOLOGY_MAP_CLEAR_PATH_NAME':
            return Object.assign({}, state, {pathName : undefined, errorMessage : undefined})
        case 'TOPOLOGY_MAP_GET_PATH_NAME':
            return Object.assign({}, state, { pathName: action.payload, errorMessage : undefined })
        case 'TOPOLOGY_MAP_SHOW_ERROR':
            return Object.assign({}, state, { errorMessage: action.payload })            
        case 'TOPOLOGY_MAP_GET_DATA' :
            return Object.assign({}, state, {data: action.payload.data, rootPathID : action.payload.rootPathID, errorMessage : undefined, customHookData: action.payload.customHookData})
        case 'GET_RootPathID':
            return Object.assign({}, state, { pathID: action.payload, errorMessage : undefined });
        case 'GET_SelectedPathID':
            return Object.assign({}, state, { selectedPathID: action.payload, errorMessage : undefined });
        case 'TOPOLOGY_MAP_UPDATE_STATUS_PANEL' :
			return Object.assign({}, state, {statusPanel : action.payload, errorMessage : undefined});
		case 'TOPOLOGY_MAP_SET_STATE_TO_DISPLAY' :
            return Object.assign({}, state, {stateToDisplay : action.payload, errorMessage : undefined});
        case 'TOPOLOGY_MAP_UPDATE_MODAL_DATA' :
            return Object.assign({}, state, {modalData : action.payload, errorMessage : undefined})
        case 'MAP_GET_TYPE_ID' :
            return Object.assign({}, state, { typeId: action.payload, errorMessage : undefined });
        case 'TOPOLOGY_MAP_RESET_STORE':
            return {}
    }
    return state;
}