/**
 *  
 * Container: equipmentViewContainer.js
 *
 * @version 1.0
 * @author Anil
 *
 */
'use strict';

import React, {
    Component
} from 'react';
import ReactDOM from 'react-dom';
import {
    bindActionCreators
} from 'redux';
import {
    connect,
    Provider
} from 'react-redux';
import {
    DataGrid,
    SvgIcon,
    SearchwChips,
    Snackbar,
    ProgressIndicatorCircular,
    ExpansionPanel,
    AppToolbarNew,
    List,
    Dialog
} from '@nokia-csf-uxr/csfWidgets';
import axios from 'axios';

import {
    gridViewData,
    
    EVSearchData
} from '../actions/equipmentViewAction.js';

//import gridOptions2 from "@nokia-csf-uxr/csfWidgets/stories/GridOptions";

//Style
import style from '../../styles/dataGrid.css';
let gridApi;
let gridColumnApi;
var entityType;
let traversalData;
var hierarchyArray;
var globalparams=[];
var defaultOpenCount=0;
var gridOptionsOriginal ;
/**
 * 
 * @class EquipmentList
 * @description Container Class
 * @memberof sureUI.components
 **/

class EquipmentListModal extends Component {

    constructor(props) {
        //console.log("@nokia-csf-uxr"+@nokia-csf-uxr);
        super(props);
        
        //this.columnStatechanges = this.columnStatechanges.bind(this);
        
        this.state = {
            data: '',
            loading: true,
            historyBaseFlag: false,
            selectedRow: '',
            selectedMethod: '',
            initialColumnData: []
        };
        this.ajaxWaiting = true;
        
    }
    /*  static get defaultProps() {
        return {
          sureEntities : ['location','network','equipment','endpoint','fcp','path','service']
        }
      }*/
    static get defaultProps() {
        return {
            sureEntities: ['location', 'network', 'equipment', 'endpoint', 'fcp', 'path', 'service'],
            userMessage: "",
            
            onClose: function onClose(e, closeVar) {
        console.log(closeVar);
        if(closeVar){
            try{
            
    console.log("inside onclose defaultprops.."+close);
console.log(this.gridApi);
            for(let i=0; i<globalparams.length; i++){
                globalparams[i].value.api.setColumnDefs(gridOptionsOriginal.columnDefs);//this.gridApi.gridCore.gridOptions.columnApi.setColumnDefs();
     }
                defaultOpenCount=0;
       setTimeout(function () { ReactDOM.unmountComponentAtNode(document.getElementById("equipmentViewWrapper")); }, 500);
            }
            
            catch(err){
                defaultOpenCount=0;
                 setTimeout(function () { ReactDOM.unmountComponentAtNode(document.getElementById("equipmentViewWrapper")); }, 500);
    
            }
            }
        
    }
            
            




        }
    }

    columnStatechanges() {
        var state = this.gridApi.gridCore.gridOptions.columnApi.getColumnState();
       // this.props.gridData.columnPreference(state);
        //this.setState({ columnAdd: state });
    }

