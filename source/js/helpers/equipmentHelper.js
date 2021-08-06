/**
 * 
 * 
 * @class equipmentMapHelper
 * @description Helper class for equipemnt map.
 * @ignore
 */
class equipmentMapHelper {


    constructor() {
        this.eqLocationIcon;
        this.markers = L.markerClusterGroup({
            iconCreateFunction: function (cluster) {
                var item = {};
                var items = cluster.getAllChildMarkers()
                var total = items.length;
                items.forEach(function (x) {
                    if (x.options.icon.options.isAlarm) {
                        if (item[x.options.icon.options.stateIconColor]) {
                            item[x.options.icon.options.stateIconColor] += 1;
                        }
                        else {
                            item[x.options.icon.options.stateIconColor] = 1;
                        }
                    }
                });
                if (Object.keys(item).length > 0)
                    var piChartInput = Object.keys(item).map(function (x) {
                        return { color: x, value: item[x] / total }
                    })
                return L.divIcon({ className: '', html: equipmentMapHelper.drawSVG({ value: "cluster" }, total, piChartInput) });
            },
            zoomToBoundsOnClick: false
        }).on('clusterclick', function (event) {
            if (equipmentMapHelper.clickedClusterID == event.latlng.lat + "$$" + event.latlng.lng) {
                // event.layer.zoomToBounds();
            }
            else {
                equipmentMapHelper.clickedClusterID = event.latlng.lat + "$$" + event.latlng.lng
                this.clearSelection();

                var cluster = event.layer._icon.querySelector("rect")
                cluster.classList.add("selected");
            }
        }, this)
    }
    
    static directory;

    onLoad(wrapperElement) {
        wrapperElement.style.height = window.outerHeight * 3 + "px";
        wrapperElement.style.width = window.outerWidth * 3 + "px";
    }

    onMoveEnd(elem) {
        let wrapperElement = elem.querySelector(".leaflet-customOverlay-pane"),
            containerElement = elem.querySelector(".leaflet-map-pane"),
            transformedValue = containerElement.getBoundingClientRect(),
            transformedtop = transformedValue.top - document.getElementById("equipmentMap").getBoundingClientRect().top;
        wrapperElement.style.transform = "translate(" + (- window.outerWidth - transformedValue.left) + "px," + (- window.outerHeight - transformedtop) + "px) translateZ(0)";
    }

    clearSelection() {
        var selectedElement = document.getElementById("equipmentMap").querySelectorAll(".selected");
        if (selectedElement[0])
            selectedElement[0].classList.remove("selected");
    }

    /**
     * 
     * @param {any} directory   (Hash table)
     * @returns {any} markers   (instance of markerClusterGroup)
     * @desc Accepts directory object, iniatialize markers and clusters
     * @memberof equipmentMapHelper
     */
    setEqLocationIcon(eqLocIcon){
        this.eqLocationIcon =eqLocIcon;
    }
    getMarkers(directory, stateToDisplay, markerClick = () => { }, props, constructContextMenuForMarkers) {
        window.dataToTest = Object.assign({}, directory);// Remove once testing done
        Object.keys(directory).forEach(function (key) {
            let value = directory[key];
            if (value.latitude && value.longitude) {
                let marker = L.marker([value.latitude, value.longitude], {
                    icon: equipmentMapHelper.drawMarker(value, stateToDisplay,this.eqLocationIcon),
                    UUID: key
                }).on('click', function (event) {
                    if (event.target.options && event.target.options.UUID && markerClick) {
                        var details = Object.assign({}, directory[event.target.options.UUID],directory[event.target.options.UUID].detail);

                        //Removing custom prop from directory
                        if (details.state)
                            delete details.state

                        markerClick(details);
                    }

                    this.clearSelection();
                    var path = event.target._icon.querySelector("path")
                    var rect = event.target._icon.querySelector("rect")
                    path.classList.add("selected");
                    if(rect){rect.classList.add("selected");}

                }, this).on('contextmenu', function (event) {
                    console.log('context menu event..');
                    event.target.bindContextMenu(constructContextMenuForMarkers(
                        event.sourceTarget.options.UUID, event.sourceTarget.options.type, props, directory
                    )
                    )
                })
                this.markers.addLayer(marker);
            }
            // else{
            // //console.error("latitude or longitude is present for the specified key ",key);
            // window.NoLL.push(key);
            // }
        }, this);

        return this.markers

    };

    updateMarkers(directory, stateToDisplay, markercluster) {
        let tempEqLocIc =this.eqLocationIcon;
        if (markercluster) {
            let lMarkers = markercluster.getLayers();
            lMarkers.forEach(function (item) {
                let value = directory[item.options.UUID];
                item.setIcon(equipmentMapHelper.drawMarker(value, stateToDisplay,tempEqLocIc))
            })
            markercluster.refreshClusters();
        }
    }

