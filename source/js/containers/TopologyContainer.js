import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getDiagraphData, getPerspective } from '../../actions/topologyAction';
//Below csf or loader we should get as the props
import { ProgressIndicatorCircular, SelectItem } from '@nokia-csf-uxr/csfWidgets'

import Diagraph from './diaGraphComponent';

class TopologyComponent extends Component {
    constructor(props) {
        super(props)
        //state with default cytoscape values
        this.state = {
            cyLout: { name: 'dagre', rankDir: "TB" },
            layoutName: 'dagre',
            diaData: null,
            showLoader: true,
            perspectiveData: null,
            selectedPerspective: null
        }

    }
    componentWillMount() {
        const {
            getDiagraphData,
            entityID,
            entityType,
            headers,
            getPerspective,
            ihubAPI
         } = this.props;

        // based on entity type we have to get perspective drop-down
        getPerspective({ entityType, headers, ihubAPI });
    }
    componentDidMount() { }

    componentWillReceiveProps(nextProps, prevProps) {
        let {
            getDiagraphData,
            entityID,
            entityType,
            headers, 
            PrimaryLabel,
            ihubAPI
         } = this.props;

        if (nextProps.diaData != this.props.diaData) {
            this.setState({
                diaData: nextProps.diaData,
                showLoader: false
            });
        }

        if (nextProps.perspectiveData != this.props.perspectiveData) {
            let _perspective = nextProps.perspectiveData;
            let _index = 0//_perspective.length - 1;

            this.setState({
                perspectiveData: _perspective,
                selectedPerspective: _perspective[_index].value
            });

            entityType = _perspective[_index].value == "raw" ? PrimaryLabel : entityType;

            getDiagraphData({
                entityID,
                entityType,
                perspective: _perspective[_index].value,
                headers,
                uri: _perspective[_index].uri,
                ihubAPI
            });
        }
    }
    onChangePerspective(e) {
        let {
            getDiagraphData,
            entityID,
            entityType,
            headers,
            PrimaryLabel,
            ihubAPI } = this.props;
        let { value, uri } = e.nativeEvent;

        entityType = value == "raw" ? PrimaryLabel : entityType;

        this.setState({ diaData: null, selectedPerspective: value })
        getDiagraphData({
            entityID,
            entityType,
            perspective: value,
            headers,
            uri,
            ihubAPI
        })
    }
    render() {
        const { diaData, showLoader, perspectiveData, selectedPerspective } = this.state;
        if (diaData)
            return (
                <div style={{ height: '100%' }}>
                    <div style={{ height: '35px', padding: "5px 10px 0", "box-sizing": "border-box" }}>
                        <SelectItem id="perspective" width={150}
                            name="perspective"
                            // label="Perspective"
                            data={perspectiveData}
                            onChange={this.onChangePerspective.bind(this)}
                            selectedItem={selectedPerspective}
                        />
                    </div>
                    <div style={{ height: 'calc(100% - 40px)' }}>
                        <Diagraph
                            {...this.props}
                            layout={this.state.cyLout}
                            diagraph={diaData}
                            close={true}
                        />
                    </div>

                </div>
            );
        else
            return (<div style={{
                "display": "flex",
                "flexFlow": "row wrap",
                "top": "50%",
                "left": "50%",
                "position": "absolute",
                "justifyContent": "space-between",
                "transform": "translate(-50%,-50%)",
            }}>
                <div id="xxlarge" style={{ display: "inline", margin: "auto", textAlign: "center" }}>
                    <div style={{ padding: "10px 0", "fontFamily": "Nokia Pure Text Regular,Arial,sans-serif" }}>loading . . .</div>
                    <ProgressIndicatorCircular id="progressIndicatorCircularID" spinner="right" className="" css={{
                        small: false, medium: false, large: false, xlarge: false, xxlarge: true
                    }} />
                </div>
            </div>)


    }
}
const mapStateToProps = state => {
    return ({
        diaData: state.topology.diaData,
        perspectiveData: state.topology.perspectiveData
    });
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        getDiagraphData: getDiagraphData,
        getPerspective: getPerspective
    }, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(TopologyComponent);
