// utils/calculateDistance.ts
import { getWaySegmentFromOSMID } from "./get_way_segment";
import { convertWayToSegment } from "./convertWayToSegment";
/**
 * Calculates the Haversine distance (in meters) between two points.
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates the distance between the primary road (identified by osmId) and each connected segment.
 * The distance is computed between the midpoint of the primary segment and the midpoint of each connected segment.
 *
 * @param osmId - The OSM way ID of the primary road.
 * @param connectedSegments - An array of connected segments.
 * @returns A Promise resolving to an array of distances in meters.
 */
export async function calculateDistance(
  osmId: number,
  connectedSegments: Segment[]
): Promise<number[]> {
  // Fetch the primary road segment.
  const { way, nodeMap } = await getWaySegmentFromOSMID(osmId);
  const primarySegment = convertWayToSegment(way, nodeMap);
  if (!primarySegment) {
    throw new Error("Unable to convert primary way to segment.");
  }

  // Calculate the midpoint of the primary segment.
  const primaryMidpoint = {
    lat: (primarySegment.point_a.lat + primarySegment.point_b.lat) / 2,
    lng: (primarySegment.point_a.lng + primarySegment.point_b.lng) / 2,
  };

  // For each connected segment, calculate its midpoint and then the distance from the primary midpoint.
  return connectedSegments.map((seg) => {
    const segMidpoint = {
      lat: (seg.point_a.lat + seg.point_b.lat) / 2,
      lng: (seg.point_a.lng + seg.point_b.lng) / 2,
    };
    return haversineDistance(
      primaryMidpoint.lat,
      primaryMidpoint.lng,
      segMidpoint.lat,
      segMidpoint.lng
    );
  });
}
