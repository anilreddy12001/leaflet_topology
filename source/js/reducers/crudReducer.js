/*
 * All reducers get two parameters passed in, state and action that occurred
 *       > state isn't entire apps state, only the part of state that this reducer is responsible for
 * */

// "state = {}" is set so that we don't throw an error when app first boots up

export default function(state={}, action) {
	switch(action.type) {
		case 'CREATE_TENANT_RESPONSE':
			return Object.assign({}, state, {data : action.payload});
		case 'RESET_STORE' :
			return {}	
		case 'FETCH_USERGROUPS':
			return Object.assign({}, state, {usergroup : action.payload});
		case 'USER_MESSAGES':
			return Object.assign({}, state, {userMessages : action.payload});	
	}
	return state;
}
