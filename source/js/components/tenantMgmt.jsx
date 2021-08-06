/**
 *  
 * Component : tenantMgmtContainer.js
 *
 * @author Sunitha.S
 *
 */
/**
 * @class Tenant
 * @memberof SUREUI.components
 *

 * @property {object}  [tenantData]      Configuartion for SURE UI data model.
 * @property {string}  tenantData.profileUrl URL for SURE REST to populate Access Roles who are Super Admin or Tenant Admin.
 * @property {string}  tenantData.profileSharing   URL for SURE REST  to populate Access Roles for Sharing to Sub tenant 
 * @property {string}  tenantData.createUrl  URL for SURE REST  to create Tenant.
 * @property {string}  tenantData.createUserUrl URL for SURE REST to create default User under the Tenant .
 * @property {string}  tenantData.shareAccessRole URL for SURE REST to share AccessRoles to SubTenant
 * @property {Object}  [tenantData.requestHeaders]  Additional headers which usually includes metadata and authorization info.
 * @property {string}  [tenantData.propsCode] JSON properties for Internationalisaton.
 * @property {string}   tenantData.userName  User Name from ETCD 
 * @property {string}   tenantData.userGroup User Group from ETCD.
 * @property {string}   tenantData.populateEmail populating Email Settings 
 * @property {function} unmountTenant function which unmounts/refreshes the User Group CRUD Component.
 * @example {@lang xml}
 * 
 * HTML
 *  <div id="tenantCreate"></div>
    <span id="infoDialog"></span>
 * 
 * JS
 * 
            
            var TenantMgmt = SUREUI.components.TenantMgmt;
 * let tenantData = {
 *               profileUrl: '/oss-uam/sure/accessRole?q=IsTenantAdmin;EQUALS;yes,IsSuperUser;EQUALS;yes',
 *               profileSharingUrl:'/oss-uam/sure/accessRole',
 *              tenantFetchUrl : '/oss-uam/sure/tenants?expand=UserGroup.Profile.Item&q=SureName;EQUALS;t1234',
                
*tenantUserFetchUrl : '/oss-uam/sure/tenants/users?tenantId=y12345',
*tenantfetchSharedResourceUrl:'/oss-uam/sure/tenants/sharedResourcesOfSubTenant?subTenantId=y12345&resourceSubType=AccessRole',
*	triggerPwResetUrl: '/resetPassword?tenantId=y12345',
*	domain: 'https://135.250.139.92:28443',
*	method: 'GET',
*	createUrl: '/oss-uam/sure/tenants',
*	createUserUrl: '/oss-uam/sure/tenants/users',
*	shareAccessRole: '/oss-uam/sure/tenants/shareResource',
*   unshareAccessRole: '/oss-uam/sure/tenants/unShareResource',
*	unmountTenant: unmountTenant,
*	userName:'admin',
*	userGroup:"Admin_UserGroup",
*	populateEmail:"/oss-uam/sure/tenants?q=SureName;EQUALS;",
*   tenantPortalLoginUrl:"abcdef",
*	editTenant : false

*   
*};
*tenantData.requestHeaders = {

*	Authorization: 'Basic YWRtaW46YWRtaW5AMTIz',
*	tenantId: 'T0',
*	ugId: 'Admin_UserGroup',
*	appId: 'SURE_APP',
*	Accept: 'application/json',
*	TransformationEnabled: true,
*	'Content-Type': 'application/json',
*	'Response-Type': 'flat',

*}

*tenantData.propsCode = {
*	"SELECT_LANG_FOR_TRANSLTN": "Language:",
*	"USER": "User",
*	"EQUIPMENT": "Equipment",
*	"SERVICE": "Service",
*	"NETWORK": "Network",
*	"PATH": "Path",
*	"CUSTOMER": "Customer",
*	"FCP": "FCP",
*	"ENDPOINT": "Endpoint",
*	"LOCATION": "Location",
*	"TENANT": "Tenants",
*	"USER GROUP": "User Groups",
*	"USERS": "Users",
*	"PROFILES": "Profiles",
*	"GRAPH": "Graph",
*	"ADD": "ADD",
*	"AUTO_REFRESH": "Auto Refresh",
*	"INVENTORY": "Inventory",
*	"TOPOLOGY": "Topology",
*	"CREATION_DATE": "Creation Date",
*	"ACTION": "Action",
*	"COPYRIGHT": "Copyright",
*	"VERSION": "Version",
*	"STATE": "State",
*	"COLUMN_PREFERENCES": "Column Preferences",
*	"ADMIN_STATE": "Admin State",
*	"MAP": "Map",
*	"VIEW_DETAILS": "View Details",
*	"CREATE": "Create",
*	"GENERAL_INFORMATION": "General Information",
*	"FEATURES": "Features",
*	"UPDATE": "Update",
*	"NETWORK_UPDATED_SUCCESSFULLY": "Network Updated Successfully",
*	"NETWORK_UPDATION_FAILED": "Network Updation failed",
*	"SUBNETWORK_CREATED_SUCCESSFULLY": "SubNetwork created Successfully",
*	"SUBNETWORK_CREATION_FAILED": "SubNetwork creation failed",
*	"NETWORK_CREATED_SUCCESSFULLY": "Network Created Successfully",
*	"NETWORK_CREATION_FAILED": "Network creation failed",
*	"SEARCH": "Search",
*	"SEARCH_MODE": "Search Mode",
*	"SAVE_SEARCH": "Save Search",
*	"SAVE_SEARCH_AS": "Save Search As",
*	"HELP": "Help",
*	"ABOUT_SURE": "About SURE",
*	"LEAVE_BLANK": "Leave blank for auto-generated",
*	"SELECT": "Select",
*	"SELECTED": "Selected",
*	"TYPE": "Type",
*	"SUB_TYPE": "Sub Type",
*	"VIEW_PROFILE": "View profile",
*	"SIGN_OUT": "Sign Out",
*	"LAUNCH_PAD": "Launch Pad",
*	"HISTORY": "HISTORY",
*	"VIEW": "View",
*	"DEFAULT": "Default",
*	"MORE_INFO": "More Info",
*	"FAVOURITE": "Favourite",
*	"CLOSE": "Close",
*	"CAPACITY": "Capacity",
*	"PHYSICAL_PORT": "Physical Port",
*	"SUB_PATH": "Sub Path",
*	"NAME": "Name",
*	"DESELECT_ALL": "Deselect All",
*	"CANCEL": "Cancel",
*	"PARENT": "Parent",
*	"NUMBER_OF_INSTANCES": "Number of instances",
*	"STARTING_AT": "Starting at",
*	"NOT_VALID_NUMBER": "Not a valid number",
*	"VALUE_IS_TOO_SHORT": "Value is too short",
*	"MINVALUE": "MinValue",
*	"MAXVALUE": "MaxValue",
*	"SHOULD_BE": "Should be",
*	"SAVE": "Save",
*	"BACK": "Back",
*	"NEXT": "Next",
*	"SHOW_NAVIGATION": "Show navigation",
*	"EXPAND_LAYERS": "Expand Layers",
*	"COLLAPSE_LAYERS": "Collapse Layers",
*	"ZOOM_IN": "Zoom In",
*	"ZOOM_OUT": "Zoom Out",
*	"EXPAND_CLUSTER": "Expand Cluster",
*	"INFORMATION": "Information",
*	"Loc_COORDS": "Location coordinates for",
*	"UNKNOWN": "are not known",
*	"SELECTROW": "Select a Row",
*	"NO_COLLAPSE": "No more layers to collapse",
*	"NO_EXPAND": "No more layers to expand",
*	"NAV_GEO": "Navigate to GeoMap",
*	"NAV_TOPOMAP": "Navigate to TopologyMap",
*	"CustomHook:EQP": "CustomHook:EQP",
*	"TOPOLOGY_MAP": "Topology Map",
*	"USER_EDIT_HEADING": "Edit User",
*	"USER_ADD_HEADING": "Add User",
*	"CONFIRM_DELETE_HEADER": "Confirm Delete",
*	"CONFIRM_DELETE_MESSAGE": "Are you sure you want to delete",
*	"ADD_PROFILE_FAILED": "Profile creation failed",
*	"ADD_USERGROUP_FAILED": "Add User Group Failed",
*	"ADD_TENANT_FAILED": "Add Tenant Failed",
*	"UPDATE_TENANT_FAILED": "Update Tenant Failed",
*	"USERGROUP_EDIT_HEADING": "Edit User Group",
*	"UPDATE_USERGROUP_FAILED": "Edit User Group Failed",
*	"USERGROUP_ADD_HEADING": "Add User Group",
*	"PROFILE_CREATED_SUCCESSFULLY": "Successfully Created",
*	"UPLOAD_PROFILE": "No File Uploaded to create Profile",
*	"USERGROUP_CANNOT_UPDATE": "could not be updated",
*	"CLAUSE": "because",
*	"UPDATED": "has been updated",
*	"ADDED": "has been added",
*	"DELETED": "has been deleted",
*	"ASEC_200": "Record not Found",
*	"ASEC_201": "Record not Found Asssociation not Possible ",
*	"ASEC_202": "Record not Found or delete not posible",
*	"ASEC_203": "multiple IDs Found for the given entity",
*	"ASEC_204": "The operation entered is not defined",
*	"ASEC_205": "The entered operation is not valid",
*	"ASEC_206": "The enter expression is not valid",
*	"ASEC_207": "Query String is empty",
*	"ASEC_208": "Not sufficent Query String",
*	"ASEC_209": "ID not found",
*	"ASEC_210": "No Operator found with given query string.",
*	"ASEC_211": "Input source entity provided is unknown.",
*	"ASEC_212": "Input source field provided is unknown.",
*	"ASEC_213": "Input destination entity provided is unknown.",
*	"ASEC_214": "Input destination field provided is unknown.",
*	"ASEC_215": "Entity not available for the given identifier.",
*	"ASEC_216": "Comparing entities of different type is not allowed.",
*	"ASEC_217": "NOT SUFFICENT QUERY STRING FOR FOURCE LOAD",
*	"ASEC_218": "SOURCE_OBJECT_UNIC_KEY_IDENTIFIER",
*	"ASEC_219": "Source and Destination are same for updateAssociation",
*	"ASEC_220": "Query string is not valid",
*	"ASEC_221": "Date format is not valid, check the property file",
*	"ASEC_222": "Destination is already associated with the given entity",
*	"ASEC_223": "Destination is not associated to the entity to remove association",
*	"ASEC_224": "Parent ID not found",
*	"ASEC_225": "Response Type is not Mentioned",
*	"ASEC_226": "selective update input column data empty.",
*	"ASEC_227": "No group found for bulk manual reconcile.",
*	"ASEC_228": "Not a valid relative URL for entity",
*	"ASEC_229": "Network entity not supported for neighbor search query.",
*	"ASEC_230": "Delete the relationship first, then delete the node",
*	"ASEC_231": "Requested Page not available.",
*	"ASEC_232": "Check the payload",
*	"ASEC_233": "The entered ID is of different type",
*	"ASEC_234": "Provided {0} already exists",
*	"ASEC_235": "unique identifier is null for match.",
*	"ASEC_236": "Type not mentioned",
*	"ASEC_237": "Source not found",
*	"ASEC_238": "Destination not mentioned",
*	"ASEC_239": "Entered topology query is not valid",
*	"ASEC_240": "INVALID LABEL OPERATION",
*	"ASEC_241": "Primary label is null, its mandatory for any operation",
*	"ASEC_242": "You don't have permission to delete or entity not available for the given identifier.",
*	"AUTH_260": "User Id not provided",
*	"AUTH_261": "Password not provided",
*	"AUTH_262": "Tenant Id not provided",
*	"AUTH_263": "User Group d not provided",
*	"AUTH_264": "App Id not provided",
*	"AUTH_265": "User Token not provided",
*	"AUTH_266": "Tenant Validation with DB Failed",
*	"AUTH_267": "Error From CSM",
*	"AUTH_268": "Logged in Tenant & UserGroup validation with CSM (UM) is Failed ",
*	"AUTH_269": "Add/Remove Association is not allowed for Tenant Framework Resources",
*	"AUTH_270": "Logged in Tenant & UserGroup validation with Keycloak is Failed ",
*	"#DBEC_100": "No record found to be delete",
*	"DBEC_400": "Ensure the neo4j database is running on specified ip and port",
*	"DBEC_401": "Spoc Procedure invoke failed due to deployment issue. Please make sure 'CALL spoc.crud.status' getting result as 'OK'",
*	"DBEC_402": "db connectivity issue, Query will be re-executed once",
*	"VEC_200": "Version is not supported",
*	"#MEC_200": "Field Mapping not present on the Class Mapping",
*	"UNEC_9999": "Unknown Error Occured",
*	"MT_1": "Invalid access rights provided, use one of R, W and D and NONE(Only for sub tenant access rights) in profile {0}",
*	"MT_2": "Global Tenant admin profile cannot be created with rest api.",
*	"MT_3": "Create List is not supported for tenant admin profile.",
*	"MT_4": "Sub Tenant Access Rights is not supported for tenant admin profile.",
*	"MT_5": "Profile cannot be moved to other UG or Application.",
*	"MT_6": "Profile already present in UG for the same Application",
*	"MT_7": "Tenant Admin profile should be attached to SURE Application ",
*	"MT_8": "Non tenantable entity {0} in create list of profile {1}",
*	"MT_9": "Empty name in create list of profile {0}",
*	"MT_10": "Invalid entity in create list of profile {1}",
*	"MT_11": "Application is not on boarded, please contact system administrator.",
*	"MT_12": "Profile Name is mandatory to create profile.",
*	"MT_13": "User Group with name {0} already present.",
*	"MT_14": "User Group with name {0} not present.",
*	"MT_15": "UserGroup can be created/updated under own tenant or one of the sub tenant.",
*	"MT_16": "Only global tenant admin or tenant admin can create user groups.",
*	"MT_17": "UserGroupName is mandatory to create user group.",
*	"MT_18": "Cyclic reference to the user group not allowed.",
*	"MT_19": "Tenant with name {0} not present.",
*	"MT_20": "Tenant related data delete is not supported.",
*	"MT_21": "Non Tenant Admin profile should not be attached to SURE Application",
*	"MT_22": "Application is mandatory to create non tenant admin profile.",
*	"MT_23": "Invalid access rights provided, use one of R, W and D.",
*	"MT_24": "Manage tenant is required to assign management.",
*	"MT_25": "Manage tenant cannot be assigned to same tenant.",
*	"MT_26": "Only global tenant admin or tenant admin can assign manage tenant.",
*	"MT_27": "Tenant with name {0} already present.",
*	"MT_28": "Tenant can not be moved under new parent.",
*	"MT_29": "Tenant can be created/updated under own tenant or one of the sub tenant.",
*	"MT_30": "Only global tenant admin or tenant admin can create tenants.",
*	"MT_31": "Tenant can not be created in heirarchy, please create one at a time. ",
*	"MT_32": "Sub Tenant Visibility flag IsChildVisible should be Y/N. ",
*	"MT_33": "Please provide the Tenant Admin Profile for atleast one User Group",
*	"MT_34": "Minimum one admin user group required for the tenant creation",
*	"MT_35": "Resource unassociation can be done by global tenant admin or tenant admin or tenant application admin.",
*	"MT_36": "Resource association can be created by global tenant admin or tenant admin or tenant application admin.",
*	"MT_37": "Resource unassociation can be done under own tenant or one of the sub tenant or managed tenant.",
*	"MT_38": "Resource association can be created under own tenant or one of the sub tenant or managed tenant.",
*	"MT_39": "User Group name is mandatory to associate/unassociate resource.",
*	"MT_40": "Application provided is invalid or not yet onboarded, please contact system administrator.",
*	"MT_41": "Application admin can associate/unassociate resource(s) only in the context of owned application.",
*	"MT_42": "Associate resource(s) cannot be done to SURE application, provide other application Id for association.",
*	"MT_43": "Found no association with resource {0}",
*	"MT_44": "One or more resources provided are not part of owned, borrowed or managing tenant.",
*	"MT_45": "Resource group provided is invalid or dont have any resources associated with it. Note that resource group is from logged in tenant and usergroup.",
*	"MT_46": "User Group level default application profile already present, you cannot update through associate/unassociate resource(s).",
*	"MT_47": "User Group level default application profile cannot be admin profile.",
*	"MT_48": "Profile will be associated with appplication mentioned in ApplicationId parameter. No need of additional application within profile.",
*	"MT_49": "Found no resource(s) to associate.",
*	"MT_50": "User Group provided is invalid or not present in the logged in tenant.",
*	"MT_51": "Resource {0} is borrowed with access rights {1}. Association access rights cannot be more than borrowed access rights.",
*	"MT_52": "Invalid access right requested.",
*	"MT_53": "Resource {0} is assigned to manage with access rights {1}. Association/UnAssociation access rights cannot be more than managed access rights.",
*	"MT_54": "Resource {0} is assigned to manage or borrowed with access rights {1}. Association/UnAssociation access rights cannot be more than permited access rights.",
*	"MT_55": "Resource unshare can be done by global tenant admin or tenant admin only.",
*	"MT_56": "Resource share/transfer cancel can be done by global tenant admin or tenant admin only.",
*	"MT_57": "Resource share/transfer can be done by global tenant admin or tenant admin only.",
*	"MT_58": "Logged in managing tenant dont have permission to unshare resource.",
*	"MT_59": "Logged in managing tenant dont have permission to cancel share/transfer resource.",
*	"MT_60": "Logged in managing tenant dont have permission to share/transfer resource.",
*	"MT_61": "Resource unshare can be done under own tenant or one of the sub tenant or managed tenant.",
*	"MT_62": "Resource share/transfer cancel can be done under own tenant or one of the sub tenant or managed tenant.",
*	"MT_63": "Resource share/transfer can be done under own tenant or one of the sub tenant or managed tenant",
*	"MT_64": "Invalid destination tenant.",
*	"MT_65": "Resource group provided is invalid or dont have any resources associated with it. Note that resource group is from logged in tenant and usergroup.",
*	"MT_66": "Resource {0} is not shared with tenant {1}",
*	"MT_67": "Resource  {0} is not shared candidate with tenant {1}",
*	"MT_68": "One or more resources provided are not candidate resource(s) of a tenant for operation  {0}",
*	"MT_69": "Resource {0} is assigned to manage with access rights {1}. UnShare/Cancel Resource access rights cannot be more than managed access rights.",
*	"MT_70": "Resource {0} is assigned to manage with access rights {1}. Share Resource access rights cannot be more than managed access rights.",
*	"MT_71": "Invalid {0} resoures provided, use one of SHARED, TRANSFERRED and ALL.",
*	"MT_72": "No {0} candidate resources to accept/reject.",
*	"MT_73": "{0} share/transfer resource can be done by global tenant admin or tenant admin only.",
*	"MT_74": "OnBoard of resource(s) can be done by global tenant admin or tenant admin only.",
*	"MT_75": "OnBoard of resource(s) can be done under own tenant or one of the sub tenant or managed tenant.",
*	"MT_76": "No resources to on board.",
*	"MT_77": "Non tenantable resource types provided as input. Provide one or more of {0}",
*	"MT_78": "{0} share/transfer resource can be done under own tenant or one of the sub tenant or managed tenant.",
*	"MT_79": "One or more resources provided are not valid tenantable resources.",
*	"MT_80": "Assign manage tenant can be done for own tenant or one of the sub tenant.",
*	"MT_81": "Resource ownership can be checked by global tenant admin or tenant admin or app admin only.",
*	"MT_82": "Tenant dont own this entity or it is not available for the given identifier.",
*	"MT_83": "Cannot create Resource Group. Resource {0} is not under MRG of the Tenant",
*	"MT_84": "ResourceGroup can only belong to the Logged in Tenant OR its SubTenant OR its ManagedTenant",
*	"MT_85": "logged in User Group is Ordinary. So resource group can only be created under logged in user group",
*	"MT_86": "App Admin group logged in. Resource group can be created under any user group under the logged in tenant",
*	"MT_87": "Resource Operation can done under ResourceGroup which belongs to the Logged in Tenant OR its SubTenant OR its ManagedTenant",
*	"MT_88": "logged in User Group is Ordinary. So Resource Operation can be done under ResourceGroup which is under logged in user group",
*	"MT_89": "App Admin group logged in. Resource Operation can be done under resource group which is under any user group under the logged in tenant ",
*	"MT_90": "Provide Resources in the payload",
*	"MT_91": "Cannot add Resources to Resource Group. Resource {0} is not under MRG of the Tenant",
*	"MT_92": "Cannot delete Resources from Resource Group. Resource {0} is not under MRG of the Tenant",
*	"MT_93": "Provide ResourceGroupName to get resources",
*	"MT_94": "Provide both userGroupName and tenantName OR neither",
*	"MT_95": "Tenant provided in URL is not subtenant of the Logged in tenant",
*	"MT_96": "Profile with name {0} already present.",
*	"MT_97": "Profile with name {0} not present.",
*	"MT_98": "Profile can be created/updated under own tenant or one of the sub tenant.",
*	"MT_99": "Only global tenant admin or tenant admin can create tenant admin profiles.",
*	"MT_100": "Only global tenant admin or tenant admin can create app admin profiles.",
*	"MT_101": "Profile Name is mandatory to create user group.",
*	"MT_102": "Cyclic reference to the profile not allowed.",
*	"MT_103": "User Group SureName or owning tenant information is required to create/update profile.",
*	"MT_104": "Only global tenant admin or tenant admin or application admin can append create entity list.",
*	"MT_105": "Application admin(s) cannot append their own create entity list.",
*	"MT_106": "No entities to append in the payload.",
*	"MT_107": "Profile not present for the application {0} under user group {1}",
*	"MT_108": "User Details is not provided or User Authentication not enabled",
*	"MT_109": "DisplayName is mandatory field",
*	"MT_110": "Only GlobalTenant or Tenant Admin users can assign searches",
*	"MT_111": "Log in as GlobalTenantAdmin OR TenantAdmin UserGroup to attach Item to UserGroup",
*	"MT_112": "Provide TenantName for the UserGroup in payload",
*	"MT_113": "Item can be attached/detached to/from a UserGroup under the Logged in Tenant OR its SubTenant OR its ManagedTenant",
*	"MT_114": "Log in as GlobalTenantAdmin OR TenantAdmin UserGroup to attach/detach Item to/from UserGroup",
*	"MT_115": "No Profile present for the Logged in UserGroup and Application",
*	"MT_116": "Log in as GlobalTenantAdmin OR TenantAdmin UserGroup to get Items Of UserGroup",
*	"MT_117": "Logged in UserGroup is TenantAdmin. Items under same  UserGroup of same Tenant OR SubTenant OR  ManagedTenant can be retreived",
*	"MT_118": "Provide UserGroupName to get Items",
*	"MT_119": "Log in as GlobalTenantAdmin OR TenantAdmin UserGroup to detach Item From UserGroup",
*	"MT_120": "Provide the Type of the Item in payload",
*	"MT_121": "Item to be attached does not exist in database",
*	"MT_122": "UserGroup OR Tenant does not exist in database",
*	"MT_123": "Resource can only be created under logged in Tenant OR a SubTenant in the same tree",
*	"MT_124": "Cannot provide tenant in payload. Resources can be created only under Logged in Tenant",
*	"MT_125": "Logged in  Tenant does not have the AccessRights to UPDATE resource under Managed Tenant",
*	"MT_126": "User Group is Tenant Admin. Resource can only be created under logged in Tenant OR a SubTenant in the same tree OR a ManagedTenant",
*	"MT_127": "Cannot UPDATE resource. Tenant in payload does not have Write access of Borrowed Resource ",
*	"MT_128": "Cannot UPDATE resource. Resource does not belong to Tenant ",
*	"MT_129": "Cannot UPDATE resource. UserGroup does not have AccessRights to UPDATE SubTenant Resource",
*	"MT_130": "Cannot UPDATE resource. Tenant in Payload is Not a SubTenant of the Logged in Tenant ",
*	"MT_131": "Cannot UPDATE resource. Tenant does not have Write access of Borrowed Resource",
*	"MT_132": "Cannot UPDATE resource. Tenant in Payload is Not a SubTenant of the Logged in Tenant",
*	"MT_133": "Cannot UPDATE resource. ResourceAccessRights is not defined in the Profile.",
*	"MT_134": "Cannot UPDATE resource. One OR more of  the underlying resources not having WRITE access  for the Usergroup in Context of the loggedin Application.",
*	"MT_135": "No Profile is present for the Resource to be modified in context of this UserGroup and Application",
*	"MT_136": "Entity of Type {0} is not present in the Profile of the loggedin UserGroup. CREATE Opearation FAILED.",
*	"MT_137": "Create List is not present in the Profile of this User Group",
*	"MT_138": "SubTenantAccessRights Property is not present in the Profile of this User Group",
*	"MT_139": "RealmName is empty",
*	"MT_140": "RealmName is already associated with Tenant",
*	"MT_141": "ClientName is already existing for this Realm in KeyCloak",
*	"MT_142": "Tenant with UUID is not present",
*	"MT_143": "Cannot change RealmName in update operation",
*	"MT_144": "SureName,Type or SubType is not provided in playload.",
*	"MT_145": "Item to update not found.",
*	"MT_146": "Failed to update catalog.",
*	"MT_147": "Failed to create catalog.",
*	"MT_148": "Rules can be run for the LoggedIn Tenant OR its SubTenant.",
*	"MT_149": "GroupName {0} is not present in KeyCloak.",
*	"MT_150": "Resource {0} is Borrowed By Tenant with access rights {1}. Share access rights cannot be more than Borrowed Access Rights.",
*	"MT_151": "Resource {0} is Borrowed By Managed Tenant with access rights {1}. Share access rights cannot be more than Managed Tenant Borrowed Access Rights.",
*	"MT_152": "User can be viewed/created/updated/deleted under own tenant or it's own sub tenant.",
*	"MT_153": "User can be searched under own tenant or it's own sub tenant.",
*	"MT_154": "Tenant with name or UUID {0} not present.",
*	"MT_155": "Borrowed resource(s) not allowed to re-share.",
*	"MT_156": "More than one group is not allowed in User creation.",
*	"MT_157": "{0} can not be used as Tenant SureName.",
*	"MT_158": "{0} can not be used as a Label.",
*	"MT_159": "Group {0} is not empty, can not be deleted.",
*	"MT_160": "Admin_UserGroup can not be deleted.",
*	"MT_161": "It's mandatory to assign a single Profile in the UserGroup.",
*	"MT_162": "More than one Profiles cannot be assigned to a UserGroup.",
*	"MT_163": "Cannot create resources under GlobalTenant.",
*	"MT_164": "User must be associated with a UserGroup.",
*	"MT_165": "User {0} does not exist in KeyCloak.",
*	"MT_166": "Profile should be having association with one AccessRole Catalog.",
*	"MT_167": "AccessRole {0} should be Owned By OR Shared With the Parent Tenant of the Tenant you are Creating.",
*	"MT_168": "Profile can have FollowsCatalog association with only a Catalog of SubType AccessRole.",
*	"MT_169": "To perform operation tenant should be Infrastructure tenant.",
*	"MT_170": "Access Profile does not exist.",
*	"MT_171": "Failed to delete Access Profile.",
*	"MT_172": "Failed to delete Access Profile as it is in use.",
*	"MT_173": "Failed to update Access Profile as it is in use.",
*	"MT_174": "Cannot Create Tenant. CanCreateTenants property is set as no in AccessRole {0} of the profile of Parent Tenant.",
*	"MT_175": "Tenant Can Be Created only under LoggedIn Tenant.",
*	"MT_176": "Sub Tenant Visibility flag IsChildVisible can only be Y in this release.",
*	"MT_177": "UserGroup can be deleted under own tenant or it's own sub tenant.",
*	"MT_178": "Password of a user can be reset under own tenant or it's own sub tenant.",
*	"MT_179": "KeyCloak SMTP server is not configured in ETCD.",
*	"MT_180": "Access Profile already exist.",
*	"SPOCEC_400": "SPOC procedure invocation failed with following reasons...",
*	"USER_EDIT_HEADING": "Edit User",
*	"USER_ADD_HEADING": "Add User",
*	"USER_CRUD_FIRSTNAME_LABEL": "First Name",
*	"USER_CRUD_LASTTNAME_LABEL": "Last Name",
*	"USER_CRUD_EMAIL_LABEL": "Email Address",
*	"USER_CRUD_USERNAME_LABEL": "Username",
*	"USER_CRUD_USERGROUP_LABEL": "User Group",
*	"USER_CRUD_ADD_SUCCESS ": "{0} has been added.",
*	"USER_CRUD_FIELD_VALIDATION": "Please enter {0}",
*	"USER_CRUD_FIELD_EMAIL_VALIDATION": "Please enter proper email",
*	"USER_CRUD_ADD_FAILED": "Add User Failed",
*	"ACTIVE": "ACTIVE",
*	"LOCKED": "LOCKED",
*	"TENANT_NAME": 'Tenant Name',
*	"CITY": 'City',
*	"COUNTRY": 'Country',
*	"ADDRESS": 'Address',
*	"PROFILE": 'Profile',
*	"CONTACT_NAME": 'Contact Name',
*	"EMAIL": 'Email Address',
*	"FROM_EMAIL": 'From',
*	"FROM_DISPLAY_NAME": 'From Display Name',
*	"REPLY_TO_EMAIL": 'Reply To',
*	"SHARED_PROFILES": "Shared Profiles",
*	"TENANT_ADMINISTRATOR": "Tenant Administartor",
*	"EMAIL_SETTINGS": "Email Settings",
*	"CONTACT_INFO": 'Contact Information',
*	"USERNAME": 'Username',
*	"USERGROUP": 'Inventory Role',
*	"TENANT_ADD_HEADING": 'ADD TENANT',
*	"TENANT_EDIT_HEADING": 'EDIT TENANT',
*	"TENANT_CRUD_TENANTPORTALURL": 'Tenant Portal URL',
*	"TENANT_CRUD_RESETPW": 'RESET TEMPORARY PASSSWORD',
*	"OTP_MESSGAE": 'New One Time Password sent to'

*}
* var tenantMgmtComponent = React.createElement(TenantMgmt, tenantData);
* ReactDOM.render(tenantMgmtComponent, document.getElementById("tenantCreate"));
*}
* 
*/
import React, { Component } from 'react';
import { Provider } from 'react-redux';
 import TenantMgmtData from '../containers/tenantMgmtContainer'
import store from '../store/store';
import { ToastContainer, toast } from 'react-toastify';

//Add Provider to the root
class TenantMgmt extends Component{
    
     render(){
    
        return(
            <Provider store={store}>
               <div> 
                   <TenantMgmtData tenantData = {this.props}/>  
                   <ToastContainer 
          position="bottom-center"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop={false}
        />            
                </div>
           </Provider>
            
        )        
    }
}

export default TenantMgmt