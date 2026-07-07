#!/usr/bin/env python3
"""Add LiveActivityWidget extension target to the Xcode project safely."""
import re

PBXPROJ = "/Users/persinger/Documents/Retake/ios/Retake.xcodeproj/project.pbxproj"

with open(PBXPROJ) as f:
    content = f.read()

# --- UUIDs we'll use (must be unique in the project) ---
# Use UUIDs that are unlikely to conflict
TARGET_UUID = "DEADBEEF00000001"
PRODUCT_REF_UUID = "DEADBEEF00000002"
CONFIG_LIST_UUID = "DEADBEEF00000003"
DEBUG_CONFIG_UUID = "DEADBEEF00000004"
RELEASE_CONFIG_UUID = "DEADBEEF00000005"
SOURCES_PHASE_UUID = "DEADBEEF00000006"
FRAMEWORKS_PHASE_UUID = "DEADBEEF00000007"
RESOURCES_PHASE_UUID = "DEADBEEF00000008"
WIDGET_SWIFT_REF = "DEADBEEF00000009"
WIDGET_LIVE_REF = "DEADBEEF0000000A"
SHARED_ATTRS_REF = "DEADBEEF0000000B"
INFO_PLIST_REF = "DEADBEEF0000000C"
ENTITLEMENTS_REF = "DEADBEEF0000000D"
BUILD_FILE_WIDGET_SWIFT = "DEADBEEF0000000E"
BUILD_FILE_WIDGET_LIVE = "DEADBEEF0000000F"
BUILD_FILE_SHARED_ATTRS_WIDGET = "DEADBEEF00000010"
BUILD_FILE_INFO_PLIST = "DEADBEEF00000011"
NATIVE_MODULE_SWIFT_REF = "DEADBEEF00000012"
NATIVE_MODULE_M_REF = "DEADBEEF00000013"
BUILD_FILE_NATIVE_SWIFT = "DEADBEEF00000014"
BUILD_FILE_NATIVE_M = "DEADBEEF00000015"
BUILD_FILE_EMBED = "DEADBEEF00000016"
DEP_UUID = "DEADBEEF00000017"
MAIN_SHARED_REF = "DEADBEEF00000018"
BUILD_FILE_MAIN_SHARED = "DEADBEEF00000019"

# --- 1. Add PBXBuildFile entries ---
build_file_entries = """
\t\t{bf_widget_swift} /* LiveActivityWidget.swift in Sources */ = {isa = PBXBuildFile; fileRef = {ref_widget_swift} /* LiveActivityWidget.swift */; };
\t\t{bf_widget_live} /* LiveActivityWidgetLiveActivity.swift in Sources */ = {isa = PBXBuildFile; fileRef = {ref_widget_live} /* LiveActivityWidgetLiveActivity.swift */; };
\t\t{bf_shared_widget} /* SharedActivityAttributes.swift in Sources */ = {isa = PBXBuildFile; fileRef = {ref_shared} /* SharedActivityAttributes.swift */; };
\t\t{bf_info_plist} /* Info.plist in Resources */ = {isa = PBXBuildFile; fileRef = {ref_info_plist} /* Info.plist */; };
\t\t{bf_native_swift} /* LiveActivityNativeModule.swift in Sources */ = {isa = PBXBuildFile; fileRef = {ref_native_swift} /* LiveActivityNativeModule.swift */; };
\t\t{bf_native_m} /* LiveActivityNativeModule.m in Sources */ = {isa = PBXBuildFile; fileRef = {ref_native_m} /* LiveActivityNativeModule.m */; };
\t\t{bf_embed} /* LiveActivityWidget.appex in Embed App Extensions */ = {isa = PBXBuildFile; fileRef = {ref_product} /* LiveActivityWidget.appex */; settings = {ATTRIBUTES = (RemoveHeadersOnCopy, ); }; };
\t\t{bf_main_shared} /* SharedActivityAttributes.swift in Sources */ = {isa = PBXBuildFile; fileRef = {ref_main_shared} /* SharedActivityAttributes.swift */; };
"""

