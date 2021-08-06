
import axios from 'axios';
import 'leaflet-textpath';
export default class topologyMapHelper {
    constructor() {
        this.eqIcon;
        this.markers = L.markerClusterGroup({
            iconCreateFunction: function (cluster) {
                var item = {};
                var items = cluster.getAllChildMarkers()
                var total = items.length;

                items.forEach(function (x) {
                    // x.options.icon.options.isAlarm = true;
                    if (x.options.icon.options.isAlarm) {
                        if (item[x.options.icon.options.stateIconColor]) {
                            item[x.options.icon.options.stateIconColor] += 1;
                        } else {
                            item[x.options.icon.options.stateIconColor] = 1;
                        }
                    }
                });
                if (Object.keys(item).length > 0)
                    var piChartInput = Object.keys(item).map(function (x) {
                        return {
                            color: x,
                            value: item[x] / total
                        }
                    })
                return L.divIcon({
                    className: '',
                    html: topologyMapHelper.drawSVG({
                        value: "cluster"
                    }, total, piChartInput)
                });
            },
            zoomToBoundsOnClick: false
        }).on('clusterclick', function (event) {
            if (topologyMapHelper.clickedClusterID == event.latlng.lat + "$$" + event.latlng.lng) {
                event.layer.zoomToBounds();
            } else {
                topologyMapHelper.clickedClusterID = event.latlng.lat + "$$" + event.latlng.lng
                this.clearSelection();

                var cluster = event.layer._icon.querySelector("rect")
                cluster.classList.add("selected");
            }
        }, this)
    }
    static directory;
    static maxLayer;
    // onlyCrossConnectedPath=[];
    onLoad(wrapperElement) {
        wrapperElement.style.height = window.outerHeight * 3 + "px";
        wrapperElement.style.width = window.outerWidth * 3 + "px";
    }

    onMoveEnd(elem) {
        let wrapperElement = elem.querySelector(".leaflet-customOverlay-pane"),
            containerElement = elem.querySelector(".leaflet-map-pane"),
            transformedValue = containerElement.getBoundingClientRect(),
            transformedtop = transformedValue.top - document.getElementById("topologyMap").getBoundingClientRect().top;
        wrapperElement.style.transform = "translate(" + (-window.outerWidth - transformedValue.left) + "px," + (-window.outerHeight - transformedtop) + "px) translateZ(0)";
    }

    xy2LatLng(map, x, y) {
        return map.containerPointToLatLng(L.point(x, y))
    }

    clearSelection() {
        var selectedElement = document.getElementById("topologyMapContainer").querySelectorAll(".selected");
        if (selectedElement[0])
            selectedElement[0].classList.remove("selected");
    }
    setEqIcon(eqIcon){
        this.eqIcon =eqIcon;
       // console.log(eqIcon);

    }

    getMarkers(directory, stateToDisplay, markerClick = () => { }, props) {
        Object.keys(directory).forEach(function (key) {
            var value = directory[key];
            console.log(stateToDisplay + "state value");
            if (value.longitude && value.latitude) {
                let marker = L.marker([value.latitude, value.longitude], {
                    icon: this.drawMarker(value, undefined, stateToDisplay),
                    UUID: key
                }).on('click', function (event) {
                    if (event.target.options && event.target.options.UUID && markerClick) {
                        var details = Object.assign({}, directory[event.target.options.UUID])
                        //Removing custom prop from directory
                        if (details.state)
                            delete details.state

                        markerClick(details);
                    }
                    this.clearSelection();
                    var path = event.target._icon.querySelector("path")
                    path.classList.add("selected");

                }, this).on('contextmenu', function (event) {
                    console.log('context menu..');
                    console.log(event);
                    event.target.bindContextMenu(
                        constructContextMenuForMarkersMulti(
                            event.sourceTarget.options.UUID, event.sourceTarget.options.type, props
                        )
                    )
                })
                this.markers.addLayer(marker);
            }
        }, this);

        function constructContextMenuForMarkersMulti(itemID, type, props) {
            var contextmenuitems = [];
            var entityType = 'Location'; //topologyMapHelper.directory[itemID].type;
            if (props.customHookData && props.customHookData.length > 0) {
                for (var i = 0; i < props.customHookData.length; i++) {
                    props.customHookData[i].entityType = entityType;
                    props.customHookData[i].directory = props.data;
                    if (props.customHookData[i].EntitiesKeys && props.customHookData[i].EntitiesKeys.indexOf(itemID) != -1 && entityType == props.customHookData[i].EntityType) {
                        if (props.customHookData[i].DisplayName) {
                            contextmenuitems.push({
                                text: props.customHookData[i].DisplayName,
                                callback: showCustomHook.bind(event, props.customHookData[i])
                            });
                        } else {
                            contextmenuitems.push({
                                text: props.customHookData[i].SureName,
                                callback: showCustomHook.bind(event, props.customHookData[i])
                            });
                        }
                    } else if (!props.customHookData[i].EntitiesKeys && (entityType == props.customHookData[i].EntityType)) {

                        if (props.customHookData[i].DisplayName) {
                            contextmenuitems.push({
                                text: props.customHookData[i].DisplayName,
                                callback: showCustomHook.bind(event, props.customHookData[i])
                            });
                        } else {
                            contextmenuitems.push({
                                text: props.customHookData[i].SureName,
                                callback: showCustomHook.bind(event, props.customHookData[i])
                            });
                        }
                    }

                }
            } else {
                /*var errorMsg='No custom hooks found';
                var dataList = {dataList:[{message: errorMsg,
                    duration: 2000, autoIncreaseDuration: false}]};
                            
                            var snack = React.createElement(Snackbar, dataList);
                    ReactDOM.render(snack, document.getElementById("snackbarID"));*/
            }
            console.log("constructContextMenuForMarkersMulti for multi input..");
            /*  
            var promise = showCustomHookLabels();
                            promise.then(function(result) { 
                                return ({
                                        contextmenu: true,
                                        contextmenuItems: result
                                    });
                            });
            */
            return ({
                contextmenu: true,
                contextmenuItems: contextmenuitems
            });
            //});

            /*return {
                   contextmenu: true,
                   contextmenuItems: contextmenuItems
               }*/

            //show custom hooks for multi input/equipment map:
            function showCustomHook(e, params) {
                //for geomap/p2pmap
                //e.relatedTarget.options.contextmenuItems[0].customHookUR
                //console.log(props.customHookData.CustomHook_URL); 
                //var urlWithSort=props.dataSource.domain+'/oss/sure/items?q=Type;EQUALS;CUSTOM_HOOK&q=EntityType;EQUALS;'+props.dataSource.payload[0].request.origin["@class"]+'&q=SubType;EQUALS;COMPONENT';

                if (!props.dataSource.domain) {
                    props.dataSource.domain = props.dataSource.url.split('/oss')[0];
                }
                var selectedEntityUUID = params.relatedTarget.options.UUID;
                var entityType = e.entityType;
                var directory = e.directory;
                var dataToSend = [];
                var filter = {
                    id: selectedEntityUUID,
                };

                var filteredDirectory = directory;

                filteredDirectory = filteredDirectory.filter(function (item) {
                    for (var key in filter) {
                        if (item[key] === undefined || item[key] != filter[key])
                            return false;
                    }
                    return true;
                });

                var objRowdataNew1 = [];
                for (var i = 0; i < filteredDirectory.length; i++) {
                    var tempObj = filteredDirectory[i].ePoints[0];
                    //Adding state data to datagrid row:
                    console.log(filteredDirectory[i].ePoints[0]);
                    if (filteredDirectory[i].ePoints[0].Associations && filteredDirectory[i].ePoints[0].Associations.Association[0] && filteredDirectory[i].ePoints[0].Associations.Association[0].Type == 'HAS_STATE') {
                        if (filteredDirectory[i].ePoints[0].Associations.Association[0].Target.Features.Feature.length > 0) {
                            for (var j = 0; j < filteredDirectory[i].ePoints[0].Associations.Association[0].Target.Features.Feature.length; j++) {
                                //var stateItem={};
                                tempObj[filteredDirectory[i].ePoints[0].Associations.Association[0].Target.Features.Feature[j].Name] = filteredDirectory[i].ePoints[0].Associations.Association[0].Target.Features.Feature[j].Value;
                                // this.push(stateItem); 
                            }
                        }
                    }
                    objRowdataNew1.push(tempObj);
                }
                // var urlForCustomHooks=props.dataSource.domain+'/oss/sure/items?q=Type;EQUALS;CUSTOM_HOOK&q=EntityType;EQUALS;Equipment&q=SubType;EQUALS;COMPONENT';
                var urlForCustomHooks = props.dataSource.domain + '/oss/sure/graphSearch?limit=100&page=1';
                var payloadForCustomHook = {
                    "request": {},
                    "response": {
                        "responseType": "List",
                        "entity": ["FCP", "Endpoint"],
                        "selfJoin": "true",
                        "responseFilter": [{
                            "for": "Equipment",
                            "filter": ["UUID;NOT EQUAL;47ffef93-779f-476d-a229-6473cc89f842"]
                        }]
                    },
                    "expand": ["Capacity", "State"],
                    "searchFilter": [{
                        "for": "Equipment",
                        "filter": ["UUID;EQUALS;47ffef93-779f-476d-a229-6473cc89f842"]
                    }]
                };

                payloadForCustomHook.response.responseFilter[0].for = entityType;
                payloadForCustomHook.response.responseFilter[0].filter[0] = "UUID;NOT EQUAL;" + selectedEntityUUID;
                payloadForCustomHook.searchFilter[0].for = entityType;
                payloadForCustomHook.searchFilter[0].filter[0] = "UUID;EQUALS;" + selectedEntityUUID;

                //https://135.250.139.91:28443/oss/sure/graphSearch?limit=100&page=1
                //get data to be fed to customhook:
                return axios({
                    method: "POST",
                    url: urlForCustomHooks,
                    headers: props.dataSource.headers,
                    data: payloadForCustomHook
                }).then(
                    (function (response) {
                        var lastRow = -1;
                        var dataRow = response.data.element;
                        var objRowdataNew = [];

                        if (dataRow) {
                            dataRow.map(function (value, key) {
                                var item = value;
                                this.push(item);
                            }, objRowdataNew);
                        } else {
                            objRowdataNew = [];
                        }
                        if (objRowdataNew.length < 100) {
                            lastRow = params.startRow + objRowdataNew.length;
                        }
                        //params.successCallback(objRowdataNew, lastRow);
                        //reloadCount && gridData.dataCount(params.startRow + objRowdata.length);
                        /* if (objRowdata.length < 100) {
                           lastRow = params.startRow + objRowdata.length;
                         }
                         params.successCallback(objRowdata, lastRow);*/
                        //
                        //to show in a new window:
                        if (e.DisplayAs.toLowerCase() == 'window') {
                            //window.open(props.customHookData.CustomHook_URL+'/?UUID='+e.relatedTarget.options.UUID);
                            var strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
                            var contentWindow = window.open(e.CustomHookURL); //+ "?launchedBy=SURE"
                            /*var self = this;
                            var dataToPost = {
                                type: "ACCESS_CUSTOM_HOOK",
                                payload: {
                                    userName: this.userName,
                                    product: this.DisplayName.replace("CH:",""),
                                    dataSource: this.dataSource,
                                    data: rowData
                                }
                            };*/


                            //async function to provied delay for postmessage
                            /*setTimeout(function() {
                                    contentWindow.postMessage(dataToPost,self.CustomHookURL)
                                }, 10); */

                        } else if (e.DisplayAs.toLowerCase() == 'popup') {
                            var rowData, columnData = [];
                            var columnData = [{
                                field: 'AdministrativeState',
                                displayName: 'AdministrativeState'
                            }, {
                                field: 'OperationalState',
                                displayName: 'OperationalState'
                            }, {
                                field: 'DisplayName',
                                displayName: 'Display Name'
                            }, {
                                field: 'SureName',
                                displayName: 'Name'
                            }, {
                                field: '@class',
                                displayName: 'Type'
                            }];
                            if (!rowData || rowData == '') {

                                /* var rowData=[{test: 'test1',test1: 'test1'}, {test: 'test1',test1: 'test1'},{test: 'test1',test1: 'test1'}];
                                 columnData=[{field: 'test',displayName: 'test'},{field: 'test1',displayName: 'test1'}];
                                 var DisplayName='test user1';*/
                            }
                            var iframeData = {
                                rowData: objRowdataNew1,
                                columnData: columnData
                            };
                            var modalWindow = SUREUI.components.ModalWindow;
                            if (e.titleBgColor) {
                                var titleBgColor = e.titleBgColor;
                            } else {
                                var titleBgColor = '#3f51b5';
                            } //Setting default bg color for custom hook's header.
                            var prop = {
                                customHookObject: e,
                                SureName: e.SureName,
                                height: 1000,
                                width: 1000,
                                headerColor: titleBgColor,
                                id: "modalWindowContainer",
                                header: true,
                                title: e.DisplayName,
                                iconBaseURL: "SURE_UI_Components/",
                                iframeSource: e.CustomHookURL,
                                iframeDataSource: props.dataSource,
                                userName: e.CreatedBy,
                                data: iframeData,
                                rowData: objRowdataNew1,
                                columnData: columnData,
                                onClose: function () {
                                    ReactDOM.unmountComponentAtNode(document.getElementById("modalWindow"));
                                }
                            }

                            var modalWindowComponent = React.createElement(modalWindow, prop);
                            ReactDOM.render(modalWindowComponent, document.getElementById("modalWindow"));
                        }
                        //axios to get fcp/endpoints of selected entity:
                    })
                );
            }
        }
        return this.markers;
    };

