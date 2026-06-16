import { createContext, useContext, useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

// Define what other components can access
interface MatchDetailsContextType {
  matchId: string | null;
  isOpen: boolean;
  openMatchDetails: (matchId: number) => void;
  closeMatchDetails: () => void;
}

const MatchDetailsContext = createContext<MatchDetailsContextType | undefined>(
  undefined,
);

export const MatchDetailsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}: any) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const openMatchDetails = (matchId: string) => {
    setSelectedMatchId(matchId);
    bottomSheetModalRef.current?.present();
  };

  const closeMatchDetails = () => {
    bottomSheetModalRef.current?.dismiss();
  };

  return (
    <MatchDetailsContext.Provider
      value={{ openMatchDetails, closeMatchDetails }}
    >
      <BottomSheetModalProvider>
        {children}

        {/* The single, global instance of the Bottom Sheet */}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          // '100%' makes it full-screen like the Apple Sports app snapshot
          snapPoints={["50%", "100%"]}
          index={0}
        >
          <BottomSheetView style={styles.contentContainer}>
            <Text style={styles.titleText}>
              Match Details ID: {selectedMatchId}
            </Text>
            {/* You can inject your sub-components here (e.g. <MatchSummary id={selectedMatchId} />) */}
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </MatchDetailsContext.Provider>
  );
};

// Custom hook to easily trigger the sheet anywhere
export const useMatchDetails = () => {
  const context = useContext(MatchDetailsContext);
  if (!context) {
    throw new Error(
      "useMatchDetails must be used within a MatchDetailsProvider",
    );
  }
  return context;
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
