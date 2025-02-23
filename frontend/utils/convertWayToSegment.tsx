
/**
 * Converts an Overpass "way" object into a segment with two endpoints.
 * The endpoints are taken as the first and last node in the way's node array.
 *
 * @param way - The Overpass way object containing node IDs.
 * @param nodeMap - A mapping of node IDs to their coordinates.
 * @returns A Segment with endpoints, or null if conversion fails.
 */
export function convertWayToSegment(
  way: OverpassWay,
  nodeMap: Record<number, LatLng>
): Segment | null {
  if (!way.nodes || way.nodes.length < 2) {
    return null;
  }
  const firstNodeId = way.nodes[0];
  const lastNodeId = way.nodes[way.nodes.length - 1];
  const pointA = nodeMap[firstNodeId];
  const pointB = nodeMap[lastNodeId];
  if (!pointA || !pointB) {
    return null;
  }
  return {
    point_a: pointA,
    point_b: pointB,
  };
}
