
export default function(state={}, action) {
	switch(action.type) {
		                //   case 'GET_CATEGORY_LIST_DATA_SUCCESS':
		     			//   return Object.assign({}, state, { responseData: action.payload.response });
                        //   break;
						
						case 'FETCH_ROOTLOC_DATA':
						return Object.assign({}, state, {treeViewDetails: action.payload.response });
					
                        case 'FETCH_TREEVIEW_DATA':
						return Object.assign({}, state, {treeViewDetails: action.payload.response },{locationMap:action.payload.locationResponse});
						
						case 'GET_LOC_DATA':
						return Object.assign({}, state, {locEquipDetails: action.payload.response });


					//   case 'RESET_TREE_STORE':
					// 	  return {};
						 
		
	}
	return state;
}