# Insert after the last existing PBXBuildFile entry
# Find the end of PBXBuildFile section
insert_before = "/* End PBXBuildFile section */"
bf_text = build_file_entries.format(
    bf_widget_swift=BUILD_FILE_WIDGET_SWIFT,
    ref_widget_swift=WIDGET_SWIFT_REF,
    bf_widget_live=BUILD_FILE_WIDGET_LIVE,
    ref_widget_live=WIDGET_LIVE_REF,
    bf_shared_widget=BUILD_FILE_SHARED_ATTRS_WIDGET,
    ref_shared=SHARED_ATTRS_REF,
    bf_info_plist=BUILD_FILE_INFO_PLIST,
    ref_info_plist=INFO_PLIST_REF,
    bf_native_swift=BUILD_FILE_NATIVE_SWIFT,
    ref_native_swift=NATIVE_MODULE_SWIFT_REF,
    bf_native_m=BUILD_FILE_NATIVE_M,
    ref_native_m=NATIVE_MODULE_M_REF,
    bf_embed=BUILD_FILE_EMBED,
    ref_product=PRODUCT_REF_UUID,
    bf_main_shared=BUILD_FILE_MAIN_SHARED,
    ref_main_shared=MAIN_SHARED_REF,
)
content = content.replace(insert_before, bf_text + "\n" + insert_before)

# --- 2. Add PBXFileReference entries ---
file_ref_entries = """
\t\t{ref_widget_swift} /* LiveActivityWidget.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = LiveActivityWidget/LiveActivityWidget.swift; sourceTree = \"<group>\"; };
\t\t{ref_widget_live} /* LiveActivityWidgetLiveActivity.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = LiveActivityWidget/LiveActivityWidgetLiveActivity.swift; sourceTree = \"<group>\"; };
\t\t{ref_shared} /* SharedActivityAttributes.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = SharedActivityAttributes.swift; sourceTree = \"<group>\"; };
\t\t{ref_info_plist} /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = LiveActivityWidget/Info.plist; sourceTree = \"<group>\"; };
\t\t{ref_entitlements} /* LiveActivityWidget.entitlements */ = {isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; path = LiveActivityWidget/LiveActivityWidget.entitlements; sourceTree = \"<group>\"; };
\t\t{ref_native_swift} /* LiveActivityNativeModule.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = LiveActivityNativeModule.swift; sourceTree = \"<group>\"; };
\t\t{ref_native_m} /* LiveActivityNativeModule.m */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.c.objc; path = LiveActivityNativeModule.m; sourceTree = \"<group>\"; };
\t\t{ref_product} /* LiveActivityWidget.appex */ = {isa = PBXFileReference; explicitFileType = \"wrapper.app-extension\"; includeInIndex = 0; path = LiveActivityWidget.appex; sourceTree = BUILT_PRODUCTS_DIR; };
\t\t{ref_main_shared} /* SharedActivityAttributes.swift */ = {isa = PBXFileReference; explicitFileType = sourcecode.swift; path = SharedActivityAttributes.swift; sourceTree = \"<group>\"; };
"""

fr_text = file_ref_entries.format(
    ref_widget_swift=WIDGET_SWIFT_REF,
    ref_widget_live=WIDGET_LIVE_REF,
    ref_shared=SHARED_ATTRS_REF,
    ref_info_plist=INFO_PLIST_REF,
    ref_entitlements=ENTITLEMENTS_REF,
    ref_native_swift=NATIVE_MODULE_SWIFT_REF,
    ref_native_m=NATIVE_MODULE_M_REF,
    ref_product=PRODUCT_REF_UUID,
    ref_main_shared=MAIN_SHARED_REF,
)
content = content.replace("/* End PBXFileReference section */", fr_text + "\n" + "/* End PBXFileReference section */")

# --- 3. Add PBXGroup entries (put widget files in a group) ---
# We'll add the widget files to the root group (same as other source files)
# This is simpler and still works

