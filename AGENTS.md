# Anchored Summary

## Goal
Add a LiveActivityWidget extension target to the Expo iOS Xcode project without corrupting `project.pbxproj`, so Live Activities work on device.

## Root Cause & Critical Context
The `xcode` npm package's **writer does NOT auto-quote values** in OpenStep plist output. Any value requiring quotes in the `.pbxproj` file must be stored in the hash **with literal double quotes already embedded**. Examples:
- `sourceTree` → `'"<group>"'` (special chars `< >`)
- `productType` → `'"com.apple.product-type.app-extension"'` (dots)
- `PRODUCT_BUNDLE_PACKAGE_TYPE` → `'"XPC!"'` (exclamation)
- `TARGETED_DEVICE_FAMILY` → `'"1,2"'` (comma separator)
- `INFOPLIST_KEY_CFBundleDisplayName` → `'"Retake Live Activities"'` (spaces)
- Empty string → `'""'`
- Simple strings (no special chars) → no quotes, e.g. `'RetakeWidgetExtension'`, `'YES'`, `'17.0'`

The parser (OpenStep) strips outer quotes on read; values like `<group>` are stored without quotes in the JS hash. The `pbxFileReferenceObj` helper auto-quotes `name` and `path` but NOT `sourceTree`, so callers must pre-quote `sourceTree`.

The `omitEmptyValues: true` option must be passed to `writeSync()` to prevent `undefined` properties (e.g. `fileEncoding`, `explicitFileType`, `includeInIndex`) from being written as literal `undefined` text.

## Progress
### Done
- **Root cause of `xcode` package corrupting files identified**: values needing quotes (see above) must be embedded with literal double quotes in the hash.
- **`addBuildPhase` high-level API works for all build phase types** (Sources, Frameworks, Resources, CopyFiles) when called with correct arguments. Uses internal `pbxCopyFilesBuildPhaseObj` which properly quotes `name`, `dstPath`, and resolves `dstSubfolderSpec`.
- **`addToPbxFileReferenceSection` works** when `sourceTree` is pre-quoted.
- **`addToPbxBuildFileSection` works** as-is.
- Created `scripts/add-widget.js` that successfully adds:
  - PBXFileReference entries (4 widget source files + 1 product)
  - PBXBuildFile entries (2 Swift source files)
  - PBXSourcesBuildPhase, PBXFrameworksBuildPhase, PBXResourcesBuildPhase (via `addBuildPhase`)
  - XCBuildConfiguration entries (Debug + Release for widget target)
  - XCConfigurationList for widget target
  - PBXNativeTarget for widget
  - PBXTargetDependency on main target
  - PBXCopyFilesBuildPhase (Embed App Extensions) on main target (via `addBuildPhase` with `'app_extension'`)
  - TargetAttributes entry for widget
  - Project target list and group references
- Project validated: `xcodebuild -list` shows both `Retake` and `RetakeWidgetExtension` targets with correct schemes.
- Round-trip test passes (re-parse + write-back produces valid output).

### In Progress
- (none)

### Blocked
- Building the widget requires a full `pod install` / clean build to resolve Pods module maps (pre-existing issue unrelated to widget changes).

## Key Decisions
- Use high-level API (`addBuildPhase`, `addToPbxFileReferenceSection`, `addToPbxBuildFileSection`) where available; fall back to direct hash manipulation for targets, configs, dependencies.
- Always create the PBXNativeTarget entry BEFORE calling `addBuildPhase` for its phases, since `addBuildPhase` pushes to the target's `buildPhases` array.
- Use `writeSync({omitEmptyValues: true})` to avoid writing `undefined` for optional properties.
- Backup clean `.bak5` is the pristine pre-widget baseline (29365 bytes).
- PBXCopyFilesBuildPhase is added to the main (app) target, not the widget target.

## Next Steps
1. Verify the widget builds in Xcode (open project with `xed ios` and build).
2. Re-enable `expo-dev-client` plugin in `app.json` if needed.
3. Verify the Live Activity toggle appears in `MatchDetailsModal.tsx`.
4. Server must handle `POST /server/notif/request` for push-to-start Live Activities.

## Relevant Files
- `scripts/add-widget.js` — Node.js script that adds the widget target to the Xcode project.
- `ios/Retake.xcodeproj/project.pbxproj` — main project file (now includes widget target).
- `ios/Retake.xcodeproj/project.pbxproj.bak5` — clean baseline pre-widget.
- `ios/LiveActivityWidget/` — widget extension source files (`.swift`, `Info.plist`, `.entitlements`).
- `node_modules/xcode/lib/pbxProject.js` — contains `addBuildPhase`, `addToPbxFileReferenceSection`, etc.
- `node_modules/xcode/lib/pbxWriter.js` — writer with `omitEmptyValues` option; no auto-quoting.