    componentWillMount() {
        console.log("this.props inside willmount:::");
        console.log(this.props);
        const {
            gridData
        } = this.props;
        console.log(gridData);
        const {
            gridViewData
        } = this.props;
        
        const {
            EVSearchData
        } = this.props;
        ///*  
        if (gridData.historyBaseFlag) {
            
        }
        //*/
        //Action Creators to retrive rowdata for the selected uuid:
        if (gridData.selectedUUID && gridData.selectedEntityType) {

            let EVsearchPayload;
if(gridData.selectedEntityType=='Equipment'){
    console.log('equipment');
            EVsearchPayload={"request":{"origin":{"@class":gridData.selectedEntityType,"UUID":gridData.selectedUUID},"inclusion":{"gInclude":[gridData.selectedEntityType]},"gDirection":"BOTH"},"response":{"responseType":"SubTree","entity":["RootEquipment", "Equipment", "Location"]},"expand":["Equipment.State"]}}
   else if(gridData.selectedEntityType=='Endpoint'){
       console.log('endpoint');
            EVsearchPayload={"request":{"origin":{"@class":gridData.selectedEntityType,"UUID":gridData.selectedUUID},"inclusion":{"gInclude":[gridData.selectedEntityType, "Equipment","FCP"]},"gDirection":"OUTGOING"},"response":{"responseType":"SubTree","entity":["RootEquipment", "Endpoint"]},"expand":["Equipment.State", "Endpoint.State"]}
   }
   
   
            else if(gridData.selectedEntityType=='FCP'){
                console.log('fcp');
                    EVsearchPayload={"request":{"origin":{"@class":gridData.selectedEntityType,"UUID":gridData.selectedUUID},"inclusion":{"gInclude":[gridData.selectedEntityType, "Equipment","Endpoint"]},"gDirection":"OUTGOING"},"response":{"responseType":"SubTree","entity":["RootEquipment", "FCP"]},"expand":["Equipment.State", "FCP.State"]}
            }
    else{
        console.log(gridData.selectedEntityType);
    //throw error..
    }
            EVSearchData({
                searchUrl: gridData.domain,
                requestHeaders: gridData.requestHeaders ? gridData.requestHeaders : {},
                columnurl: gridData.metadataUrl + gridData.columnurl,
                selectedEntity: gridData.selectedEntity,
                selectedEntityType: gridData.selectedEntityType,
                selectedUUID: gridData.selectedUUID,
                imageIconurl: gridData.imageIconurl,
                externalIconURL: gridData.externalIconURL,
                traversalEntity: gridData.traversalEntity,
                searchPayload: EVsearchPayload,
                nameIcon: gridData.nameIcon,
                columnResponse: gridData.columnResponse,
                clientSideEnabled: gridData.clientSideEnabled
            })
        } else {
            
        }



    }


    onGridReady(i, params) {

globalparams.push(params);
        
        console.log("params inside ongridready: ");
        console.log(globalparams);
        //this.gridApi = params.value.api;
        //this.gridApi = globalparams[i].value.api;
        //console.log("this.gridApi: ");
        //console.log(JSON.stringify(hierarchyArray));
        //var gridObject=this.gridApi;
        //console.log(gridData);
        
        //globalparams[i].value.api
        for(let i=0; i<globalparams.length;i++){
            this.gridApi = globalparams[i].value.api;
        this.gridApi.forEachNode(function (node) {
            //console.log(node);
            
        //params.value.api.selectNode(node, true);
            for(let i=0; i<hierarchyArray.length;i++){
            if(node.data.UUID==hierarchyArray[i].UUID){
                //console.log(node.data.UUID);
                node.setSelected(true);
          //     node.selected=true;
               }
            }
});
    }
        
        
        
        // this.gridColumnApi = params.columnApi;
        this.gridApi.sizeColumnsToFit();
        

var newObjDatachecked = [];
    var newObjDataUnchecked = [];
    var newArrayObj = [];
    newArrayObj = this.columnPreferenceUpdate(newObjDatachecked, newObjDataUnchecked);
        console.log(newArrayObj);
        for(let i=0;i<globalparams.length;i++){
       // this.gridApi=globalparams[i].value.api;
            console.log(globalparams[i]);
        globalparams[i].value.api.gridOptionsWrapper.gridOptions.columnDefs=newArrayObj;
        }
    //this.props.gridData.columnPreference(newArrayObj); //this.gridApi=globalparams[e].value.api;
    }
    //   columnStatechanges(state){
    //  this.props.gridData.columnPreference(state);
    // }

    checkColumnSize() {
        if (!this.columnsResized) {
            this.gridApi.sizeColumnsToFit();
            this.columnsResized = true;
        }
    }
    
    columnResize(gridApi, props) {
        if (props.gridData.selectedEntity === "users") {
            document.getElementById("errors") && ReactDOM.unmountComponentAtNode(document.getElementById("errors"));
            //columnApi.resetColumnState();
            //gridApi.sizeColumnsToFit();
        }
    }



