// Have to Stash because needed more time to integrate

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  function computeHeading(
    viewpointLat: number,
    viewpointLng: number,
    storefrontLat: number,
    storefrontLng: number
  ): number {
    const lat1 = toRadians(viewpointLat);
    const lon1 = toRadians(viewpointLng);
    const lat2 = toRadians(storefrontLat);
    const lon2 = toRadians(storefrontLng);
  
    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const initialHeading = Math.atan2(y, x) * (180 / Math.PI);
  
    // Normalize the heading to be within [0, 360)
    const heading = (initialHeading + 360) % 360;
    return heading;
  }
  
  function getStreetViewUrl(
    storefrontLat: number,
    storefrontLng: number,
    viewpointLat: number,
    viewpointLng: number
  ): string {
    const heading = computeHeading(viewpointLat, viewpointLng, storefrontLat, storefrontLng);
  
    const apiKey = ""; // Add your API key here
    const size = "600x400";
    const location = `${viewpointLat},${viewpointLng}`;
    const fov = 90;
    const pitch = 0;
  
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${location}&heading=${heading}&fov=${fov}&pitch=${pitch}&key=${apiKey}`;
    return streetViewUrl;
  }
  
  // Example usage:
  const storefrontLat = 33.76821413035106;
  const storefrontLng = -84.38503155930037;
  const viewpointLat = 33.768203518689745;
  const viewpointLng = -84.38531121421197;
  
  const url = getStreetViewUrl(storefrontLat, storefrontLng, viewpointLat, viewpointLng);
  console.log(url);
  