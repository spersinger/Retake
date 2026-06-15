import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TeamData } from "@/components/ui/team-view";

const STORAGE_KEY = "@cs-live/favorites";

interface FavoritesContextValue {
  favorites: TeamData[];
  loaded: boolean;
  isFavorite: (teamId: number) => boolean;
  toggleFavorite: (team: TeamData) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<TeamData[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        setFavorites(JSON.parse(data));
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((next: TeamData[]) => {
    setFavorites(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const isFavorite = useCallback(
    (teamId: number) => favorites.some((t) => t.id === teamId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (team: TeamData) => {
      const exists = favorites.some((t) => t.id === team.id);
      if (exists) {
        persist(favorites.filter((t) => t.id !== team.id));
      } else {
        persist([...favorites, team]);
      }
    },
    [favorites, persist],
  );

  const value = useMemo(
    () => ({ favorites, loaded, isFavorite, toggleFavorite }),
    [favorites, loaded, isFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
