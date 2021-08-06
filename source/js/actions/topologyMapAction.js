import axios from 'axios';
import ReactDOM from 'react-dom';

import { ProgressIndicatorCircular, Snackbar } from '@nokia-csf-uxr/csfWidgets';

export const _loadExternalComponent = (componentName, _props, placeholder) => {
    //This Condition is to load/send message outside our SURE-UI APP i.e for Iframe communication
    if (window.self !== window.top) {
        window.parent.postMessage(_props, "*")
    }
    else {
        let element = React.createElement(componentName, _props);
        ReactDOM.render(element, document.getElementById(placeholder));
    }
}

export const resetStore = () => {
    return function (dispatch) {
        dispatch({
            type: "TOPOLOGY_MAP_RESET_STORE"
        });
    }

}
export const customError = (err) => {
    return function (dispatch) {
        dispatch({
            type: "TOPOLOGY_MAP_SHOW_ERROR",
            payload: err
        })
    }
}

export const getPathName = (data) => {
    return function (dispatch) {
        dispatch({
            type: "TOPOLOGY_MAP_GET_PATH_NAME",
            payload: data
        });
    }
}

export const clearPathName = () => {
    return function (dispatch) {
        dispatch({
            type: "TOPOLOGY_MAP_CLEAR_PATH_NAME"
        });
    }
}

export const getRootPathID = (pathID) => {
    return function (dispatch) {
        dispatch({
            type: "GET_RootPathID",
            payload: pathID
        });
    }
}

export const updateTypeID = (typeId) => {
    return function (dispatch) {
        dispatch({
            type: "MAP_GET_TYPE_ID",
            payload: typeId
        });
    }
}

export const updateModalInfo = (data) => {
    return function (dispatch) {
        dispatch(
            {
                type: "TOPOLOGY_MAP_UPDATE_MODAL_DATA",
                payload: data
            }
        )
    }
}

export const updateStatusPanel = (data) => {
    //Processing
    let stateToDisplay = {};
    data.status.forEach(function (status) {
        stateToDisplay[status.group] = stateToDisplay[status.group] || {};
        let filteredobj = status.items.filter(function (item) {
            return item.text == status.value
        })[0];
        if (filteredobj.text)
            stateToDisplay[status.group][filteredobj.text] = filteredobj.values.filter(function (value) {
                return value.enabled
            }).map(function (value) {
                let statusName = value.text.toUpperCase()
                let result = { text: statusName, color: value.color }
                if (value.badge)
                    result.badge = value.badge
                return result
            })
    })
    return function (dispatch) {
        dispatch({
            type: "TOPOLOGY_MAP_UPDATE_STATUS_PANEL",
            payload: data
        });

        dispatch({
            type: "TOPOLOGY_MAP_SET_STATE_TO_DISPLAY",
            payload: stateToDisplay
        });
    }

}

var progressOptions = {
    spinner: "right"
    , overlay: true
    , css: { small: false, medium: false, large: false, xlarge: true, xxlarge: false }

};

