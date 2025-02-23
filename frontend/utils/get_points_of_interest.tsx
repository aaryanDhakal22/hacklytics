
export interface POI {
  id: number;
  lat: number;
  lng: number;
  name?: string;
  amenity?: string;
}

export async function getPointsOfInterest(
  lat: number,
  lng: number,
  radius: number = 500
): Promise<POI[]> {
  const overpassUrl = "https://overpass-api.de/api/interpreter";
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"](around:${radius},${lat},${lng});
    );
    out body;
  `;
  const response = await fetch(overpassUrl, {
    method: "POST",
    body: query,
  });
  const data = await response.json();
  if (!data.elements) {
    return [];
  }
  // Map over the returned nodes to create POI objects.
  const pois = data.elements
    .filter((el: any) => el.type === "node")
    .map((node: any) => ({
      id: node.id,
      lat: node.lat,
      lng: node.lon,
      name: node.tags?.name,
      amenity: node.tags?.amenity,
    }));
  return pois;
}
