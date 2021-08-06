import axios from 'axios';

let isReset = false;
export const updateStatusPanel = (data) => {
    //Processing
    let stateToDisplay = {};
    data.status.forEach(function (status) {
        let filteredobj = status.items.filter(function (item) {
            return item.text == status.value
        })[0];
        if (filteredobj.text)
            stateToDisplay[filteredobj.text] = filteredobj.values.filter(function (value) {
                return value.enabled
            }).map(function (value) {
                let statusName = value.text.toUpperCase()
                let result = { text: statusName, color: value.color }
                if (value.badge)
                    result.badge = value.badge
                return result
            })
    })
    return function (dispatch) {
        dispatch({
            type: "UPDATE_STATUS_PANEL",
            payload: data
        });

        dispatch({
            type: "SET_STATE_TO_DISPLAY",
            payload: stateToDisplay
        });
    }

}


export const showTreeViewData = (data) => {

}

export const resetStore = () => {
    isReset = true;
    return function (dispatch) {
        dispatch({
            type: "RESET_STORE"
        });
    }

}
const MapNodeForFilter = (input) => {
    var lNodes = [];
    input.forEach(function (object) {
        var hasAssociation = object.relationships && object.relationships.LOCATED_AT && object.relationships.LOCATED_AT.relationship
        var result = {
            id: object.properties.UUID
        }
        if (hasAssociation) {
            function processAssociation(childNode, type) {
                childNode.forEach(function (item) {
                    var targetNode = item.Target ? item.Target : item.Source
                    if (type) {
                        result.state = result.state ? result.state : {};
                        var filteredProperties = filtered_keys(targetNode.properties, /.*State/);
                        filteredProperties.forEach(function (feature) {
                            if (result.state[feature] && result.state[feature].indexOf(targetNode.properties[feature]) == -1) {
                                result.state[feature].push(targetNode.properties[feature]);
                            }
                            else if (!result.state[feature]) {
                                result.state[feature] = [targetNode.properties[feature]];
                            }
                        })
                    }

                    var childNodeAssociation = targetNode.relationships && targetNode.relationships.HAS_STATE && targetNode.relationships.HAS_STATE.relationship
                    if (childNodeAssociation)
                        processAssociation(childNodeAssociation, "state")
                })
            }
            processAssociation(hasAssociation);
        }
        result.detail = (function (object) {
            delete object.Associations
            delete object.Features
            return object.properties
        })(object)
        if (result.detail.Latitude && result.detail.Longitude) {
            result.latitude = result.detail.Latitude;
            result.longitude = result.detail.Longitude;
            result.name = result.detail.SureName
            lNodes.push(result);
        }
        else {
            result.latitude = result.detail.Latitude;
            result.longitude = result.detail.Longitude;
            result.name = result.detail.SureName
            lNodes.push(result);
        }
    })
    return lNodes;
}

const MapNodeForFilter2 = (input) => {
    var lNodes = [];
    input.forEach(function (object) {
        var hasAssociation = object.relationships && object.relationships.LOCATED_AT && object.relationships.LOCATED_AT.relationship
     if(object.relationships && object.relationships.LOCATED_AT && object.relationships.LOCATED_AT.relationship[0].Target.properties){   
        var result = {
            id: object.relationships.LOCATED_AT.relationship[0].Target.properties.UUID
        }
    }
    if(result && object.relationships && object.relationships.HAS_STATE && object.relationships.HAS_STATE.relationship[0].Target.properties){   
        result.state = object.relationships.HAS_STATE.relationship[0].Target.properties;
    }
        if (hasAssociation) {
            function processAssociation(childNode, type) {
                childNode.forEach(function (item) {
                    var targetNode = item.Target ? item.Target : item.Source
                    if (type) {
                        result.state = result.state ? result.state : {};
                        var filteredProperties = filtered_keys(targetNode.properties, /.*State/);
                        filteredProperties.forEach(function (feature) {
                            if (result.state[feature] && result.state[feature].indexOf(targetNode.properties[feature]) == -1) {
                                result.state[feature].push(targetNode.properties[feature]);
                            }
                            else if (!result.state[feature]) {
                                result.state[feature] = [targetNode.properties[feature]];
                            }
                        })
                    }

                    var childNodeAssociation = targetNode.relationships && targetNode.relationships.HAS_STATE && targetNode.relationships.HAS_STATE.relationship
                    if (childNodeAssociation)
                        processAssociation(childNodeAssociation, "state")
                })
            }
            processAssociation(hasAssociation);
        }
        if(object.relationships && object.relationships.LOCATED_AT && object.relationships.LOCATED_AT.relationship[0].Target.properties){
            result.detail = (function (object) {
                delete object.Associations
                delete object.Features
                return object.relationships.LOCATED_AT.relationship[0].Target.properties
            })(object)
        }
        
        if (result && result.detail && result.detail.Latitude && result.detail.Longitude) {
            result.latitude = result.detail.Latitude;
            result.longitude = result.detail.Longitude;
            result.name = result.detail.SureName
            lNodes.push(result);
        }
        
    })
    return lNodes;
}

