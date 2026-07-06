import { useColorScheme as useSystemColorScheme } from "react-native";

export function useColorScheme() {
  return "dark" as ReturnType<typeof useSystemColorScheme>;
}
