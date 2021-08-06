import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ToggleSwitch, FileUploader, Button, Snackbar } from "@nokia-csf-uxr/csfWidgets";
import Wrapper from "../components/wrapper.jsx"
import "../../styles/addProfiles.css"
import {addData,resetStore, deleteData, saveProfile } from '../actions/addProfilesAction.js';
import { ToastContainer, toast } from 'react-toastify';
import { AlertDialogError } from '@nokia-csf-uxr/csfWidgets';
import { ProgressIndicatorCircular } from '@nokia-csf-uxr/csfWidgets';



class AddProfilesRoot extends Component {

    constructor(props) {
        super(props);
    }
    
    onFileSelect(e) {
        const {addData} = this.props;
        addData(e);
    }
    
    onFileDelete(fileName){
        const {deleteData} = this.props;
        deleteData(this.props.data, fileName.value);
    }
    
    
     componentDidUpdate(prevProps, prevState) {
        ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularID"));
          if(this.props.checkFlag){
              var props= this.props;
           setTimeout(function(){
               props.resetStore();
            props.unMount();
           },1500);    
          
        }
     }
    
    componentWillReceiveProps(nextProp) {
        if(nextProp.message){
          /* toast(nextProp.message, {
            className: 'darker-toast',
            progressClassName: 'transparent-progress'
        });*/
            if(nextProp.checkFlag){
                if(nextProp.message.indexOf(":") > -1){
                    var msg =nextProp.message.split(":")[0].trim();
                    var name = nextProp.message.split(":")[1].trim();
                }else {var msg = nextProp.message}
              /* this.renderInfoDialog("Success",nextProp.message); */
                  toast((this.props.propsCode[msg]+" "+(name?name:"")), {
            className: 'darker-toast',
            progressClassName: 'transparent-progress'
        });
            }else {
                this.renderErrorDialog(this.props.propsCode.ADD_PROFILE_FAILED,nextProp.message); 
            }
          
           }
       if( nextProp &&  nextProp.data && nextProp.data.length!=0){
          nextProp.data[0].uploadDate=new Date().toDateString();
          }
        
    }

    renderFileUploader() {
        return (
            <div id="fileUploaderContainer">
                <div>
                    <div id="fileUploaderLabel">Profile file</div>
                    <div id="fileUploaderHelperText">Upload a profile file.</div>
                </div>
                <div id="fileUploaderInnerContainer">
                    <div id="fileUploaderWrapper">
                        <FileUploader data={this.props.data} denyMultipleFileDrop = {true} allowOnlyOneFileInUploader = {true} dropZoneHintText = "Only one file to be uploaded. Supported file formats .JSON" onFileSelect={this.onFileSelect.bind(this)} fileDeleteResponse={this.onFileDelete.bind(this)} />
                        
                    </div>
                </div>
            </div>
        )
    }
/*<div id="fileUploaderHelperText1">Supported file formats .JSON</div>*/
    onSave(props){
        const {data} = this.props;
        const{saveProfile} = this.props;
        saveProfile(data,this.props);
    }

    onCancel(props){
       // const {unmount} = this.props.unMount;
         this.props.resetStore();
        this.props.unMount();
       
    }

 renderErrorDialog(title, detailedMsg) {
       /* var aboutOptions = {
            title: title,
            infoText: detailedMsg,
            buttonLabel: 'OK',
            onClose: function () {
               
                ReactDOM.unmountComponentAtNode(document.getElementById("infoDialog"));
                
                
            }
        };*/
     var aboutOptions ={
            id: "errorDialog"
            , title: title
            , errorText: detailedMsg 
            /*, detailsText: errorParameter + detailedError*/ 
              ,onClose: function () {
               
                ReactDOM.unmountComponentAtNode(document.getElementById("infoDialog"));
                
                
            }
        };

            var component = React.createElement(AlertDialogError, aboutOptions);

            ReactDOM.render(component, document.getElementById("infoDialog"));
        }



    render() {
        return (
            <div id="addProfiles">
                <Wrapper headerText="Add Profile" onSave={this.onSave.bind(this)} onCancel={this.onCancel.bind(this)}>
                    <div id="card">
                        {this.renderFileUploader()}
                    </div>
                </Wrapper>
             
            </div>
            
        )
    }
}
//   {this.props.message && <Snackbar id="snackbarID" dataList={[{message: this.props.message}]} />}
function mapStateToProps(state) {
    return state.addProfiles;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
            addData: addData,
            deleteData: deleteData,
            saveProfile: saveProfile,
            resetStore : resetStore
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AddProfilesRoot);