    componentWillReceiveProps(nextProps) {


       
    }
    
    componentDidMount(){
   
    
    }

componentDidUpdate(){
console.log('component updated');
}


    onSelectionChanged(e, i) {
        console.log(e);
        console.log(i);
        const {
            gridData
        } = this.props;
        console.log(this.props);
        this.gridApi=globalparams[e].value.api;
        //var this2= JSON.parse(JSON.stringify(this));
        //var selectedRows = this.gridApi.getSelectedRows(); //gridOptions.api
        if(i.nativeEvent && i.nativeEvent.data){
        var selectedRows=[];selectedRows[0] = i.nativeEvent.data;
           }
           else{
           var selectedRows=[];selectedRows[0] = i.data;
           
           }
        //  var selectedRows=gridOptions.api.getSelectedRows();
        /*if (gridData.passRowData) {
            gridData.passRowData(selectedRows);
        }*/
        console.log("getSelectedRows: ");
        console.log(selectedRows);


        if (selectedRows && selectedRows[0]) {

            console.log(selectedRows[0].SureName);
            var inputObj = selectedRows[0];
            var result = [];
            Object.keys(inputObj)
                .forEach(function eachKey(key) {
                    //console.log(key); // alerts key
                    //console.log(this.state.selectedRowData[key]); // alerts value
                    result.push({
                        'label': key,
                        'value': inputObj[key]
                    });
                });
            console.log(result);
            var html = '';
            html = html + "<div class='header'><div class='title'>" + selectedRows[0].SureName + "</div></div>"
            for (let i = 0; i < result.length; i++) {
                if (result[i].label != 'parentNode' && typeof (result[i].value) != 'object') {
                    html = html + "<div class='container'><div class='panelLabel'>" + result[i].label + "</div><div class='propValue'>" + result[i].value + "</div></div>";
                }

            }

            document.getElementById("detailsDiv").innerHTML = html;
            // var result=[{label: 'a',value:'1'},{label: 'a',value:'1'}];
            /*var html;
            result.forEach(
                
        
            )*/

           
        }



        //this.state.selectedRowData=selectedRows;


    }

   
    traversalEntityFn(currentEntity) {
        var traversalSelectedEntity = this.props;
        traversalSelectedEntity.traversalEntity(currentEntity);
    }
    parentTraversalEntity(entity) {
        var parentEntity = this.props;
        parentEntity.gridData.parentTraversal(entity);
    }

   

    
    renderExpansionPanels(expansionParams, i, hierarchyArrayItem) {
        console.log(hierarchyArrayItem);
        if (!hierarchyArrayItem) {
            hierarchyArrayItem = {
                SureName: '',
                UUID: ''
            };

        }
        var defaultOpenFlag=false;
        console.log(this.props);//.EV.selectedUUIDData
        // if (hierarchyArrayItem.UUID == this.props.EV.selectedUUIDData) {
        //     console.log("defaultopen.."+hierarchyArrayItem.UUID);
        //     defaultOpenFlag = true;

        // }
        /*if(expansionParams[0].defaultOpen==true && defaultOpenCount==0){
            console.log('defaultOpen:'+expansionParams[0].UUID);
            
            
            defaultOpenCount=defaultOpenCount+1;
        }*/
        console.log("this.props.EV.rowData.length ::"+this.props.EV.rowData.length);
        if(i==(this.props.EV.rowData.length-1)){
            defaultOpenFlag = true;
            
        defaultOpenCount=defaultOpenCount+1;
        }
        
        this.hierarchyArrayItem=hierarchyArrayItem;
        console.log("inside renderExpansionPanels");

        let gridOptions2 = {
            columnDefs: this.props.EV.columnData,
            rowData: expansionParams,
            rowSelection: 'single'
        };
        if(i==0){
        gridOptionsOriginal=JSON.parse(JSON.stringify(gridOptions2));
            
        }
        console.log(gridOptionsOriginal);
        
        gridOptions2.columnDefs[0]={
        headerName: 'Severity',
        field: 'AORAlarmState',
        headerClass: 'severity',
        width: 100,
        cellRendererFramework: CustomCellRenderer,
        cellClass: 'colorBar',
        cellStyle: {
          paddingLeft: '0px', // light green
        },
        pinned: 'left',
        comparator: colorComparator,
      };
        
        gridOptions2.columnDefs[2]={
        headerName: 'Operational State',
        field: 'OperationalState',
        headerClass: 'severity',
        width: 100,
        cellClass: 'colorBar',
        cellStyle: {
          paddingLeft: '0px', // light green
        },
        pinned: 'left'
      };

        
              
        //gridOptions2.alignedGrids.push(gridOptions2)
            
        var datagridid = 'datagrid' + i;
        var titleContent=hierarchyArrayItem.SureName;
        if(hierarchyArrayItem.DisplayName){
            console.log("display name found..");
            titleContent=hierarchyArrayItem.DisplayName;}
        return <div class = 'expansionItem' style = {{height: '400px'}} defaultOpen = {defaultOpenFlag} >
            <div class='titleDiv'>{
                titleContent
            } < /div >
            
            < DataGrid id = {datagridid} gridOptions = {gridOptions2} onGridReady = {this.onGridReady.bind(this, i)} onRowClicked={this.onSelectionChanged.bind(this, i)}>
            </DataGrid>
            </div>;

    }