    getTermiantionsByParts(start, end, height, count) {
        var result = [];
        var pathLength = (end - start) / count;
        for (var i = 0; i < count; i++) {
            result.push([{
                x: start,
                y: height
            }, {
                x: start + pathLength,
                y: height
            }])
            start += pathLength
        }
        return result
    }
    splitId(arg) {
        let _sAr = arg.id.split("#");
        _sAr[0] = _sAr[0].split("_")[1]
        return _sAr;
    }
    drawTopologyLayer(map, layer, pathWidth, gPathWidth, uPathWidth, startPosition, stateToDisplay, markerEvents, pathEvents, onlyCrossConnectedPath) {
        /**CODE RELATED TO RING PATH */
        var ringDrawn = false;
        var ringStart = false;

        for (var index = 0; index < layer.paths.length; index++) {
            if (layer.paths[index].type == "gPath")
                var layerGap = gPathWidth
            else if (layer.paths[index].type == "uPath")
                var layerGap = uPathWidth
            else
                var layerGap = pathWidth

            var terminations = [{
                x: startPosition.x,
                y: startPosition.y
            }, {
                x: startPosition.x + layerGap,
                y: startPosition.y
            }];
            /**CODE RELATED TO RING PATH  */
            if (layer.paths[index].ringPathStart == true) {
                ringStart = true;
            }
            //This is for the parentRingPath(that completes the loop) which needs to be drawn with different x and y:
            if (layer.paths[index].ringPath == true && ringDrawn == false) {
                if (layer.paths[index].ringPathStart) {
                    var terminations = [{
                        x: startPosition.x,
                        y: startPosition.y
                    }, {
                        x: startPosition.x + layerGap,
                        y: startPosition.y + 50
                    }];
                    var ringStartX = startPosition.x;
                    var ringStartY = startPosition.y;
                } else if (layer.paths[index].ringPathEnd) {
                    var terminations = [{
                        x: startPosition.x,
                        y: startPosition.y + 50
                    }, {
                        x: startPosition.x + layerGap,
                        y: ringStartY
                    }];
                    var ringEndX = startPosition.x + layerGap;
                    var ringEndY = ringStartY;
                    ringStart = false;

                } else if (layer.paths[index].ringPath == true) {
                    var terminations = [{
                        x: startPosition.x,
                        y: startPosition.y + 50
                    }, {
                        x: startPosition.x + layerGap,
                        y: startPosition.y + 50
                    }];
                }
                else if (layer.paths[index].parentRingPath == true) {
                    var terminations = [{
                        x: startPosition.x,
                        y: startPosition.y
                    }, {
                        x: startPosition.x + layerGap,
                        y: startPosition.y
                    }];
                }
                else {
                    var terminations = [{
                        x: startPosition.x,
                        y: startPosition.y
                    }, {
                        x: startPosition.x + layerGap,
                        y: startPosition.y
                    }];
                }
                if (layer.paths[index + 1] && layer.paths[index + 1].ringPath == false) {
                    var terminations = [{
                        x: startPosition.x,
                        y: startPosition.y
                    }, {
                        x: startPosition.x + layerGap,
                        y: ringStartY
                    }]
                    //this.drawPaths(layer, index, map, terminations, stateToDisplay, markerEvents, pathEvents);
                    //once the ring is completely drawn:
                    ringDrawn = true;
                    //ringStart=false;
                }

                if (layer.paths[index].ringParent == true) {
                    var terminations = [{
                        x: ringStartX,
                        y: ringStartY
                    }, {
                        x: ringEndX,
                        y: ringEndY
                    }];
                }
                this.drawPaths(layer, index, map, terminations, stateToDisplay, markerEvents, pathEvents, onlyCrossConnectedPath);
            } else {
                this.drawPaths(layer, index, map, terminations, stateToDisplay, markerEvents, pathEvents, onlyCrossConnectedPath)
            }
            startPosition.x = terminations[1].x;
            if (layer.paths[index].id == "link_280db390-98c0-11e9-8655-0242ac140108#27712536-98c0-11e9-8655-0242ac140108") {
            }
        }
    }

