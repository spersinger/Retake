import teamDictionaryRaw from "@/constants/team-dictionary.json";

interface TeamDictionaryEntry {
  color: string;
  logo: string | null;
}

const teamLookup = teamDictionaryRaw as Record<
  string,
  TeamDictionaryEntry | undefined
>;

export const getTeamVisuals = (teamName: string, defaultColor: string) => {
  if (!teamName) return { color: defaultColor, logo: null };

  const exactMatch = teamLookup[teamName];
  if (exactMatch) {
    return { color: exactMatch.color, logo: exactMatch.logo };
  }

  const normalizedInput = teamName.toLowerCase().trim();
  const foundKey = Object.keys(teamLookup).find(
    (key) =>
      key.toLowerCase().trim() === normalizedInput ||
      normalizedInput.includes(key.toLowerCase()),
  );

  if (foundKey && teamLookup[foundKey]) {
    return { color: teamLookup[foundKey]!.color, logo: teamLookup[foundKey]!.logo };
  }

  return { color: defaultColor, logo: null };
};
