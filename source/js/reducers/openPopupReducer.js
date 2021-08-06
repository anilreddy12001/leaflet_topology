
export default function (state = {}, action) {
	switch (action.type) {
		case 'GET_CATEGORY_LIST_DATA_SUCCESS':
			return Object.assign({}, state, { responseData: action.payload.response });
			break;

		case 'ADD_SEARCH_PAYLOAD':
			return Object.assign({}, state, { responseCreatePayload: action.payload.response, timeStamp: new Date() });
			break;

		case 'FETCH_SEARCHQUERY_DATA':
			return Object.assign({}, state, { searchQueryDetails: action.payload.response });
			break;

		case 'UPDATE_ERROR':
			return Object.assign({}, state, { updateErr: action.payload.response });
			break;

		case 'DELETE_SEARCH_DATA':
			return Object.assign({}, state, { deleteResponse: action.payload.response });
			break;

		case 'DELETE_ERROR':
			return Object.assign({}, state, { deleteErr: action.payload.response });
			break;

		case 'RESET_SEARCH_DATA':
			return {};
			break;

	}
	return state;
}