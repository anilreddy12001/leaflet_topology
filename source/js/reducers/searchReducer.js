/*
 * All reducers get two parameters passed in, state and action that occurred
 *       > state isn't entire apps state, only the part of state that this reducer is responsible for
 * */

// "state = {}" is set so that we don't throw an error when app first boots up

import _ from 'lodash';
export default function(state={}, action) {
	switch(action.type) {
		case 'GET_SEARCH_DATA':
			return Object.assign({}, state, {data: action.payload.data})
			break;
		case 'GET_SEARCH_COLUMN_DATA_SUCCESS':
            return Object.assign({}, state, {searchColumnData: action.payload});
			break;
		case 'RESET_SEARCH_DATA':
			return {}
	}
	return state;
}