/*
 * All reducers get two parameters passed in, state and action that occurred
 *       > state isn't entire apps state, only the part of state that this reducer is responsible for
 * */

// "state = {}" is set so that we don't throw an error when app first boots up
export default function (state = {}, action) {


	switch (action.type) {
		case 'GET_COLUMN_DATA_SUCCESS':
		
			return Object.assign({}, state, { columnData: action.payload });
			break;
		case 'GET_GRID_DATA_SUCCESS':
			
			return Object.assign({}, state, { rowData: action.payload.objRowdata, /*imageIcon: action.payload.iconUrl, rowDataDetail: action.payload.rowDetail, editRow : action.payload.editRow, deleteRow: action.payload.deleteRow,*/ traversalEntity:action.payload.traversalEntity, selectedEntityData:action.payload.selectedEntity });
			break;
		case 'GET_TRAVERSAL_SUCCESS':
			return Object.assign({}, state, { rowData: action.payload.objRowdata,currentTraversalEntity:action.payload.currentTraversalEntity });
			break;
		case 'GET_COLUMN_TRAVERSAL_DATA_SUCCESS':
			return Object.assign({}, state, { columnData: action.payload });
			break;
		case 'GET_SEARCH_SUCCESS':
		return Object.assign({}, state, { rowData: action.payload.objRowdata, /*imageIcon: action.payload.iconUrl, rowDataDetail: action.payload.rowDetail, editRow : action.payload.editRow, deleteRow: action.payload.deleteRow,*/ traversalEntity:action.payload.traversalEntity, selectedEntityData:action.payload.selectedEntity });
			break;
		case 'GET_SEARCH_COLUMN_SUCCESS':
			return Object.assign({}, state, { columnData: action.payload });
			break;
		case 'RESET':
			return {};
			break;


	}

	return state;
}