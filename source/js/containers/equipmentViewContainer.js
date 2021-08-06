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
    TopologyMap,
    DetailsPanel,
    DataGridList
} from '../sureUIComponents.js';
import {
    gridViewData,
    unmountGridData,
    traversalAction,
    EVSearchData
} from '../actions/equipmentViewAction.js';
import UamHelper from "../helpers/uam/UamHelper";
//import gridOptions2 from "@nokia-csf-uxr/csfWidgets/stories/GridOptions";
import OverlayLoader from 'react-overlay-loading/lib/OverlayLoader'
import {
    UAM_LABELS
} from "../helpers/uam/uamConstants"
//Style
import style from '../../styles/dataGrid.css';
let gridApi;
let gridColumnApi;
var entityType;
let traversalData;
var hierarchyArray;
var globalparams=[];
/**
 * 
 * @class EquipmentList
 * @description Container Class
 * @memberof sureUI.components
 **/

class EquipmentList extends Component {

    constructor(props) {
        //console.log("@nokia-csf-uxr"+@nokia-csf-uxr);
        super(props);
        //this.updateData = this.updateData.bind(this);
        this.columnStatechanges = this.columnStatechanges.bind(this);
        this.uamHelper = new UamHelper();
        this.state = {
            data: '',
            loading: true,
            historyBaseFlag: false,
            selectedRow: '',
            selectedMethod: '',
            initialColumnData: []
        };
        this.ajaxWaiting = true;
        this.UAM_LABELS = UAM_LABELS;
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
            passRowDataDetail: function passRowData(selectedRowData) {

                if (window.parent)
                    window.parent.postMessage(selectedRowData, "*");

                return (selectedRowData);

            }




        }
    }

    columnStatechanges() {
        var state = this.gridApi.gridCore.gridOptions.columnApi.getColumnState();
        //this.props.gridData.columnPreference(state);
        // this.setState({ columnAdd: state });
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
            unmountGridData
        } = this.props;
        const {
            EVSearchData
        } = this.props;
        ///*  
        if (gridData.historyBaseFlag) {
            this.setState({
                historyBaseFlag: gridData.historyBaseFlag
            });
        }
        //*/
        //Action Creators to retrive rowdata for the selected uuid:
        if (gridData.selectedUUID && gridData.selectedEntityType) {
            let EVsearchPayload;
if(gridData.selectedEntityType=='Equipment'){
    console.log('equipment');
            EVsearchPayload={"request":{"origin":{"@class":gridData.selectedEntityType,"UUID":gridData.selectedUUID},"inclusion":{"gInclude":[gridData.selectedEntityType]},"gDirection":"BOTH"},"response":{"responseType":"SubTree","entity":["RootEquipment", "Equipment", "Location"]},"expand":["Equipment.State","Endpoint.State"]}}
   else if(gridData.selectedEntityType=='Endpoint'){
       console.log('endpoint');
            EVsearchPayload={"request":{"origin":{"@class":gridData.selectedEntityType,"UUID":gridData.selectedUUID},"inclusion":{"gInclude":[gridData.selectedEntityType, "Equipment","FCP"]},"gDirection":"OUTGOING"},"response":{"responseType":"SubTree","entity":["RootEquipment", "Endpoint"]},"expand":["Equipment.State"]}
   }
   
   
            else if(gridData.selectedEntityType=='FCP'){
                console.log('fcp');
                    EVsearchPayload={"request":{"origin":{"@class":gridData.selectedEntityType,"UUID":gridData.selectedUUID},"inclusion":{"gInclude":[gridData.selectedEntityType, "Equipment","Endpoint"]},"gDirection":"OUTGOING"},"response":{"responseType":"SubTree","entity":["RootEquipment", "FCP"]},"expand":["Equipment.State"]}
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
                stateConfig: gridData.stateConfig,
                passRowData: gridData.passRowData,
                editRow: gridData.editRow,
                deleteRow: gridData.deleteRow,
                traversalEntity: gridData.traversalEntity,
                dataCount: gridData.dataCount,
                searchPayload: EVsearchPayload,
                rowMenu: gridData.rowMenu,
                nameIcon: gridData.nameIcon,
                columnResponse: gridData.columnResponse,
                clientSideEnabled: gridData.clientSideEnabled
            })
        } else {
            
        }


        //unmountGridData({});


    }


    onGridReady(params) {

globalparams.push(params);
        console.log("params inside ongridready: ");
        //console.log(params);
        this.gridApi = params.value.api;
        //console.log("this.gridApi: ");
        //console.log(JSON.stringify(hierarchyArray));
        //var gridObject=this.gridApi;
        //console.log(gridData);
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
        
        // this.gridColumnApi = params.columnApi;
        this.gridApi.sizeColumnsToFit();
        /*    // this.gridApi.gridCore.gridOptions.onColumnVisible = this.columnStatechanges;
            const checkColumnSizeFunc = this.checkColumnSize.bind(this);
            this.updateData(this.props.rowData, this.props.selectedEntity, checkColumnSizeFunc);
            if (this.props.gridData.traversalClick) {
              const { traversalAction } = this.props;
              traversalAction({

                url: this.props.gridData.domain, //+ "graphSearch?limit=100&page=1",
                imageIconurl: this.props.gridData.imageIconurl,
                requestHeaders: this.props.gridData.requestHeaders ? this.props.gridData.requestHeaders : {},
                payload: this.props.gridData.traversalClick,
                method: this.props.gridData.method,
                columnUrl: this.props.gridData.metadataUrl + this.props.gridData.columnurl,
                selectedEntity: entityType

              });

            }
            //this.gridApi.gridCore.gridOptions.onColumnVisible = this.columnStatechanges;
        */

var newObjDatachecked = [];
    var newObjDataUnchecked = [];

    var newArrayObj = [];
    newArrayObj = this.columnPreferenceUpdate(newObjDatachecked, newObjDataUnchecked);
    this.props.gridData.columnPreference(newArrayObj);
    
    }
    //   columnStatechanges(state){
    //  this.props.gridData.columnPreference(state);
    // }
    dataCountFn(count) {
        const {
            gridData
        } = this.props;
        if (gridData.dataCount) {
            gridData.dataCount(count);
        }
    }
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
console.log("inside willreceiveprops");
        this.setState({
            initialColumnData: []
        });
        if ((this.props.rowData !== nextProps.rowData) && this.gridApi != null) {

            //this.updateData(nextProps.rowData, nextProps.currentTraversalEntity, this.gridApi);
            this.gridApi.refreshCells({
                force: true
            });
            // this.setState({changed: true});
        }
        if ((this.props.columnData !== nextProps.columnData) && Object.keys(nextProps.columnData).length > 0) {
            this.setState({
                initialColumnData: [...this.state.initialColumnData, nextProps.columnData]
            });
        }

        if ((this.props.columnData !== nextProps.columnData) && this.gridApi != null) {
            // this.gridApi.gridCore.gridOptions.api.getColumnState();
            // var colState = this.gridColumnApi.getColumnState();

            this.gridApi.setColumnDefs(nextProps.columnData);
            // this.columnStatechanges(colState);
            this.gridApi.refreshHeader();
            this.gridApi.sizeColumnsToFit();

        }

        if ((this.props.rowData !== nextProps.rowData) && (this.props.columnData !== nextProps.columnData) && this.props.gridData.selectedEntity != 'users') {
            this.setState({
                data: nextProps.rowData,
                loading: false
            });
        }
    }

  

    onSelectionChanged(e, j) {
        console.log(e);
        console.log(j);
        const {
            gridData
        } = this.props;
        console.log(this.props);
        this.gridApi=globalparams[e].value.api;
        //var this2= JSON.parse(JSON.stringify(this));
        var selectedRow = this.gridApi.getSelectedRows(); //gridOptions.api
        //var selectedRows=[];selectedRows[0] = j.nativeEvent.data;
        /*if (gridData.passRowData) {
            gridData.passRowData(selectedRows);
        }*/
        console.log("getSelectedRows: ");
        console.log(selectedRow);


        if (selectedRow && selectedRow[0]) {

            console.log(selectedRow[0].SureName);
            var inputObj = selectedRow[0];
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
            html = html + "<div class='header'><div class='title'>" + selectedRow[0].SureName + "</div></div>"
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

            /*var props= result;
              var detailsPanel = SUREUI.components.DetailsPanel;
            var detailsPanelComponent = React.createElement(detailsPanel, props);
                ReactDOM.render(detailsPanelComponent, document.getElementById("detailsPanel"));*/
            //this.setState({selectedRowData: 'testt'});  
        }



        //this.state.selectedRowData=selectedRows;


    }



    //Edit call back
    editRowFn(params) {

        const {
            gridData
        } = this.props;
        gridData.editRow(params);
    }
    deleteRowFn(params) {
        const {
            gridData
        } = this.props;
        gridData.deleteRow(params);
        // var finalRowData = this.props;
        //  finalRowData.deleteRow(params);
    }
    traversalEntityFn(currentEntity) {
        var traversalSelectedEntity = this.props;
        traversalSelectedEntity.traversalEntity(currentEntity);
    }
    parentTraversalEntity(entity) {
        var parentEntity = this.props;
        parentEntity.gridData.parentTraversal(entity);
    }

    //Grid Update from traversal Menu 

    entityClick(params) {
        const {
            traversalAction
        } = this.props;
        var menuData = this.props;
        for (let irow = 0; irow < params.items.length; irow++) {
            let row = params.items[irow];
            entityType = params.name;

            //creating a payload for traversal
            var payload = {
                "request": {
                    "level": 1
                },
                "response": {
                    "responseType": "List",
                    "entity": [entityType],
                    "selfJoin": "true",
                    "responseFilter": [{
                            "for": row.data.PrimaryLabel,
                            "filter": ["UUID;NOT EQUAL;" + row.data.UUID]
          }
          ]
                },
                "expand": ["Capacity", "State"],
                "searchFilter": [{
                        "for": row.data.PrimaryLabel,
                        "filter": ["UUID;EQUALS;" + row.data.UUID]
        }
        ]
            };


            //for traversal from one entity to similar subentity
            if (row.data.PrimaryLabel == entityType && entityType != undefined) {
                if (payload && payload.request) {
                    (payload.request.gDirection = entityType == "Path" || entityType == "Service" ? "OUTGOING" : "INCOMING");
                }
            }
            //for traversal from Location to Equipment
            if (row.data.PrimaryLabel == "Location" && entityType != undefined && entityType == "Equipment") {
                if (payload && payload.response) {
                    payload.response.levelData = {
                        level: ["0"]
                    };

                }

            }
            if (row.data.PrimaryLabel != entityType) {
                delete payload.request.level;
            }
            var traversalMenuData = [entityType, row.data.PrimaryLabel, payload];
            this.traversalEntityFn(traversalMenuData);
            traversalData = [entityType, row.data.PrimaryLabel, payload];

            //ajax call for traversal
            traversalAction({

                url: menuData.gridData.domain, //+ "graphSearch?limit=100&page=1",        
                imageIconurl: menuData.gridData.imageIconurl,
                requestHeaders: menuData.gridData.requestHeaders ? menuData.gridData.requestHeaders : {},
                payload: payload,
                externalIconURL: menuData.gridData.externalIconURL,
                stateConfig: menuData.gridData.stateConfig,
                method: menuData.gridData.method,
                columnUrl: menuData.gridData.metadataUrl + menuData.gridData.columnurl,
                selectedEntity: entityType

            });
        }
    }

    menuTraversalFn(params) {
        this.setState({
            selectedRow: params.value.items[0].data,
            selectedMethod: params.value.name
        });
        if (params.value.name == 'Edit') {
            for (let irow = 0; irow < params.value.items.length; irow++) {
                let row = params.value.items[irow];
                this.editRowFn(row);
            }
        } else if (params.value.name == 'Delete' || params.value.name == 'Delete ') {
            this.deleteRowFn(params.value.items);
        } else if (params.value.name == 'Add') {
            //
        } else if (params.value.name == '') {
            // do nothing
        } else if (params.value.name == 'Lock' || params.value.name == 'Unlock') {
            const {
                domain,
                requestHeaders
            } = this.props.gridData;
            const {
                userAction
            } = this.props;
            let status = params.value.name == 'Unlock' ? 'Active' : 'Lock';
            var component = React.createElement(progressPanal);
            ReactDOM.render(component, document.getElementById("errors"));
            userAction({
                method: 'PUT',
                url: domain + "tenants/users/" + params.value.items[0].data.Username + "?tenantId=" + requestHeaders.tenantId + "&status=" + status,
                requestHeaders: requestHeaders,
                payload: null,
                operation: 'UPDATE_USER'
            })
        } else if (params.value.name == 'Reset password') {
            var component = React.createElement(progressPanal);
            ReactDOM.render(component, document.getElementById("errors"));
            const {
                domain,
                requestHeaders
            } = this.props.gridData;
            const {
                userAction
            } = this.props;
            userAction({
                method: 'PUT',
                url: domain + "tenants/users/" + params.value.items[0].data.Username + "/resetPassword?tenantId=" + requestHeaders.tenantId,
                requestHeaders: requestHeaders,
                payload: null,
                operation: 'UPDATE_USER'
            })
        } else {

            if (Array.isArray(this.props.gridData.customTraversal)) {

                let filteredObj = this.props.gridData.customTraversal.filter(function (item) {
                    return item.name == params.value.name
                })

                filteredObj = filteredObj && filteredObj[0] && filteredObj[0].callbackFunc;


                if (params.value.items[0].data) {
                    typeof filteredObj == "function" ? filteredObj(params.value.name, params.value.items[0].data) : this.entityClick(params)
                }

            } else
                this.entityClick(params)
        }
        if (params.state) {
            console.log('Button State', params.state);
        }


    }

    openOverlayPanel() {
        console.log("overlaypanel..");
       

    }
    renderExpansionPanels(expansionParams, i, hierarchyArrayItem) {
 
        console.log(hierarchyArrayItem);
        if (!hierarchyArrayItem) {
            hierarchyArrayItem = {
                SureName: '',
                UUID: ''
            };

        }
        var defaultOpenFlag;
        if (hierarchyArrayItem.UUID == this.props.EV.selectedUUIDData) {
            defaultOpenFlag = true;

        }

        
        var uam = false;
        var passData = this.props;
        var rows = this.props.rowData;
        
        var rowSelectionMode = passData.gridData.selectedEntity.toLowerCase() == 'users' ? 'single' : 'multiple';
        const uamEntities = ['tenants', 'users', 'usergroups', 'groups', 'profiles'];
        if (uamEntities.some(a => a === passData.gridData.selectedEntity.toLowerCase())) {
            uam = true;
            this.props.columnData.map(item =>
                ((item.field == "SureName" || item.field == "Username" && item.hasOwnProperty("cellRendererFramework")) ? (item.headerClass = 'headerWithIcon') : item)
            );
        }
        const {
            traversalAction
        } = this.props;
        const {
            gridData
        } = this.props;

        function rowOptions() {
            if (uam) {
                return false;
            } else if (passData.gridData.selectedEntity.toLowerCase() === 'network') {
                return false;
            } else {
                return true;
            }
        }
        let serverSideSort = true;
        let rowModel = 'infinite';
        if (passData.gridData.clientSideEnabled) {
            serverSideSort = false;
            rowModel = 'inMemory';
            this.dataCountFn(rows ? this.props.EV.rowData.length : rows.length);
        }
        this.hierarchyArrayItem=hierarchyArrayItem;
        console.log("inside renderExpansionPanels");

        let gridOptions2 = {
            columnDefs: this.props.EV.columnData,
            rowData: expansionParams,
            rowSelection: 'single'
        };
        
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
            
        var datagridid = 'datagrid' + i;
        return <div class = 'expansionItem' style = {{height: '400px'}} defaultOpen = {defaultOpenFlag} >
            {
                hierarchyArrayItem.SureName
            } < br / >
            
            < DataGrid id = {datagridid} gridOptions = {gridOptions2} onGridReady = {this.onGridReady.bind(this)} onRowSelected={this.onSelectionChanged.bind(this, i)}>
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
        console.log(closeVar);
        if(closeVar){
               
               
    console.log("inside onclose.."+close);
            //var detailPanelElement = document.getElementById("equipmentView")
            /*detailPanelElement.classList.remove("expanded");*/
     
    
    ReactDOM.unmountComponentAtNode(document.getElementById("equipmentViewWrapper"));
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

            console.log("inside render function this.props:");
console.log(this.props);
        console.log(JSON.stringify(this.props.EV.rowData));
            if (this.props.EV && this.props.EV.rowData) {

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
                let serverSideSort = true;
                let rowModel = 'infinite';
                let passData = this.props;
                
                var uam = false;
                var rowSelectionMode = passData.gridData.selectedEntity.toLowerCase() == 'users' ? 'single' : 'multiple';
                const uamEntities = ['tenants', 'users', 'usergroups', 'groups', 'profiles'];
                if (uamEntities.some(a => a === passData.gridData.selectedEntity.toLowerCase())) {
                    uam = true;
                    this.props.columnData.map(item =>
                        ((item.field == "SureName" || item.field == "Username" && item.hasOwnProperty("cellRendererFramework")) ? (item.headerClass = 'headerWithIcon') : item)
                    );
                }
                const {
                    traversalAction
                } = this.props;
                if (passData.gridData.clientSideEnabled) {
                    serverSideSort = false;
                    rowModel = 'inMemory';
                    
                }
                //console.log(this.props);
                
                hierarchyArray=this.props.EV.hierarchyArray;
                //console.log(this.props.rowData[0]);
                for (var i = 0; i < this.props.EV.rowData.length; i++) {
                    
                    
                    
                    DataGrids.push(this.renderExpansionPanels(this.props.EV.rowData[i], i, this.props.EV.hierarchyArray[i]));
                    console.log("DataGrids:");
                    console.log(DataGrids);
                    console.log(this.props.EV.hierarchyArray);
                }

                //console.log(JSON.stringify(this.props.rowData));






                return (

                    <
                    div id = "equipmentViewComponent" >
                    
    

                    <
                    AppToolbarNew id = "wTitleOverlayPanel"
                    title = {
                        {
                            pageTitle: this.props.EV.rootEquipment.SureName,
                            subTitle: 'Root Equipment'
                        }
                    }
                    overlayPanel = {
                        {
                            onToggle: this.openOverlayPanel(),
                            content: < div id = 'detailsDiv' > < /div>}} / >

                                <
                                ExpansionPanel id = "expansionPanel"
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
                            showExpansionGap = {
                                false
                            } >

                            {
                                DataGrids
                            }


                            <
                            /ExpansionPanel>


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
                        return waiting(this.state);
                    }

                    // <ProgressIndicatorCircular name="testtt" height='90' defaultOpen={true} onExpand={onExpand()} />

                    function waiting(stateObj) {
                        return ( <div><ProgressIndicatorCircular /></div>     )
                    }


                }

            }


            function mapStateToProps(state) {
                let EVobj = {EV:{}};
                console.log("inside mapstatetoprops:");
                console.log(state);
                if (state.equipmentView.columnData && state.equipmentView.rowData) {
if(state.equipmentView.selectedEntityData=="EquipmentHierarchy"){
                    console.log("state.equipmentView.columnData: ");
                    console.log(state.equipmentView.columnData);
                    EVobj.EV.columnData = state.equipmentView.columnData;
                    
                    EVobj.EV.rowData = state.equipmentView.rowData;
                    EVobj.EV.traversalEntity = state.equipmentView.traversalEntity;
                    EVobj.EV.selectedEntityData = state.equipmentView.selectedEntityData;
                    EVobj.EV.selectedSureName = state.dataGrid.selectedEntityData;

                    EVobj.EV.currentTraversalEntity = state.dataGrid.currentTraversalEntity;
                    EVobj.EV.rootEquipment = state.equipmentView.rootEquipment;
                    EVobj.EV.selectedUUIDData = state.equipmentView.selectedUUIDData;
                    EVobj.EV.hierarchyArray = state.equipmentView.hierarchyArray;
                    //gridDataobj.ajaxWaiting = state.dataGrid.ajaxWaiting;
                }
                }
                console.log(EVobj);
                return EVobj;
            }

            

            function mapDispatchToProps(dispatch) {

                return bindActionCreators({
                    unmountGridData: unmountGridData,
                    traversalAction: traversalAction,
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




            export default connect(mapStateToProps, mapDispatchToProps)(EquipmentList);