# --- 4. Add PBXNativeTarget for the widget ---
native_target = """
\t\t{target_uuid} /* {target_name} */ = {{
\t\t\tisa = PBXNativeTarget;
\t\t\tbuildConfigurationList = {config_list_uuid} /* Build configuration list for PBXNativeTarget \"{target_name}\" */;
\t\t\tbuildPhases = (
\t\t\t\t{sources_phase} /* Sources */,
\t\t\t\t{frameworks_phase} /* Frameworks */,
\t\t\t\t{resources_phase} /* Resources */,
\t\t\t);
\t\t\tbuildRules = (
\t\t\t);
\t\t\tdependencies = (
\t\t\t);
\t\t\tname = \"{target_name}\";
\t\t\tproductName = \"{target_name}\";
\t\t\tproductReference = {product_ref};
\t\t\tproductType = \"com.apple.product-type.app-extension\";
\t\t}};
"""

nt_text = native_target.format(
    target_uuid=TARGET_UUID,
    target_name="LiveActivityWidget",
    config_list_uuid=CONFIG_LIST_UUID,
    sources_phase=SOURCES_PHASE_UUID,
    frameworks_phase=FRAMEWORKS_PHASE_UUID,
    resources_phase=RESOURCES_PHASE_UUID,
    product_ref=PRODUCT_REF_UUID,
)
# Insert after the last PBXNativeTarget entry
content = content.replace("/* End PBXNativeTarget section */", nt_text + "\n" + "/* End PBXNativeTarget section */")

# --- 5. Add product reference to PBXGroup ---
# The product reference needs to be in the Products group
# Find the Products group and add our .appex
# Pattern: products group usually has path = "Products";
# We need to add the productRef to the products group's children
# This is a fragile regex approach
products_group_pattern = r'(children\s*=\s*\()([^)]*)(\);\s*\n\s*name\s*=\s*"Products")'
def add_to_products(m):
    before, children, after = m.groups()
    if PRODUCT_REF_UUID not in children:
        return f'{before}{children}\t\t\t\t{PRODUCT_REF_UUID} /* LiveActivityWidget.appex */,{after}'
    return m.group(0)
content = re.sub(products_group_pattern, add_to_products, content, count=1)

# --- 6. Add widget files to the main group (the root group) ---
# The root group contains all the source files. Add our new file refs there.
# Find the root group (comment = no name, or name = "Retake" or similar)
# More reliable: find the group with sourceTree = "<group>" that has children including AppDelegate.swift
root_group_pattern = r'(children\s*=\s*\()([^)]*)(\);\s*\n\s*path\s*=\s*"";?\s*\n\s*sourceTree\s*=\s*"<group>")'
def add_to_root_group(m):
    before, children, after = m.groups()
    new_refs = [
        f'{WIDGET_SWIFT_REF} /* LiveActivityWidget.swift */',
        f'{WIDGET_LIVE_REF} /* LiveActivityWidgetLiveActivity.swift */',
        f'{SHARED_ATTRS_REF} /* SharedActivityAttributes.swift */',
        f'{INFO_PLIST_REF} /* Info.plist */',
        f'{ENTITLEMENTS_REF} /* LiveActivityWidget.entitlements */',
        f'{NATIVE_MODULE_SWIFT_REF} /* LiveActivityNativeModule.swift */',
        f'{NATIVE_MODULE_M_REF} /* LiveActivityNativeModule.m */',
        f'{MAIN_SHARED_REF} /* SharedActivityAttributes.swift */',
    ]
    # Only add if not already present
    for ref in new_refs:
        if ref.split()[0] not in children:
            before = before + f'\t\t\t\t{ref},\n'
    return before + children + after
content = re.sub(root_group_pattern, add_to_root_group, content, count=1)

