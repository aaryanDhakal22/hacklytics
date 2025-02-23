
export async function getConnectedRoadEndpoints(
  lat: number,
  lng: number
): Promise<{ ways: OverpassWay[]; nodeMap: Record<number, LatLng> }> {
  const overpassUrl = "https://overpass-api.de/api/interpreter";

  // 1. Find the reference road near the provided coordinate (within 50 meters).
  const refQuery = `
    [out:json][timeout:25];
    way(around:50,${lat},${lng})[highway~"^(primary|secondary|residential)$"];
    out body;
  `;
  const refResponse = await fetch(overpassUrl, {
    method: "POST",
    body: refQuery,
  });
  const refData = await refResponse.json();
  if (!refData.elements || refData.elements.length === 0) {
    throw new Error("No reference road found near the given location.");
  }
  // Use the first found way as the reference road.
  const refRoad = refData.elements.find((el: any) => el.type === "way");
  if (!refRoad) {
    throw new Error("No reference road found.");
  }
  const refNodeIds: number[] = refRoad.nodes;
  if (!refNodeIds || refNodeIds.length === 0) {
    throw new Error("Reference road has no nodes.");
  }
  const nodesList = refNodeIds.join(",");

  // 2. Query for ways that share any of the reference road's nodes.
  const connectedQuery = `
    [out:json][timeout:25];
    node(id:${nodesList})->.refNodes;
    way(bn.refNodes)[highway~"^(primary|secondary|residential)$"]->.connectedWays;
    (.connectedWays;>;);
    out body;
  `;
  const connResponse = await fetch(overpassUrl, {
    method: "POST",
    body: connectedQuery,
  });
  const connData = await connResponse.json();
  if (!connData.elements) {
    throw new Error("No connected roads found.");
  }
  const ways = connData.elements.filter((el: any) => el.type === "way");
  const nodes = connData.elements.filter((el: any) => el.type === "node");

  // Build a map from node IDs to their coordinates.
  const nodeMap: Record<number, LatLng> = {};
  nodes.forEach((node: any) => {
    nodeMap[node.id] = { lat: node.lat, lng: node.lon };
  });

  return { ways, nodeMap };
}
