import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchTreeViewData,locationData,fetchRootLocations} from '../actions/treeViewAction.js';
import { Tree} from '@nokia-csf-uxr/csfWidgets';

class TreeViewForMap extends Component {

    constructor(props) {
        
                super(props);
                this.state = {
                   
                  };
                
                
            }

    static get defaultProps() {
        return {}
      }
    
 
  componentWillMount() {
    const { treeViewData,data } = this.props;

    const { fetchTreeViewData } = this.props;
    const{fetchRootLocations} = this.props;
    if(!treeViewData.data){

    fetchRootLocations({
      requestHeaders: treeViewData.requestHeaders ? treeViewData.requestHeaders : {},
      method: treeViewData.method,
      url: treeViewData.url,
      IconUrl:treeViewData.imageIconurl
         });
        }

// if(!treeViewData.data){
    
//     fetchTreeViewData({
//         requestHeaders: treeViewData.requestHeaders ? treeViewData.requestHeaders : {},
//         method: treeViewData.method,
//         url: treeViewData.url,
//         payload:treeViewData.payload
//          });
//         }

  }

 
//   componentWillUnmount() {
   
//     this.props.resetTreeStore();
// }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    console.log(this.props);
    if(nextProps.locationMap){
      this.props.treeViewData.getTreeViewData(nextProps.locationMap,nextProps.treeViewData.stateToDisplay,nextProps.treeViewData.onMarkerClick);
    }
   
   //  console.log(nextProps);


  }

  // getMarkers(){

  // }
  onLocationData(rootLocations,eventData){
  const { locationData } = this.props;
  const { treeViewData } = this.props;
  var locUuid=eventData.value.node.UUID;
  var expandTreePayload= {"request":{"origin":{"@class":"Location","UUID":locUuid},"inclusion":{"gInclude":["Location","Equipment"]},"gDirection":"INCOMING"},"response":{"responseType":"SubTree","entity":["Location"],"columnFilter":[{"for":"Entity","filter":["SureName","UUID","SubType","Latitude","Longitude"]}]},"expand":["State"]}
 //var expandTreePayload ={"request":{"origin":{"@class":"Location","UUID":locUuid},"inclusion":{"gInclude":["Location"]},"gDirection":"INCOMING"},"response":{"responseType":"SubTree","entity":["Location"],"columnFilter":[{"for":"Entity","filter":["SureName","UUID","SubType","Latitude","Longitude"]}]},"expand":[]};
 var  locationPayload ={"request":{"origin":{"@class":"Location","UUID":locUuid},"inclusion":{"gInclude":["Location"]},"gDirection":"INCOMING"},"response":{"responseType":"List", "entity": ["Location"],"columnFilter":[{"for":"Entity","filter":["SureName","UUID","SubType","Latitude","Longitude"]}]},"expand":["State","Location.Equipment"]}
 var listOfRoot=rootLocations.treeViewDetails;
  locationData({
      requestHeaders: treeViewData.requestHeaders,
      method:'POST',
      url: treeViewData.topoUrl,
      expandPayload: expandTreePayload,
      locationsList:listOfRoot,
      locPayload:locationPayload,
      IconUrl:treeViewData.imageIconurl,
      locStates:treeViewData.statesForTree,
      locStateAttribute:treeViewData.stateAttributeForTree
     });
  //  console.log(locationData);
  }

    getMarkers(){


    }

  render() {
   // const { treeViewData } = this.props;
  var LocationTreeData =[];
  var statusIconFile = require("../../images/map/UNKNOWN.svg");
     LocationTreeData = this.props.treeViewDetails;
    if(LocationTreeData){
    
       return (
        <div id="treeView">

<Tree
        id="toggleButtonGroupID"
        height={300}
        data={LocationTreeData}
        
        defaultFolderIcon={this.props.treeViewData.imageIconurl + statusIconFile}
        defaultOpenFolderIcon={this.props.treeViewData.imageIconurl + statusIconFile}
        onNodeEvent={this.handleNodeEvent}
       onClick={this.onLocationData.bind(this,this.props)}
      />
        </div>

      )
    }else 
    {
        return(
            <div ></div>
        )
    }
    
  
    }
}

// handleNodeEvent = (event) => {
//   console.log(event);
// }


function mapStateToProps(state) {
  //const { treeViewData } = this.props;
    let dataObj = {};
  //  dataObj.data = this.state.data;
    
      if (state.treeView.responseData) {
    
        dataObj.responseData = state.treeView.responseData;
       
    
      }
      if (state.treeView.treeViewDetails) {
        dataObj.treeViewDetails = state.treeView.treeViewDetails;
      }    

      if (state.treeView.locationMap){
        dataObj.locationMap= state.treeView.locationMap
      }
      return dataObj;

}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchTreeViewData: fetchTreeViewData,
    locationData:locationData,
   fetchRootLocations:fetchRootLocations,
  //  resetTreeStore:resetTreeStore,
 }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TreeViewForMap);