    drawPaths(layer, index, map, terminatingPoints, stateToDisplay, markerEvents, pathEvents, onlyCrossConnectedPath) {
        var layerGroup = layer.layers[layer.layers.length - 1] //Empty array(layerGroup) created in getLayers
        var type = layer.paths[index].type
        var UUID = layer.paths[index].id

        var pointList = terminatingPoints.map((terminatingPoint) => {
            return this.xy2LatLng(map, terminatingPoint.x, terminatingPoint.y);
        })

        var path = topologyMapHelper.directory[UUID] || {};

        if (type == "path")
            delete path.selectedPathID //clear selectedPathID set by path bundle selection

        var isPathBundle;
        var ring = false;
        var disablePathBundleFlag = false;
        for (var i = 0; i < path.siblings.length; i++) {
            if (topologyMapHelper.directory[path.siblings[i]].layerDepth != topologyMapHelper.directory[UUID].layerDepth) {
                //disable path bundle..
                // console.log("disablePathBundleFlag true.." + path.siblings[i] + "   i: " + i);
                disablePathBundleFlag = true;
            }
            else {
                disablePathBundleFlag = false;
                break;
            }
        }

        if (path.terminations[0] == path.terminations[1] || (path.siblings[0] && disablePathBundleFlag)) {
            //disabling the pathbundle icon..
            isPathBundle = false;
            ring = true;
        }
        else {
            isPathBundle = path.siblings && path.siblings.length > 0
        }

        //stateColor
        if (isPathBundle) {
            var stateObjFromStatusPanel = topologyMapHelper.filteredBuldleState(topologyMapHelper.directory, path, stateToDisplay.path)
        } else
            var stateObjFromStatusPanel = topologyMapHelper.filteredState(path, stateToDisplay.path);

        //drawingPath
        var polyline = new L.Polyline(pointList, {
            className: "topologyPath",
            id: UUID,
            type: type,
            opacity: type == "gPath" ? 0.5 : 1,
            ring: ring,
            weight: isPathBundle && type != "gPath" ? 5 : (type == "uPath" ? 0 : 2),
            color: stateObjFromStatusPanel && stateObjFromStatusPanel.length > 0 ? stateObjFromStatusPanel[0].color : "#acacac"
        });

        polyline.on("click", pathEvents.click);
        polyline.on("mouseover", pathEvents.enter);
        polyline.on("mouseout", pathEvents.leave);
        polyline.on("contextmenu", pathEvents.contextmenu);
        layerGroup.addLayer(polyline);

        //drawPathBundle
        if (isPathBundle && type != "gPath") {
            var bundleIconPoint = {
                x: terminatingPoints[0].x + (terminatingPoints[1].x - terminatingPoints[0].x) / 2,
                y: terminatingPoints[0].y
            }
            var marker = L.marker(this.xy2LatLng(map, bundleIconPoint.x, bundleIconPoint.y), {
                icon: topologyMapHelper.drawPathBundleIcon(topologyMapHelper.directory, path, stateToDisplay.path),
                isShowLabel: true,
                id: UUID,
                type: "bundleIcon",
            }).on('click', function (event) {
                console.log(this, "Marker click event is triggered");
            }, this);
            layerGroup.addLayer(marker);
        }

        path.terminations && path.terminations.forEach((markerID, terminationIndex) => {
            this.drawMarkersV1(layer, map, path, index, type, markerID, terminationIndex, terminatingPoints, markerEvents, stateToDisplay, onlyCrossConnectedPath)
        }, this)
    }

    updateLayers(layers, directory, stateToDisplay, drawMarkerV1, typeid) {
        console.log("inside updatelayers..", layer.options.type);
       
        if (typeid == '2') {
            if (!Array.isArray(layers)) {
                // layers=Object.entries(layers);
                layers = Object.values(layers);
            }
            if (!Array.isArray(directory)) {
                // directory=Object.entries(directory);
                directory = Object.values(directory);
            }

            for (var ind = 0; ind < layers.length; ind++) {
                if (typeof layers[ind].eachLayer === "function") {
                    // safe to use the function
                    layers[ind].eachLayer((layer) => {
                        if (typeid == 2 && layer.options.UUID) {
                            var value = directory.filter(obj => {
                                return obj.id == layer.options.UUID;
                            })
                            layer.setIcon(drawMarkerV1(value[0], "marker", stateToDisplay, layer.options.isShowLabel));
                        } else if (layer.options.type == "marker" || layer.options.type == "gMarker") {
                            let value = directory[layer.options.id];
                            if (!Array.isArray(directory)) {
                                // directory=Object.entries(directory);
                                directory = Object.values(directory);
                            }
                            layer.setIcon(drawMarkerV1(value[0], layer.options.type, stateToDisplay, layer.options.isShowLabel))
                        } else if (layer.options.type == "path" || layer.options.type == "gPath") {
                            let pathID = directory[layer.options.id].selectedPathID || layer.options.id

                            let value = directory[pathID];
                            if (value.siblings.length > 0 && !value.selectedPathID) {
                                var stateObj = topologyMapHelper.filteredBuldleState(directory, value, stateToDisplay.path)
                            } else {
                                var stateObj = topologyMapHelper.filteredState(value, stateToDisplay.path);
                            }
                            layer.setStyle({
                                color: stateObj && stateObj.length > 0 ? stateObj[0].color : "#acacac"
                            })
                        } else if (layer.options.type == "bundleIcon") {
                            let value = directory[layer.options.id];
                            layer.setIcon(topologyMapHelper.drawPathBundleIcon(directory, value, stateToDisplay.path))
                        }
                    }
                    )
                }
            }
        } else {
            layers.forEach((layer, i) => {
                console.log("inside each layer of layers.."+i+1);
                layer.eachLayer((layer) => {
                   
                    if (layer.options.type == "marker" || layer.options.type == "gMarker" || layer.options.type == "crossConnectMarker") {
                        let value = directory[layer.options.id];
                        
                        if (value.type.toLowerCase() == "location") {
                            if (!Array.isArray(directory)) {
                                // directory=Object.entries(directory);
                                var directoryArr = Object.values(directory);
                            }

                            var eqStates = directoryArr.filter(function (e) {
                                return e.location == value.id;
                            });
                            value.state = eqStates[0].state;
                        }
                        layer.setIcon(drawMarkerV1(value, layer.options.type, stateToDisplay, layer.options.isShowLabel, undefined, i+1))
                        //layer.setIcon(drawMarker(value, layer.options.type, stateToDisplay, true));
                    } else if (layer.options.type == "path" || layer.options.type == "gPath") {
                        let pathID = directory[layer.options.id].selectedPathID || layer.options.id
                        let value = directory[pathID];

                        if (value.siblings && value.siblings.length > 0 && !value.selectedPathID) {
                            var stateObj = topologyMapHelper.filteredBuldleState(directory, value, stateToDisplay.path)
                        } else {
                            var stateObj = topologyMapHelper.filteredState(value, stateToDisplay.path);
                        }
                        layer.setStyle({
                            color: stateObj && stateObj.length > 0 ? stateObj[0].color : "#acacac"
                        })
                    } else if (layer.options.type == "bundleIcon") {
                        let bundlepathValue = directory[layer.options.id].siblings;
                        layer.setIcon(topologyMapHelper.drawPathBundleIcon(directory, bundlepathValue, stateToDisplay.path))
                    }
                })
            })
        }
    }

    pathOnHover() { }
    pathOnLeave() { }

