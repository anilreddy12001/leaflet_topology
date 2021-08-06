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
        case 'GET_PROFILE_DATA_SHARE_SUCCESS':

            return Object.assign({}, state, { shareResponse: action.payload.response });
            break;
        case 'ADD_TENANT':

            return Object.assign({}, state, { responseDataCreate: action.payload.response ,timeStamp:new Date()});
            break;

        case 'POPULATE_DATA':

            return Object.assign({}, state, { populateEmailSettings: action.payload.response });
            break;
        case 'FETCH_TENANT_DATA':
            return Object.assign({}, state, {tenantDetails: action.payload.response });
            break;
        case 'RESET_PW':
            return Object.assign({}, state, {resetPw: action.payload.response });
            break;
        case 'UPDATE_ERROR':
            return Object.assign({}, state, {updateErr: action.payload.response });
            break;
        case 'RESET':
            return {};
            break;


    }

    return state;
}