export const getTopologyData = (axiosdata, typeId, props) => {
    var component1 = React.createElement(ProgressIndicatorCircular, progressOptions);
    document.getElementById("progressIndicatorCircularIDComp") && ReactDOM.render(component1, document.getElementById("progressIndicatorCircularIDComp"));

    if (axiosdata.headers["Response-Type"] || axiosdata.headers["response-type"]) {
        delete axiosdata.headers["Response-Type"];
        delete axiosdata.headers["response-type"]
    }
    axiosdata.headers["TransformationEnabled"] = false;

    return function (dispatch) {
  /*
      var directory={
  "2b1257ae-b3ef-11eb-84c1-0242ac14010b": {
    "type": "Equipment",
    "name": "fb1pwbxlf02",
    "id": "2b1257ae-b3ef-11eb-84c1-0242ac14010b",
    "terminations": [

    ],
    "location": "null",
    "ePoints": [

    ],
    "state": {
      "CreatedByAppId": [
        "SURE_APP"
      ],
      "CreatedByUgId": [
        "T0_Admin_UserGroup"
      ],
      "DeploymentState": [
        "deployed"
      ],
      "CreatedByUserId": [
        "SureRDAUser"
      ],
      "OperationalState": [
        "DOWN"
      ],
      "AORAlarmState": [
        "MAJOR"
      ],
      "AdministrativeState": [
        "TERMINATED"
      ],
      "CreatedByTenantId": [
        "T0"
      ]
    },
    "cNodes": [

    ],
    "detail": {
      "UUID": "2b1257ae-b3ef-11eb-84c1-0242ac14010b",
      "Type": "NE",
      "DiscoveredName": "network:172.17.132.1",
      "SureName": "network:172.17.132.1",
      "contextId": "1042:1",
      "SubType": "210 WBX-32Q",
      "DisplayName": "fb1pwbxlf02",
      "Category": "INFRASTRUCTURE",
      "CreationDate": "2021-05-13T13:28:56.611Z",
      "LastUpdateDate": "2021-05-13T13:28:56.611Z",
      "ResourceCategory": "OWNED_RESOURCE",
      "Label": "Equipment",
      "TenantSureName": "T0",
      "CreatedBy": "MAYA-NFMP",
      "rootNetworkElement": "False",
      "SystemAddress": "172.17.132.1",
      "SiteId": "172.17.132.1",
      "SiteName": "fb1pwbxlf02",
      "DescriptorVersion": "5.0.0",
      "ProductType": "68",
      "DeviceRole": "WBX 210 Leaf",
      "VersionType": "12",
      "ChassisMode": "modeA",
      "MgmtIpAddrType": "ipv4",
      "BaseMacAddress": "D0-99-D5-A8-1A-41",
      "Version": "TiMOS-DC-B-5.3.2-90.274",
      "IpAddress": "172.17.132.1",
      "ChassisType": "dc_wbx_32Q_1Slot",
      "SysObjectId": ".1.3.6.1.4.1.6527.1.18.4",
      "Location": "N/A"
    }
  },
  "b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2": {
    "type": "Equipment",
    "name": "fb1pvsglf04",
    "id": "b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2",
    "terminations": [

    ],
    "location": "null",
    "ePoints": [

    ],
    "state": {
      "CreatedByAppId": [
        "SURE_APP"
      ],
      "CreatedByUgId": [
        "T0_Admin_UserGroup"
      ],
      "DeploymentState": [
        "deployed"
      ],
      "CreatedByUserId": [
        "SureRDAUser"
      ],
      "OperationalState": [
        "UP"
      ],
      "AORAlarmState": [
        "CRITICAL"
      ],
      "AdministrativeState": [
        "TERMINATED"
      ],
      "CreatedByTenantId": [
        "T0"
      ]
    },
    "cNodes": [

    ],
    "detail": {
      "UUID": "b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2",
      "Type": "NE",
      "DiscoveredName": "network:172.17.132.21",
      "SureName": "network:172.17.132.21",
      "contextId": "1042:1",
      "SubType": "7850",
      "DisplayName": "fb1pvsglf04",
      "Category": "INFRASTRUCTURE",
      "CreationDate": "2021-05-13T13:28:56.923Z",
      "LastUpdateDate": "2021-05-13T13:28:56.923Z",
      "ResourceCategory": "OWNED_RESOURCE",
      "Label": "Equipment",
      "TenantSureName": "T0",
      "CreatedBy": "MAYA-NFMP",
      "rootNetworkElement": "False",
      "SystemAddress": "172.17.132.21",
      "SiteId": "172.17.132.21",
      "SiteName": "fb1pvsglf04",
      "DescriptorVersion": "5.0.0",
      "ProductType": "38",
      "DeviceRole": "VSG 7850",
      "VersionType": "12",
      "ChassisMode": "modeA",
      "MgmtIpAddrType": "ipv4",
      "BaseMacAddress": "68-54-ED-07-68-00",
      "Version": "TiMOS-DC-B-5.3.2-90.274",
      "IpAddress": "172.17.132.21",
      "ChassisType": "dc_tor_1Slot",
      "SysObjectId": ".1.3.6.1.4.1.6527.1.18.1",
      "Location": "N/A"
    }
  },
  "002b41f348-b3ef-11eb-84c1-0242ac14010b00": {
    "type": "Equipment",
    "name": "fb1pvsglf06",
    "id": "002b41f348-b3ef-11eb-84c1-0242ac14010b00",
    "terminations": [

    ],
    "location": "null",
    "ePoints": [

    ],
    "state": {
      "CreatedByAppId": [
        "SURE_APP"
      ],
      "CreatedByUgId": [
        "T0_Admin_UserGroup"
      ],
      "DeploymentState": [
        "deployed"
      ],
      "CreatedByUserId": [
        "SureRDAUser"
      ],
      "OperationalState": [
        "DOWN"
      ],
      "AdministrativeState": [
        "TERMINATED"
      ],
      "CreatedByTenantId": [
        "T0"
      ]
    },
    "cNodes": [

    ],
    "detail": {
      "UUID": "002b41f348-b3ef-11eb-84c1-0242ac14010b00",
      "Type": "NE",
      "DiscoveredName": "network:172.17.132.21",
      "SureName": "network:172.17.132.21",
      "contextId": "1042:1",
      "SubType": "7850",
      "DisplayName": "fb1pvsglf06",
      "Category": "INFRASTRUCTURE",
      "CreationDate": "2021-05-13T13:28:56.923Z",
      "LastUpdateDate": "2021-05-13T13:28:56.923Z",
      "ResourceCategory": "OWNED_RESOURCE",
      "Label": "Equipment",
      "TenantSureName": "T0",
      "CreatedBy": "MAYA-NFMP",
      "rootNetworkElement": "False",
      "SystemAddress": "172.17.132.21",
      "SiteId": "172.17.132.21",
      "SiteName": "fb1pvsglf06",
      "DescriptorVersion": "5.0.0",
      "ProductType": "38",
      "DeviceRole": "VSG 7850",
      "VersionType": "12",
      "ChassisMode": "modeA",
      "MgmtIpAddrType": "ipv4",
      "BaseMacAddress": "68-54-ED-07-68-00",
      "Version": "TiMOS-DC-B-5.3.2-90.274",
      "IpAddress": "172.17.132.21",
      "ChassisType": "dc_tor_1Slot",
      "SysObjectId": ".1.3.6.1.4.1.6527.1.18.1",
      "Location": "N/A"
    }
  },
  "002b7f98cc-b3ef-11eb-84c1-0242ac14010b00": {
    "type": "Path",
    "name": "00from-172.17.132.1-id-1739200",
    "id": "002b7f98cc-b3ef-11eb-84c1-0242ac14010b00",
    "terminations": [
      "002b41f348-b3ef-11eb-84c1-0242ac14010b00",
      "b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2"
    ],
    "location": "null",
    "ePoints": [
      "2b1257ae-b3ef-11eb-84c1-0242ac14010b",
      "b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2"
    ],
    "state": {
      "CreatedByAppId": [
        "SURE_APP"
      ],
      "CreatedByUgId": [
        "T0_Admin_UserGroup"
      ],
      "DeploymentState": [
        "deployed"
      ],
      "CreatedByUserId": [
        "SureRDAUser"
      ],
      "OperationalState": [
        "UP"
      ],
      "AdministrativeState": [
        "TERMINATED"
      ],
      "CreatedByTenantId": [
        "T0"
      ]
    },
    "cNodes": [
      "222b7f98cc-b3ef-11eb-84c1-0242ac14010b22",
      "cc2b7f98cc-b3ef-11eb-84c1-0242ac14010bcc"
    ],
    "detail": {
      "UUID": "002b7f98cc-b3ef-11eb-84c1-0242ac14010b00",
      "Type": "ServiceTunnelPath",
      "DiscoveredName": "serviceTunnel:from-172.17.132.1-id-17392",
      "SureName": "serviceTunnel:from-172.17.132.1-id-17392",
      "contextId": "1042:1",
      "SubType": "VXLAN",
      "DisplayName": "from-172.17.132.1-id-17392",
      "Category": "INFRASTRUCTURE",
      "CreationDate": "2021-05-13T13:28:57.327Z",
      "LastUpdateDate": "2021-05-13T13:28:57.327Z",
      "ResourceCategory": "OWNED_RESOURCE",
      "Label": "Path",
      "TenantSureName": "T0",
      "CreatedBy": "MAYA-NFMP",
      "rootNetworkElement": "False",
      "underlyingTransport": "vxlan",
      "pathId": "17392",
      "fromNodeId": "172.17.132.1",
      "numberOfFunctionalUnderlyingPaths": "0",
      "fromNodeName": "fb1pwbxlf06",
      "egressSnmpPortId": "503316480",
      "toNodeId": "172.17.132.21",
      "svcConnectionType": "p2p",
      "actualPathMtu": "9166",
      "pathMtu": "9166",
      "redundantVcId": "0",
      "isAutoselectable": "true",
      "availableBandwidth": "0",
      "vlanVcEtherType": "33024",
      "autoSdp": "auto",
      "pbbEtype": "35047",
      "creationOrigin": "evpnPmsi",
      "redundantServiceId": "0",
      "redundantPathId": "0",
      "svcTunnelType": "sdp",
      "toNodeName": "fb1pvsglf04",
      "loadFactor": "33.0",
      "encapsulationType": "martini",
      "transmittedHelloMessages": "0",
      "sdpActiveLspType": "notApplicable",
      "receivedHelloMessages": "0",
      "numberOfUnderlyingTransportPaths": "0",
      "operBandwidth": "0",
      "signallingType": "none",
      "terminatingSiteId": "172.17.132.21"
    }
  },
  "cc2b7f98cc-b3ef-11eb-84c1-0242ac14010bcc": {
    "type": "Path",
    "name": "ccfrom-172.17.132.1-id-17392cc",
    "id": "cc2b7f98cc-b3ef-11eb-84c1-0242ac14010bcc",
    "terminations": [
      "002b41f348-b3ef-11eb-84c1-0242ac14010b00",
      "002b41f348-b3ef-11eb-84c1-0242ac14010b00"
    ],
    "ePoints": [
      "002b41f348-b3ef-11eb-84c1-0242ac14010b00",
      "002b41f348-b3ef-11eb-84c1-0242ac14010b00"
    ],
    "location": "null",
    "state": {
      "CreatedByAppId": [
        "SURE_APP"
      ],
      "CreatedByUgId": [
        "T0_Admin_UserGroup"
      ],
      "DeploymentState": [
        "deployed"
      ],
      "CreatedByUserId": [
        "SureRDAUser"
      ],
      "OperationalState": [
        "UP"
      ],
      "AdministrativeState": [
        "TERMINATED"
      ],
      "CreatedByTenantId": [
        "T0"
      ]
    },
    "cNodes": [

    ],
    "detail": {
      "UUID": "cc2b7f98cc-b3ef-11eb-84c1-0242ac14010bcc",
      "Type": "ServiceTunnelPath",
      "DiscoveredName": "serviceTunnel:from-172.17.132.1-id-17392",
      "SureName": "serviceTunnel:from-172.17.132.1-id-17392",
      "contextId": "1042:1",
      "SubType": "VXLAN",
      "DisplayName": "from-172.17.132.1-id-17392",
      "Category": "INFRASTRUCTURE",
      "CreationDate": "2021-05-13T13:28:57.327Z",
      "LastUpdateDate": "2021-05-13T13:28:57.327Z",
      "ResourceCategory": "OWNED_RESOURCE",
      "Label": "Path",
      "TenantSureName": "T0",
      "CreatedBy": "MAYA-NFMP",
      "rootNetworkElement": "False",
      "underlyingTransport": "vxlan",
      "pathId": "17392",
      "fromNodeId": "172.17.132.1",
      "numberOfFunctionalUnderlyingPaths": "0",
      "fromNodeName": "fb1pwbxlf06",
      "egressSnmpPortId": "503316480",
      "toNodeId": "172.17.132.21",
      "svcConnectionType": "p2p",
      "actualPathMtu": "9166",
      "pathMtu": "9166",
      "redundantVcId": "0",
      "isAutoselectable": "true",
      "availableBandwidth": "0",
      "vlanVcEtherType": "33024",
      "autoSdp": "auto",
      "pbbEtype": "35047",
      "creationOrigin": "evpnPmsi",
      "redundantServiceId": "0",
      "redundantPathId": "0",
      "svcTunnelType": "sdp",
      "toNodeName": "fb1pvsglf06",
      "loadFactor": "33.0",
      "encapsulationType": "martini",
      "transmittedHelloMessages": "0",
      "sdpActiveLspType": "notApplicable",
      "receivedHelloMessages": "0",
      "numberOfUnderlyingTransportPaths": "0",
      "operBandwidth": "0",
      "signallingType": "none",
      "terminatingSiteId": "172.17.132.21"
    }
  },
  "cc3b7f98cc-b3ef-11eb-84c1-0242ac140103cc": {
    "type": "Path",
    "name": "ccfrom-172.17.132.1-id-17392cc",
    "id": "cc2b7f98cc-b3ef-11eb-84c1-0242ac14010bcc",
    "terminations": [
      "002b41f348-b3ef-11eb-84c1-0242ac14010b00",
      "002b41f348-b3ef-11eb-84c1-0242ac14010b00"
    ],
    "ePoints": [
      "002b41f348-b3ef-11eb-84c1-0242ac14010b00",
      "002b41f348-b3ef-11eb-84c1-0242ac14010b00"
    ],
    "location": "null",
    "state": {
      "CreatedByAppId": [
        "SURE_APP"
      ],
      "CreatedByUgId": [
        "T0_Admin_UserGroup"
      ],
      "DeploymentState": [
        "deployed"
      ],
      "CreatedByUserId": [
        "SureRDAUser"
      ],
      "OperationalState": [
        "UP"
      ],
      "AdministrativeState": [
        "TERMINATED"
      ],
      "CreatedByTenantId": [
        "T0"
      ]
    },
    "cNodes": [

    ],
    "detail": {
      "UUID": "cc2b7f98cc-b3ef-11eb-84c1-0242ac14010bcc",
      "Type": "ServiceTunnelPath",
      "DiscoveredName": "serviceTunnel:from-172.17.132.1-id-17392",
      "SureName": "serviceTunnel:from-172.17.132.1-id-17392",
      "contextId": "1042:1",
      "SubType": "VXLAN",
      "DisplayName": "from-172.17.132.1-id-17392",
      "Category": "INFRASTRUCTURE",
      "CreationDate": "2021-05-13T13:28:57.327Z",
      "LastUpdateDate": "2021-05-13T13:28:57.327Z",
      "ResourceCategory": "OWNED_RESOURCE",
      "Label": "Path",
      "TenantSureName": "T0",
      "CreatedBy": "MAYA-NFMP",
      "rootNetworkElement": "False",
      "underlyingTransport": "vxlan",
      "pathId": "17392",
      "fromNodeId": "172.17.132.1",
      "numberOfFunctionalUnderlyingPaths": "0",
      "fromNodeName": "fb1pwbxlf06",
      "egressSnmpPortId": "503316480",
      "toNodeId": "172.17.132.21",
      "svcConnectionType": "p2p",
      "actualPathMtu": "9166",
      "pathMtu": "9166",
      "redundantVcId": "0",
      "isAutoselectable": "true",
      "availableBandwidth": "0",
      "vlanVcEtherType": "33024",
      "autoSdp": "auto",
      "pbbEtype": "35047",
      "creationOrigin": "evpnPmsi",
      "redundantServiceId": "0",
      "redundantPathId": "0",
      "svcTunnelType": "sdp",
      "toNodeName": "fb1pvsglf06",
      "loadFactor": "33.0",
      "encapsulationType": "martini",
      "transmittedHelloMessages": "0",
      "sdpActiveLspType": "notApplicable",
      "receivedHelloMessages": "0",
      "numberOfUnderlyingTransportPaths": "0",
      "operBandwidth": "0",
      "signallingType": "none",
      "terminatingSiteId": "172.17.132.21"
    }
  },
  "222b7f98cc-b3ef-11eb-84c1-0242ac14010b22": {
    "type": "Path",
    "name": "22from-172.17.132.1-id-1739222",
    "id": "222b7f98cc-b3ef-11eb-84c1-0242ac14010b22",
    "terminations": [
      "002b41f348-b3ef-11eb-84c1-0242ac14010b00",
      "b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2"
    ],
    "location": "null",
    "ePoints": [
      "002b41f348-b3ef-11eb-84c1-0242ac14010b00",
      "b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2"
    ],
    "state": {
      "CreatedByAppId": [
        "SURE_APP"
      ],
      "CreatedByUgId": [
        "T0_Admin_UserGroup"
      ],
      "DeploymentState": [
        "deployed"
      ],
      "CreatedByUserId": [
        "SureRDAUser"
      ],
      "OperationalState": [
        "UP"
      ],
      "AdministrativeState": [
        "TERMINATED"
      ],
      "CreatedByTenantId": [
        "T0"
      ]
    },
    "cNodes": [

    ],
    "detail": {
      "UUID": "222b7f98cc-b3ef-11eb-84c1-0242ac14010b22",
      "Type": "ServiceTunnelPath",
      "DiscoveredName": "serviceTunnel:from-172.17.132.1-id-17392",
      "SureName": "serviceTunnel:from-172.17.132.1-id-17392",
      "contextId": "1042:1",
      "SubType": "VXLAN",
      "DisplayName": "from-172.17.132.1-id-17392",
      "Category": "INFRASTRUCTURE",
      "CreationDate": "2021-05-13T13:28:57.327Z",
      "LastUpdateDate": "2021-05-13T13:28:57.327Z",
      "ResourceCategory": "OWNED_RESOURCE",
      "Label": "Path",
      "TenantSureName": "T0",
      "CreatedBy": "MAYA-NFMP",
      "rootNetworkElement": "False",
      "underlyingTransport": "vxlan",
      "pathId": "17392",
      "fromNodeId": "172.17.132.1",
      "numberOfFunctionalUnderlyingPaths": "0",
      "fromNodeName": "fb1pwbxlf06",
      "egressSnmpPortId": "503316480",
      "toNodeId": "172.17.132.21",
      "svcConnectionType": "p2p",
      "actualPathMtu": "9166",
      "pathMtu": "9166",
      "redundantVcId": "0",
      "isAutoselectable": "true",
      "availableBandwidth": "0",
      "vlanVcEtherType": "33024",
      "autoSdp": "auto",
      "pbbEtype": "35047",
      "creationOrigin": "evpnPmsi",
      "redundantServiceId": "0",
      "redundantPathId": "0",
      "svcTunnelType": "sdp",
      "toNodeName": "fb1pvsglf04",
      "loadFactor": "33.0",
      "encapsulationType": "martini",
      "transmittedHelloMessages": "0",
      "sdpActiveLspType": "notApplicable",
      "receivedHelloMessages": "0",
      "numberOfUnderlyingTransportPaths": "0",
      "operBandwidth": "0",
      "signallingType": "none",
      "terminatingSiteId": "172.17.132.21"
    }
  },
  "333b7f98cc-b3ef-11eb-84c1-0242ac14010b33": {
    "type": "Path",
    "name": "33from-172.17.132.1-id-1739233",
    "id": "333b7f98cc-b3ef-11eb-84c1-0242ac14010b33",
    "terminations": [
      "2b1257ae-b3ef-11eb-84c1-0242ac14010b",
      "002b41f348-b3ef-11eb-84c1-0242ac14010b00"
    ],
    "location": "null",
    "ePoints": [
      "2b1257ae-b3ef-11eb-84c1-0242ac14010b",
      "002b41f348-b3ef-11eb-84c1-0242ac14010b00"
    ],
    "state": {
      "CreatedByAppId": [
        "SURE_APP"
      ],
      "CreatedByUgId": [
        "T0_Admin_UserGroup"
      ],
      "DeploymentState": [
        "deployed"
      ],
      "CreatedByUserId": [
        "SureRDAUser"
      ],
      "OperationalState": [
        "UP"
      ],
      "AdministrativeState": [
        "TERMINATED"
      ],
      "CreatedByTenantId": [
        "T0"
      ]
    },
    "cNodes": [

    ],
    "detail": {
      "UUID": "333b7f98cc-b3ef-11eb-84c1-0242ac14010b33",
      "Type": "ServiceTunnelPath",
      "DiscoveredName": "serviceTunnel:from-172.17.132.1-id-17392",
      "SureName": "serviceTunnel:from-172.17.132.1-id-17392",
      "contextId": "1042:1",
      "SubType": "VXLAN",
      "DisplayName": "from-172.17.132.1-id-17392",
      "Category": "INFRASTRUCTURE",
      "CreationDate": "2021-05-13T13:28:57.327Z",
      "LastUpdateDate": "2021-05-13T13:28:57.327Z",
      "ResourceCategory": "OWNED_RESOURCE",
      "Label": "Path",
      "TenantSureName": "T0",
      "CreatedBy": "MAYA-NFMP",
      "rootNetworkElement": "False",
      "underlyingTransport": "vxlan",
      "pathId": "17392",
      "fromNodeId": "172.17.132.1",
      "numberOfFunctionalUnderlyingPaths": "0",
      "fromNodeName": "fb1pwbxlf02",
      "egressSnmpPortId": "503316480",
      "toNodeId": "172.17.132.21",
      "svcConnectionType": "p2p",
      "actualPathMtu": "9166",
      "pathMtu": "9166",
      "redundantVcId": "0",
      "isAutoselectable": "true",
      "availableBandwidth": "0",
      "vlanVcEtherType": "33024",
      "autoSdp": "auto",
      "pbbEtype": "35047",
      "creationOrigin": "evpnPmsi",
      "redundantServiceId": "0",
      "redundantPathId": "0",
      "svcTunnelType": "sdp",
      "toNodeName": "fb1pvsglf06",
      "loadFactor": "33.0",
      "encapsulationType": "martini",
      "transmittedHelloMessages": "0",
      "sdpActiveLspType": "notApplicable",
      "receivedHelloMessages": "0",
      "numberOfUnderlyingTransportPaths": "0",
      "operBandwidth": "0",
      "signallingType": "none",
      "terminatingSiteId": "172.17.132.21"
    }
  },
  "2b7f98cc-b3ef-11eb-84c1-0242ac14010b": {
    "type": "Path",
    "name": "from-172.17.132.1-id-17392",
    "id": "2b7f98cc-b3ef-11eb-84c1-0242ac14010b",
    "terminations": [
      "2b1257ae-b3ef-11eb-84c1-0242ac14010b",
      "002b41f348-b3ef-11eb-84c1-0242ac14010b00"
    ],
    "location": "null",
    "ePoints": [
      "2b1257ae-b3ef-11eb-84c1-0242ac14010b",
      "b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2"
    ],
    "state": {
      "CreatedByAppId": [
        "SURE_APP"
      ],
      "CreatedByUgId": [
        "T0_Admin_UserGroup"
      ],
      "DeploymentState": [
        "deployed"
      ],
      "CreatedByUserId": [
        "SureRDAUser"
      ],
      "OperationalState": [
        "DOWN"
      ],
      "AdministrativeState": [
        "TERMINATED"
      ],
      "CreatedByTenantId": [
        "T0"
      ]
    },
    "cNodes": [
      "333b7f98cc-b3ef-11eb-84c1-0242ac14010b33",
      "cc2b7f98cc-b3ef-11eb-84c1-0242ac14010bcc"
    ],
    "detail": {
      "UUID": "2b7f98cc-b3ef-11eb-84c1-0242ac14010b",
      "Type": "ServiceTunnelPath",
      "DiscoveredName": "serviceTunnel:from-172.17.132.1-id-17392",
      "SureName": "serviceTunnel:from-172.17.132.1-id-17392",
      "contextId": "1042:1",
      "SubType": "VXLAN",
      "DisplayName": "from-172.17.132.1-id-17392",
      "Category": "INFRASTRUCTURE",
      "CreationDate": "2021-05-13T13:28:57.327Z",
      "LastUpdateDate": "2021-05-13T13:28:57.327Z",
      "ResourceCategory": "OWNED_RESOURCE",
      "Label": "Path",
      "TenantSureName": "T0",
      "CreatedBy": "MAYA-NFMP",
      "rootNetworkElement": "False",
      "underlyingTransport": "vxlan",
      "pathId": "17392",
      "fromNodeId": "172.17.132.1",
      "numberOfFunctionalUnderlyingPaths": "0",
      "fromNodeName": "fb1pwbxlf02",
      "egressSnmpPortId": "503316480",
      "toNodeId": "172.17.132.21",
      "svcConnectionType": "p2p",
      "actualPathMtu": "9166",
      "pathMtu": "9166",
      "redundantVcId": "0",
      "isAutoselectable": "true",
      "availableBandwidth": "0",
      "vlanVcEtherType": "33024",
      "autoSdp": "auto",
      "pbbEtype": "35047",
      "creationOrigin": "evpnPmsi",
      "redundantServiceId": "0",
      "redundantPathId": "0",
      "svcTunnelType": "sdp",
      "toNodeName": "fb1pvsglf06",
      "loadFactor": "33.0",
      "encapsulationType": "martini",
      "transmittedHelloMessages": "0",
      "sdpActiveLspType": "notApplicable",
      "receivedHelloMessages": "0",
      "numberOfUnderlyingTransportPaths": "0",
      "operBandwidth": "0",
      "signallingType": "none",
      "terminatingSiteId": "172.17.132.21"
    }
  },
  "fb893929-b3ec-11eb-84c1-0242ac14010b": {
    "type": "Path",
    "name": "SDP Binding 172.17.132.1 (17392) - circuit-17392-2502986",
    "id": "fb893929-b3ec-11eb-84c1-0242ac14010b",
    "terminations": [
      "2b1257ae-b3ef-11eb-84c1-0242ac14010b",
      "b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2"
    ],
    "location": "null",
    "ePoints": [
      "2b1257ae-b3ef-11eb-84c1-0242ac14010b",
      "b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2"
    ],
    "state": {
      "CreatedByAppId": [
        "SURE_APP"
      ],
      "CreatedByUgId": [
        "T0_Admin_UserGroup"
      ],
      "CreatedByUserId": [
        "SureRDAUser"
      ],
      "OperationalState": [
        "UP"
      ],
      "AdministrativeState": [
        "INSTALLED"
      ],
      "CreatedByTenantId": [
        "T0"
      ]
    },
    "cNodes": [
      "2b7f98cc-b3ef-11eb-84c1-0242ac14010b",
      "002b7f98cc-b3ef-11eb-84c1-0242ac14010b00",
      "cc2b7f98cc-b3ef-11eb-84c1-0242ac14010bcc"
    ],
    "detail": {
      "UUID": "fb893929-b3ec-11eb-84c1-0242ac14010b",
      "Type": "SpokeSDPBindingPath",
      "DiscoveredName": "svc-mgr:service-1042:172.17.132.1:circuit-17392-2502986",
      "SureName": "svc-mgr:service-1042:172.17.132.1:circuit-17392-2502986",
      "contextId": "1042:1",
      "SubType": "VPLS",
      "DisplayName": "SDP Binding 172.17.132.1 (17392) - circuit-17392-2502986",
      "Category": "INFRASTRUCTURE",
      "CreationDate": "2021-05-13T13:13:17.866Z",
      "LastUpdateDate": "2021-05-13T13:13:17.866Z",
      "ResourceCategory": "OWNED_RESOURCE",
      "Label": "Path",
      "TenantSureName": "T0",
      "CreatedBy": "MAYA-NFMP",
      "rootNetworkElement": "False",
      "serviceType": "vpls",
      "etreeLeafAccess": "false",
      "svcComponentId": "1042",
      "pathId": "17392",
      "operationalEgressLabel": "0",
      "fromNodeId": "172.17.132.1",
      "circuitType": "spoke",
      "creationOrigin": "evpnPmsi",
      "vlanVcTag": "4095",
      "circuitTransport": "unknown",
      "vcType": "ethernet",
      "toNodeName": "fb1pvsglf04",
      "autoSelectReturnTunnel": "false",
      "fromNodeName": "fb1pwbxlf02",
      "encapsulationType": "martini",
      "toNodeId": "172.17.132.21",
      "operationalIngressLabel": "0",
      "serviceId": "931662924",
      "sdpMtu": "9216",
      "autoSelectTunnel": "false",
      "signallingType": "none",
      "vcId": "2502986"
    }
  }
};
*/

var directory= require('../helpers/response.json');
var response_UIV= require('../helpers/ims_levelorder.json');

var UIV_diagraphModel=response_UIV.diagraphModel;
Object.keys(response_UIV).forEach((item, index) => {
        console.log(item, index);
		
		
		
		
		
    })



	  // return axios({
        //     method: axiosdata.method,
        //     url: axiosdata.url,
        //     headers: axiosdata.headers,
        //     data: axiosdata.method != "GET" ? axiosdata.payload : ""
        // }).then(function (response) {

        //     try {
        //         document.getElementById("progressIndicatorCircularIDComp") && ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularIDComp"));
        //         var data = response.data.element && response.data.element[0];
        //         var directory = {};
        //         if (data) {
        //             if (data["@class"].toLowerCase() == "service") {
        //                 var hasAssociation = data.Associations && data.Associations.Association;

        //                 if (!hasAssociation) {
        //                     dispatch({
        //                         type: "TOPOLOGY_MAP_SHOW_ERROR",
        //                         payload: new Error("No Service Path to display")
        //                     });
        //                     return;
        //                 }

        //                 var rootPath = hasAssociation.filter((x) => { var item = x.Target ? x.Target : x.Source; return item["@class"].toLowerCase() == "path" })
        //             }
        //             var rootNode = (rootPath && rootPath[0]) || data
        //             if (rootNode) {
        //                 var result = typeId && typeId == 2 ? MapNode_ForLocations(rootNode, directory, typeId) : MapNode(rootNode, directory);
        //             }

        //             //sortCNode
        //             if (rootNode) {
        //                 sortNode(result.id, directory)
        //             }
        //         }
        //         var domain;
        //         if (!axiosdata.domain) {
        //             domain = axiosdata.url.split('/oss')[0];
        //         }
        //         var customHookObject = [];
        //         var urlForCustomHooks = domain + "/oss/sure/items?q=Type;EQUALS;CUSTOM_HOOK&q=SubType;NOT%20EQUAL;COMPONENT";
        //         // var urlForCustomHooks = domain + "/oss/sure/customhooks";
        //         //EQUALS;CUSTOM_HOOK&q=SubType;NOT%20EQUAL;COMPONENT
        //         axios({
        //             method: "GET",
        //             url: urlForCustomHooks,
        //             headers: axiosdata.headers

        //         }).then(function (response) {
        //             // var customhooks=[];
        //             customHookObject = response.data.element.map(function (item) {
        //                 var obj = item.properties ? item.properties : parseCustomHookObject(item)
        //                 //customHookObject.push(obj);
        //                 // customHookObject=customhooks;
        //                 return obj;
        //             })
        //             // this.props.customHookData=customHookObject;
        //             function parseCustomHookObject(customHookObject) {
        //                 if (customHookObject.Features && customHookObject.Features.Feature) {
        //                     customHookObject.Features.Feature.reduce(function (obj, item) {
        //                         obj[item.Name] = item.Value;
        //                         return obj;
        //                     }, customHookObject)
        //                 }
        //                 return customHookObject
        //             }
                    // for (var key in directory) {
                    //     // skip loop if the property is from prototype
                    //     if (!directory.hasOwnProperty(key)) continue;

                    //     var obj = directory[key];
                    //     for (var prop in obj) {
                    //         // skip loop if the property is from prototype
                    //         if (!obj.hasOwnProperty(prop)) continue;

                    //         //
                    //         // if(directory['b41b9fbb-3e7b-11ea-987e-0242ac140104'] && !directory['b41b9fbb-3e7b-11ea-987e-0242ac140104'].location){
                    //         //     directory['b41b9fbb-3e7b-11ea-987e-0242ac140104'].location="35ce4d91-36b3-11ea-ab55-0242ac14010a";

                    //         //     sessionStorage.getItem();
                    //         // }

                    //         //console.log(prop + " = " + obj[prop]);
                    //         //console.log(obj['location']);
                    //         if (obj['location'] == null) {

                    //             obj['location'] = sessionStorage.getItem(obj['id']);


                    //         }
                    //     }
                    // }
        var customHookObject ={};
            var rootPathIdValue ="fb893929-b3ec-11eb-84c1-0242ac14010b";
                    // console.log(JSON.stringify(directory) + "Directory data******************** ");
                    dispatch({
                        type: "TOPOLOGY_MAP_GET_DATA",
                        payload: { rootPathID: rootPathIdValue, data: directory, customHookData: customHookObject }
                    });
              //  });
            // } catch (err) {
            //     console.log("catch block1");
            //     document.getElementById("progressIndicatorCircularIDComp") && ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularIDComp"));

            //     if (err && err.error && err.error == "invalidPathTerminationNo") {
            //         err = {
            //             custom_error: {
            //                 name: 'Path with less/more than two terminations',
            //                 details: err.object.DisplayName
            //             }
            //         }
            //     }
            //     dispatch({
            //         type: "TOPOLOGY_MAP_SHOW_ERROR",
            //         payload: err
            //     });
            // }
        // }, (err) => {
        //     console.log("catch block2(usually network error)");
        //     document.getElementById("progressIndicatorCircularIDComp") && ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularIDComp"));
        //     dispatch({
        //         type: "TOPOLOGY_MAP_SHOW_ERROR",
        //         payload: err
        //     });
        // });
    }
}
export const getMultiEntityTopologyData = (axiosdata, typeId) => {
    //console.log(axiosdata);
    var component1 = React.createElement(ProgressIndicatorCircular, progressOptions);
    console.log(document.getElementById("progressIndicatorCircularIDComp"));
    document.getElementById("progressIndicatorCircularIDComp") && ReactDOM.render(component1, document.getElementById("progressIndicatorCircularIDComp"));

    if (axiosdata.headers["Response-Type"] || axiosdata.headers["response-type"]) {
        delete axiosdata.headers["Response-Type"];
        delete axiosdata.headers["response-type"]
    }
    axiosdata.headers["TransformationEnabled"] = false;
    //console.log(Array.isArray(axiosdata.payload));
    if (!Array.isArray(axiosdata.payload)) {
        console.log('inside axios data not array..');
        return function (dispatch) {
            return axios({
                method: axiosdata.method,
                url: axiosdata.url,
                headers: axiosdata.headers,
                data: axiosdata.method != "GET" ? axiosdata.payload : ""
            }).then(function (response) {

                try {
                    document.getElementById("progressIndicatorCircularIDComp") && ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularIDComp"));
                    var data = response.data.element && response.data.element[1];
                    var directory = {};

                    if (data) {
                        /*if (data["@class"].toLowerCase() == "service") {
                            var hasAssociation = data.Associations && data.Associations.Association;

                            if (!hasAssociation) {
                                dispatch({
                                    type: "TOPOLOGY_MAP_SHOW_ERROR",
                                    payload: "No Service Path to display"
                                });
                                return;
                            }

                            var rootPath = hasAssociation.filter((x) => { var item = x.Target ? x.Target : x.Source; return item["@class"].toLowerCase() == "path" })
                        }*/
                        //var rootNode = (rootPath && rootPath[0]) || data
                        var rootNode = data;

                        if (rootNode) {
                            var result = typeId && typeId == 2 ? MapNode_ForMultipleLocations(rootNode, directory, typeId) : MapNode(rootNode, directory);
                        }


                        //sortCNode
                        /*if (rootNode) {
                            sortNode(result.id, directory)
                        }*/
                    }

                    dispatch({
                        type: "TOPOLOGY_MAP_GET_DATA",
                        payload: { rootPathID: result.id, data: directory }
                    });
                } catch (err) {
                    console.log("catch block1");
                    document.getElementById("progressIndicatorCircularIDComp") && ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularIDComp"));
                    //document.getElementById("progressIndicatorCircularIDComp").style.display='none';
                    var errorMsg = err.message;
                    var dataList = {
                        dataList: [{
                            message: errorMsg,
                            duration: 2000, autoIncreaseDuration: false
                        }]
                    };
                    _loadExternalComponent(Snackbar, dataList, "snackbarID");

                    dispatch({
                        type: "TOPOLOGY_MAP_SHOW_ERROR",
                        payload: err
                    });
                }
            }, (err) => {

                console.log("catch block2");
                document.getElementById("progressIndicatorCircularIDComp") && ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularIDComp"));
                //document.getElementById("progressIndicatorCircularIDComp").style.display='none';
                var errorMsg = err.message;
                var dataList = {
                    dataList: [{
                        message: errorMsg,
                        duration: 2000, autoIncreaseDuration: false
                    }]
                };
                _loadExternalComponent(Snackbar, dataList, "snackbarID");
                //         var snack = React.createElement(Snackbar, dataList);
                // ReactDOM.render(snack, document.getElementById("snackbarID"));
                dispatch({
                    type: "TOPOLOGY_MAP_SHOW_ERROR",
                    payload: err
                });


            }).catch((error) => {
                console.log("catch block for network errors");
                document.getElementById("progressIndicatorCircularIDComp") && ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularIDComp"));
                //document.getElementById("progressIndicatorCircularIDComp").style.display='none';

                var errorMsg = error.message;
                var dataList = {
                    dataList: [{
                        message: errorMsg,
                        duration: 2000, autoIncreaseDuration: false
                    }]
                };
                _loadExternalComponent(Snackbar, dataList, "snackbarID");
                //         var snack = React.createElement(Snackbar, dataList);
                // ReactDOM.render(snack, document.getElementById("snackbarID"));
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    // console.log(error.response.data);
                    // console.log(error.response.status);
                    // console.log(error.response.headers);
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                }
                console.log(error.config);
            });
        }
    }
    else {
        console.log("inside else..");
        return function (dispatch) {
            var result;
            var directory = {};
            var resultArray = [];
            var i = 0;

            var payloadlength = axiosdata.payload.length;
            axiosdata.payload.forEach(function (singleElement) {
                axios({
                    method: axiosdata.method,
                    url: axiosdata.url,
                    headers: axiosdata.headers,
                    data: axiosdata.method != "GET" ? singleElement : ""
                }).then(function (response) {

                    document.getElementById("progressIndicatorCircularIDComp") && ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularIDComp"));
                    var data = response.data.element[1];
                    if (response.data.element[0]) {
                        var EPData = response.data.element[0];
                    }
                    if (response.data.element[1]) {
                        var data = response.data.element && response.data.element[1];
                    }

                    console.log(EPData.Features);
                    if (data || EPData) {
                        if (data) {
                            var rootNode = data;
                        }

                        if (rootNode) {
                            result = typeId && typeId == 2 ? MapNode_ForMultipleLocations(rootNode, directory, typeId, EPData) : MapNode(rootNode, directory);
                        }
                        resultArray.push(result);
                        if (EPData) {
                            result = typeId && typeId == 2 ? MapNode_ForMultipleLocations(EPData, directory, typeId, EPData) : MapNode(EPData, directory);
                        }
                        resultArray.push(result);
                    }
                    directory = resultArray;
                    i = i + 1;
                    var customHookObject = [];
                    if (i == payloadlength) {
                        //Make axios call to get custom hooks for multi equipment input..
                        var domain;
                        if (!axiosdata.domain) {
                            domain = axiosdata.url.split('/oss')[0];

                        }
                        var urlForCustomHooks = domain + "/oss/sure/items?q=Type;EQUALS;CUSTOM_HOOK&q=EntityType;EQUALS;Location&q=SubType;EQUALS;COMPONENT";
                        axios({
                            method: "GET",
                            url: urlForCustomHooks,
                            headers: axiosdata.headers

                        }).then(function (response) {
                            // var customhooks=[];
                            customHookObject = response.data.element.map(function (item) {
                                var obj = item.properties ? item.properties : parseCustomHookObject(item)
                                //customHookObject.push(obj);
                                // customHookObject=customhooks;
                                return obj;
                            })
                            // this.props.customHookData=customHookObject;
                            function parseCustomHookObject(customHookObject) {
                                if (customHookObject.Features && customHookObject.Features.Feature) {
                                    customHookObject.Features.Feature.reduce(function (obj, item) {
                                        obj[item.Name] = item.Value;
                                        return obj;
                                    }, customHookObject)
                                }
                                return customHookObject
                            }

                            dispatch({
                                type: "TOPOLOGY_MAP_GET_DATA",
                                payload: { rootPathID: result.id, data: directory, customHookData: customHookObject }
                            });
                        })
                    }
                }).catch((error) => {
                    console.log("catch block for network errors");
                    console.log(error);
                    document.getElementById("progressIndicatorCircularIDComp") && ReactDOM.unmountComponentAtNode(document.getElementById("progressIndicatorCircularIDComp"));
                    //document.getElementById("progressIndicatorCircularIDComp").style.display='none';
                    if (error.config && error.config.data) {
                        var errorMsg = "Latitude/Longitude not found for " + JSON.parse(error.config.data).request.origin['@class'] + " with UUID " + JSON.parse(error.config.data).request.origin.UUID;//payload.request.origin['@class']
                    }
                    else {
                        var errorMsg = "Latitude/Longitude not found";
                    }
                    var dataList = {
                        dataList: [{
                            message: errorMsg,
                            duration: 2000, autoIncreaseDuration: false
                        }]
                    };
                    _loadExternalComponent(Snackbar, dataList, "snackbarID");
                    if (error.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        // console.log(error.response.data);
                        // console.log(error.response.status);
                        // console.log(error.response.headers);
                    } else if (error.request) {
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                        // http.ClientRequest in node.js
                        console.log(error.request);
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        console.log('Error', error.message);
                    }
                    dispatch({
                        type: "TOPOLOGY_MAP_GET_DATA",
                        payload: { rootPathID: result.id, data: directory }
                    });
                });
            }
            );
        }
    }
}

