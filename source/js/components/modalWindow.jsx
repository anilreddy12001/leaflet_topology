/**
 *  
 * Component : modalPopup.js
 *
 * @version 1.0
 * @author Gowtham.S
 * @description designed for custom hook
 * @ignore
 */

import React, { Component } from 'react';
import { Dialog, IconButton, DataGrid, Snackbar, ProgressIndicatorCircular } from "@nokia-csf-uxr/csfWidgets";
import "../../styles/modalWindow.css"

//Add Provider to the root
class ModalWindow extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        console.log(React);
        if(document.getElementsByClassName("header-container")[0]){var headerContainerElement = document.getElementsByClassName("header-container")[0];
        headerContainerElement.style.backgroundColor = this.props.headerColor
        }
        if(this.refs && this.refs.iframeContent){this.refs.iframeContent.onload = () => {
            var ifarmeObj = {
                type: "ACCESS_CUSTOM_HOOK",
                payload: {
                    userName: this.props.userName,
                    product: this.props.title.replace("CH:",""),
                    dataSource: this.props.iframeDataSource,
                    data: this.props.data,
                    customHookObject: this.props.customHookObject
                    
                    
                }
            }

            this.refs.iframeContent.contentWindow.postMessage(ifarmeObj, this.props.iframeSource);
        }
    }
    }

    render() {
        console.log(this.props);
        var columnData; //if launched from component: launchPoint=fromComponent. Else if launched from an iframe, launchPoint=iframe
        if(this.props.launchPoint=='iframe' && this.props.rowData && this.props.columnData && this.props.rowData.length>0 && this.props.columnData.length>0 ){
            
               columnData=this.props.columnData;
               
        return (
                
                    <div id="containerBody">
                        <iframe ref="iframeContent" src='about:blank' style={{height: '50%', display:'none'}}></iframe>
                        
                        <DataGrid id='DataGridModalWindow' gridOptions={{
            columnDefs: columnData,
            rowData: this.props.rowData,
            enableFilter: false,
            enableServerSideSorting: false,
            enableSorting: true,
            enableStatusBar: true,
            alwaysShowStatusBar: false,
            enableRangeSelection: false,
            enableColResize: true               
                            }} ></DataGrid>
                    </div>
            
               
        )
        }
        
        else{
           return (
                <Dialog {...this.props} close>
                    <div id="containerBody">
                        <iframe ref="iframeContent" src={this.props.iframeSource} ></iframe>
                        
                    </div>
                </Dialog>
        ) 
            
            
        }
    }
}


export default ModalWindow