# --- 7. Add XCBuildConfiguration entries for Debug and Release ---
xcconfig_debug = """
\t\t{debug_uuid} /* Debug */ = {{
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {{
\t\t\t\tAPPLICATION_EXTENSION_API_ONLY = YES;
\t\t\t\tCODE_SIGN_ENTITLEMENTS = \"LiveActivityWidget/LiveActivityWidget.entitlements\";
\t\t\t\t"CODE_SIGN_IDENTITY[sdk=iphoneos*]" = \"iPhone Developer\";
\t\t\t\tDEVELOPMENT_TEAM = FAMKHM5JC3;
\t\t\t\tGCC_PREPROCESSOR_DEFINITIONS = (
\t\t\t\t\t"DEBUG=1",
\t\t\t\t\t"$(inherited)",
\t\t\t\t);
\t\t\t\tINFOPLIST_FILE = \"LiveActivityWidget/Info.plist\";
\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = 16.2;
\t\t\t\tLD_RUNPATH_SEARCH_PATHS = \"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks\";
\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = \"com.spersin00.cslivemobile.LiveActivityWidget\";
\t\t\t\tPRODUCT_BUNDLE_PACKAGE_TYPE = \"XPC!\";
\t\t\t\tPRODUCT_NAME = \"LiveActivityWidget\";
\t\t\t\tSKIP_INSTALL = YES;
\t\t\t\tSWIFT_VERSION = 5.0;
\t\t\t}};
\t\t\tname = Debug;
\t\t}};
""".format(debug_uuid=DEBUG_CONFIG_UUID)

xcconfig_release = """
\t\t{release_uuid} /* Release */ = {{
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {{
\t\t\t\tAPPLICATION_EXTENSION_API_ONLY = YES;
\t\t\t\tCODE_SIGN_ENTITLEMENTS = \"LiveActivityWidget/LiveActivityWidget.entitlements\";
\t\t\t\t"CODE_SIGN_IDENTITY[sdk=iphoneos*]" = \"iPhone Developer\";
\t\t\t\tDEVELOPMENT_TEAM = FAMKHM5JC3;
\t\t\t\tINFOPLIST_FILE = \"LiveActivityWidget/Info.plist\";
\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = 16.2;
\t\t\t\tLD_RUNPATH_SEARCH_PATHS = \"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks\";
\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = \"com.spersin00.cslivemobile.LiveActivityWidget\";
\t\t\t\tPRODUCT_BUNDLE_PACKAGE_TYPE = \"XPC!\";
\t\t\t\tPRODUCT_NAME = \"LiveActivityWidget\";
\t\t\t\tSKIP_INSTALL = YES;
\t\t\t\tSWIFT_VERSION = 5.0;
\t\t\t}};
\t\t\tname = Release;
\t\t}};
""".format(release_uuid=RELEASE_CONFIG_UUID)

content = content.replace("/* End XCBuildConfiguration section */",
    xcconfig_debug + "\n" + xcconfig_release + "\n" + "/* End XCBuildConfiguration section */")

# --- 8. Add XCConfigurationList for the widget target ---
config_list = """
\t\t{config_list_uuid} /* Build configuration list for PBXNativeTarget \"{target_name}\" */ = {{
\t\t\tisa = XCConfigurationList;
\t\t\tbuildConfigurations = (
\t\t\t\t{debug_uuid} /* Debug */,
\t\t\t\t{release_uuid} /* Release */,
\t\t\t);
\t\t\tdefaultConfigurationIsVisible = 0;
\t\t\tdefaultConfigurationName = Release;
\t\t}};
""".format(config_list_uuid=CONFIG_LIST_UUID, target_name="LiveActivityWidget",
           debug_uuid=DEBUG_CONFIG_UUID, release_uuid=RELEASE_CONFIG_UUID)

content = content.replace("/* End XCConfigurationList section */",
    config_list + "\n" + "/* End XCConfigurationList section */")