function MapNode_ForMultipleLocations(parentObject, directory, typeId, EPData) {
    var associatedEndpoint;
    var locationObject;
    var stateOfEPData = {};
    if (parentObject["@class"].toLowerCase() == "location") {
        locationObject = parentObject;
        associatedEndpoint = EPData;
    }
    else if (parentObject["@class"].toLowerCase() == "equipment" || parentObject["@class"].toLowerCase() == "fcp" || parentObject["@class"].toLowerCase() == "endpoint") {
        //associatedEndpoint = parentObject;
        if (EPData.Associations && EPData.Associations.Association[0] && EPData.Associations.Association[0].Target == 'HAS_STATE' && EPData.Associations.Association[0].Target.Features.Feature) {
            for (let i = 0; i < EPData.Associations.Association[0].Target.Features.Feature.length; i++) {
                stateOfEPData[EPData.Associations.Association[0].Target.Features.Feature[i].Name] = EPData.Associations.Association[0].Target.Features.Feature[i].Value;
            }
        }
    }

    //Get keys of parentObject:
    /*    for (var key in parentObject) {
    console.log(key);
    if(typeof parentObject[key]!= "object" && parentObject[key].toLowerCase() == "location"){
    locationObject = parentObject;
    }
    else if(parentObject[key].toLowerCase() == "equipment" || parentObject["@class"].toLowerCase() == "fcp" || parentObject["@class"].toLowerCase() == "endpoint"){
    associatedEndpoint = parentObject;
    }

    }*/
    if (EPData) {
        console.log(EPData);
        //sureNameEP = EPData.SureName;
        //UUIDEP = EPData.UUID;
        //typeEP = EPData['@class'] ? EPData['@class'] : EPData.Type;
        if (EPData.Associations && EPData.Associations.Association[0] && EPData.Associations.Association[0].Target && EPData.Associations.Association[0].Target.Features) {
            for (var j = 0; j < EPData.Associations.Association[0].Target.Features.Feature.length; j++) {
                //var stateItem={};
                EPData[EPData.Associations.Association[0].Target.Features.Feature[j].Name] = EPData.Associations.Association[0].Target.Features.Feature[j].Value;
                // this.push(stateItem);
            }
        }
        if (EPData.Features && EPData.Features.Feature[0]) {


        }
    }
    var lEndPointsTypes = ["equipment", "fcp", "endpoint", "location"];
    var object = GetLastLocation(parentObject, directory, lEndPointsTypes);
    object = object["@class"] ? object : (object.Target || object.Source);
    var hasAssociation = (object.Associations && object.Associations.Association) || []
    var lStateNodes = hasAssociation.filter((x) => { var item = x.Target ? x.Target : x.Source; return item["@class"].toLowerCase() == "state" })
    var lCNodesToProcess = [parentObject];
    var term = [associatedEndpoint];
    var result = new GetMultipleEntity(object, lCNodesToProcess, [], lEndPointsTypes, [], lStateNodes, directory, typeId)

    directory[object["UUID"] /* object["UUID"].slice(object.UUID.length - 4, object.UUID.length)*/] = result;
    directory[object["UUID"]].ePoints = [EPData];

    //console.log( { id: object["UUID"], terminations: result.terminations });
    return result
}

