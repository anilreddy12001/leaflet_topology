/*
 * All reducers get two parameters passed in, state and action that occurred
 *       > state isn't entire apps state, only the part of state that this reducer is responsible for
 * */

// "state = {}" is set so that we don't throw an error when app first boots up
export default function (state = {}, action) {


	switch (action.type) {

		case 'GET_PROFILE_DATA_SUCCESS':

			return Object.assign({}, state, { responseData: action.payload.response });
			break;
		case 'ADD_USER_GROUP':

			return Object.assign({}, state, { userGroupCreation: action.payload.response,timeStamp:new Date() });
			break;
		case 'EDIT_USER_GROUP':

			return Object.assign({}, state, { userGroupEdit: action.payload.response });
			break;

		case 'UPDATE_USER_GROUP':
			return Object.assign({}, state, { userGroupUpdation: action.payload.response });
			break;

		case 'RESET':
			return {};
			break;


	}

	return state;
}