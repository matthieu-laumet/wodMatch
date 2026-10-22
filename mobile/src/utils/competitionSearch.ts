import type { Competition } from '../types/competition';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

const toRad = (d: number) => (d * Math.PI) / 180;

// Haversine en km (remplace @turf/turf)
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371.0088;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function findNearbyCompetitions(
  competitions: Competition[],
  cityName: string,
  maxDistance = 10,
): Promise<Competition[]> {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json` +
        `?access_token=${MAPBOX_TOKEN}&types=place,locality`,
    );
    const data = await res.json();
    if (!data.features?.length) return [];

    const cities = data.features.map((f: any) => ({
      lon: parseFloat(f.geometry.coordinates[0]),
      lat: parseFloat(f.geometry.coordinates[1]),
      text: f.text as string,
    }));

    const nearby: Competition[] = [];
    for (const c of competitions) {
      const lat = parseFloat(String(c.coordinates?.[0]?.lat));
      const lon = parseFloat(String(c.coordinates?.[0]?.lon));
      if (isNaN(lat) || isNaN(lon)) continue;

      for (const city of cities) {
        const d = distanceKm(city.lat, city.lon, lat, lon);
        if (d <= maxDistance) {
          nearby.push({ ...c, queryMatchCity: city.text, distance: parseFloat(d.toFixed(2)) });
          break;
        }
      }
    }
    return nearby;
  } catch (e) {
    console.error('Erreur recherche géographique:', e);
    return [];
  }
}