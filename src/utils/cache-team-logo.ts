// utils/cache-team-logo.ts
import * as FileSystem from "expo-file-system/legacy";

export async function cacheTeamLogo(
  url: string | null,
): Promise<string | undefined> {
  if (!url) return undefined;
  const filename = url.split("/").pop() ?? `${Date.now()}.png`;
  const dest = `${FileSystem.cacheDirectory}team-logos/${filename}`;
  const dirInfo = await FileSystem.getInfoAsync(
    `${FileSystem.cacheDirectory}team-logos`,
  );
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.cacheDirectory}team-logos`,
      { intermediates: true },
    );
  }
  const fileInfo = await FileSystem.getInfoAsync(dest);
  if (!fileInfo.exists) {
    await FileSystem.downloadAsync(url, dest);
  }
  return dest;
}