    static filteredBuldleState(directory, path, stateToDisplay = {}, states = {}) {
        var lPathsID = [path.id].concat(path.siblings);
        //create statesObj from path bundle e.g. {OperationalState: [{count:5, name: "UP"}]}
        const stateToDisplayKeys = Object.keys(stateToDisplay)
        let lSubState = {};
        for (var i = 0; i < stateToDisplayKeys.length; i++) {
            var state = stateToDisplayKeys[i];
            lSubState = lSubState ? lSubState : {};
            lSubState[state] = stateToDisplay[state].map(function (value) {
                return value.text;
            })
        }

        lPathsID.forEach((pathID) => {
            var statesFromDirectory = directory[pathID].state;
            if (statesFromDirectory) {
                stateToDisplayKeys.forEach((stateKey) => {
                    if (statesFromDirectory[stateKey]) {
                        states[stateKey] = states[stateKey] || [];

                        statesFromDirectory[stateKey].forEach((stateFromDirectory) => {
                            var index = states[stateKey].findIndex((state) => state.name.toUpperCase() == stateFromDirectory.toUpperCase());
                            if (index == -1) {
                                var obj = stateToDisplay[stateKey].filter((item) => item.text == stateFromDirectory)[0];
                                states[stateKey].push({
                                    count: 1,
                                    name: stateFromDirectory,
                                    color: obj && obj.color ? obj.color : "#acacac"
                                })
                            } else {
                                var state = states[stateKey][index];
                                state.count++
                            }
                        })
                    }
                })
            }
        })

        let result = []
        for (var i = 0; i < stateToDisplayKeys.length; i++) {
            var state = stateToDisplayKeys[i];
            if (states && states[state]) {
                var filteredSubState = lSubState[state].filter(function (x) {
                    return states[state].findIndex((item) => item.name == x) != -1
                })[0];
                if (filteredSubState) {
                    result.push(stateToDisplay[state][lSubState[state].indexOf(filteredSubState)])
                }
            }
        }
        return result;
    }

    static filteredState(itemFromDirectory, stateToDisplay = {}) {
        const stateToDisplayKeys = Object.keys(stateToDisplay)
        let lSubState = {};
        for (var i = 0; i < stateToDisplayKeys.length; i++) {
            var state = stateToDisplayKeys[i];
            lSubState = lSubState ? lSubState : {};
            lSubState[state] = stateToDisplay[state].map(function (value) {
                return value.text;
            })
        }

        let stateFromDir = itemFromDirectory && itemFromDirectory.state;
        let result = []
        for (var i = 0; i < stateToDisplayKeys.length; i++) {
            var state = stateToDisplayKeys[i];
            if (stateFromDir && stateFromDir[state]) {
                var filteredSubState = lSubState[state].filter(function (x) {
                    return stateFromDir[state].indexOf(x) != -1
                })[0];
                if (filteredSubState) {
                    result.push(
                        Object.assign(
                            stateToDisplay[state][lSubState[state].indexOf(filteredSubState)], {
                            priority: lSubState[state].indexOf(filteredSubState)
                        }
                        )
                    )
                }

            }
        }
        return result;
    }

    static drawSVG(request, siteCount, pieValue) {


        var siteCount = siteCount > 9999 ? "9999+ Sites" : siteCount + " Sites";
        var lsize = ["small", "medium", "large", "xlarge"]
        if (request.state)
            var stateinfo = `<circle cx="25" cy="5" r="5.5" fill="${request.state.color}" style="stroke:white ;stroke-width:1px;"/>
                        <text x="25" y="5" text-anchor="middle" font-family="Arial" style="font-weight: bold; font-size:50%" fill="#f9fbfd" dy=".35em">
                            ${request.state.badge}
                        </text>`;
        var svg = "";

        var customIcon='';
        var fillColor='';
                if(request.eqIcon){
                    var combination_values=[];
                for(var i=0; i<request.eqIcon.customGUI_combinations.length;i++){

if(request.details.detail[request.eqIcon.customGUI_combinations[i]]){
    combination_values.push(request.details.detail[request.eqIcon.customGUI_combinations[i]]);
}

if(request.eqIcon[request.eqIcon.customGUI_combinations.join(",")] && request.details.detail[request.eqIcon.customGUI_combinations[i]]){
combination=request.eqIcon.customGUI_combinations.join(",");

}
}
// if(request.eqIcon[combination_values.join(",")])
//     {

//     customIcon=request.eqIcon[combination_values.join(",")];
    
//     }
for(var j=0; j<combination_values.length; j++){
   
   
     if(request.eqIcon[combination_values.slice(0, j+1).join(",")]){
        customIcon=request.eqIcon[combination_values.slice(0, j+1).join(",")];
    }
}


            }
        switch (request.value) {
            case "cluster":
                svg = '<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="mapviewclustersvgMultiInput" viewBox="-3 -3 6 6" width="6" height="6" style="transform: rotate(-90deg);">\
                    <g>\
                        <rect id="mapviewclusterrect" x="-2.75" y="-2.75" rx="0.25" ry="0.25" height="5.5" width="5.5"></rect>\
                        ' + (pieValue ? getPiChartElements(pieValue) : "") + '\
                        <text id="mapviewclustertext" x="0" y="2" font-size="1" text-anchor="middle">' + siteCount + '</text>\
                    </g>\
                </svg>';
                break;
            case "gMarker":
                svg = '<div id="mapviewgmakerwraper"><svg id= "mapviewgmarker" viewBox="0 0 100 100">\
                    <circle cx="50" cy="50" r="50" fill="' + ((request.state && request.state.color) || request.color || "#acacac") + '" />\
                </svg>'
                break;
            case "dotMarker":
                    svg = '<div id="mapviewgmakerwraperdot"><svg id= "mapviewgmarkerdot" viewBox="0 0 100 100">\
                    <circle cx="10" cy="10" r="10" fill="#ffffff" />\
                    </svg>'
                    break;    
            case "bundleIcon":
                svg = '<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="mapviewclustersvg" width="20" height="20" viewBox="-2 -2 4 4" style="transform: rotate(-90deg);">\
            <g>\
                <circle cx="0" cy="0" r="1.7" fill="#fafafa"  stroke= "' + request.color + '" style="stroke-width: 0.6""></circle>\
                ' + (request.pieValue ? getPiChartElements(request.pieValue) : "") + '\
            </g>\
        </svg>'
                break;
            case "marker":
                
            if(!customIcon || customIcon == ''){
                svg = `<svg version="1.1" id="mapviewmarkersvg" 
                xmlns="http://www.w3.org/2000/svg" 
                xmlns:xlink="http://www.w3.org/1999/xlink" 
                x="0px" y="0px" 
                viewBox="0 0 34 24"
                style="enable-background:new 0 0 30 30;" 
                xml:space="preserve"> 
                <g id="Symbols-(Map)---Nokia" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g fill="${request.color}">
                        <path stroke="${request.color}" 
                            d="M24.1,1H3.9C2.3,1,1,2.3,1,3.9v20.2C1,25.7,2.3,27,3.9,27h20.2c1.6,0,2.9-1.3,2.9-2.9V3.9C27,2.3,25.7,1,24.1,1z M23.8,23.8H4.2V4.2h19.6V23.8z"/>                                    
                        <rect x="6.6" y="6.6" class="st0" width="14.7" height="14.7"/>
                        
                    </g>
                    ${stateinfo && stateinfo}  
                </g>
            </svg>`

            }
            else if(customIcon != ''){
               
                //<circle cx="35" cy="47" r="30.5" fill="#be0006" style="stroke:white ;stroke-width:1px;"></circle>
                if(request.state){
                    stateinfo = `<circle cx="50" cy="55" r="40.5" fill="${request.state.color}" style="stroke:white ;stroke-width:1px;"/>
                    <text x="45" y="15" text-anchor="middle" font-family="Arial" style="font-weight: bold; font-size:500%" fill="#f9fbfd" dy="1em">
                        ${request.state.badge}
                    </text>`;
                    
                }
                if(request.color=="#acacac"){
                    fillColor='none';
                }
                else{
                    fillColor=request.color;
                                    }

                svg=`<svg xmlns="http://www.w3.org/2000/svg"  id="mapviewmarkersvg" width="54px" height="54px" class="equipment-ic-wrap" viewBox="0 0 380 380" preserveAspectRatio="none">
                <rect class="customIconClass" width="80%" height="80%" style="fill:${fillColor};stroke-width:1;stroke:rgb(0,0,0)" x="10%" y="10%"></rect>
               
                <svg width="80%" height="80%" x="10%" y="10%" style="border:solid red 2px;">  
                <!-- START: ICON-->
                ${customIcon}
                <!-- END:ICON-->  
                </svg>
                ${stateinfo && stateinfo}
                </svg>`
            }
           
                break;
            case "crossConnectMarker":
               
                if(customIcon != ''){
                    if(request.state){
                        stateinfo = `<circle cx="50" cy="55" r="40.5" fill="${request.state.color}" style="stroke:white ;stroke-width:1px;"/>
                        <text x="45" y="15" text-anchor="middle" font-family="Arial" style="font-weight: bold; font-size:500%" fill="#f9fbfd" dy="1em">
                            ${request.state.badge}
                        </text>`;
                    }
                    if(request.color=="#acacac"){
                        fillColor='none';
                    }
                    else{
                        fillColor=request.color;
                                        }
    
               svg = `<svg xmlns="http://www.w3.org/2000/svg" id="mapviewmarkersvg" width="54px" height="54px" class="equipment-ic-wrap" viewBox="0 0 380 380" preserveAspectRatio="none">
 <g>
  <rect class="customIconClass" style="fill:${fillColor}; stroke:${request.color};stroke-width:10px" id="canvas_background" height="300" width="320" y="65" x="20"/>
  <rect class="customIconClass" fill="none" stroke-width="10" x="270.5" y="10" width="50" height="70.000001" id="svg_4" rx="12" stroke=${request.color} />
 </g>
 <g>
  <rect id="svg_2" style="fill:none;" y="9%" x="10%" height="80%" width="80%" stroke-width="12"/>
  <g id="svg_1">
   <svg id="svg_3" y="10%" x="10%" height="80%" width="80%">
    <!-- START: ICON-->
    ${customIcon}
    <!-- END:ICON-->
   </svg>
  </g>
 
 </g>${stateinfo && stateinfo}</svg>`;
        }
 else if(!customIcon || customIcon == ''){
    svg = `<svg version="1.1" id="mapviewmarkersvg" 
    xmlns="http://www.w3.org/2000/svg" 
    xmlns:xlink="http://www.w3.org/1999/xlink" 
    x="0px" y="0px" 
    viewBox="0 0 34 24"
    style="enable-background:new 0 0 30 30;" 
    xml:space="preserve"> 

    <g id="Symbols-(Map)---Nokia" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    
        <g fill="${request.color}">
            <path stroke="${request.color}" 
                d="M24.1,1H3.9C2.3,1,1,2.3,1,3.9v20.2C1,25.7,2.3,27,3.9,27h20.2c1.6,0,2.9-1.3,2.9-2.9V3.9C27,2.3,25.7,1,24.1,1z M23.8,23.8H4.2V4.2h19.6V23.8z"/>
            <rect x="6.6" y="6.6" class="st0" width="14.7" height="14.7"/>
        </g>
        <g class="currentLayer" style="">                                
            <g id="CrossConnectEquipmentPath" 
                transform="translate(-712.000000, -574.000000)" 
                stroke="${request.color}" stroke-width="2">
                <g id="Group-2" transform="translate(258.000000, 574.000000)">
                    <rect id="Rectangle" x="470" y="-6" width="6" height="10" rx="2"></rect>
                </g>
            </g>
            ${stateinfo && stateinfo}
    </g>
    </g>
</svg>`
 }
                
                break;
        }

        function getPiChartElements(input) {
            //derived from unit circle def.
            var path = "";
            var totalArea = 0
            input.forEach(function (item) {
                var cordinateStart = Math.cos(2 * Math.PI * totalArea);
                var cordinateEnd = Math.sin(2 * Math.PI * totalArea);
                totalArea += item.value
                path += '<path d="M ' + cordinateStart + ' ' + cordinateEnd + ' A 1 1 0 ' + (item.value > .5 ? 1 : 0) + ' 1 ' + Math.cos(2 * Math.PI * totalArea) + ' ' + Math.sin(2 * Math.PI * totalArea) + ' L 0 0" fill="' + item.color + '"></path>'
            })
            return path;
        }
        return svg;
    };

