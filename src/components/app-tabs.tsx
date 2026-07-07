import { NativeTabs } from "expo-router/unstable-native-tabs";
import { router, usePathname } from "expo-router";
import { Pressable, View, StyleSheet, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

import { MaxContentWidth, Spacing } from "@/constants/theme";

export default function AppTabs() {
  return (
    <>
      <NativeTabs hidden backgroundColor="transparent">
        <NativeTabs.Trigger
          name="index"
          contentStyle={{ backgroundColor: "transparent" }}
        />
        <NativeTabs.Trigger
          name="teams"
          contentStyle={{ backgroundColor: "transparent" }}
        />
      </NativeTabs>
      <CustomTabBarOverlay />
    </>
  );
}

function CustomTabBarOverlay() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const tabs = [
    { name: "home", href: "/" as const, label: "Home" },
    { name: "team", href: "/teams" as const, label: "Teams" },
  ];

  return (
    <View
      style={[
        styles.tabListContainer,
        { paddingBottom: insets.bottom + Spacing.three },
      ]}
      pointerEvents="box-none"
    >
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <View style={styles.brandRow}>
          <Image
            source={require("@/assets/images/retake-logo.png")}
            style={styles.brandLogo}
          />
          <ThemedText type="smallBold" style={styles.brandText}>
            Retake
          </ThemedText>
        </View>

        {tabs.map((tab) => {
          const isFocused = pathname === tab.href;
          return (
            <Pressable
              key={tab.name}
              onPress={() => router.push(tab.href)}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <ThemedView
                type={isFocused ? "backgroundSelected" : "backgroundElement"}
                style={styles.tabButtonView}
              >
                <ThemedText
                  type="small"
                  themeColor={isFocused ? "text" : "textSecondary"}
                >
                  {tab.label}
                </ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: "auto",
  },
  brandLogo: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  brandText: {},
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