    toggle(event) {
        console.log("toggle called..(expand/collapse called)");
        console.log(event);
        //    /this.viewOpenState = event.type === 'onExpand';
        //this.setState({ viewOpenState: this.viewOpenState });
    };
    onExpand(e) {

        console.log("expanding.." + e.value);
    }

    onCollapse(e) {
        console.log("collapsing.." + e.value);
    }

    onClose(e, closeVar) {
    
        if(closeVar){
               
   try{            
    console.log("inside onclose.."+close);
            console.log(this.gridApi);
            this.gridApi.setColumnDefs(gridOptionsOriginal.columnDefs);
           /* for(let i=0; i<globalparams.length; i++){
                //globalparams[i].value.api.setColumnDefs(gridOptionsOriginal.columnDefs);
                
     }*/
       defaultOpenCount=0;
    setTimeout(function () { ReactDOM.unmountComponentAtNode(document.getElementById("equipmentViewWrapper")); }, 500);
   }
catch(err) {
            defaultOpenCount=0;
            setTimeout(function () { ReactDOM.unmountComponentAtNode(document.getElementById("equipmentViewWrapper")); }, 500);
            
}
       
        
        }
        
    }


 columnPreferenceUpdate(columnCheckedArray, columnUnCheckedArray) {
    console.log(this.state.initialColumnData);
    var columnDataArray = this.state.initialColumnData;
    var visibleColumnArray = [];
    var hiddenColumnArray = [];
    var visibleColumnMainArray = [];
    var availableColumnMainArray = [];
    var changedColumnPreferenceArray = [];
    columnDataArray.map(function (value) {
      for (var i = 0; i < columnCheckedArray.length; i++) {
        for (var k = 0; k < value.length; k++) {
          if (value[k]['field'] == columnCheckedArray[i]) {
            var newObj = {};
            newObj['field'] = columnCheckedArray[i];
            newObj['hide'] = false;
            newObj['displayName'] = value[k]['displayName'];
            visibleColumnArray.push(newObj);
          }
        }
      }
      for (var j = 0; j < columnUnCheckedArray.length; j++) {
        for (var k = 0; k < value.length; k++) {
          if (value[k]['field'] == columnUnCheckedArray[j]) {
            var newObj = {};
            newObj['field'] = columnUnCheckedArray[j];
            newObj['hide'] = true;
            newObj['displayName'] = value[k]['displayName'];
            hiddenColumnArray.push(newObj);
          }
        }
      }
    });
    changedColumnPreferenceArray = visibleColumnArray.concat(hiddenColumnArray);
    return changedColumnPreferenceArray
  }
  onColumnChange(value) {
      console.log("column change..");
    columnSelected = [];
    var columnArraySelected = value.value.checkedColumns;
    var columnArrayUnselected = value.value.unCheckedColumns;
    var finalColumnArray = [];
    finalColumnArray = this.columnPreferenceUpdate(columnArraySelected, columnArrayUnselected);
    if (columnSelected && columnSelected.length == 0) {
      columnSelected.push(finalColumnArray);
    }
    this.props.gridData.columnPreference(finalColumnArray);
  }