function pathGroups(items) {
    if (items.length > 0) {
        var coreNode = items.splice(0, 1);
        var rightOrigin = sortPaths(items, coreNode[0].terminations[1]);
        var leftOrigin = sortPaths(items, coreNode[0].terminations[0], true).reverse();

        return ([leftOrigin.concat(coreNode, rightOrigin)]).concat(pathGroups(items))
    }
    else {
        return []
    }
}

function concatPathGroupsWithUnknownNode(groups, unknownNode) {
    var result = [];
    groups.forEach((group, index) => {
        result = result.concat(group, (index != groups.length - 1 ? [unknownNode] : []))
    })
    return result
}

function pathGroupsByBaseTerminations(items, baseTerminations) {
    if (items.length > 0) {
        var unknownNode = { id: "unknown", terminations: [] }
        var itemsLength = items.length;
        var baseOrigin = sortPaths(items, baseTerminations[0]);
        if (baseOrigin.length != itemsLength || baseOrigin[baseOrigin.length - 1].terminations[1] != baseTerminations[1]) {
            var baseDest = sortPaths(items, baseTerminations[1], true).reverse();
            baseDest.unshift(unknownNode);
            var remainingGroups = pathGroups(items);
            if (remainingGroups.length > 0) {
                var remainingGroupsMerged = concatPathGroupsWithUnknownNode(remainingGroups, unknownNode);
                remainingGroupsMerged.unshift(unknownNode)
            }

            baseOrigin = baseOrigin.concat((remainingGroupsMerged ? remainingGroupsMerged : []), baseDest)

        }
        return baseOrigin
    }
    else {
        return []
    }
}

