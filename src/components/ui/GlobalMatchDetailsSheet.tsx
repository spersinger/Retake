import { useEffect, useRef } from "react";
import { ImageBackgroundComponent, StyleSheet, Text } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useMatchDetails } from "@/hooks/use-match-details";
import { useTheme } from "@/hooks/use-theme";
import { ThemedView } from "../themed-view";

export const GlobalMatchDetailsSheet = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { isOpen, matchId, closeMatchDetails } = useMatchDetails();
  const theme = useTheme();

  // Sync the hook state with the actual Gorhom imperative ref methods
  useEffect(() => {
    if (isOpen) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isOpen]);

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={["50%", "100%"]}
        index={1}
        // 1. Force the main background graphic shape
        backgroundStyle={styles.modalBackground}
        // 2. Force the top drag handle line color
        handleIndicatorStyle={styles.modalHandle}
        detached={true}
        // 3. Force the outer container structure style to match
        containerStyle={styles.modalContainerOverride}
      >
        <BottomSheetView style={styles.modalContent}>
          <Text style={styles.text}>Displaying Match: {matchId}</Text>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  text: { fontSize: 18, fontWeight: "bold" },
  // Forces the backdrop container layer to be dark/transparent instead of white
  modalContainerOverride: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  // Forces the physical paper sheet shape to be black
  modalBackground: {
    backgroundColor: "#000000",
  },
  // Makes the horizontal drag bar visible on black
  modalHandle: {
    backgroundColor: "#ffffff",
  },
  // Forces your inner layout content to be black
  modalContent: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#000000",
    padding: 24,
  },
});