const filtered_keys = (obj, filter) => {
    var key, keys = [];
    for (key in obj) {
        if (obj.hasOwnProperty(key) && filter.test(key)) {
            keys.push(key);
        }
    }
    return keys;
}

const generateQuery= (q,isCyperQuery)=>{
    let NE = q.getNorthEast();
    let SW = q.getSouthWest();
    if(isCyperQuery){
     // MATCH (n:Equipment)-[*]->(e:Location) where e.Latitude<=43.70053354110517 and e.Longitude<=126.28906220197679 and e.Latitude>=2.0113052415595245 and e.Longitude>=59.58007782697678 return count(e)
         return `MATCH (n:Location) where n.Latitude<=${NE.lat} and n.Longitude<=${NE.lng} and n.Latitude>=${SW.lat} and n.Longitude>=${SW.lng} RETURN count(*) as count`
        // return `MATCH (n:Equipment)-[*]->(e:Location) where e.Latitude<=${NE.lat} and e.Longitude<=${NE.lng} and e.Latitude>=${SW.lat} and e.Longitude>=${SW.lng} return count(e) as count`;
        //
      //  return `MATCH (n:Equipment)-[LOCATED_AT]->(e:Location) where e.Latitude<=${NE.lat} and e.Longitude<=${NE.lng} and e.Latitude>=${SW.lat} and e.Longitude>=${SW.lng} return count(distinct e) as count`;
    }
    else{
        // let q = `Latitude;LESS%20OR%20EQUAL;${NE.lat}&q=Longitude;LESS%20OR%20EQUAL;${NE.lng}&q=Latitude;GREATER%20OR%20EQUAL;${SW.lat}&q=Longitude;GREATER%20OR%20EQUAL;${SW.lng}`;
        return  `q=Latitude;LESS%20OR%20EQUAL;${NE.lat}&q=Longitude;LESS%20OR%20EQUAL;${NE.lng}&q=Latitude;GREATER%20OR%20EQUAL;${SW.lat}&q=Longitude;GREATER%20OR%20EQUAL;${SW.lng}`
    }

}