function sortPaths(items, origin, isReverseSort) {
    var result = [];
    while (true) {
        var isCrossLink = items.findIndex((x) => x.terminations[0] == origin && x.terminations[1] == origin);
        if (isCrossLink != -1)
            result.push(items.splice(isCrossLink, 1)[0])
        else {
            var index = items.findIndex((x) => x.terminations.indexOf(origin) !== -1);
            if (index != -1) {
                result.push(items.splice(index, 1)[0])
                let lastNodeObject = result[result.length - 1];

                if (lastNodeObject.terminations.indexOf(origin) != 0 && !isReverseSort) {
                    lastNodeObject.terminations.reverse();
                    lastNodeObject.ePoints.reverse();
                }
                else if (lastNodeObject.terminations.indexOf(origin) != 1 && isReverseSort) {
                    lastNodeObject.terminations.reverse();
                    lastNodeObject.ePoints.reverse();
                }
            }
            else
                break;
        }
    }

    if (result.length > 0) {
        return result.concat(sortPaths(items, result[result.length - 1].terminations.filter((x) => x != origin)[0], isReverseSort))
    }
    else
        return []
}

function GetTerminations(object, directory, lEndPointsTypes) {
    var item = object["@class"] ? object : (object.Target || object.Source);
    var hasAssociation = (item.Associations && item.Associations.Association) || []

    var lCNodesToProcess = hasAssociation.filter((x) => {
        var _item = x.Target ? x.Target : x.Source;
        let isNextNodePoint = lEndPointsTypes.findIndex((x) => x.toLowerCase() == _item["@class"].toLowerCase()) != -1
        return isNextNodePoint;
    });

    if (lCNodesToProcess.length > 0) {
        let validTermination = lCNodesToProcess.map((endAsscocation, i) => {
            return GetTerminations(endAsscocation, directory, lEndPointsTypes);
        }).filter(function (eachVal, j) {
            return eachVal != false;
        });
        return validTermination.length > 0 ? validTermination[0] : false;
    }
    else if (item.Type != "NE" && item.rootNetworkElement != 'True') {
        return false;
    }
    else {
        var node = MapNode(object, directory);
        return node.id;
    }
}

