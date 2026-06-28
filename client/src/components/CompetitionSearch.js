import * as turf from '@turf/turf';

export const findNearbyCompetitions = async (competitions, cityName, maxDistance = 10) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?` +
      `access_token=${process.env.REACT_APP_MAPBOX_TOKEN}&types=place,locality`
    );
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return [];
    }

    // Vérifier et convertir les coordonnées en nombres
    const cityLocations = data.features.map(feature => ({
      longitude: parseFloat(feature.geometry.coordinates[0]),
      latitude: parseFloat(feature.geometry.coordinates[1]),
      text: feature.text
    }));

    // Filtrer les compétitions qui ont des coordonnées valides
    const validCompetitions = competitions.filter(competition => {
      const { coordinates } = competition
      return coordinates?.[0]?.lat != null && coordinates?.[0]?.lon != null && !isNaN(parseFloat(coordinates?.[0]?.lat)) && !isNaN(parseFloat(coordinates?.[0]?.lon));
    }).map(competition => ({ ...competition })); // Créer des copies des objets

    const nearbyCompetitions = [];
    
    validCompetitions.forEach(competition => {
      // Conversion des coordonnées en nombres
      const competLongitude = competition.coordinates[0].lon;
      const competLatitude = competition.coordinates[0].lat;

      cityLocations.some(cityLocation => {
        try {
          const distance = turf.distance(
            turf.point([cityLocation.longitude, cityLocation.latitude]),
            turf.point([competLongitude, competLatitude])
          );
          
          if (distance <= maxDistance) {
            nearbyCompetitions.push({
              ...competition,
              queryMatchCity: cityLocation.text,
              distance: parseFloat(distance.toFixed(2))
            });
            return true;
          }
          return false;
          
        } catch (error) {
          console.error('Erreur calcul distance pour:', competition.compet_name, error);
          return false;
        }
      });
    });

    return nearbyCompetitions;
  } catch (error) {
    console.error('Erreur détaillée:', error);
    console.error('Stack trace:', error.stack);
    return [];
  }
};