    render() {

            console.log("inside render function this.props:"+defaultOpenCount);
console.log(this.props);
        
            if (this.props.EV.columnData && this.props.EV.rowData) {

                // function rowOptions() {
                //   if (passData.gridData.selectedEntity.toLowerCase() === 'network') {
                //     return false;
                //   }
                //   else {
                //     return true;
                //   }
                // }
                //this.props.rowData
                let w = window.width;
                let h = window.height;
                let closeVar=true;
                let DataGrids = [];
                
                let rowModel = 'infinite';
                let passData = this.props;
                
                var uam = false;
                
                
                                //console.log(this.props);
                
                hierarchyArray=this.props.EV.hierarchyArray;
                
                for (var i = 0; i < this.props.EV.rowData.length; i++) {
                    
                    
                    
                    DataGrids.push(this.renderExpansionPanels(this.props.EV.rowData[i], i, this.props.EV.hierarchyArray[i]));
                    console.log("DataGrids:");
                    console.log(DataGrids);
                    console.log(this.props.EV.hierarchyArray);
                }
            if(this.props.EV.rootEquipment.DisplayName){
               var rootEquipmentContent = this.props.EV.rootEquipment.DisplayName;
               }
               else{
               var rootEquipmentContent = this.props.EV.rootEquipment.SureName;
               }
                
                 //Added below code to fix the issue: UNIFIEDINVENTORY-1022
     
       
        console.log(this.props);
        var inputObj = hierarchyArray[hierarchyArray.length-1];
            var result = [];
            Object.keys(inputObj)
                .forEach(function eachKey(key) {
                    //console.log(key); // alerts key
                    //console.log(this.state.selectedRowData[key]); // alerts value
                    result.push({
                        'label': key,
                        'value': inputObj[key]
                    });
                });
            console.log(result);
            var html = '';
            html = html + "<div class='header'><div class='title'>" + inputObj.SureName + "</div></div>"
            for (let i = 0; i < result.length; i++) {
                if (result[i].label != 'parentNode' && typeof (result[i].value) != 'object') {
                    html = html + "<div class='container'><div class='panelLabel'>" + result[i].label + "</div><div class='propValue'>" + result[i].value + "</div></div>";
                }

            }
if(document.getElementById("detailsDiv")){
            document.getElementById("detailsDiv").innerHTML = html;
}
             
        //End of code to fix the issue: UNIFIEDINVENTORY-1022 

                return (

                    <div id = "equipmentViewComponent" >
                    
    
<div id='evclosebuttondiv' title='Close' onClick = {
                                (e) => {
                                    this.onClose(e, closeVar);
                                }
                            }></div>
                    <AppToolbarNew id = "wTitleOverlayPanelEV" title = {{
                            pageTitle: rootEquipmentContent,
                            subTitle: 'Root Equipment'}}
                    overlayPanel = {{ content: < div id = "detailsDiv" dangerouslySetInnerHTML={{__html: html}}>< /div> }} / >
                                <ExpansionPanel id = "expansionPanel"
                            name = "exp"
                            width = {
                                w
                            }
                            height = {
                                40
                            }
                            expandedHeight = {
                                300
                            }
                            onExpand = {
                                (e) => {
                                    this.onExpand(e);
                                }
                            }
                            onCollapse = {
                                (e) => {
                                    this.onCollapse(e);
                                }
                            }
                            showExpansionGap = {false} >
                            {
                                DataGrids
                            }
</ExpansionPanel>


                            <
                            /div>

                        )
                    }
                    else {

                        /*
        
        <div style={{ height: '400px' }} defaultOpen>
        {this.props.rowData[1][0].SureName}
        <DataGrid gridOptions={gridOptions2} id="my-datagrid-id" />
      </div>
        <Snackbar id="snackbarID" dataList={[{message: "ExpansionPanel loaded successfully.."}]} />*/
                        /*{this.ajaxWaiting && this.props.gridData.selectedEntity =='users' && waiting(this.state) }*/
                        return waiting(this.state, this.props.onClose);
                    }

                    // <ProgressIndicatorCircular name="testtt" height='90' defaultOpen={true} onExpand={onExpand()} />

                    function waiting(stateObj, onClose) {
                        console.log(stateObj);
                        return ( <div id="snackbarID"></div> );
                    }


                }

            }


            function mapStateToProps(state) {
                let EVobj = {EV:{}};
                console.log("inside mapstatetoprops:");
                console.log(state);
                
                if (state.equipmentView.columnDataEV && state.equipmentView.rowDataEV) {
if(state.equipmentView.selectedEntityData=="EquipmentHierarchy"){
                   
                    EVobj.EV.columnData = state.equipmentView.columnDataEV;
                    
                    EVobj.EV.rowData = state.equipmentView.rowDataEV;
                    EVobj.EV.traversalEntity = state.equipmentView.traversalEntity;
                    EVobj.EV.selectedEntityData = state.equipmentView.selectedEntityData;

                    
                    EVobj.EV.rootEquipment = state.equipmentView.rootEquipment;
                    EVobj.EV.selectedUUIDData = state.equipmentView.selectedUUIDData;
                    EVobj.EV.hierarchyArray = state.equipmentView.hierarchyArray;
                    
                }
                }
                console.log(EVobj);
                return EVobj;
            }

            

            function mapDispatchToProps(dispatch) {

                return bindActionCreators({
                   
                    
                    EVSearchData: EVSearchData


                }, dispatch);
            }

