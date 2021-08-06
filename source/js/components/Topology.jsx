import React, { Component } from 'react';
import { Provider } from 'react-redux';
import store from '../store/store';
import TopologyComponent from "../containers/Topology/TopologyContainer";

class Topology extends Component {
    componentWillMount() {

    }
    render() {
        return (
            <Provider store={store} >
                <TopologyComponent {...this.props}/>
            </Provider>
        );
    }

}

export default Topology;