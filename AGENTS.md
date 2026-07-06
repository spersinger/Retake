# Anchored Summary

## Goal
Make the bottom sheet modal only open to the top of the visible screen, respecting safe area insets so the fully expanded top sits below the notch.

## Constraints & Preferences
- The popup should be fully open but stop exactly at the top safe area inset (below the notch).
- Use safe area insets from `react-native-safe-area-context`.
- App is forced to dark mode always.

## Progress
### Done
- Replaced `NativeTabs` with a hidden native tab bar + absolutely positioned custom glass overlay (logo, pill buttons, safe area padding).
- Forced dark mode: `use-color-scheme.ts` always returns `"dark"`, `_layout.tsx` uses `DarkTheme` unconditionally.
- Reverted two experimental fixes to `themed-view.tsx` and `match.tsx` that didn't help.
- Added `contentStyle={{ backgroundColor: "transparent" }}` to each `NativeTabs.Trigger` in `app-tabs.tsx` so the root `LinearGradient` shows through on iOS (matching web behavior).
- Reverted broken snap point changes in `MatchDetailsModal.tsx` back to original `["65%", "100%"]`.
- Added Live Activity widget: `ios/LiveActivityWidget/LiveActivityWidgetLiveActivity.swift` rewritten with `MatchActivityAttributes` (team names, scores, map, status) and Lock Screen + Dynamic Island UI.
- Added expo-notifications: installed package, configured plugin in app.json, notification handler in `_layout.tsx`.
- Created `src/api/notifications.ts`: `requestLiveActivity()` calls `server/notif/request` with match ID and push token.
- Created `src/hooks/use-live-activity.tsx`: manages push token registration, provides `startActivity(matchId)` and `stopActivity()` that call the server endpoint.
- Added Live Activity toggle button in `MatchDetailsModal.tsx` header (only shown for running matches).

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- Dark mode is forced by overriding `use-color-scheme.ts` to return `"dark"` and hardcoding `DarkTheme` in `_layout.tsx`.
- The tab bar uses `NativeTabs hidden` for routing + safe areas, with a separate `CustomTabBarOverlay` absolutely positioned at the bottom.
- `expo-router/ui`'s `Tabs` and `expo-router`'s `Tabs` with `tabBar` prop both caused layout or hook errors on iOS, so the hybrid `NativeTabs` + overlay approach was chosen.
- Gradient background lives in `_layout.tsx` (works for web). On iOS, `NativeTabs.Trigger contentStyle` with transparent bg lets it show through.
- Bottom sheet snap points use `["65%", "100%"]` - the safe-area-constrained approach didn't work.
- Live Activity uses push-to-start: app sends match ID + Expo push token to `server/notif/request`, server sends APNs push-to-start/update/end notifications to the Live Activity widget.
- `MatchActivityAttributes` define matched data contract: matchId (static), ContentState with team names/scores/map/status/round tick.

## Next Steps
- Server must handle `POST /server/notif/request` with `{ id: number, pushToken?: string, action: "start" | "stop" }`. It should use the push token to send APNs Live Activity push notifications with `content-state` matching `MatchActivityAttributes.ContentState`.
- After rebuilding the dev client, the Live Activity button will appear on live match detail modals.

## Relevant Files
- `src/components/ui/MatchDetailsModal.tsx`: bottom sheet modal (reverted to `["65%", "100%"]`), now has Live Activity toggle button.
- `src/hooks/use-color-scheme.ts`: always returns `"dark"`.
- `src/app/_layout.tsx`: hardcodes `DarkTheme` + root `LinearGradient` + notification handler.
- `src/components/app-tabs.tsx`: NativeTabs + CustomTabBarOverlay approach; triggers have `contentStyle={{ backgroundColor: "transparent" }}`.
- `src/components/app-tabs.web.tsx`: web tab bar (uses `expo-router/ui` Tabs, no gradient needed).
- `src/hooks/use-match-details.tsx`: renders `MatchDetailModal` and owns the `BottomSheetModal` ref.
- `src/constants/theme.ts`: contains `BottomTabInset` (50 iOS, 80 Android).
- `ios/LiveActivityWidget/LiveActivityWidgetLiveActivity.swift`: `MatchActivityAttributes` + Lock Screen and Dynamic Island UI for CS:GO matches.
- `src/api/notifications.ts`: calls `server/notif/request` to start/stop Live Activity for a match.
- `src/hooks/use-live-activity.tsx`: hook for push token and Live Activity start/stop.