export const getEquipmentMapData = (data, q, cancelToken) => {
    var self = this ? this : {};
    if (data.headers["Response-Type"] || data.headers["response-type"]) {
        delete data.headers["Response-Type"];
        delete data.headers["response-type"]
    }

    data.headers["Response-Type"] = "flat"
    data.headers["TransformationEnabled"] = true;

    function initialMapLoad(dispatch,markerCount){
        
        let matchQuery = generateQuery(q,false);

        axios({
            method: "GET",
            url: `${data.url}&page=1&limit=5&${matchQuery}`,
            headers: data.headers,
            cancelToken: cancelToken.token
        }).then(function (response) {
            //console.log(response.data);
            let result = response.data ? MapNodeForFilter(response.data.entities.splice(0,1)) : [];
            dispatch({
                type: "DISPLAY_EQUIPMENT_MAP_COUNT",
                payload: { progress: 100, data: result ,markerCount}
            });
            return result;
        }).catch((e) => {
            // console.log("Error ", e);
            return e;
        });
    }
    function loadBaseEqMap(dispatch, siteCount) {
        const limit = 1000 // hardcoded, since api is limited
        const apiToTrigger = Math.ceil(siteCount / limit);
        let apiPromiseAr = [];
        let progress = 0;
       
        for (let i = 0; i < apiToTrigger; i++) {
            apiPromiseAr.push(
                axios({
                    method: "GET",
                    url: `${data.url}&page=${i + 1}&limit=${limit}&${generateQuery(q,false)}`,
                    headers: data.headers,
                    cancelToken: cancelToken.token
                }).then(function (response) {
                    console.log(response.data);
                    let result = response.data ? MapNodeForFilter(response.data.entities) : [];
                    progress = progress + 1000;
                    dispatch({
                        type: "GET_EQUIPMENT_MAP_DATA",
                        payload: { progress: (progress * 100) / siteCount, data: [],markerCount:false }
                    });
                    return result;
                }).catch((e) => {
                    // console.log("Error ", e);
                    if(e.message && e.message ==! "API ABORTED"){
                        progress = progress + 1000;
                        dispatch({
                            type: "GET_EQUIPMENT_MAP_DATA",
                            payload: { progress: (progress * 100) / siteCount, data: [],markerCount:false }
                        });    
                    }
                    return e;
                }));
        }
        
        Promise.allSettled(apiPromiseAr).
            then((results) => {
                let promiseCancelledFalg = false;
                let result = results.reduce((res, val, i) => {
                    // Status of each api request , irresepective of reject /resolve
                    console.log("Status of each api request ", val.status);
                    let status =val.status;
                    let _val= val.value;
                    if (status == "fulfilled" && _val.message === undefined)
                        return res.concat(_val);
                    else if(status == "fulfilled" && _val.message && _val.message == "API ABORTED"){
                        promiseCancelledFalg = true;
                        return [];
                    }
                    else
                        return res;
                }, []);
                if(promiseCancelledFalg){
                  throw new Error("API aborted");
                }
                else{
                    dispatch({
                        type: "GET_EQUIPMENT_MAP_DATA",
                        payload: { progress: 100, data: result }
                    });
                }
            })
            .catch((e) => {
                console.log("Promise.allSetted_Error:", e);
            });
    }

    function getData(dispatch, page, limit) {
        let domain = data.url.split('/oss')[0];
        // let searchChips = data.url.split('&q=')[2].split("&page=")[0].replace("Equipment.", "");
        let filterurl = `${domain}/oss/sure/graphSearch`;
        //let filterPayload = data.searchPayload;
        let filterPayload= {"response":{"responseType":"List","entity":["Equipment"]},"expand":["Equipment.State","Equipment.Location"],"searchFilter":[{"for":"Equipment","filter":data.searchPayload.searchFilter[0].filter}]}
        //for topology query: {"request":{"origin":{"@class":"Filter","for":"Equipment","filter":data.searchPayload.searchFilter[0].filter},"graphSearch":false,"exclusion":{"excludeFrom":[{"from":"Location","exclusion":["Location"],"relation":[{"relType":"ASSOCIATES_WITH"}]}]},"inclusion":{"gInclude":["Location","Equipment"],"includeFrom":[{"from":"Location","inclusion":["Equipment","State"],"relation":[{"relType":"LOCATED_AT","direction":"INCOMING"},{"relType":"HAS_STATE","direction":"OUTGOING"}]}]},"multiOriginRequest":false,"gDirection":"OUTGOING"},"response":{"responseType":"List","entity":["Equipment"]},"expand":["Equipment.State","Equipment.Location"]}
        // {"response":{"responseType":"List","entity":["Location"]},"expand":["Capacity","State"],"searchFilter":[{"for":"Equipment","filter":[searchChips]}]};
        //filterPayload.response.entity[0] = "Location";
    // filterPayload.expand=["Equipment.Capacity", "Equipment.State"];
       // filterPayload.searchFilter[0].filter.push('Type;EQUALS;NE,RootNetworkElement;EQUALS;True');
        if (page == 1)
            isReset = false;
        if (page > 1 && isReset)
            return null;
        else {
            return axios({
                method: "POST",
                url: filterurl,
                headers: data.headers,
                data: filterPayload
            }).then(function (response) {
                let result = response.data.entities ? MapNodeForFilter2(response.data.entities) : 0;
                //Formula for progress indicator is (100-100/2^n)
                let progress = (result.length && result.length == limit) ? 100 * (1 - 1 / Math.pow(2, (page - 1) / 2)) : 100;
                if (page > 1 && isReset) {
                    return null;
                } else {
                    dispatch({
                        type: "GET_EQUIPMENT_MAP_DATA",
                        payload: {
                            progress: progress,
                            data: result
                        }
                    });
                }
                page++;

                if (result.length == limit) {
                    getData(dispatch, page, limit)
                }
                else {
                    dispatch({
                        type: "GET_EQUIPMENT_MAP_DATA",
                        payload: { progress: 100, data: [] }
                    });
                }
            }).catch((e) => {
                console.log("Filter search Error  ", e);
            });
        }
    }

    return function (dispatch) {
        if (!data.searchPayload) {
            //If its not filter search
            // let matchQuery = `MATCH (n:Location) where n.Latitude<=${NE.lat} and n.Longitude<=${NE.lng} and n.Latitude>=${SW.lat} and n.Longitude>=${SW.lng} RETURN count(*) as count`
            let matchQuery = generateQuery(q,true);

            let originURL = new URL(data.url).origin;
            let _url = `${originURL}/oss/sure/execute/cypher`;
            let headers = Object.assign({}, data.headers);
            headers["Content-Type"] = 'text/plain';

            axios({
                method: "POST",
                url: _url,
                headers: headers,
                data: matchQuery,
                cancelToken: cancelToken.token
            }).then(function (response) {
                // configured value need to added, As of now its 2K
                let count =response.data.element[0].count;
                if(count > 2000){
                    initialMapLoad(dispatch,response.data.element[0]["count"])
                }
                else if(count ==0 ){
                    dispatch({
                        type: "DISPLAY_EQUIPMENT_MAP_COUNT",
                        payload: { progress: 100, data: null ,markerCount:count}
                    });
                }
                else{
                    loadBaseEqMap(dispatch, count);
                }
            }).catch((error) => {
                //Failed to load Data please check network or try again
                console.log(error,"ERROR TO FETCH THE TOTAL COUNT ");
            });
        }
        else {
            //Filter search data reterivig
            getData(dispatch, 1, 5000);
        }
    }
}