// CustomCellRenderer for Severity Column
function colorComparator(hexValue1, hexValue2) {
  let hexValueA = hexValue1.substring(1, 7);
  let hexValueB = hexValue2.substring(1, 7);
  hexValueA = parseInt(hexValueA, 16);
  hexValueB = parseInt(hexValueB, 16);

  return hexValueB - hexValueA;
}

function CustomCellRenderer(params) {
  let image;
    
    /*PLANNED
RESERVED
TERMINATED
INSTALLED
RETIRED*/
  if (params.value === 'CRITICAL') {
    image = 'ic_critical_kpi';
  } else if (params.value === 'MINOR') {
    image = 'ic_minor_kpi';
  } else if (params.value === 'MAJOR') {
    image = 'ic_major_kpi';
  } else if (params.value === 'CLEARED') {
    image = 'ic_cleared_kpi';
  }
    else if (params.value === 'WARNING') {
    image = 'ic_warning_kpi';
  }
    else if (params.value === 'INDETERMINATE') {
    image = 'ic_indeterminate_kpi';
  }
    else if (params.value === 'INFORMATION') {
    image = 'ic_info_kpi';
  }
     else if (params.value === 'CONDITION') {
    image = 'ic_condition_kpi';
  }
  return (
    <div
      style={{
        backgroundColor: params.value,
        width: '8px',
        height: '40px',
        marginTop: '-14px',
      }}
    >
      <div title={params.value}
        style={{
          marginLeft: '28px',
          marginTop: '1px'
        }}
      >
        <SvgIcon
          id={'icon-${params.rowIndex}'}
          icon={image}
          retainIconColor
          iconWidth={37}
          iconHeight={37}
        />
      </div>
    </div>
  );
}




            export default connect(mapStateToProps, mapDispatchToProps)(EquipmentListModal);
