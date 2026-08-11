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
  refreshHLTV: () => void;
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
    if (!isOpen || !matchId) return;

    getMatch({ match_id: matchId })
      .then((matchData) => {
        setMatch(matchData);
        if (
          matchData?.status === "running" ||
          matchData?.status === "finished"
        ) {
          getHLTVMatch({ match_id: matchId })
            .then(setHLTVData)
            .catch(console.error);
        }
      })
      .catch(console.error);
  }, [isOpen, matchId, fetchKey]);

  useEffect(() => {
    if (!isOpen || !matchId || match?.status !== "running") return;

    const interval = setInterval(async () => {
      await Promise.allSettled([
        getMatch({ match_id: matchId }, true).then(setMatch),
        getHLTVMatch({ match_id: matchId }, true).then(setHLTVData),
      ]);
    }, 45_000);

    return () => clearInterval(interval);
  }, [isOpen, matchId, match?.status]);

  const refreshHLTV = () => {
    if (!matchId) return;
    getHLTVMatch({ match_id: matchId }, true)
      .then(setHLTVData)
      .catch(console.error);
  };

  return (
    <MatchDetailsContext.Provider
      value={{ matchId, isOpen, openMatchDetails, closeMatchDetails, refreshHLTV }}
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