function GetLastLocation(object, directory, lEndPointsTypes) {
    var item = object["@class"] ? object : (object.Target || object.Source);
    var hasAssociation = (item.Associations && item.Associations.Association) || []
    var lCNodesToProcess = hasAssociation.filter((x) => { var item = x.Target ? x.Target : x.Source; return lEndPointsTypes.findIndex((x) => x.toLowerCase() == item["@class"].toLowerCase()) != -1 })
    if (lCNodesToProcess.length > 0) {
        return GetLastLocation(lCNodesToProcess[0], directory, lEndPointsTypes)
    }
    else {
        return object
        //return item["UUID"].slice(item.UUID.length - 4, item.UUID.length)
    }
}
function GetMultipleEntity(object, lCNodesToProcess, lEndpoints, lEndPointsTypes, location, lStates, directory, typeId) {
    var terminations = {}
    this.type = object["@class"];
    this.name = object["SureName"];
    this.id = object["UUID"] //object["UUID"].slice(object.UUID.length - 4, object.UUID.length);

    if (this.type.toLowerCase() == "location") {
        this.latitude = object.Latitude;
        this.longitude = object.Longitude;
    }
    this.terminations = (function (object) {
        if (lEndpoints && lEndpoints.length > 0) {
            var lTerminations = lEndpoints.map((object) => {
                return GetTerminations(object, directory, lEndPointsTypes);
                /*let result = GetTerminations(object, directory, lEndPointsTypes);
                if(result == false){
                    object.noRootEquipment = true;
                }
                return result;*/
            })
            return lTerminations
        }
        else
            return []
    })(object);
    this.location = (function (object) {
        if (location && location[0] && location[0].Target) {
            var node = MapNode(location[0], directory);
            return node.id
        }
        else
            return null
    })(object);
    this.ePoints = (function (object) {
        if (lEndpoints && lEndpoints.length > 0) {
            return lEndpoints.map((object) => {
                var item = object.Target;
                var node = MapNode(object, directory);
                return node.id
                //return item["UUID"].slice(item.UUID.length - 4, item.UUID.length)
            })
        }
        else
            return []
    })(object);
    this.state = (function (lStates) {
        var targetNode = lStates[0] && lStates[0].Target
        var result = {}
        if (targetNode && targetNode.Features && targetNode.Features.Feature && targetNode.Features.Feature.length > 0) {
            targetNode.Features.Feature.forEach((feature) => {
                result[feature.Name] = (result[feature.Name] || []).concat([feature.Value])
            })
        };
        return result
    })(lStates);
    this.cNodes = (function (object) {
        if (lCNodesToProcess && lCNodesToProcess.length > 0) {
            var lCNodes = lCNodesToProcess.map((object) => {
                return MapNode(object, directory)
            })
            var filteredNodes = lCNodes.filter((cNode) => { return cNode ? true : false })
            //var sortedNodes = pathGroupsByBaseTerminations(filteredNodes, this.terminations)

            return filteredNodes.map((node) => {
                return node.id
            })
        }
        else
            return []
    }).call(this, object);

    this.detail = (function (object) {
        delete object.Associations
        delete object.Features
        var result = JSON.parse(JSON.stringify(object))
        delete result["@class"]
        return result
    })(object)
}
function GetEntity(object, lCNodesToProcess, lEndpoints, lEndPointsTypes, location, lStates, directory, typeId) {
    var terminations = {}
    this.type = object["@class"];
    //this.name = object["SureName"];
    //Changes for making displayname default for location name(s):
    this.name = object["DisplayName"] && object["DisplayName"] != "" ? object["DisplayName"] : object["SureName"];

    this.id = object["UUID"] //object["UUID"].slice(object.UUID.length - 4, object.UUID.length);

    if (this.type.toLowerCase() == "location") {
        this.latitude = object.Latitude;
        this.longitude = object.Longitude;
    }
    this.terminations = (function (object) {
        if (lEndpoints && lEndpoints.length > 0) {
            var lTerminations = lEndpoints.map((_object) => {
                let result = GetTerminations(_object, directory, lEndPointsTypes);
                if (result == false) {
                    object.noRootEquipment = true;
                }
                return result;
            })
            return lTerminations;
        }
        else
            return []
    })(this);
    this.location = (function (object) {
        if (location && location[0] && location[0].Target) {
            var node = MapNode(location[0], directory);
            return node.id
        }
        else
            return null
    })(object);
    this.ePoints = (function (object) {
        if (lEndpoints && lEndpoints.length > 0) {
            return lEndpoints.map((object) => {
                var item = object.Target;
                var node = MapNode(object, directory);
                return node.id
                //return item["UUID"].slice(item.UUID.length - 4, item.UUID.length)
            })
        }
        else
            return []
    })(object);
    this.state = (function (lStates) {
        var targetNode = lStates[0] && lStates[0].Target
        var result = {}
        if (targetNode && targetNode.Features && targetNode.Features.Feature && targetNode.Features.Feature.length > 0) {
            targetNode.Features.Feature.forEach((feature) => {
                result[feature.Name] = (result[feature.Name] || []).concat([feature.Value])
            })
        };
        return result
    })(lStates);
    this.cNodes = (function (object) {
        if (lCNodesToProcess && lCNodesToProcess.length > 0) {
            var lCNodes = lCNodesToProcess.map((object) => {
                return MapNode(object, directory)
            })
            var filteredNodes = lCNodes.filter((cNode) => { return cNode ? true : false })
            //var sortedNodes = pathGroupsByBaseTerminations(filteredNodes, this.terminations)

            return filteredNodes.map((node) => {
                return node.id
            })
        }
        else
            return []
    }).call(this, object);


    this.detail = (function (object) {
        delete object.Associations
        delete object.Features
        var result = JSON.parse(JSON.stringify(object))
        delete result["@class"]
        return result
    })(object)
}

