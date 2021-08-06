/*
 * All reducers get two parameters passed in, state and action that occurred
 *       > state isn't entire apps state, only the part of state that this reducer is responsible for
 * */

// "state = {}" is set so that we don't throw an error when app first boots up
export default function (state = {}, action) {

      if(state.gridrowError)
      state.gridrowError = undefined

      switch (action.type) {

            case 'GET_CATEGORY_LIST_DATA_SUCCESS':

                  return Object.assign({}, state, { responseData: action.payload.response });
                  break;

            case 'GET_QUERY_LIST_DATA_SUCCESS':

                  return Object.assign({}, state, { queryResponseData: action.payload.response });
                  break;

            case 'GET_QUERY_DATA_SUCCESS':

                  return Object.assign({}, state, { querySearchData: action.payload.response });
                  break;
            case 'GET_QUERY_DATA_FAILURE':

                  return Object.assign({}, state, { querySearchDataFailure: action.payload.response });
                  break;

            case 'GET_SEARCH_DATA_SUCCESS':

                  return Object.assign({}, state, { searchResult: action.payload.response });
                  break;

            case 'GET_ROW_GSEARCH_DATA_SUCCESS':

                  return Object.assign({}, state, { gridRowSearchData: action.payload.response });
                  break;

            case 'GET_COLUMN_GSEARCH_DATA_SUCCESS':

                  return Object.assign({}, state, { gridColumnSearchData: action.payload.response });
                  break;
           
            case 'ROW_DATA_ERROR':
                  return Object.assign({}, state, { gridrowError: action.payload.response });
                  break;

            case 'RESET_GSEARCH':
                  return {};
                  break;


      }

      return state;
}