    /**
     * 
     * @static
     * @param {any} request 
     * @param {any} siteCount 
     * @param {any} pieValue 
     * @returns 
     * 
     * @memberof equipmentMapHelper
     */
    static drawSVG(request, siteCount, pieValue) {
        //get all the properties here through parameters..
//       console.log(request);
        // var siteCount = siteCount > 9999 ? "9999+ Sites" : siteCount + " Sites";
        var siteCount = siteCount + " Sites";
        var lsize = ["small", "medium", "large", "xlarge"]
        if (request.state)
            var stateinfo = `<rect width="80%" height="80%" style="fill:${request.state.color};stroke-width:1;stroke:rgb(0,0,0)" x="10%" y="10%"></rect>
            <circle cx="85%" cy="15%" r=".5em" fill="red" stroke="#fff"></circle>
            <text fill="#f9fbfd" x="85%" y="21%" text-anchor="middle" font-family="Arial" style="font-size:70%">${request.state.badge}</text>`;
        var svg = "";
        switch (request.value) {
            case "cluster":
                svg = '<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="mapviewclustersvg" viewBox="-3 -3 6 6" width="6" height="6" style="transform: rotate(-90deg);">\
                        <g>\
                            <rect id="mapviewclusterrect" x="-2.75" y="-2.75" rx="0.25" ry="0.25" height="5.5" width="5.5"></rect>\
                            ' + (pieValue ? getPiChartElements(pieValue) : "") + '\
                            <text id="mapviewclustertext" x="0" y="2" font-size="1" text-anchor="middle">' + siteCount + '</text>\
                        </g>\
                    </svg>';
                break;
            case "marker":

                var customIcon='';
                if(request.eqLocationIcon){
                    var combination_values=[];
                for(var i=0; i<request.eqLocationIcon.customGUI_combinations.length;i++){
//console.log(request.eqLocationIcon.customGUI_combinations[i]);
if(request.details.detail[request.eqLocationIcon.customGUI_combinations[i]]){
    combination_values.push(request.details.detail[request.eqLocationIcon.customGUI_combinations[i]]);
}

if(request.eqLocationIcon[request.eqLocationIcon.customGUI_combinations.join(',')] && request.details.detail[request.eqLocationIcon.customGUI_combinations[i]]){
combination=request.eqLocationIcon.customGUI_combinations.join(',');

}
}
if(request.eqLocationIcon[combination_values.join(',')])
    {
    customIcon=request.eqLocationIcon[combination_values.join(',')];
    }
else{
        for(var j=0; j<combination_values.length; j++){
    
        if(request.eqLocationIcon[combination_values.slice(0, j+1).join(",")]){
                customIcon=request.eqLocationIcon[combination_values.slice(0, j+1).join(",")];
            }
            }
    }


            }
            if (request.size) {
                var scale = lsize.indexOf(request.size.value) * 0.25 + 0.75;
                var size = "style='transform-origin:bottom; transform:scale(" + scale + "," + scale + ")'";
            }

            if(!customIcon || customIcon == ''){
                svg = '<svg id="mapviewmarkersvg" viewBox="-4 -2 26 30" ' + (size ? size : "") + 'version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\
                        <g id="Symbols-(Map)---Nokia" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\
                            <g fill="'+ request.color + '">\
                                <path stroke="'+ request.color + '" d="M7.9964124,24 C7.9964124,24 16.3051778,17.7981979 15.9913273,12.2953973 C15.7138588,7.43048918 12.411882,4 7.9964124,4 C3.5809428,4 0.0992023405,7.71561877 0.00149746311,12.2953973 C-0.126521704,18.2961154 7.9964124,24 7.9964124,24  Z" id="Oval"></path>\
                            '+ (stateinfo ? stateinfo : "") + '</g>\
                        </g>\
                    </svg>'

            }
            else if(customIcon != ''){
                var fillColor="";
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
                <rect width="80%" height="80%" style="fill:${fillColor};stroke-width:1;stroke:rgb(0,0,0)" x="10%" y="10%"></rect>
               
                <svg width="80%" height="80%" x="10%" y="10%" style="border:solid red 2px;">  
                <!-- START: ICON-->
                ${customIcon}
                <!-- END:ICON-->  
                </svg>
                ${stateinfo && stateinfo}
                </svg>`
            }
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


    static drawMarker(itemFromDirectory, stateToDisplay,eqLocationIcon) {
        const stateToDisplayKeys = Object.keys(stateToDisplay);
        let lSubState = {};
        for (var i = 0; i < stateToDisplayKeys.length; i++) {
            var state = stateToDisplayKeys[i];
            lSubState = lSubState ? lSubState : {};
            lSubState[state] = stateToDisplay[state].map(function (value) {
                return value.text;
            })
        }

        let stateFromDir = itemFromDirectory.state;

        for (var i = 0; i < stateToDisplayKeys.length; i++) {
            var state = stateToDisplayKeys[i];
            if (stateFromDir && stateFromDir[state]) {
                var filteredSubState = lSubState[state].filter(function (x) {
                    return stateFromDir[state].indexOf(x) != -1
                })[0];
                if (filteredSubState) {
                    var stateIconColor = stateToDisplay[state][lSubState[state].indexOf(filteredSubState)]
                    if (stateIconColor.badge) {
                        var stateBadge = { color: stateIconColor.color, badge: stateIconColor.badge }
                    }
                    else
                        var stateMarkerColor = stateIconColor.color;
                }
            }
        }
        return new L.DivIcon({
            className: '',
            html: "<div id='mapviewmarkercontainer'>\
                                    "+ equipmentMapHelper.drawSVG({ value: "marker", color: stateMarkerColor ? stateMarkerColor : "#acacac", state: stateBadge,eqLocationIcon:eqLocationIcon, details:itemFromDirectory }) + "\
                                    <div id='mapviewmarkerlabel'>" + itemFromDirectory.name + "</div>\
                                </div>",

            iconSize: [48, 48],
            stateIconColor: stateBadge ? stateBadge.color : "#acacac",
            isAlarm: Object.keys(stateToDisplay).filter((x) => (stateToDisplay[x][0] && stateToDisplay[x][0].badge)).length > 0 ? true : false
        });
    }

}

export default equipmentMapHelper;