function MapNode(object, directory) {
    object = object["@class"] ? object : (object.Target || object.Source);
    if (object.Features && object.Features.Feature) {
        object.Features.Feature.forEach((val, i) => {
            object[val.Name] = val.Value;
        });
        delete object.Features.Feature;
    }

    var lEndPointsTypes = ["equipment", "fcp", "endpoint", "path"];
    var hasAssociation = (object.Associations && object.Associations.Association) || []
    var lStateNodes = hasAssociation.filter((x) => { var item = x.Target ? x.Target : x.Source; return item["@class"].toLowerCase() == "state" })
    var lCNodesToProcess = hasAssociation.filter((x) => { var item = x.Target ? x.Target : x.Source; return item["@class"].toLowerCase() == "path" })
    var location = hasAssociation.filter((x) => { var item = x.Target ? x.Target : x.Source; return item["@class"].toLowerCase() == "location" })

    if (object["@class"].toLowerCase() == "path" && hasAssociation.length>1) {
        var lEndpoints = hasAssociation.filter((x) => { var item = x.Target ? x.Target : x.Source; return lEndPointsTypes.indexOf(item["@class"].toLowerCase()) != -1 })
        if (!lEndpoints || lEndpoints.length  ==0) {
            console.log(lEndpoints);
            console.log("No terminations found", object)
            throw {
                error: "invalidPathTerminationNo",
                object
            };
            return;
        }
        else if(lEndpoints.length > 2){
console.log(lEndpoints);
lEndpoints=lEndpoints.slice(0, 2);
        }
    }

    var result = new GetEntity(object, lCNodesToProcess, lEndpoints, lEndPointsTypes, location, lStateNodes, directory)
    //console.log(result);
    if (sessionStorage.getItem(result.id) == "null" || sessionStorage.getItem(result.id) == null) {
        sessionStorage.setItem(result.id, result.location);
    }

    directory[object["UUID"] /* object["UUID"].slice(object.UUID.length - 4, object.UUID.length)*/] = result
    return { id: object["UUID"], terminations: result.terminations }
}



