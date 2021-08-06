/*
 * All reducers get two parameters passed in, state and action that occurred
 *       > state isn't entire apps state, only the part of state that this reducer is responsible for
 * */

// "state = {}" is set so that we don't throw an error when app first boots up

export default function(state={}, action) {
	switch(action.type) {
		case 'ADD_PROFILES_DATA':
        case 'DELETE_PROFILES_DATA':
			return Object.assign({}, state, {data:action.payload, message:undefined}); 
        case 'INVALID_FILE':
            return Object.assign({}, state, {message :  action.message, timeStamp: Date.now()})
        case 'SAVE_PROFILES_DATA':
			return Object.assign({}, state, {message :  action.message, timeStamp: Date.now(), checkFlag: action.checkFlag});
		case 'RESET_STORE' :
			return {}	
	}
	return state;
}