import React, { Component, Fragment } from 'react';
import cytoscape from 'cytoscape';

/**External layout  */
import dagre from 'cytoscape-dagre';

/**extension for cytoscape */
import panzoom from 'cytoscape-panzoom';
import expandCollapse from 'cytoscape-expand-collapse';
import { ProgressIndicatorCircular, SelectItem } from '@nokia-csf-uxr/csfWidgets';
// import Location from '../../images/'
// import Path from '../images/dv_Path.svg';
// import FCP from '../images/dv_FCP.svg';
// import Endpoint from '../images/dv_Endpoint.svg';
// import Service from '../images/dv_Service.svg';
// import Equipment from '../images/dv_Equipment.svg';
// import expand from '../images/fit.svg'

// import ele_styleSheet from "../common/nodeStyle.json";

// import '../styles/topology.css';

//binding extension to cytoscape library
cytoscape.use(dagre);
expandCollapse(cytoscape);
panzoom(cytoscape);

class Diagarph extends Component {
    constructor(props) {
        super(props);
        this.expandNode = this.expandNode.bind(this);
        this.collapseNode = this.collapseNode.bind(this);
        this.layoutCall = this.layoutCall.bind(this);
        this.destroy = this.destroy.bind(this);
        this.parseDiagraph = this.parseDiagraph.bind(this);
        this.loadCytoscape = this.loadCytoscape.bind(this);
        this.bindCompunding = this.bindCompunding.bind(this);
        this.initLayout = this.initLayout.bind(this);
        // this.getDetails = this.getDetails.bind(this);
        this.destroy = this.destroy.bind(this);
        this.state = {
                 layout: null,
                 details: null
            }
            this.cy = null;
            this.cyCompundAPI = null;
    }
    // 

    expandNode(arrayOfNodesEdges) {
        //Show nodes if any attached to click or user interested nodes
        this.cy.add(arrayOfNodesEdges);
        this.layoutCall();
    }
    collapseNode(arrayOfNodesEdges) {
        //hide nodes if any attached to click(on uncheck) or user not interested nodes
        arrayOfNodesEdges.forEach((val, i) => {
            this.cy.remove(this.cy.getElementById(val.data.id))
        });
        this.layoutCall();
    }
    layoutCall() {
        //Required on diagraph nodes or edges update 
        //Else all node or edges are shown at one place 
        this.cy.layout(this.state.layout).run();
    }
    destroy() {
        this.cy && this.cy.destroy() && (this.cy = null);
    }
    parseNodesFn(nodesAr, nodes) {
        let parsedNodes = [];
        nodesAr.forEach((val, i) => {
            //take copy to avoid the accidental changes in original object, since we are constructing structure with respect to plguins
            let _val = Object.assign({}, nodes[val]);

            let attributes = Object.assign({}, _val.attributes);
            delete _val.attributes;

            /* //Below code is used when parsing all diagrph at once
                    let dGraph;
                    if (_val.diagraph) {
                    let diagraph = this.state.data;
                    dGraph = this.parseNE(diagraph[_val.diagraph]);
                    }
            */
            let dataClone = Object.assign({},
                _val,
                attributes
            );
            // dataClone    
            dataClone["id"] = val;
            dataClone["parent"] = _val["_classifiers"];//helps in grouping of nodes
            dataClone["_type"] = _val["_type"];


            //data= {
            //     // ..._val,
            //     // ...attributes,//spread all attributes
            //     id: val,
            //     parent: _val["_classifiers"],//helps in grouping of nodes
            //     _type: _val["_type"]//helps in styling of each node,                     
            //     // NOTE: We are not injecting the actual object for the style here, because only the Cytoscape plugin must be labeled and the parsing data for the style is provided separately to the plugins
            //     /*Below properties for generic approch not stick to any plugin 
            //     "_type": diagraph.diagraphView.nodeViewMetadata[val[1]._type] // gets styles from node view & injects here 
            //      level:_val["level"]
            //      */
            //     //TBD need event to trigger expansion
            // }
            parsedNodes.push({
                group: 'nodes',
                "data": dataClone
            })
        });
        return parsedNodes;
    }
    parseEdgesFn(edgesAr, edges) {
        let parsedEdges = [];
        edgesAr.forEach((val, i) => {
            let _val = Object.assign({}, edges[val]);

            let attributes = Object.assign({}, _val.attributes);
            delete _val.attributes;
            let dataClone = Object.assign({},
                _val,
                attributes
            );
            // dataClone    
            dataClone["id"] = val;
            dataClone["source"] = _val["from"];//helps in grouping of edges
            dataClone["target"] = _val["to"];
            dataClone["_type"] = _val["_type"];

            // {
            //     // ..._val,
            //     // ...attributes,
            //     id: val,
            //     "source": _val["from"],
            //     "target": _val["to"],
            //     _type: _val["_type"]//helps in styling of each edges, 
            //     // "_type": diagraph.diagraphView.edgeViewMetadata[val[1]._type]
            //     //TBD - direction of arrows is taken from style?
            // }

            parsedEdges.push({
                group: 'edges',
                "data": dataClone
            });
        });
        return parsedEdges;
    }

