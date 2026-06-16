import { createContext, useContext, useRef, useState, useEffect } from "react";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { getMatch } from "@/api/pandascore";
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
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [match, setMatch] = useState<any>();
  const [games, setGames] = useState<Game[] | null>(null);

  const openMatchDetails = (id: number) => {
    setMatchId(id);
    setIsOpen(true);
    setGames(null);
    bottomSheetModalRef.current?.present();
  };

  const closeMatchDetails = () => {
    setIsOpen(false);
    setMatchId(null);
    setGames(null);
    bottomSheetModalRef.current?.dismiss();
  };

  useEffect(() => {
    if (isOpen && matchId) {
      getMatch({ match_id: matchId }).then(setMatch).catch(console.error);
    }
  }, [isOpen, matchId]);

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
