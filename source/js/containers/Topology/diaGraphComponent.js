import React, { Component, Fragment } from 'react';
import cytoscape from 'cytoscape';

/**External layout  */
import dagre from 'cytoscape-dagre';

/**extension for cytoscape */
import panzoom from 'cytoscape-panzoom';
import expandCollapse from 'cytoscape-expand-collapse';
import './diagraph_style.css';

//binding extension to cytoscape library
cytoscape.use(dagre);
expandCollapse(cytoscape);
panzoom(cytoscape);

class Diagraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            layout: null,
            details: null
        }
        this.expandNode = this.expandNode.bind(this);
        this.collapseNode = this.collapseNode.bind(this);
        this.layoutCall = this.layoutCall.bind(this);
        this.destroy = this.destroy.bind(this);
        this.parseDiagraph = this.parseDiagraph.bind(this);
        this.loadCytoscape = this.loadCytoscape.bind(this);
        this.bindCompunding = this.bindCompunding.bind(this);
        this.initLayout = this.initLayout.bind(this);
        this.destroy = this.destroy.bind(this);
        this.cy = null;
        this.cyCompundAPI = null;
    }

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
                        let imagePath = `${this.props.imgPath}${attrValue}`;
                        try {
                            style[attrKey] = imagePath;
                            style["background-fit"] = "cover";
                        } catch (error) {
                            console.log("Failed to load", error);
                        }
                    }
                    else {
                        style[attrKey] = attrValue;
                    }
                }
            })
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
            selector: "node",
            style: {
                "text-wrap": "ellipsis",
                "text-max-width": "120px"
            }
        });

        diagraph.diagraphView.stylesheet.push({
            selector: "node.custome_hover",
            style: {
                "text-wrap": "wrap",
                "text-max-width": "120px"
            }
        });
    }

    parseDiagraph(diagraph, nodesAr, edgesAr) {
        diagraph.cyView.nodeView = this.parseNodesFn(nodesAr, diagraph.diagraphModel.nodes);
        diagraph.cyView.edgeView = this.parseEdgesFn(edgesAr, diagraph.diagraphModel.edges);

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
        //TODO: OPTION OF EXPAND/COLLAPSE based on cinfiguration
        cyCompundAPI.collapseAll(); //By default show all nodes & edges in hidden way
        this.cyCompundAPI = cyCompundAPI;//keep reference to module level
    }

    updateDetailsView(nodeID, eleParam) {
        // TBD : is details panel part of topology or pass data respective user component to maintain the consistency 
        let details = this.state.diagraph.diagraphModel[eleParam][nodeID].attributes;    
        this.props.updateDetails1(details);
    }

    loadCytoscape(dg) {
        let self = this;
        let { layout, diagraph } = this.state;
        let cy = cytoscape({
            container: document.getElementById('cy'),
            elements: {
                nodes: dg.cyView.nodeView,
                edges: dg.cyView.edgeView
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
        let { layout, diagraph } = this.props;
        diagraph.cyView = {
            nodeView: [],
            edgeView: []
        }

        this.setState({
            layout,
            diagraph
        })
    }
    componentDidMount() {
        this.initLayout();
    }
    componentWillReceiveProps(newProps) { }
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
                zVal = zVal < 0 ? 0.1 : zVal;
                this.cy.zoom(zVal);
                break;

            default: this.cy.fit();
                break;

        }
    }

    render() {
        let { showDetails, details } = this.state;
        /**
         * NOTE: COMPONENT ACCEPT DIAGRAPH & LAYOUT DATA TO LOAD VIEW
         *       COMPONENTS LOADS WITH RESPECT TO OUTTER PLACEHOLDER i.e positioning & size of outter block is not controlled from here.   
         * CONTAINS - the diagraph view
         *       - controllers button - zoom in, out fit, status setting   
         *       - component # setting/status panel
         *                   # Details panel (TBD)
         * 
         */
        return (
            <div className="cy-w">
                <div id="cy">
                    {/* Placeholder to load Diagraph( DG )  */}
                </div>
                <div className="zoom-control-w">
                    <div className="zoomIn" onClick={this.zoomControl.bind(this, "+")}>+</div>
                    <div className="zoomFit" onClick={this.zoomControl.bind(this, "#")}></div>
                    <div className="zoomOut" onClick={this.zoomControl.bind(this, "-")}>-</div>
                </div>
            </div>
        );
    }
}

export default Diagraph;