import axios from 'axios';
var dataSource;
export const getSearchData = (chips) => {
    return function (dispatch) {
        if (chips && dataSource && dataSource.searchAPI) {
            return axios({
                method: "POST",
                url: dataSource.searchAPI,
                headers: dataSource.headers,
                data: getSearchJSONPayload(chips, dataSource.selectedEntity,dataSource.selectedEntity)
            }).then(function (response) {
                dispatch({
                    type: "GET_SEARCH_DATA",
                    payload: { data: response }
                });
            });
        }
        else {
            dispatch({
                type: "GET_SEARCH_DATA",
                payload: {}
            });
        }

    }
}

export const resetStore = () => {
    return function (dispatch) {
        dispatch({
            type: "RESET_SEARCH_DATA"
        });
    }

}

var getSearchJSONPayload = function (tokens, entityType, filterType) {
    
 var searchFilters = [];
            var searchJsonPayload = {
                "response": {
                    "responseType": "List"
                    , "entity": [entityType]
                }
                , "expand": ["Capacity","State"]
            };
            var filter = [];
            var filterObj = {"for" :filterType ? filterType : entityType}
            filterObj["filter"] = tokens.data.map(function(token){
                var prefix = "";
                var operator = "";
                var suffix = "";
                var filterObj = {};
                
                 if (token.value) {
        			for(var i=0; i < token.value.length; i++){
        				if(token.value[i].id === "first-field"){
        					prefix = token.value[i].dbName + ";";
        				}else if (token.value[i].id === "condition") {
                        	if (token.value[i].value === ":") {
                                    operator = "CONTAINS;";
                                } else if (token.value[i].value === "!:") {
                                    operator = "NOT CONTAINS;";
                                }else if (token.value[i].value === "=") {
                                    operator = "EQUALS;";
                                } else if (token.value[i].value === "!=") {
                                    operator = "NOT EQUAL;"
                                }else if (token.value[i].value === "Starts With") {
                                    operator = "STARTS WITH;"
                                }else if (token.value[i].value === "Ends With") {
                                    operator = "ENDS WITH;"
                                }else if (token.value[i].value === ">") {
                                    operator = "GREATER THAN;"
                                }else if (token.value[i].value === "<") {
                                    operator = "LESS THAN;"
                                }else if (token.value[i].value === ">=") {
                                    operator = "GREATER OR EQUAL;"
                                }else if (token.value[i].value === "<=") {
                                    operator = "LESS OR EQUAL;"
                                }
                                else {
                                    operator = token.value[i].value + ";";
                                }
                   		 }else if (token.value[i].id.startsWith("query")){
                            suffix = token.value[i].value;
                        }else{
                            console.log("chip doesnot met the condition");
                        }
        			}                 
                }
                return (prefix + operator + suffix) ;
            })
            searchJsonPayload["searchFilter"] = [filterObj]
            return searchJsonPayload;
}

export const searchTokenData = (data) => {
    dataSource = data;
    return function (dispatch) {
        return axios({
            method: data.method,
            url: data.catalogAPI,
            headers: data.headers
        }).then(function (response) {
            var currentEntity = data.selectedEntity;
            var columnData;
            if(response.data.entityAttributes[currentEntity] && response.data.entityAttributes[currentEntity].defaultAttribute && response.data.entityAttributes[currentEntity].specificAttribute){
                columnData = [].concat(response.data.entityAttributes[currentEntity].defaultAttribute,
                response.data.entityAttributes[currentEntity].specificAttribute);
            }else if(response.data.entityAttributes[currentEntity] && response.data.entityAttributes[currentEntity].defaultAttribute){
                columnData = response.data.entityAttributes[currentEntity].defaultAttribute;
            }else if(response.data.entityAttributes[currentEntity] && response.data.entityAttributes[currentEntity].specificAttribute){
               columnData = response.data.entityAttributes[currentEntity].specificAttribute
            }else{
                console.log("Entity Attribute is not configured. setting default..");
                columnData = [{visibleColumn: "Policy Name", entityAttribute: "SureName"}, {visibleColumn: "Display Name", entityAttribute: "DisplayName"},
                    {visibleColumn: "Type", entityAttribute: "Type"},
                    {visibleColumn: "Sub Type", entityAttribute: "SubType"}];
            }
            if("users" == currentEntity) {
                columnData = userSerchConditions(columnData);
            }
            else{
                var listToDelete = ['STATE_OperationalState', 'STATE_AdministrativeState','CAPACITY_Speed','URL'];
                for (var i = 0; i < columnData.length; i++) {
                    var obj = columnData[i];
                
                    if (listToDelete.indexOf(obj.entityAttribute) !== -1) {
                        columnData.splice(i, 1);
                        i--;
                    }
                }
                columnData = columnData.map(function (item) {
                     return searchConditions(item);
            });
          
        }
            dispatch({
                type: 'GET_SEARCH_COLUMN_DATA_SUCCESS',
                payload: columnData
            });
        })
    }
}
var searchConditions = (item) =>{
    return {
        "value": item["visibleColumn"] || item["availableColumn"],
        "label": item["visibleColumn"] || item["availableColumn"],
        "dbName": item["entityAttribute"],
        "conditions": [
          {
            "value": "=",
            "label": "Equal to (=)",
            "acceptOnlyMatchedValues": false,
            "maxNumberOfFields": 1
          },
          {
            "value": "!=",
            "label": "Not Equal (!=)",
            "acceptOnlyMatchedValues": false,
            "maxNumberOfFields": 1
          },
            {
            "value": ":",
            "label": "Contains (:)",
            "acceptOnlyMatchedValues": false,
            "maxNumberOfFields": 1
          },
          {
            "value": "!:",
            "label": "Does Not Contain (!:)",
            "acceptOnlyMatchedValues": false,
            "maxNumberOfFields": 1
          },
          {
            "value": "Starts With",
            "label": "Starts With",
            "acceptOnlyMatchedValues": false,
            "maxNumberOfFields": 1
          },
          {
            "value": "Ends With",
            "label": "Ends With",
            "acceptOnlyMatchedValues": false,
            "maxNumberOfFields": 1
          },
          {
            "value": ">",
            "label": "Greater than (>)",
            "acceptOnlyMatchedValues": false,
            "maxNumberOfFields": 1
          },
          {
            "value": "<",
            "label": "Less than (<)",
            "acceptOnlyMatchedValues": false,
            "maxNumberOfFields": 1
          },
          {
            "value": ">=",
            "label": "Greater or Equal (>=)",
            "acceptOnlyMatchedValues": false,
            "maxNumberOfFields": 1
          },
          {
            "value": "<=",
            "label": "Less or Equal (<=)",
            "acceptOnlyMatchedValues": false,
            "maxNumberOfFields": 1
          }
        ]
    }
}

var userSerchConditions = (data) => {
    let userColumnData = data.map(function(item) {
        // if ((item["visibleColumn"] || item["availableColumn"]).toUpperCase() === "GROUP") {
        //     return searchConditions(item);
        // } else if((item["visibleColumn"] || item["availableColumn"]).toUpperCase() !== "STATUS"){
            return {
                "value": item["visibleColumn"] || item["availableColumn"],
                "label": item["visibleColumn"] || item["availableColumn"],
                "dbName": item["entityAttribute"],
                "conditions": [{
                    "value": ":",
                    "label": "Contains (:)",
                    "acceptOnlyMatchedValues": false,
                    "maxNumberOfFields": 1
                }]
            }
        //}
    });
    return userColumnData.filter(item => typeof item !=='undefined');;
}
