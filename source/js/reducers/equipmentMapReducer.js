/*
 * All reducers get two parameters passed in, state and action that occurred
 *       > state isn't entire apps state, only the part of state that this reducer is responsible for
 * */

// "state = {}" is set so that we don't throw an error when app first boots up

export default function (state = {}, action) {
	switch (action.type) {
		case 'GET_EQUIPMENT_MAP_DATA':
			state.data = state.data || [];
			return Object.assign({}, state, {
				progress: action.payload.progress,
				data: [...state.data, ...action.payload.data],
				viewPoint: null,
				markerCount: -1
			});
		case 'DISPLAY_EQUIPMENT_MAP_COUNT':
			let pLoad = action.payload;
			return Object.assign({}, state, {
				progress: 100,
				viewPoint: pLoad.data && {
					lat: pLoad.data[0].latitude,
					lng: pLoad.data[0].longitude
				},
				markerCount: pLoad.markerCount,
				data: []
			}
			)
		case 'UPDATE_STATUS_PANEL':
			return Object.assign({}, state, { statusPanel: action.payload });
		case 'SET_STATE_TO_DISPLAY':
			return Object.assign({}, state, { stateToDisplay: action.payload });
		case 'RESET_STORE':
			return {}
	}
	return state;
}