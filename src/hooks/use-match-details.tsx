import { createContext, useContext, useRef, useState, useEffect } from "react";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { getHLTVMatch, getMatch } from "@/api/pandascore";
import { Game } from "@/api/pandascore-types";
import MatchDetailModal from "@/components/ui/MatchDetailsModal";

interface MatchDetailsContextType {
  matchId: number | null;
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
  const [matchId, setMatchId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [match, setMatch] = useState<any>();
  const [hltvData, setHLTVData] = useState<any>();
  const [games, setGames] = useState<Game[] | null>(null);

  const openMatchDetails = (id: number) => {
    setMatchId(id);
    setIsOpen(true);
    setFetchKey((k) => k + 1);
    setGames(null);
    setHLTVData(null);
    bottomSheetModalRef.current?.present();
  };

  const closeMatchDetails = () => {
    setIsOpen(false);
    setMatchId(null);
    setGames(null);
    setHLTVData(null);
    bottomSheetModalRef.current?.dismiss();
  };

  useEffect(() => {
    if (isOpen && matchId) {
      getMatch({ match_id: matchId }).then(setMatch).catch(console.error);
      getHLTVMatch({ match_id: matchId })
        .then(setHLTVData)
        .catch(console.error);
    }
  }, [isOpen, matchId, fetchKey]);

  return (
    <MatchDetailsContext.Provider
      value={{ matchId, isOpen, openMatchDetails, closeMatchDetails }}
    >
      <BottomSheetModalProvider>
        {children}
        <MatchDetailModal
          bottomSheetModalRef={bottomSheetModalRef}
          matchData={match}
          gamesData={games}
          HLTVData={hltvData}
        />
      </BottomSheetModalProvider>
    </MatchDetailsContext.Provider>
  );
};

export const useMatchDetails = () => {
  const context = useContext(MatchDetailsContext);
  if (!context) {
    throw new Error(
      "useMatchDetails must be used within a MatchDetailsProvider",
    );
  }
  return context;
};