# --- 9. Add PBXSourcesBuildPhase for the widget ---
sources_phase = """
\t\t{sources_phase_uuid} /* Sources */ = {{
\t\t\tisa = PBXSourcesBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
\t\t\t\t{bf_widget_swift} /* LiveActivityWidget.swift in Sources */,
\t\t\t\t{bf_widget_live} /* LiveActivityWidgetLiveActivity.swift in Sources */,
\t\t\t\t{bf_shared} /* SharedActivityAttributes.swift in Sources */,
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t}};
""".format(
    sources_phase_uuid=SOURCES_PHASE_UUID,
    bf_widget_swift=BUILD_FILE_WIDGET_SWIFT,
    bf_widget_live=BUILD_FILE_WIDGET_LIVE,
    bf_shared=BUILD_FILE_SHARED_ATTRS_WIDGET,
)
content = content.replace("/* End PBXSourcesBuildPhase section */",
    sources_phase + "\n" + "/* End PBXSourcesBuildPhase section */")

# --- 10. Add PBXFrameworksBuildPhase for the widget ---
frameworks_phase = """
\t\t{frameworks_phase_uuid} /* Frameworks */ = {{
\t\t\tisa = PBXFrameworksBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t}};
""".format(frameworks_phase_uuid=FRAMEWORKS_PHASE_UUID)
content = content.replace("/* End PBXFrameworksBuildPhase section */",
    frameworks_phase + "\n" + "/* End PBXFrameworksBuildPhase section */")

# --- 11. Add PBXResourcesBuildPhase for the widget ---
resources_phase = """
\t\t{resources_phase_uuid} /* Resources */ = {{
\t\t\tisa = PBXResourcesBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
\t\t\t\t{bf_info_plist} /* Info.plist in Resources */,
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t}};
""".format(
    resources_phase_uuid=RESOURCES_PHASE_UUID,
    bf_info_plist=BUILD_FILE_INFO_PLIST,
)
content = content.replace("/* End PBXResourcesBuildPhase section */",
    resources_phase + "\n" + "/* End PBXResourcesBuildPhase section */")

# --- 12. Add to main target's buildPhases: Embed App Extensions ---
# Find the main target's buildPhases and add the Embed App Extensions phase
# Also add the dependency
# Main target UUID is usually 13B07F861A680F5B00A75B9A
MAIN_TARGET_UUID = "13B07F861A680F5B00A75B9A"

# Add Embed App Extensions phase reference to main target's buildPhases
# We need to add both the Copy Files phase and its content
embed_phase_text = """
\t\tEMBED_PHASE_UUID /* Embed App Extensions */ = {
\t\t\tisa = PBXCopyFilesBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
\t\t\t\tEMBED_BF_UUID /* LiveActivityWidget.appex in Embed App Extensions */,
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t\tdstPath = "";
\t\t\tdstSubfolderSpec = 13;
\t\t\tname = "Embed App Extensions";
\t\t};
"""
# Generate a real-looking UUID for the embed phase
EMBED_PHASE_UUID = "DEADBEEF0000001A"
embed_text = embed_phase_text.replace("EMBED_PHASE_UUID", EMBED_PHASE_UUID).replace("EMBED_BF_UUID", BUILD_FILE_EMBED)

# Add the embed phase to PBXCopyFilesBuildPhase section
content = content.replace("/* End PBXCopyFilesBuildPhase section */",
    embed_text + "\n" + "/* End PBXCopyFilesBuildPhase section */")

# Add the embed phase reference to the main target's buildPhases
main_target_pattern = re.compile(
    r'(' + re.escape(MAIN_TARGET_UUID) + r'\s+/\*\s+Retake\s+\*/\s*=\s*\{[^}]*buildPhases\s*=\s*\()'
    r'([^)]*)\)',
    re.DOTALL
)
def add_embed_phase(m):
    prefix = m.group(1)
    phases = m.group(2)
    if "Embed App Extensions" not in phases:
        phases += f",\n\t\t\t\t{EMBED_PHASE_UUID} /* Embed App Extensions */"
    return prefix + phases + ")"
content = main_target_pattern.sub(add_embed_phase, content)

# --- 13. Add target dependency ---
# Add PlayActivityWidget as a dependency of the main target
dependency_entry = f"""
\t\t{DEP_UUID} /* PBXTargetDependency */ = {{
\t\t\tisa = PBXTargetDependency;
\t\t\tname = \"LiveActivityWidget\";
\t\t\ttarget = {TARGET_UUID} /* LiveActivityWidget */;
\t\t}};
"""
content = content.replace("/* End PBXTargetDependency section */",
    dependency_entry + "\n" + "/* End PBXTargetDependency section */")