    static drawPathBundleIcon(directory, itemFromDirectory, stateToDisplay = {}) {
        var filteredStates = {}
        /***
         *      State adding to bundle path 
         *      var statesObjFromStatusPanel = topologyMapHelper.filteredBuldleState(directory, itemFromDirectory, stateToDisplay, filteredStates)
                var states = filteredStates[Object.keys(stateToDisplay)[0]] //will filter AORAlarmstate or OperationalState
                var pathsCount = itemFromDirectory.siblings.length + 1; //circum. of a circle
         */
        var pathsCount = itemFromDirectory.length + 1;

        var remainingCount = pathsCount;
        var pieObject = [];
        // if (states && states.length > 0) {
        //     states.forEach((state) => {
        //         remainingCount -= state.count
        //         pieObject.push({
        //             color: state.color,
        //             value: state.count / pathsCount
        //         })
        //     })
        //     pieObject.push({
        //         color: "#acacac",
        //         value: remainingCount / pathsCount
        //     })
        //     var markerLabel = "<div id='mapviewmarkerlabel'>" + pathsCount + "</div>";
        //     return new L.DivIcon({
        //         className: 'showLabel',
        //         html: "<div>\
        //                         " + topologyMapHelper.drawSVG({
        //             value: "bundleIcon",
        //             color: statesObjFromStatusPanel[0] ? statesObjFromStatusPanel[0].color : "#acacac",
        //             pieValue: pieObject
        //         }) + "\
        //                         " + markerLabel + " \
        //                     </div>",

        //         iconSize: [20, 20]
        //     });
        // } else {
        var markerLabel = `<div id='mapviewmarkerlabel'> ${pathsCount} </div>`;
        pieObject.push({
            color: "#acacac",
            value: 0.5
        })
        return new L.DivIcon({
            className: 'showLabel',
            html: `<div>
                ${
                topologyMapHelper.drawSVG({
                    value: "bundleIcon",
                    color: "#acacac",
                    pieValue: pieObject
                })} ${markerLabel} </div>`,
            iconSize: [20, 20]
        });
        // }
    }

    getLayersV1(map, topologyLayer, geoLayer, directory, typeId, stateToDisplay, markerEvents, pathEvents, _selectdPathObj, handleCustomError) {
        // var isRootCC = false;
        var rootPath = directory[topologyLayer.paths[0].id];

        if ((rootPath && rootPath.noRootEquipment) || (rootPath.terminations.length!=2)) {
            handleCustomError({
                custom_error: {
                    name: 'Path is not terminated on root equipment',
                    details: rootPath.name
                }
            })
            return false;
        }
        // if (topologyLayer.layers.length <= 0 && topologyLayer.paths.length == 1) {
        //     //We are checking is root path is cross
        //     isRootCC = rootPath.terminations[0] == rootPath.terminations[1] ? true : false;
        // }

        // if (!isRootCC) {
        var viewPortOffset = 2 * (window.innerWidth * 0.15)
        var viewLength = window.innerWidth - viewPortOffset;
        var height = 150;

        var gPaths = topologyLayer.paths.filter((path) => {
            return path.type == "gPath"
        });

        var gCount = gPaths && gPaths.length > 0 ? gPaths.length : 0;
        var gPathWidth = 50;
        var gPathsWidth = gPathWidth * gCount;

        var uPaths = topologyLayer.paths.filter((path) => {
            return path.type == "uPath"
        });

        var uCount = uPaths && uPaths.length > 0 ? uPaths.length : 0;
        var uPathWidth = 50;
        var uPathsWidth = uPathWidth * uCount;

        if (topologyLayer.layers.length > 0) {
            var rootLayer = topologyLayer.layers[0].getLayers()[0];
            map.setView([51.505, -0.09], 13);
            if (typeId != 2) {
                var start = map.latLngToContainerPoint(rootLayer.getLatLngs()[0]);
                var end = map.latLngToContainerPoint(rootLayer.getLatLngs()[1]);
                viewLength = end.x - start.x;
                start.y = start.y + (topologyLayer.layers.length) * height;
            }
        } else {
            var start = {
                x: viewPortOffset / 2,
                y: height
            }
        }
        var topologyLayerGroup = L.layerGroup();
        topologyLayer.layers.push(topologyLayerGroup);

        var geoLayerGroup = L.layerGroup();
        geoLayer.layers.push(geoLayerGroup);
        var purePaths = [];
        var ccPaths = [];
        var bundlePaths = [];
        for (var i = 0; i < topologyLayer.paths.length; i++) {
            if (topologyLayer.paths[i].type == "uPath") {
                console.log("Path with out any termination is not drawn/plotted into map");
            }
            else if (directory[topologyLayer.paths[i].id].terminations[0] == directory[topologyLayer.paths[i].id].terminations[1]) {
                ccPaths.push(topologyLayer.paths[i].id);
            }
            else {
                let isBundlePath = false;
                let currentPathId = topologyLayer.paths[i].id;
                if (purePaths.length > 0) {
                    isBundlePath = purePaths.some((val, j) => {
                        let isBundle = ((directory[val.id].terminations[0] == directory[currentPathId].terminations[0] &&
                            directory[val.id].terminations[1] == directory[currentPathId].terminations[1]) ||
                            (directory[val.id].terminations[0] == directory[currentPathId].terminations[1] &&
                                directory[val.id].terminations[1] == directory[currentPathId].terminations[0]));
                        if (isBundle) {
                            if (purePaths[j].siblings === undefined) {
                                purePaths[j].siblings = [];
                            }
                            purePaths[j].siblings.push(currentPathId);
                            bundlePaths.push(currentPathId);
                        }
                        return isBundle;
                    });
                }
                if (!isBundlePath) {
                    purePaths.push(topologyLayer.paths[i]);
                }
            }
        }

        topologyLayer.paths = purePaths;
        var AvailableViewLength = viewLength - gPathsWidth;
        var pathWidth = AvailableViewLength / (purePaths.length - gCount);
        pathWidth -= bundlePaths.length > 0 ? (bundlePaths.length - 1) : 0;

        /** Code Related TO RING PATH*/
        if (topologyLayer.paths.filter((path) => {
            return path.ringParent == true
        }).length > 0) {
            pathWidth = AvailableViewLength / (topologyLayer.paths.length - gCount - uCount - 1)
        }
        var ccLength = ccPaths.length;



        if (topologyLayer.paths.length <= 0 && ccLength > 0) {
            var type = "marker";
            var index = 0;
            var terminationIndex = 0;

            ccPaths.forEach((eachCCPath, k) => {
                var terminatingPoints = [{
                    x: ccLength > 1 ? (window.innerWidth * k / ccLength + window.innerWidth * .25) : window.innerWidth / 2,
                    y: (topologyLayer.layers.length) * height
                }];
                var markerID = directory[eachCCPath].terminations[0];
                var path = directory[eachCCPath];

                this.drawMarkersV1(topologyLayer, map, path, index, type, markerID, terminationIndex, terminatingPoints, markerEvents, stateToDisplay, ccPaths, true);
            })
        }
        else {
            this.drawTopologyLayerV1(map, topologyLayer, pathWidth, gPathWidth, uPathWidth, start, stateToDisplay, markerEvents, pathEvents, ccPaths, bundlePaths);
        }
    
        let invalidEquipementLocation = [];
        //let lMarkers = this.drawGeoLayer(geoLayer, topologyLayer, directory, stateToDisplay, markerEvents, pathEvents);
        if (typeId == 0)
            topologyLayerGroup.addTo(map);
  
    }