    stylesheetUpdating(diagraph) {

        diagraph.diagraphView.stylesheet = [];
        Object.entries(diagraph.diagraphView.nodeViewMetadata).forEach((nodeView) => {
            let nodeViewKey = nodeView[0];
            let nodeViewValue = nodeView[1];
            let style = {};
            Object.entries(nodeViewValue).forEach((nodeAttr, i) => {
                let attrKey = nodeAttr[0];
                let attrValue = nodeAttr[1];
                if (attrValue && attrValue != "" && typeof (attrValue) != "object") {
                    if (attrKey == "background-image") {
                        // TODO IMAGE LOADING 
                        // var imageList = ["dv_Endpoint", "dv_Equipment", "dv_FCP", "dv_Location", "dv_Path", "dv_Service", "lag", "dv_cloud"];
                        // if (imageList.indexOf(attrValue) >= 0) {
                            style[attrKey] = require("../../../source/images/" + attrValue);
                            style["background-fit"] = "cover";
                        // }
                    }
                    else {
                        style[attrKey] = attrValue;
                    }
                }
            })
            // style["background-image"] = require("../cytoscape/dv_Endpoint.svg");
            // style["background-image"] = require("../../../source/images/dv_Equipment.svg");
            // style["background-fit"] = "cover";
            let selector = "node[_type='" + nodeViewKey + "']";
            if (nodeViewKey.endsWith("_collapse")) {
                selector = "node.cy-expand-collapse-collapsed-node[_type='" + nodeViewKey + "']";
            }

            diagraph.diagraphView.stylesheet.push({
                selector,
                style
            });
        });

        Object.entries(diagraph.diagraphView.edgeViewMetadata).forEach((nodeView) => {
            let nodeViewKey = nodeView[0];
            let nodeViewValue = nodeView[1];
            let style = {};
            Object.entries(nodeViewValue).forEach((nodeAttr, i) => {
                let attrKey = nodeAttr[0];
                let attrValue = nodeAttr[1];
                if (attrValue && attrValue != "" && typeof (attrValue) != "object") {
                    style[attrKey] = attrValue;
                }
            })
            diagraph.diagraphView.stylesheet.push({
                selector: "edge[_type='" + nodeViewKey + "']",
                style
            });
        });
        
        diagraph.diagraphView.stylesheet.push({
            selector:"node",
            style:{
                "text-wrap": "ellipsis",
                "text-max-width": "60px"
            }
        });

        diagraph.diagraphView.stylesheet.push({
            selector:"node.custome_hover",
            style:{
                "text-wrap": "wrap",
                "text-max-width": "60px"
            }
        });
    }

    parseDiagraph(diagraph, nodesAr, edgesAr) {
        diagraph.diagraphView.nodeView = this.parseNodesFn(nodesAr, diagraph.diagraphModel.nodes)
        diagraph.diagraphView.edgeView = this.parseEdgesFn(edgesAr, diagraph.diagraphModel.edges)

        this.stylesheetUpdating(diagraph);
        return diagraph;
    }

    bindCompunding() {
        let __layout = this.state.layout;
        let cyCompundAPI = this.cy.expandCollapse({
            layoutBy: __layout,
            fisheye: false,
            animate: true,
            undoable: false
        });
        cyCompundAPI.collapseAll(); //By default show all nodes & edges in hidden way
        this.cyCompundAPI = cyCompundAPI;//keep reference to module level
    }
    updateDetailsView(nodeID, eleParam) {
        let details = this.state.diagraph.diagraphModel[eleParam][nodeID].attributes;
        // this.setState({details})
        this.props.updateDetails1(details);
    }

