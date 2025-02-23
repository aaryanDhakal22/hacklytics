
// Function to perform reverse geocoding
async function getStreetName(lat: number, lng: number, apiKey: string): Promise<string> {
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  try {
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const streetName = data.results[0].formatted_address;
      return streetName;
    } else {
      throw new Error('Geocoding failed');
    }
  } catch (error) {
    console.error('Error fetching geocode data:', error);
    return 'Unable to retrieve address';
  }
}


export default getStreetName