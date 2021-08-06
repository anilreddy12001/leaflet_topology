/*
 * All reducers get two parameters passed in, state and action that occurred
 *       > state isn't entire apps state, only the part of state that this reducer is responsible for
 * */

// "state = {}" is set so that we don't throw an error when app first boots up
export default function (state = {}, action) {


	switch (action.type) {
		case 'GET_ASSOCIATION_SUCCESS':
		return Object.assign({}, state, { rowDataAV: action.payload.objRowdata, /*imageIcon: action.payload.iconUrl, rowDataDetail: action.payload.rowDetail, editRow : action.payload.editRow, deleteRow: action.payload.deleteRow,*/ traversalEntity:action.payload.traversalEntity, selectedEntityData:action.payload.selectedEntity, selectedUUIDData: action.payload.selectedUUIDData});
			break;
		case 'GET_IN_ASSOCIATION_COLUMN_SUCCESS':
			return Object.assign({}, state, { columnDataAVIN: action.payload });
			break;
        case 'GET_OUT_ASSOCIATION_COLUMN_SUCCESS':
			return Object.assign({}, state, { columnDataAVOUT: action.payload });
			break;
            
		case 'RESET':
			return {};
			break;


	}

	return state;
}