    drawTopologyLayerV1(map, layer, pathWidth, gPathWidth, uPathWidth, startPosition, stateToDisplay, markerEvents, pathEvents, ccPaths, bundlePaths) {

        console.log(map._layers);

        /**CODE RELATED TO RING PATH */
        var ringDrawn = false;
        var ringStart = false;
        var parentIndex = '';
        var parentPath = '';
        var ringPathEndIndex = '';
        var reverseFlag = false;
        //rearrange paths to keep parent path(the larger branch of a ring) at the end of the ring:
        for (var ind1 = 0; ind1 < layer.paths.length; ind1++) {
            if (layer.paths[ind1].ringParent == true) {
                parentIndex = ind1;
                parentPath = layer.paths[ind1];
            }
            if (layer.paths[ind1].ringPathEnd == true) {
                ringPathEndIndex = ind1;
            }
        }
        if (ringPathEndIndex != '' && parentIndex != '') {
            layer.paths.splice(ringPathEndIndex + 1, 0, parentPath);
            layer.paths.splice(parentIndex, 1);
        }

        for (var index = 0; index < layer.paths.length; index++) {
            if (layer.paths[index].type == "gPath")
                var layerGap = gPathWidth;
            else if (layer.paths[index].type == "uPath")
                var layerGap = uPathWidth;
            else
                var layerGap = pathWidth;

            var terminations = [{
                x: startPosition.x,
                y: startPosition.y
            }, {
                x: startPosition.x + layerGap,
                y: startPosition.y
            }];
            /**CODE RELATED TO RING PATH  */
            if (layer.paths[index].ringPathStart == true) {
                ringStart = true;
            }

            //This is for the parentRingPath(that completes the loop) which needs to be drawn with different x and y:
            if (layer.paths[index].ringPath == true && ringDrawn == false) {
                if (layer.paths[index].ringPathStart) {
                    var terminations = [{
                        x: startPosition.x,
                        y: startPosition.y
                    }, {
                        x: startPosition.x + layerGap,
                        y: startPosition.y + 50
                    }];
                    var ringStartX = startPosition.x;
                    var ringStartY = startPosition.y;
                } else if (layer.paths[index].ringPathEnd) {
                    var terminations = [{
                        x: startPosition.x,
                        y: startPosition.y + 50
                    }, {
                        x: startPosition.x + layerGap,
                        y: ringStartY
                    }];
                    var ringEndX = startPosition.x + layerGap;
                    var ringEndY = ringStartY;
                    ringStart = false;

                } else if (layer.paths[index].ringPath == true) {
                    var terminations = [{
                        x: startPosition.x,
                        y: startPosition.y + 50
                    }, {
                        x: startPosition.x + layerGap,
                        y: startPosition.y + 50
                    }];
                }
                else if (layer.paths[index].ringBody == true) {
                    var terminations = [{
                        x: startPosition.x,
                        y: startPosition.y + 50
                    }, {
                        x: startPosition.x + layerGap,
                        y: startPosition.y + 50
                    }];
                    //var ringEndX = startPosition.x + layerGap;
                    //var ringEndY = ringStartY;
                    //ringStart = false;

                }
                else if (layer.paths[index].parentRingPath == true) {
                    var terminations = [{
                        x: startPosition.x,
                        y: startPosition.y
                    }, {
                        x: startPosition.x + layerGap,
                        y: startPosition.y
                    }];
                }
                else {
                    var terminations = [{
                        x: startPosition.x,
                        y: startPosition.y
                    }, {
                        x: startPosition.x + layerGap,
                        y: startPosition.y
                    }];
                }
                if (layer.paths[index + 1] && layer.paths[index + 1].ringPath == false) {
                    var terminations = [{
                        x: startPosition.x,
                        y: startPosition.y
                    }, {
                        x: startPosition.x + layerGap,
                        y: ringStartY
                    }]
                    //this.drawPaths(layer, index, map, terminations, stateToDisplay, markerEvents, pathEvents);
                    //once the ring is completely drawn:
                    ringDrawn = true;
                    //ringStart=false;
                }

                if (layer.paths[index].ringParent == true) {
                    if (!ringStartX || !ringStartY) {
                        var ringStartX = startPosition.x;
                        var ringStartY = startPosition.y;
                    }

                    if (!ringEndX || !ringEndY) {
                        var ringEndX = startPosition.x + layerGap;
                        var ringEndY = ringStartY;
                    }
                    var terminations = [{
                        x: ringStartX,
                        y: ringStartY
                    }, {
                        x: ringEndX,
                        y: ringEndY
                    }];
                }
                if (layer.paths[index].ringPathEnd && (layer.paths[index - 1] && layer.paths[index] && topologyMapHelper.directory[layer.paths[index].id].terminations[0] != topologyMapHelper.directory[layer.paths[index - 1].id].terminations[1])) {
                    reverseFlag = true;
                } else if (layer.paths[index].ringParent && topologyMapHelper.directory[layer.paths.filter(word => word.ringPathStart)[0].id].terminations[0] != topologyMapHelper.directory[layer.paths[index].id].terminations[0] && topologyMapHelper.directory[layer.paths.filter(word => word.ringPathStart)[0].id].terminations[1] != topologyMapHelper.directory[layer.paths[index].id].terminations[1]) {

                    reverseFlag = true;

                }
                else {
                    reverseFlag = false;

                }
                this.drawPathsV1(layer, index, map, terminations, stateToDisplay, markerEvents, pathEvents, ccPaths, bundlePaths, reverseFlag);
            } else {
                if (layer.paths[index - 1] && layer.paths[index] && topologyMapHelper.directory[layer.paths[index].id].terminations[0] != topologyMapHelper.directory[layer.paths[index - 1].id].terminations[1]) {
                    reverseFlag = true;

                }
                else {
                    reverseFlag = false;

                }
                this.drawPathsV1(layer, index, map, terminations, stateToDisplay, markerEvents, pathEvents, ccPaths, bundlePaths, reverseFlag)
            }
            startPosition.x = terminations[1].x;

        }
    }
    drawPathsV1(layer, index, map, terminatingPoints, stateToDisplay, markerEvents, pathEvents, ccPaths, bundlePaths, reverseFlag) {
        var layerGroup = layer.layers[layer.layers.length - 1]; //Empty array(layerGroup) created in getLayers
        var type = layer.paths[index].type;
        var UUID = layer.paths[index].id;

        var pointList = terminatingPoints.map((terminatingPoint) => {
            return this.xy2LatLng(map, terminatingPoint.x, terminatingPoint.y);
        })

        var path = topologyMapHelper.directory[UUID] || {};
        // var path = UUID || {}; // if its root id then value is render directly
console.log("path inside drawpathsv1: ",path);
        if (type == "path")
            delete path.selectedPathID; //clear selectedPathID set by path bundle selection

        var isPathBundle = false;
        var ring = false;
        var disablePathBundleFlag = false;
        /***START:Bundle Path */
        let pathWithSibling;
        if (bundlePaths.length > 0) {
            pathWithSibling = layer.paths.filter((val, i) => {
                return val.id == UUID;
            });
            pathWithSibling = pathWithSibling.length > 0 && pathWithSibling[0].siblings;
        }
        if (pathWithSibling != undefined) {
            isPathBundle = true;
        }
        /***END:Bundle Path */

        if (isPathBundle) {
            let bundlePath = Object.assign({}, path);
            bundlePath.siblings = pathWithSibling;
            var stateObjFromStatusPanel = topologyMapHelper.filteredBuldleState(topologyMapHelper.directory, bundlePath, stateToDisplay.path)
        } else
            var stateObjFromStatusPanel = topologyMapHelper.filteredState(path, stateToDisplay.path);

        //drawingPath
        var polyline = new L.Polyline(pointList, {
            className: "topologyPath",
            id: UUID,
            type: type,
            opacity: type == "gPath" ? 0.5 : 1,
            ring: ring,
            weight: isPathBundle && type != "gPath" ? 5 : (type == "uPath" ? 0 : 2),
            color: stateObjFromStatusPanel && stateObjFromStatusPanel.length > 0 ? stateObjFromStatusPanel[0].color : "#acacac", // please verfiy once everthing is complete
            pathWithSibling: pathWithSibling
        });
        // polyline.setText(path.detail.DisplayName, {repeat: false,
        //     offset: 10,
        //     attributes: {'font-weight': 'bold',
        //                  'font-size': '24'}})
        // polyline.on("click", pathEvents.click);
        if(isPathBundle){
            polyline.setText('', {repeat: false, center: true, offset: -8,
                attributes: {'font-size': '12'}})
        }
        else{
        polyline.setText(path.detail.DisplayName, {repeat: false, center: true, offset: -8,
            attributes: {'font-size': '12'}})

        }
        polyline.on("click", pathEvents.click);
        polyline.on("mouseover", pathEvents.enter);
        polyline.on("mouseout", pathEvents.leave);
        polyline.on("contextmenu", pathEvents.contextmenu);
        layerGroup.addLayer(polyline);

        //drawPathBundle
        if (isPathBundle && type != "gPath") {
            var bundleIconPoint = {
                x: terminatingPoints[0].x + (terminatingPoints[1].x - terminatingPoints[0].x) / 2,
                y: terminatingPoints[0].y + (terminatingPoints[1].y - terminatingPoints[0].y) / 2
            }
            var marker = L.marker(this.xy2LatLng(map, bundleIconPoint.x, bundleIconPoint.y), {
                icon: topologyMapHelper.drawPathBundleIcon(topologyMapHelper.directory, pathWithSibling, stateToDisplay.path),
                isShowLabel: true,
                id: UUID,
                type: "bundleIcon",
            }).on('click', function (event) {
                console.log(this, "Marker click event is triggered");
            }, this);
            layerGroup.addLayer(marker);
        }
        //reverse termination points based on order of ring paths:
        if (reverseFlag == true) {
            path.terminations = path.terminations.reverse();
            path.ePoints = path.ePoints.reverse();
        }

        path.terminations && path.terminations.forEach((markerID, terminationIndex) => {
            // if(path.terminations[0]!=path.terminations[1]){
            //     ccPaths = [];
            // }
            this.drawMarkersV1(layer, map, path, index, type, markerID, terminationIndex, terminatingPoints, markerEvents, stateToDisplay, ccPaths);
        }, this)
    }

