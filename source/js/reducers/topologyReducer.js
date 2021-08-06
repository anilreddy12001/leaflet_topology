/*
 * All reducers get two parameters passed in, state and action that occurred
 *       > state isn't entire apps state, only the part of state that this reducer is responsible for
 * */
// "state = {}" is set so that we don't throw an error when app first boots up
export default function (state = {}, action) {
    switch (action.type) {
        case "DIA_DATA": return Object.assign({}, state, { diaData: action.payload });
        case "PERSPECTIVE_DATA": return Object.assign({}, state, { perspectiveData: action.payload.perspective });
        // case "RESET_DIA_DATA": return Object.assign({}, state, { diaData: null });
        default:
            return state;

    }
}