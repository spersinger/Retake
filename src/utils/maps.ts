const mapDisplayNames: Record<string, string> = {
  de_dust2: "Dust II",
  de_overpass: "Overpass",
  de_mirage: "Mirage",
  de_inferno: "Inferno",
  de_nuke: "Nuke",
  de_ancient: "Ancient",
  de_vertigo: "Vertigo",
  de_anubis: "Anubis",
  de_cache: "Cache",
  de_train: "Train",
  de_cbble: "Cobblestone",
  de_tuscan: "Tuscan",
};

export function formatMapName(name: string | null | undefined): string {
  if (!name) return "";
  return mapDisplayNames[name] || name;
}