    drawMarkersV1(layer, map, path, pathIndex, pathType, markerID, terminationIndex, terminatingPoints, markerEvents, stateToDisplay, ccPaths, isRootPathMarker) {
        // path.terminations[0]==path.terminations[1]
        // if(path.terminations[0]!=path.terminations[1]){
        var layerGroup = layer.layers[layer.layers.length - 1];

        //skip drawing first termination from second child node as it has drawn by previous path
        if (pathIndex != 0 && terminationIndex == 0 && !(layer.paths[pathIndex - 1] && layer.paths[pathIndex - 1].type == "uPath"))
            return;

        var markerPoints = this.xy2LatLng(map, terminatingPoints[terminationIndex].x, terminatingPoints[terminationIndex].y);
        /*
            Drawing gMarker
            * cNode should be gPath
            * For termination 1 to be gMarker, check if no previous cNode or previous cNode is gPath/uPath
            * For termination 2 to be gMarker, check if no next cNode or next cNode is gPath/uPath 
        */
     
        let crossConnectedAr = ccPaths.filter((id, i) => {
            let _CCEndPoint1 = topologyMapHelper.directory[id].terminations[0];
            let _CCEndPoint2 = topologyMapHelper.directory[id].terminations[1];
           
           return ((_CCEndPoint1.indexOf(markerID) > -1)&&(_CCEndPoint2.indexOf(markerID) > -1));
        })

        var markerType = "marker";
        if (pathType == "gPath") {
            if (terminationIndex == 0 && (!layer.paths[pathIndex - 1] || layer.paths[pathIndex - 1].type == "gPath" || layer.paths[pathIndex - 1].type == "uPath"))
                markerType = "gMarker";
            else if (terminationIndex == 1 && (!layer.paths[pathIndex + 1] || layer.paths[pathIndex + 1].type == "gPath" || layer.paths[pathIndex + 1].type == "uPath"))
                markerType = "gMarker";
        }
        /*
            DrawingConnectingLine(dotted lines)
            * Check list of marker layers available with the same marker id in previous layer. Multiple marker layer with same id exists in case of cross link
            * Check if marker ID is already exists in present layergroup, then it is crosslink connect with second marker layer instance of previous layer, else connect with 
            first marker layer instance of previous layer
        */
        var previousLayer = layer.layers[layer.layers.length - 2];
        if (previousLayer && markerType != "gMarker") {
            var lMarkerLayerWithSameID = []
            previousLayer.eachLayer((layer) => {
                if (layer.options.id == markerID) {
                    lMarkerLayerWithSameID.push(layer)
                }
            })
            if (lMarkerLayerWithSameID.length > 0) {
                var isMarkerLayerAlreadyExists = false;
                layerGroup.eachLayer((layer) => {
                    if (layer.options.id == markerID)
                        isMarkerLayerAlreadyExists = true
                })
                var previousLayerMarker = isMarkerLayerAlreadyExists ? (lMarkerLayerWithSameID[1] || lMarkerLayerWithSameID[0]) : lMarkerLayerWithSameID[0];
                //previousLayerMarker.options.isShowLabel = false;
               
                // previousLayerMarker.setIcon(this.drawMarkerV1(topologyMapHelper.directory[previousLayerMarker.options.id], markerType, stateToDisplay, false))
                var polyline = new L.Polyline([previousLayerMarker.getLatLng(), markerPoints], {
                    weight: 2,
                    dashArray: "3",
                    dashOffset: "10",
                    opacity: 0.5,
                    color: "#acacac"
                });
                layerGroup.addLayer(polyline)
            }
        }
      
           markerType = crossConnectedAr.length > 0 ? "crossConnectMarker" : markerType  
      
       
           // if (typeof layer.layers[ind].eachLayer === "function") {
                // safe to use the function
              //  layer.layers[ind].eachLayer(function (layer) {
                  console.log("no. of layers: ",layer.layers.length);
                    if(layer.options && layer.options.type){
					console.log(layer.options.type);	
					}
var layerNo=layer.layers.length;
                    
                    //calculateLayerDepthV1(directory, id, layer);
                    // if(topologyMapHelper.directory[markerID].type=='Path'){markerType ='dotMarker';}
                    // else{
                    //     markerType ='Marker'; 
                    // }

                    var marker = L.marker(markerPoints, {
                        icon: this.drawMarkerV1(topologyMapHelper.directory[markerID], markerType, stateToDisplay, undefined, this.eqIcon, layerNo),
                        isShowLabel: true,
                        id: markerID,
                        type: markerType,
                        ccPaths: markerType == "crossConnectMarker" ? crossConnectedAr : []
                    }).on('click', markerEvents.click)
                        .on('mousemove', markerEvents.enter)
                        .on('mouseout', markerEvents.leave)
                        .on('contextmenu', markerEvents.contextmenu)
                    //layer.setIcon(this.drawMarkerV1(layer, layer.options.type, stateToDisplay, layer.options.isShowLabel));
                   // }
               // );
           //
            layerGroup.addLayer(marker);
		
        }
        

        
		
		//
		
