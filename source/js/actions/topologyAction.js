import axios from "axios";

export const getPerspective = (parameters) => {
  let { entityType, headers,ihubAPI } = parameters;
  let uri, perspective = [];
  return function (dispatch) {
    axios({
      method: "GET",
      url: `${ihubAPI}/metadata/`,
      headers
    }).then(response => {
      let _perspective = response.data.perspectives

      let result = _perspective._extended.filter((topologyEle, i) => {
        if (topologyEle.response.entityType.indexOf(entityType)>-1) {
          return true;
        }
      });

      if (result.length > 0) {

        perspective = result[0].response.perspective.map((val, i) => ({
          label: val,
          value: val,
          uri: result[0].uri
        }));
      }

      let tempAr = _perspective._default.response.perspective.map((val, i) => ({ label: val, value: val, uri: _perspective._default.uri }))
      perspective = tempAr.concat(perspective);


      dispatch({
        type: "PERSPECTIVE_DATA",
        payload: {
          perspective
        }
      })

    }).catch(error => console.log(error));
  }
}

export const getDiagraphData = (parameters) => {
  let {
    headers,
    entityID,
    entityType,
    uri,
    perspective,
    ihubAPI
  } = parameters;
  return function (dispatch) {
    axios({
      method: "POST",
      url: `${ihubAPI}/${uri}/${perspective}`, 
      headers,
      data: { "type": entityType, "sureName": entityID }
    }).then(response => {
      let result = response.data ? response.data : data;
      dispatch({
        type: "DIA_DATA",
        payload: result
      });

    }).catch(error => console.log(error));
  }
}
