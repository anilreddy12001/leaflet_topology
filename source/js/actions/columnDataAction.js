import axios from 'axios';
export const gridColumnData = (data) =>
{
   
    return function(dispatch){
    
        return axios ({
            method: data.method,
            url: data.url,
            headers: data.requestHeaders,
            
        }).then(function(response)
        {
        
           var currentEntity = data.selectedEntity;
            var outputObject = [];
           
             var columnDataNew = response.data.entityAttributes[currentEntity].defaultAttribute ;
           
            columnDataNew.map(function(value, key){
                var item = {};
                item['field'] = value["entityAttribute"];
                 item['displayName'] = value["visibleColumn"];
                
                    this.push(item);
                  
            }, outputObject);
                 
    
         dispatch(
             {
                type : 'GET_COLUMN_DATA_SUCCESS',
                payload : outputObject
             },
            {
                type : 'RESET',
                payload : null
             }
            );

        })
        // .catch((error) => {
        //     console.log('Error', error.message);
        //     console.log(error.config);
        // })


}
}