		//
		
		
		
    
    drawMarkerV1(itemFromDirectory, type = 'marker', stateToDisplay, isShowLabel = true, eqIcon, layerNo) {
        //  var markerStateToDisplay = stateToDisplay || {};
        console.log("drawMarkerV1: ",layerNo, "itemfromdirectory: ", itemFromDirectory);
        var statesObjFromStatusPanel = topologyMapHelper.filteredState(itemFromDirectory, stateToDisplay.marker)
        
        for (var i = 0; i < statesObjFromStatusPanel.length; i++) {
            var stateObjFromStatusPanel = statesObjFromStatusPanel[i];

            if (stateObjFromStatusPanel) {
                if (stateObjFromStatusPanel.badge) {
                    var stateBadge = {
                        color: stateObjFromStatusPanel.color,
                        badge: stateObjFromStatusPanel.badge
                    }
                } else
                    var stateMarkerColor = stateObjFromStatusPanel.color;
            }
        }
        //truncate markerName
        if (itemFromDirectory.name && itemFromDirectory.name.length > 10)
            var truncatedName = itemFromDirectory.name.slice(0, 11) + "..";
        else {
            var truncatedName = itemFromDirectory.name.slice(0, 11) + "..";
        }
        var markerLabel = type != "gMarker" ? "<div id='mapviewmarkerlabel'>" + (truncatedName || itemFromDirectory.name) + "</div>" : ""
for(var i=0; i<layerNo; i++){
    
var elements=document.getElementsByClassName("showLabel "+i);
console.log("elements:: i:: ",elements," i : ", i, "length: ",elements.length);
if(elements.length>0){
    [].forEach.call(elements, function(ele){
        console.log(ele);
//ele.style.display='none';
if(ele && ele.getElementsByClassName(itemFromDirectory.detail.UUID) && ele.getElementsByClassName(itemFromDirectory.detail.UUID)[0]){
    //var doc=document.getElementById("topologyMap"); console.log(doc);
    //doc.getElementsByClassName('statusPanelWrapper')[0]
    ele.style.display='none';
    //ele.getElementsByClassName(itemFromDirectory.detail.UUID)[0].style.display='none';

}
})
}

}



//     var collapseElements=document.getElementsByClassName("showLabel undefined");
// if(collapseElements.length>0){
//     [].forEach.call(collapseElements, function(ele){
// ele.style.display='block';

// })
// }

/*
<span style="
    display: inline;
    float: right;
    position: absolute;
">test: testval<br> test1: test1val</span>
itemFromDirectory.name.slice(0, 10) + ".."
*/
/*
        return new L.DivIcon({
            className: isShowLabel ? 'showLabel '+layerNo : ''+layerNo,
            html: "<div id='mapview" + type + "container' className='level'>\
                                " + topologyMapHelper.drawSVG({
                value: type,
                type: type,
                color: stateMarkerColor ? stateMarkerColor : "#acacac",
                state: stateBadge,
                eqIcon: eqIcon,
                details: itemFromDirectory
            }) + "<span style=float:right;position:absolute>Type: "+itemFromDirectory.detail.Type+"<br>SubType: "+itemFromDirectory.detail.SubType.slice(0, 5) + ".."+"</span>\
                                " + markerLabel + " \
                            </div>",

            iconSize: type == "gMarker" ? [10, 10] : [48, 48],
            stateIconColor: stateBadge ? stateBadge.color : "#acacac",
            isAlarm: Object.keys(stateToDisplay).filter((x) => (stateToDisplay[x][0] && stateToDisplay[x][0].badge)).length > 0 ? true : false
        });*/
        console.log(stateObjFromStatusPanel);
        let color=stateMarkerColor ? stateMarkerColor : "#acacac";
       // let badgeColor=stateObjFromStatusPanel.badge?stateObjFromStatusPanel.color:"#acacac";

       let badgeColor= (stateToDisplay.marker && Object.keys(stateToDisplay.marker)[0]!='None' && stateBadge) ? stateBadge.color : "#acacac";
var svg='';
var customIcon='';
var stateinfo='';
var stateObjFromStatusPanelText=stateObjFromStatusPanel?stateObjFromStatusPanel.text:'';
var stateObjFromStatusPanelColor=stateObjFromStatusPanel?stateObjFromStatusPanel.color:'#acacac';
        if(type=='crossConnectMarker'){
               
                if(customIcon != ''){
                    if(stateBadge){
                        stateinfo = `<circle cx="50" cy="55" r="40.5" fill="${color}" style="stroke:white ;stroke-width:1px;"/>
                        <text x="45" y="15" text-anchor="middle" font-family="Arial" style="font-weight: bold; font-size:500%" fill="#f9fbfd" dy="1em">
                            ${stateBadge.badge}
                        </text>`;
                    }
                    if(request.color=="#acacac"){
                        fillColor='none';
                    }
                    else{
                        fillColor=color;
                                        }
    
               svg = `<svg xmlns="http://www.w3.org/2000/svg" id="mapviewmarkersvg" width="54px" height="54px" class="equipment-ic-wrap" viewBox="0 0 380 380" preserveAspectRatio="none">
 <g>
  <rect class="customIconClass" style="fill:${fillColor}; stroke:${color};stroke-width:10px" id="canvas_background" height="300" width="320" y="65" x="20"/>
  <rect class="customIconClass" fill="none" stroke-width="10" x="270.5" y="10" width="50" height="70.000001" id="svg_4" rx="12" stroke=${color} />
 </g>
 <g>
  <rect id="svg_2" style="fill:none;" y="9%" x="10%" height="80%" width="80%" stroke-width="12"/>
  <g id="svg_1">
   <svg id="svg_3" y="10%" x="10%" height="80%" width="80%">
    <!-- START: ICON-->
    ${customIcon}
    <!-- END:ICON-->
   </svg>
  </g>
 
 </g>${stateinfo && stateinfo}</svg>`;
        }
 else if(!customIcon || customIcon == ''){
    svg = `<svg version="1.1" id="mapviewmarkersvg" 
    xmlns="http://www.w3.org/2000/svg" 
    xmlns:xlink="http://www.w3.org/1999/xlink" 
    x="0px" y="0px" 
    viewBox="0 0 34 24"
    style="enable-background:new 0 0 30 30;" 
    xml:space="preserve"> 

    <g class="currentLayer" style="">                                
            <g id="CrossConnectEquipmentPath" transform="translate(-712.000000, -574.000000)" stroke="#acacac" stroke-width="2" style="
    fill: #ffffff;
">
                <g id="Group-2" transform="translate(258.000000, 574.000000)">
                    <rect id="Rectangle" x="465" y="-7" width="10" height="10" rx="2"></rect>
                </g>
            </g>
            
    </g>
</svg>`
 }

 return new L.DivIcon({
    className: isShowLabel ? 'showLabel '+layerNo : ''+layerNo,
    html: `
    <div id="topologyModalWrapper" className="modalPopOver">`+svg+`
            <div id="topologyModal" style="border-top:4px solid #acacac">
    <div class="modalHeader">
<div class="modalHeaderContent">
<span class=`+itemFromDirectory.detail.UUID+`></span>
<strong class="itemName"></strong><div class="itemsCount">`+itemFromDirectory.detail.DisplayName.slice(0, 11) +`</div><div class="statusInfo"><svg width="10" height="10" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="`+stateObjFromStatusPanelColor+`"></circle></svg><div class="name">`+stateObjFromStatusPanelText+`</div></div></div><div class="modalClose">
</div>
</div>
</div>
</div>
`,
iconSize: type == "gMarker"? [10,10]:[48, 48],
stateIconColor: stateBadge ? stateBadge.color : "#acacac",
isAlarm: Object.keys(stateToDisplay).filter((x) => (stateToDisplay[x][0] && stateToDisplay[x][0].badge)).length > 0 ? true : false
   

});


        }
        else{
            console.log("stateObjFromStatusPanel: ",stateObjFromStatusPanel, "stateToDisplay: ",stateToDisplay);
            
            return new L.DivIcon({
                className: isShowLabel ? 'showLabel '+layerNo : ''+layerNo,
                html: `
                <div id="topologyModalWrapper" className="modalPopOver">
                        <div id="topologyModal" style="border-top:4px solid `+badgeColor+`">
                <div class="modalHeader">
    <div class="modalHeaderContent">
    <span class=`+itemFromDirectory.detail.UUID+`></span>
    <strong class="itemName">EQUIPMENT</strong><div class="itemsCount">`+itemFromDirectory.detail.DisplayName.slice(0, 11) +`</div><div class="statusInfo"><svg width="10" height="10" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="`+stateObjFromStatusPanelColor+`"></circle></svg><div class="name">`+stateObjFromStatusPanelText+`</div></div></div><div class="modalClose">
    </div>
    </div>
    </div>
    </div>
    `,
    iconSize: type == "gMarker"? [10,10]:[48, 48],
    stateIconColor: stateBadge ? stateBadge.color : "#acacac",
    isAlarm: Object.keys(stateToDisplay).filter((x) => (stateToDisplay[x][0] && stateToDisplay[x][0].badge)).length > 0 ? true : false
               
            
        });

        }


        
}
}