# Add the dependency to the main target
def add_dependency(m):
    prefix = m.group(1)
    deps = m.group(2)
    if "LiveActivityWidget" not in deps:
        deps += f",\n\t\t\t\t{DEP_UUID} /* LiveActivityWidget */"
    return prefix + deps + ")"
content = re.sub(
    r'(' + re.escape(MAIN_TARGET_UUID) + r'\s+/\*\s+Retake\s+\*/\s*=\s*\{[^}]*dependencies\s*=\s*\()([^)]*)\)',
    add_dependency,
    content,
    count=1,
    flags=re.DOTALL
)

# --- 14. Update main target's buildPhases to include native module files ---
# Add native module files to the main source phase
# Find the main Sources phase
MAIN_SOURCES_PHASE = "13B07F871A680F5B00A75B9A"
main_sources_pattern = re.compile(
    r'(' + re.escape(MAIN_SOURCES_PHASE) + r'\s+/\*\s+Sources\s+\*/\s*=\s*\{[^}]*files\s*=\s*\()([^)]*)\)',
    re.DOTALL
)
def add_to_main_sources(m):
    prefix = m.group(1)
    files = m.group(2)
    additions = []
    if "LiveActivityNativeModule.swift" not in files:
        additions.append(f'\t\t\t\t{BUILD_FILE_NATIVE_SWIFT} /* LiveActivityNativeModule.swift in Sources */')
    if "LiveActivityNativeModule.m" not in files:
        additions.append(f'\t\t\t\t{BUILD_FILE_NATIVE_M} /* LiveActivityNativeModule.m in Sources */')
    if "SharedActivityAttributes.swift" not in files:
        additions.append(f'\t\t\t\t{BUILD_FILE_MAIN_SHARED} /* SharedActivityAttributes.swift in Sources */')
    for add in additions:
        files += ",\n" + add
    return prefix + files + ")"
content = main_sources_pattern.sub(add_to_main_sources, content)

# --- 15. Add LastSwiftMigration to target attributes ---
target_attrs_pattern = re.compile(
    r'(TargetAttributes\s*=\s*\{[^}]*' + re.escape(MAIN_TARGET_UUID) + r'\s*=\s*\{[^}]*\};)',
    re.DOTALL
)
def add_widget_attrs(m):
    block = m.group(1)
    if "DEADBEEF00000001" not in block:
        block = block.rstrip('}') + f"""
\t\t\t\t\t{TARGET_UUID} = {{
\t\t\t\t\t\tLastSwiftMigration = 1250;
\t\t\t\t\t}};
\t\t\t\t}};
"""
    return block
content = target_attrs_pattern.sub(add_widget_attrs, content)

# --- 16. Add NSUserActivityTypes to Info.plist ---
INFO_PLIST_PATH = "/Users/persinger/Documents/Retake/ios/Retake/Info.plist"
with open(INFO_PLIST_PATH) as f:
    info_plist = f.read()

if "MatchActivityAttributes" not in info_plist:
    # Add MatchActivityAttributes to NSUserActivityTypes
    insert_before_info = "<key>RCTNewArchEnabled</key>"
    insert_text = """\t<key>NSUserActivityTypes</key>
\t<array>
\t\t<string>$(PRODUCT_BUNDLE_IDENTIFIER).expo.index_route</string>
\t\t<string>MatchActivityAttributes</string>
\t</array>
\t"""
    info_plist = info_plist.replace(insert_before_info, insert_text + "\t" + insert_before_info)
    with open(INFO_PLIST_PATH, 'w') as f:
        f.write(info_plist)
    print("Added NSUserActivityTypes to Info.plist")

# --- Write the modified pbxproj ---
with open(PBXPROJ, 'w') as f:
    f.write(content)

print("Widget target added successfully!")
