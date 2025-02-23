

/**
 * Queries Overpass API for a way by its OSM ID, including all its nodes.
 *
 * @param osmId - The OSM ID of the way.
 * @returns A Promise resolving to an object containing the Overpass way and a node map.
 */
export async function getWaySegmentFromOSMID(
  osmId: number
): Promise<{ way: OverpassWay; nodeMap: Record<number, LatLng> }> {
  const overpassUrl = "https://overpass-api.de/api/interpreter";
  const query = `
    [out:json][timeout:25];
    way(${osmId});
    (._;>;);
    out body;
  `;
  const response = await fetch(overpassUrl, {
    method: "POST",
    body: query,
  });
  const data = await response.json();
  if (!data.elements || data.elements.length === 0) {
    throw new Error("No data found for OSM ID " + osmId);
  }
  // Find the way with the specified OSM ID.
  const way = data.elements.find(
    (el: any) => el.type === "way" && el.id === osmId
  );
  if (!way) {
    throw new Error("No way found with OSM ID " + osmId);
  }
  // Build a map from node IDs to their coordinates.
  const nodeMap: Record<number, LatLng> = {};
  data.elements
    .filter((el: any) => el.type === "node")
    .forEach((node: any) => {
      nodeMap[node.id] = { lat: node.lat, lng: node.lon };
    });
  return { way, nodeMap };
}
