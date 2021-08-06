import { combineReducers } from 'redux';

import topologyMapReducer from './topologyMapReducer';

import topologyReducer from './topologyReducer';
/*
 * We combine all reducers into a single object before updated data is dispatched (sent) to store
 * Your entire applications state (store) is just whatever gets returned from all your reducers
 * */

const allReducers = combineReducers({
       
		topologyMap: topologyMapReducer,
      
        topology:topologyReducer
});

export default allReducers