function MapNode_ForLocations(parentObject, directory, typeId) {

    var lEndPointsTypes = ["equipment", "fcp", "endpoint", "location"];
    var object = GetLastLocation(parentObject, directory, lEndPointsTypes);
    object = object["@class"] ? object : (object.Target || object.Source);
    var hasAssociation = (object.Associations && object.Associations.Association) || []
    var lStateNodes = hasAssociation.filter((x) => { var item = x.Target ? x.Target : x.Source; return item["@class"].toLowerCase() == "state" })
    var lCNodesToProcess = [parentObject];
    var result = new GetEntity(object, lCNodesToProcess, [], lEndPointsTypes, [], lStateNodes, directory, typeId)

    directory[object["UUID"] /* object["UUID"].slice(object.UUID.length - 4, object.UUID.length)*/] = result
    return { id: object["UUID"], terminations: result.terminations }
}

function sortNode(nodeID, directory) {
    var lcNodes = directory[nodeID] && directory[nodeID].cNodes
    if (lcNodes && lcNodes.length > 0) {
        var lNodesToSort = lcNodes.map((cNode) => {
            let tempCNode = directory[cNode];
            return {
                id: cNode,
                terminations: tempCNode.terminations,
                ePoints: tempCNode.ePoints
                /* reference is passed */
            }
        })
        var lSortedNodes = pathGroupsByBaseTerminations(lNodesToSort, directory[nodeID].terminations)
        directory[nodeID].cNodes = lSortedNodes.map((sNode) => { sortNode(sNode.id, directory); return sNode.id })
    }
}