    loadCytoscape(dg) {
        let self = this;
        let { layout, diagraph } = this.state;
        let cy = cytoscape({
            container: document.getElementById('cy'),
            elements: {
                nodes: dg.diagraphView.nodeView,
                edges: dg.diagraphView.edgeView
            },
            layout,
            style: dg.diagraphView.stylesheet
        })
        cy.ready(() => {
            //click, animation, after effect 
            cy.on('tap', 'edge', function (evt) {
                let node = evt.target;
                let nodeID = node.id();

                self.updateDetailsView.call(self, nodeID, "edges");
            });
            cy.on('tap', 'node', function (evt) {
                let node = evt.target;
                let nodeID = node.id();
                self.updateDetailsView.call(self, nodeID, "nodes");
                
                if (node.attr("collapse") == true || node.attr("collapse") == "true") {
                    // toggleExapnd(nodeID) {
                    let { nodes, adjacencyList, edges } = diagraph.diagraphModel;
                    let nodesAr = nodes[nodeID].child;
                    let edgesAr = adjacencyList[nodeID]

                    let parsedNodesAr = self.parseNodesFn(nodesAr, nodes);
                    let parsedEdgesAr = self.parseEdgesFn(edgesAr, edges);

                    // if (!node.isExpanded) {//Adding nodes of other diagraph
                    self.expandNode(parsedNodesAr.concat(parsedEdgesAr));
                    // node.isExpanded = true;
                    // }
                    // else {//Removing nodes of other diagraph
                    //     node.isExpanded = false;
                    //     this.collapseNode(dg.diagraphView.nodeView.concat(dg.diagraphView.edgeView));
                    // }
                }
            });

            cy.on('mouseout', 'node', function (evt) {
                evt.target.removeClass("custome_hover");                
            });
            cy.on('mouseover', 'node', function (evt) {
                evt.target.addClass("custome_hover");
            });

        });
        this.cy = cy;
        //try to call compunding after map is ready
        this.bindCompunding();
    }
    initLayout(selectDg) {
        if (this.cy) {
            this.destroy();
        }
        let { nodes, edges } = this.state.diagraph.diagraphView;
        let dg = this.parseDiagraph(this.state.diagraph, nodes, edges);
        this.loadCytoscape(dg);
    }

    componentWillMount() {
        this.setState({
            layout: this.props.layout,
            diagraph: this.props.diagraph
        })
    }
    componentDidMount() {
        this.initLayout();
    }
    componentWillReceiveProps(newProps) {
    }
    zoomControl(input) {
        var zVal = this.cy.zoom(zVal) || this.state.zoomValue
        switch (input) {

            case "+":
                zVal = zVal + 0.25;
                this.cy.zoom(zVal);
                break;

            case "#":
                this.cy.fit();
                break;

            case "-":
                zVal = zVal - 0.25;
                if (zVal < 1)
                    zVal = 0.5
                this.cy.zoom(zVal);
                break;

            default: this.cy.fit();
                break;

        }

    }
    //below function get as a props
    // getDetails(details) {
    //     let details_key = Object.keys(details).sort();
    //     return (<div className="detailspanel  topology-detailspanel">
    //         <h2>{details["DisplayName"] || details["UUID"] || "Details"}
    //             <i className="details-close" onClick={() => this.setState({ showDetails: false })}></i></h2>
    //         {
    //             details_key.filter((val, i) => {
    //                 if (details[val] != "") {
    //                     return val;
    //                 }
    //             }).map((val, index) => {
    //                 return (
    //                     <div key={index} className="detailsProperty">
    //                         <div className="label">{val}</div>
    //                         <div className="value"> {details[val]}</div>
    //                     </div>)
    //             })
    //         }
    //     </div>)
    // }
    onChangePerspective(e){
       this.props.onChangePerspective(e.nativeEvent.value,e.nativeEvent.uri)
    }
    render() {
        let { showDetails, details } = this.state;
        return (
            // <Fragment>
            <div className="cy-w">
                {/* <i className="info-icon" onClick={(a) => {
                    if (details != null)
                        this.setState({ showDetails: true })
                }}></i> */}
                <SelectItem id="perspective" width={150}
                                name="perspective" 
                                // ref="perspective"
                                label="Perspective" 
                                data={this.props.pd.perspective}
                                // error={this.state.formErrors.perspective.hasError}
                                // errorMsg={this.state.formErrors.perspective.errorMsg}
                                onChange={this.onChangePerspective.bind(this)}
                                selectedItem={this.props.selectedPD} />
                <div id="cy">
                    {/* Placeholder to load Diagraph( DG )  */}
                </div>
                <div className="zoom-control-w">
                    <div className="zoomIn" onClick={this.zoomControl.bind(this, "-")}></div>
                    <div className="zoomFit" onClick={this.zoomControl.bind(this, "#")}></div>
                    <div className="zoomOut" onClick={this.zoomControl.bind(this, "+")}></div>
                </div>
                {/* {showDetails && this.getDetails(this.state.details)} */}
            </div>
            // </Fragment>
        );
    }
}

export default Diagarph;